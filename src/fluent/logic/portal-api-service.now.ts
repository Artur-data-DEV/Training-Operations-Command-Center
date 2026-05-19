import { ScriptInclude } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// PortalApiService — server-side Script Include consumed by Service Portal
// widgets via GlideAjax (client-callable) and server scripts.
//
// Responsibilities:
//   - List available training sessions (open/full with seats)
//   - Return session detail with enrollment context for logged-in student
//   - List student's own enrollments
//   - Expose room and course context for portal widgets
//
// Security note:
// For TOCC portal UX we use scoped server-side queries with explicit user filtering
// to avoid inherited task ACL side-effects blocking valid end-user pages.
// ---------------------------------------------------------------------------

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_portal_api_service'],
    name: 'PortalApiService',
    apiName: 'x_783010_tocc_a1.PortalApiService',
    accessibleFrom: 'public',
    clientCallable: true,
    protectionPolicy: 'read',
    script: `var PortalApiService = Class.create();
PortalApiService.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    // -----------------------------------------------------------------------
    // getAvailableSessions
    // Returns open/full sessions visible to students.
    // Optional filters: sysparm_course, sysparm_location, sysparm_from_date
    // -----------------------------------------------------------------------
    getAvailableSessions: function() {
        var courseFilter   = this._getParam('sysparm_course')    || '';
        var locationFilter = this._getParam('sysparm_location')  || '';
        var fromDate       = this._getParam('sysparm_from_date') || '';

        var sessions = [];
        var gr = new GlideRecord('x_783010_tocc_a1_training_session');
        gr.addQuery('status', 'IN', 'open,full');
        gr.addQuery('active', true);
        gr.addNotNullQuery('tocc_course');
        gr.addNotNullQuery('room');
        gr.addNotNullQuery('tocc_instructor');
        gr.addNotNullQuery('start_datetime');
        gr.addNotNullQuery('end_datetime');
        gr.addQuery('start_datetime', '>=', new GlideDateTime().getValue());
        gr.addQuery('total_seats', '>', 0);

        if (courseFilter)   { gr.addQuery('tocc_course', courseFilter); }
        if (locationFilter) { gr.addQuery('room.location', locationFilter); }
        if (fromDate)       { gr.addQuery('start_datetime', '>=', fromDate); }

        gr.orderBy('start_datetime');
        gr.setLimit(50);
        gr.query();

        while (gr.next()) {
            if (!this._isActiveRoom(gr.getValue('room'))) {
                continue;
            }
            if (!this._recordExists('x_783010_tocc_a1_course', gr.getValue('tocc_course'))) {
                continue;
            }
            if (!this._isActiveUser(gr.getValue('tocc_instructor'))) {
                continue;
            }

            var myEnrollment = this._getStudentEnrollmentForSession(gr.getUniqueValue());
            sessions.push({
                sys_id:               gr.getUniqueValue(),
                number:               gr.getValue('number'),
                title:                gr.getValue('title'),
                course:               gr.getValue('tocc_course'),
                course_name:          gr.getDisplayValue('tocc_course'),
                instructor:           gr.getValue('tocc_instructor'),
                instructor_name:      gr.getDisplayValue('tocc_instructor'),
                room:                 gr.getValue('room'),
                room_name:            gr.getDisplayValue('room'),
                start_datetime:       gr.getValue('start_datetime'),
                start_display:        gr.getDisplayValue('start_datetime'),
                end_datetime:         gr.getValue('end_datetime'),
                end_display:          gr.getDisplayValue('end_datetime'),
                status:               gr.getValue('status'),
                available_seats:      parseInt(gr.getValue('available_seats'), 10) || 0,
                total_seats:          parseInt(gr.getValue('total_seats'), 10) || 0,
                enrollment_deadline:  gr.getValue('enrollment_deadline'),
                confirmation_deadline:gr.getValue('confirmation_deadline'),
                data_quality_status:  'ready',
                data_quality_issues:  [],
                my_enrollment_id:     myEnrollment ? myEnrollment.sys_id : '',
                my_enrollment_status: myEnrollment ? myEnrollment.status : '',
            });
        }

        return JSON.stringify({ success: true, sessions: sessions, count: sessions.length });
    },

    // -----------------------------------------------------------------------
    // getSessionDetail
    // Returns full session detail plus the logged-in student's enrollment state.
    // Required: sysparm_session_id
    // -----------------------------------------------------------------------
    getSessionDetail: function() {
        var sessionId = this._getParam('sysparm_session_id');
        if (!sessionId) {
            return JSON.stringify({ success: false, message: 'Session ID is required.' });
        }

        var gr = new GlideRecord('x_783010_tocc_a1_training_session');
        if (!gr.get(sessionId)) {
            return JSON.stringify({ success: false, message: 'Session not found.' });
        }

        var session = {
            sys_id:                gr.getUniqueValue(),
            number:                gr.getValue('number'),
            title:                 gr.getValue('title'),
            course:                gr.getValue('tocc_course'),
            course_name:           gr.getDisplayValue('tocc_course'),
            instructor_name:       gr.getDisplayValue('tocc_instructor'),
            room_name:             gr.getDisplayValue('room'),
            location_name:         gr.getDisplayValue('room.location'),
            start_datetime:        gr.getValue('start_datetime'),
            start_display:         gr.getDisplayValue('start_datetime'),
            end_datetime:          gr.getValue('end_datetime'),
            end_display:           gr.getDisplayValue('end_datetime'),
            status:                gr.getValue('status'),
            available_seats:       parseInt(gr.getValue('available_seats'), 10) || 0,
            total_seats:           parseInt(gr.getValue('total_seats'), 10) || 0,
            enrollment_deadline:   gr.getValue('enrollment_deadline'),
            confirmation_deadline: gr.getValue('confirmation_deadline'),
        };

        // Attach this student's enrollment state (if any).
        var enrollment = this._getStudentEnrollmentForSession(sessionId);

        return JSON.stringify({
            success:    true,
            session:    session,
            enrollment: enrollment,
        });
    },

    // -----------------------------------------------------------------------
    // getMyEnrollments
    // Returns the logged-in student's enrollments, ordered by session start.
    // Optional filter: sysparm_status (pending|approved|waitlisted|cancelled)
    // -----------------------------------------------------------------------
    getMyEnrollments: function() {
        var statusFilter = this._getParam('sysparm_status') || '';

        var studentId = this._getLoggedStudentId();
        if (!studentId) {
            return JSON.stringify({ success: false, message: 'No active student profile found.' });
        }

        var enrollments = [];
        var gr = new GlideRecord('x_783010_tocc_a1_student_enrollment');
        gr.addQuery('tocc_student', studentId);
        if (statusFilter) { gr.addQuery('status', statusFilter); }
        gr.orderBy('tocc_training_session.start_datetime');
        gr.query();

        while (gr.next()) {
            enrollments.push({
                sys_id:           gr.getUniqueValue(),
                number:           gr.getValue('number'),
                status:           gr.getValue('status'),
                status_display:   gr.getDisplayValue('status'),
                confirmed:        gr.getValue('confirmed'),
                training_session: gr.getValue('tocc_training_session'),
                session_title:    gr.getDisplayValue('tocc_training_session'),
                session_number:   gr.getDisplayValue('tocc_training_session.number'),
                start_datetime:   gr.getValue('tocc_training_session.start_datetime'),
                start_display:    gr.getDisplayValue('tocc_training_session.start_datetime'),
                room_name:        gr.getDisplayValue('tocc_training_session.room'),
                instructor_name:  gr.getDisplayValue('tocc_training_session.tocc_instructor'),
            });
        }

        return JSON.stringify({ success: true, enrollments: enrollments, count: enrollments.length });
    },

    // -----------------------------------------------------------------------
    // getMyReservations  (Instructor view)
    // Returns the logged-in instructor's room reservations.
    // -----------------------------------------------------------------------
    getMyReservations: function() {
        var reservations = [];
        var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
        var ownership = gr.addQuery('tocc_instructor', gs.getUserID());
        ownership.addOrCondition('opened_by', gs.getUserID());
        gr.orderByDesc('start_datetime');
        gr.query();

        while (gr.next()) {
            var reservationIssues = this._getReservationDataQualityIssues(gr);
            reservations.push({
                sys_id:               gr.getUniqueValue(),
                number:               gr.getValue('number'),
                status:               gr.getValue('status'),
                status_display:       gr.getDisplayValue('status'),
                course:               gr.getValue('tocc_course'),
                course_name:          gr.getDisplayValue('tocc_course'),
                instructor:           gr.getValue('tocc_instructor'),
                instructor_name:      gr.getDisplayValue('tocc_instructor'),
                room:                 gr.getValue('tocc_room'),
                room_name:            gr.getDisplayValue('tocc_room'),
                start_datetime:       gr.getValue('start_datetime'),
                start_display:        gr.getDisplayValue('start_datetime'),
                end_datetime:         gr.getValue('end_datetime'),
                end_display:          gr.getDisplayValue('end_datetime'),
                expected_participants:gr.getValue('expected_participants'),
                training_session:     gr.getValue('training_session'),
                record_url:           '/now/nav/ui/classic/params/target/x_783010_tocc_a1_room_reservation.do?sys_id=' + gr.getUniqueValue(),
                portal_record_url:    '?id=form&table=x_783010_tocc_a1_room_reservation&sys_id=' + gr.getUniqueValue(),
                data_quality_status:  reservationIssues.length ? 'needs_review' : 'ready',
                data_quality_issues:  reservationIssues,
            });
        }

        return JSON.stringify({ success: true, reservations: reservations, count: reservations.length });
    },

    // -----------------------------------------------------------------------
    // getBackofficeReservationQueue
    // Returns submitted reservations requiring operational review.
    // Access: backoffice, manager, scoped admin, or platform admin.
    // -----------------------------------------------------------------------
    getBackofficeReservationQueue: function() {
        if (!this._canViewReservationQueue()) {
            return JSON.stringify({ success: false, message: 'Access denied.' });
        }

        var canApprove = this._canApproveReservation();
        var canReject = this._canRejectReservation();
        var reservations = [];
        var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
        gr.addQuery('status', 'submitted');
        gr.orderBy('start_datetime');
        gr.query();

        while (gr.next()) {
            var issues = this._getReservationDataQualityIssues(gr);
            reservations.push({
                sys_id:                gr.getUniqueValue(),
                number:                gr.getValue('number'),
                status:                gr.getValue('status'),
                status_display:        gr.getDisplayValue('status'),
                course:                gr.getValue('tocc_course'),
                course_name:           gr.getDisplayValue('tocc_course'),
                instructor:            gr.getValue('tocc_instructor'),
                instructor_name:       gr.getDisplayValue('tocc_instructor'),
                room:                  gr.getValue('tocc_room'),
                room_name:             gr.getDisplayValue('tocc_room'),
                start_datetime:        gr.getValue('start_datetime'),
                start_display:         gr.getDisplayValue('start_datetime'),
                end_datetime:          gr.getValue('end_datetime'),
                end_display:           gr.getDisplayValue('end_datetime'),
                expected_participants: gr.getValue('expected_participants'),
                training_session:      gr.getValue('training_session'),
                record_url:            '/now/nav/ui/classic/params/target/x_783010_tocc_a1_room_reservation.do?sys_id=' + gr.getUniqueValue(),
                portal_record_url:     '?id=form&table=x_783010_tocc_a1_room_reservation&sys_id=' + gr.getUniqueValue(),
                data_quality_status:   issues.length ? 'needs_review' : 'ready',
                data_quality_issues:   issues,
                can_approve:           canApprove && issues.length === 0,
                can_reject:            canReject,
            });
        }

        return JSON.stringify({
            success: true,
            reservations: reservations,
            count: reservations.length,
            permissions: {
                can_approve: canApprove,
                can_reject: canReject,
            },
        });
    },

    // -----------------------------------------------------------------------
    // approveReservation
    // Approves one submitted reservation from the backoffice queue.
    // -----------------------------------------------------------------------
    approveReservation: function(reservationId) {
        if (!this._canApproveReservation()) {
            return JSON.stringify({ success: false, message: 'Access denied.' });
        }

        var id = reservationId || this._getParam('sysparm_reservation_id');
        if (!id) {
            return JSON.stringify({ success: false, message: 'Reservation ID is required.' });
        }

        var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
        if (!gr.get(id)) {
            return JSON.stringify({ success: false, message: 'Reservation not found.' });
        }

        if (gr.getValue('status') !== 'submitted') {
            return JSON.stringify({ success: false, message: 'Only submitted reservations can be approved.' });
        }

        var issues = this._getReservationDataQualityIssues(gr);
        if (issues.length) {
            return JSON.stringify({
                success: false,
                message: 'Reservation has missing operational data: ' + issues.join(', ') + '.',
                data_quality_issues: issues,
            });
        }

        gr.setValue('status', 'approved');
        gr.setValue('work_notes', 'Approved via TOCC Backoffice Queue by ' + gs.getUserDisplayName() + '.');
        gr.setWorkflow(true);
        gr.update();

        gr.get(id);
        if (!gr.getValue('training_session')) {
            return JSON.stringify({
                success: false,
                message: 'Reservation was approved, but no training session was linked. Review required operational fields and sync rules.',
            });
        }

        return JSON.stringify({ success: true, message: 'Reservation approved successfully.', training_session: gr.getValue('training_session') });
    },

    // -----------------------------------------------------------------------
    // rejectReservation
    // Rejects one submitted reservation from the backoffice queue.
    // -----------------------------------------------------------------------
    rejectReservation: function(reservationId, reason) {
        if (!this._canRejectReservation()) {
            return JSON.stringify({ success: false, message: 'Access denied.' });
        }

        var id = reservationId || this._getParam('sysparm_reservation_id');
        var rejectReason = reason || this._getParam('sysparm_reason') || '';
        if (!id) {
            return JSON.stringify({ success: false, message: 'Reservation ID is required.' });
        }

        var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
        if (!gr.get(id)) {
            return JSON.stringify({ success: false, message: 'Reservation not found.' });
        }

        if (gr.getValue('status') !== 'submitted') {
            return JSON.stringify({ success: false, message: 'Only submitted reservations can be rejected.' });
        }

        gr.setValue('status', 'rejected');
        gr.setValue('work_notes', 'Rejected via TOCC Backoffice Queue by ' + gs.getUserDisplayName() + (rejectReason ? '. Reason: ' + rejectReason : '.'));
        gr.setWorkflow(true);
        gr.update();

        return JSON.stringify({ success: true, message: 'Reservation rejected successfully.' });
    },

    // -----------------------------------------------------------------------
    // confirmMyAttendance
    // Confirms attendance for the logged-in student on a given enrollment.
    // Required: sysparm_enrollment_id
    // -----------------------------------------------------------------------
    confirmMyAttendance: function() {
        var enrollmentId = this._getParam('sysparm_enrollment_id');
        if (!enrollmentId) {
            return JSON.stringify({ success: false, message: 'Enrollment ID is required.' });
        }

        var gr = new GlideRecord('x_783010_tocc_a1_student_enrollment');
        if (!gr.get(enrollmentId)) {
            return JSON.stringify({ success: false, message: 'Enrollment not found.' });
        }

        // Ownership check — only the student themselves can confirm via this method.
        var studentId = this._getLoggedStudentId();
        if (gr.getValue('tocc_student') !== studentId) {
            return JSON.stringify({ success: false, message: 'You can only confirm your own enrollment.' });
        }

        if (gr.getValue('status') !== 'approved') {
            return JSON.stringify({ success: false, message: 'Only approved enrollments can be confirmed.' });
        }

        if (gr.getValue('confirmed') === 'true' || gr.getValue('confirmed') === true) {
            return JSON.stringify({ success: true, message: 'Attendance already confirmed.' });
        }

        // Check confirmation deadline.
        var session = new GlideRecordSecure('x_783010_tocc_a1_training_session');
        if (session.get(gr.getValue('tocc_training_session'))) {
            var deadline = session.getValue('confirmation_deadline');
            if (deadline) {
                var now = new GlideDateTime();
                var deadlineGdt = new GlideDateTime(deadline);
                if (now.compareTo(deadlineGdt) > 0) {
                    return JSON.stringify({
                        success: false,
                        message: 'The confirmation deadline has passed. Contact the training team.'
                    });
                }
            }
        }

        gr.setValue('confirmed', true);
        gr.setValue('work_notes', 'Attendance confirmed via Service Portal by ' + gs.getUserDisplayName() + '.');
        gr.setWorkflow(false);
        gr.update();

        return JSON.stringify({ success: true, message: 'Attendance confirmed successfully.' });
    },

    // -----------------------------------------------------------------------
    // cancelMyEnrollment
    // Cancels one enrollment belonging to the logged-in student.
    // Required: sysparm_enrollment_id
    // -----------------------------------------------------------------------
    cancelMyEnrollment: function() {
        var enrollmentId = this._getParam('sysparm_enrollment_id');
        if (!enrollmentId) {
            return JSON.stringify({ success: false, message: 'Enrollment ID is required.' });
        }

        var studentId = this._getLoggedStudentId();
        if (!studentId) {
            return JSON.stringify({ success: false, message: 'No active student profile found.' });
        }

        var gr = new GlideRecord('x_783010_tocc_a1_student_enrollment');
        if (!gr.get(enrollmentId)) {
            return JSON.stringify({ success: false, message: 'Enrollment not found.' });
        }

        if (gr.getValue('tocc_student') !== studentId) {
            return JSON.stringify({ success: false, message: 'You can only cancel your own enrollment.' });
        }

        var status = gr.getValue('status');
        if (status === 'cancelled') {
            return JSON.stringify({ success: true, message: 'Enrollment already cancelled.' });
        }

        if (status !== 'pending' && status !== 'approved' && status !== 'waitlisted') {
            return JSON.stringify({
                success: false,
                message: 'Enrollment cannot be cancelled from its current status.',
            });
        }

        if (status === 'approved') {
            var lateWindow = this._isLateCancellationWindow(gr.getValue('tocc_training_session'));
            if (lateWindow.blocked) {
                return JSON.stringify({
                    success: false,
                    message: 'Cancellation is not allowed within ' + lateWindow.hours + ' hours of session start.',
                });
            }
        }

        gr.setValue('status', 'cancelled');
        gr.setValue('confirmed', false);
        gr.setValue('work_notes', 'Enrollment cancelled via Service Portal by ' + gs.getUserDisplayName() + '.');
        gr.setWorkflow(false);
        gr.update();

        var enrollmentService = new EnrollmentService();
        enrollmentService.syncSessionAfterEnrollmentChange(gr.getValue('tocc_training_session'));

        var helper = new NotificationHelper();
        helper.sendEnrollmentDecision(enrollmentId);

        return JSON.stringify({ success: true, message: 'Enrollment cancelled successfully.' });
    },

    // -----------------------------------------------------------------------
    // getTrainingPolicies
    // Returns policy values used by portal and VA responses.
    // -----------------------------------------------------------------------
    getTrainingPolicies: function() {
        var cfg = new TrainingConfigService();
        var help = this._getHelpCenterContextObject();

        return JSON.stringify({
            success: true,
            policies: {
                minimum_advance_notice_hours: cfg.getMinimumAdvanceNoticeHours(),
                late_cancellation_window_hours: cfg.getLateCancellationWindowHours(),
                waitlist_mode: cfg.getWaitlistMode(),
                enrollment_approval_mode: cfg.getEnrollmentApprovalMode(),
                confirmation_lead_hours: cfg.getConfirmationLeadHours(),
                reminder_lead_hours: cfg.getReminderLeadHours(),
                feedback_window_hours: cfg.getFeedbackWindowHours(),
                stale_approval_hours: cfg.getStaleApprovalHours(),
            },
            links: {
                kb: help.kb_url,
                support_page: help.support_page,
                support_catalog_url: help.support_catalog_url,
                va_url: help.va_url,
                backoffice_email: help.backoffice_email,
            },
        });
    },

    // -----------------------------------------------------------------------
    // getHelpCenterContext
    // Returns property-driven links and escalation channels used by SP + VA.
    // -----------------------------------------------------------------------
    getHelpCenterContext: function() {
        return JSON.stringify(this._getHelpCenterContextObject());
    },

    // -----------------------------------------------------------------------
    // getOperationsSnapshot
    // Returns high-signal operational counters for Backoffice workspace views.
    // Access: backoffice, manager, scoped admin, or platform admin.
    // -----------------------------------------------------------------------
    getOperationsSnapshot: function() {
        if (!this._canViewOperationsSnapshot()) {
            return JSON.stringify({ success: false, message: 'Access denied.' });
        }

        var todayStart = gs.beginningOfToday();
        var todayEnd = gs.endOfToday();

        var snapshot = {
            pending_reservations: this._countRecords('x_783010_tocc_a1_room_reservation', function(gr) {
                gr.addQuery('status', 'submitted');
            }),
            todays_sessions: this._countRecords('x_783010_tocc_a1_training_session', function(gr) {
                gr.addQuery('start_datetime', '>=', todayStart);
                gr.addQuery('start_datetime', '<=', todayEnd);
                gr.addQuery('status', 'IN', 'open,full,in_progress');
            }),
            pending_enrollments: this._countRecords('x_783010_tocc_a1_student_enrollment', function(gr) {
                gr.addQuery('status', 'pending');
            }),
            unconfirmed_approved_enrollments: this._countRecords('x_783010_tocc_a1_student_enrollment', function(gr) {
                gr.addQuery('status', 'approved');
                gr.addQuery('confirmed', false);
                gr.addQuery('tocc_training_session.start_datetime', '>=', todayStart);
            }),
            in_progress_attendance_pending: this._countRecords('x_783010_tocc_a1_attendance', function(gr) {
                gr.addQuery('attendance_status', 'pending');
                gr.addQuery('tocc_training_session.status', 'in_progress');
            }),
            resources_missing_ci: this._countRecords('x_783010_tocc_a1_room_resource', function(gr) {
                gr.addQuery('active', true);
                gr.addNullQuery('ci_reference');
            }),
        };

        return JSON.stringify({
            success: true,
            generated_on: new GlideDateTime().getValue(),
            window: {
                today_start: todayStart,
                today_end: todayEnd,
            },
            snapshot: snapshot,
            kpi_highlights: this._getLatestKpiHighlights(),
        });
    },

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    _getParam: function(name) {
        if (this._testParams && this._testParams[name] !== undefined && this._testParams[name] !== null) {
            return this._testParams[name];
        }

        return this.getParameter(name);
    },

    _getLoggedStudentId: function() {
        var student = new GlideRecord('x_783010_tocc_a1_student');
        student.addQuery('user', gs.getUserID());
        student.addQuery('active', true);
        student.setLimit(1);
        student.query();
        if (student.next()) {
            return student.getUniqueValue();
        }

        // Auto-provision student profile for student persona users to avoid enrollment dead-end.
        if (!(gs.hasRole('x_783010_tocc_a1.student') || gs.hasRole('admin') || gs.hasRole('x_783010_tocc_a1.admin'))) {
            return null;
        }

        var newStudent = new GlideRecord('x_783010_tocc_a1_student');
        newStudent.initialize();
        newStudent.setValue('user', gs.getUserID());
        newStudent.setValue('active', true);
        var studentId = newStudent.insert();
        return studentId || null;
    },

    _getStudentEnrollmentForSession: function(sessionId) {
        var studentId = this._getLoggedStudentId();
        if (!studentId) { return null; }

        var gr = new GlideRecord('x_783010_tocc_a1_student_enrollment');
        gr.addQuery('tocc_student', studentId);
        gr.addQuery('tocc_training_session', sessionId);
        gr.setLimit(1);
        gr.query();

        if (!gr.next()) { return null; }

        return {
            sys_id:    gr.getUniqueValue(),
            number:    gr.getValue('number'),
            status:    gr.getValue('status'),
            confirmed: gr.getValue('confirmed'),
        };
    },

    _isLateCancellationWindow: function(sessionId) {
        var result = { blocked: false, hours: 0 };
        if (!sessionId) {
            return result;
        }

        var cfg = new TrainingConfigService();
        var hours = cfg.getLateCancellationWindowHours();
        result.hours = hours;

        if (!hours || hours <= 0) {
            return result;
        }

        var session = new GlideRecord('x_783010_tocc_a1_training_session');
        if (!session.get(sessionId)) {
            return result;
        }

        var startDateTime = session.getValue('start_datetime');
        if (!startDateTime) {
            return result;
        }

        var now = new GlideDateTime();
        var cutoff = new GlideDateTime(startDateTime);
        cutoff.addSeconds(-1 * hours * 3600);

        if (now.compareTo(cutoff) >= 0) {
            result.blocked = true;
        }

        return result;
    },

    _canViewOperationsSnapshot: function() {
        if (gs.hasRole('admin')) {
            return true;
        }
        return (
            gs.hasRole('x_783010_tocc_a1.admin') ||
            gs.hasRole('x_783010_tocc_a1.backoffice') ||
            gs.hasRole('x_783010_tocc_a1.manager')
        );
    },

    _canViewReservationQueue: function() {
        if (gs.hasRole('admin')) {
            return true;
        }
        return (
            gs.hasRole('x_783010_tocc_a1.admin') ||
            gs.hasRole('x_783010_tocc_a1.backoffice') ||
            gs.hasRole('x_783010_tocc_a1.manager')
        );
    },

    _canApproveReservation: function() {
        if (gs.hasRole('admin')) {
            return true;
        }
        return (
            gs.hasRole('x_783010_tocc_a1.admin') ||
            gs.hasRole('x_783010_tocc_a1.backoffice')
        );
    },

    _canRejectReservation: function() {
        return this._canApproveReservation();
    },

    _getReservationDataQualityIssues: function(gr) {
        var issues = [];
        var courseId = gr.getValue('tocc_course');
        var roomId = gr.getValue('tocc_room');
        var instructorId = gr.getValue('tocc_instructor');

        if (!courseId) {
            issues.push('missing course');
        } else if (!this._recordExists('x_783010_tocc_a1_course', courseId)) {
            issues.push('invalid course');
        }
        if (!roomId) {
            issues.push('missing room');
        } else if (!this._isActiveRoom(roomId)) {
            issues.push('invalid or inactive room');
        }
        if (!instructorId) {
            issues.push('missing instructor');
        } else if (!this._isActiveUser(instructorId)) {
            issues.push('invalid or inactive instructor');
        }
        if (!gr.getValue('start_datetime')) {
            issues.push('missing start');
        }
        if (!gr.getValue('end_datetime')) {
            issues.push('missing end');
        }
        if (!(parseInt(gr.getValue('expected_participants'), 10) > 0)) {
            issues.push('invalid participants');
        }
        return issues;
    },

    _recordExists: function(tableName, sysId) {
        if (!sysId) {
            return false;
        }

        var gr = new GlideRecord(tableName);
        return gr.get(sysId);
    },

    _isActiveUser: function(userId) {
        if (!userId) {
            return false;
        }

        var user = new GlideRecord('sys_user');
        if (!user.get(userId)) {
            return false;
        }

        var activeVal = user.getValue('active');
        return activeVal == true || String(activeVal) === 'true';
    },

    _isActiveRoom: function(roomId) {
        if (!roomId) {
            return false;
        }

        var room = new GlideRecord('x_783010_tocc_a1_room');
        if (!room.get(roomId)) {
            return false;
        }

        var status = room.getValue('status');
        return status && status.toString().toLowerCase() === 'active';
    },

    _countRecords: function(tableName, queryFn) {
        var gr = new GlideRecord(tableName);
        if (queryFn) {
            queryFn(gr);
        }
        gr.query();

        var count = 0;
        while (gr.next()) {
            count = count + 1;
        }
        return count;
    },

    _getLatestKpiHighlights: function() {
        var keys = [
            'training_session_fill_rate',
            'no_show_rate',
            'attendance_confirmation_rate',
            'feedback_average_rating',
        ];

        var latest = new GlideRecord('x_783010_tocc_a1_kpi_snapshot');
        latest.addQuery('active', true);
        latest.orderByDesc('snapshot_date');
        latest.setLimit(1);
        latest.query();

        if (!latest.next()) {
            return {
                snapshot_date: '',
                metrics: [],
            };
        }

        var snapshotDate = latest.getValue('snapshot_date');
        var byKey = {};

        var gr = new GlideRecordSecure('x_783010_tocc_a1_kpi_snapshot');
        gr.addQuery('active', true);
        gr.addQuery('snapshot_date', snapshotDate);
        gr.addQuery('kpi_key', 'IN', keys.join(','));
        gr.query();

        while (gr.next()) {
            var key = gr.getValue('kpi_key');
            byKey[key] = {
                key: key,
                label: gr.getValue('kpi_label') || key,
                value: this._toNumber(gr.getValue('kpi_value')),
                unit: gr.getValue('kpi_unit') || '',
            };
        }

        var orderedMetrics = [];
        for (var i = 0; i < keys.length; i++) {
            var wantedKey = keys[i];
            if (byKey[wantedKey]) {
                orderedMetrics.push(byKey[wantedKey]);
            }
        }

        return {
            snapshot_date: snapshotDate,
            metrics: orderedMetrics,
        };
    },

    _toNumber: function(value) {
        var n = parseFloat(value);
        return isNaN(n) ? 0 : n;
    },

    _getHelpCenterContextObject: function() {
        var supportPage = gs.getProperty('x_783010_tocc_a1.portal.support_page', '?id=tocc_help');
        return {
            success: true,
            kb_url: gs.getProperty('x_783010_tocc_a1.portal.kb_url', '?id=kb_home'),
            va_url: gs.getProperty('x_783010_tocc_a1.portal.va_url', '/$sn-va-web-client-app.do'),
            support_page: supportPage,
            support_catalog_url: gs.getProperty('x_783010_tocc_a1.portal.support_catalog_url', supportPage),
            backoffice_email: gs.getProperty(
                'x_783010_tocc_a1.backoffice.email',
                gs.getProperty('x_783010_tocc_a1.portal.support_email', 'training-ops@company.com')
            ),
        };
    },

    type: 'PortalApiService'
});`,
})
