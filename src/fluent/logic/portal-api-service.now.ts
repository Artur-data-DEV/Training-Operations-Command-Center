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
// Security: all queries use GlideRecordSecure so ACLs are enforced.
// ---------------------------------------------------------------------------

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_portal_api_service'],
    name: 'PortalApiService',
    apiName: 'x_783010_tocc_a1.PortalApiService',
    accessibleFrom: 'package_private',
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
        var gr = new GlideRecordSecure('x_783010_tocc_a1_training_session');
        gr.addQuery('status', 'IN', 'open,full');
        gr.addQuery('active', true);

        if (courseFilter)   { gr.addQuery('course', courseFilter); }
        if (locationFilter) { gr.addQuery('room.location', locationFilter); }
        if (fromDate)       { gr.addQuery('start_datetime', '>=', fromDate); }

        gr.orderBy('start_datetime');
        gr.setLimit(50);
        gr.query();

        while (gr.next()) {
            sessions.push({
                sys_id:               gr.getUniqueValue(),
                number:               gr.getValue('number'),
                title:                gr.getValue('title'),
                course:               gr.getValue('course'),
                course_name:          gr.getDisplayValue('course'),
                instructor:           gr.getValue('instructor'),
                instructor_name:      gr.getDisplayValue('instructor'),
                room:                 gr.getValue('room'),
                room_name:            gr.getDisplayValue('room'),
                start_datetime:       gr.getValue('start_datetime'),
                start_display:        gr.getDisplayValue('start_datetime'),
                end_datetime:         gr.getValue('end_datetime'),
                end_display:          gr.getDisplayValue('end_datetime'),
                status:               gr.getValue('status'),
                available_seats:      gr.getValue('available_seats'),
                total_seats:          gr.getValue('total_seats'),
                enrollment_deadline:  gr.getValue('enrollment_deadline'),
                confirmation_deadline:gr.getValue('confirmation_deadline'),
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

        var gr = new GlideRecordSecure('x_783010_tocc_a1_training_session');
        if (!gr.get(sessionId)) {
            return JSON.stringify({ success: false, message: 'Session not found.' });
        }

        var session = {
            sys_id:                gr.getUniqueValue(),
            number:                gr.getValue('number'),
            title:                 gr.getValue('title'),
            course:                gr.getValue('course'),
            course_name:           gr.getDisplayValue('course'),
            instructor_name:       gr.getDisplayValue('instructor'),
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
        var gr = new GlideRecordSecure('x_783010_tocc_a1_student_enrollment');
        gr.addQuery('student', studentId);
        if (statusFilter) { gr.addQuery('status', statusFilter); }
        gr.orderBy('training_session.start_datetime');
        gr.query();

        while (gr.next()) {
            enrollments.push({
                sys_id:           gr.getUniqueValue(),
                number:           gr.getValue('number'),
                status:           gr.getValue('status'),
                status_display:   gr.getDisplayValue('status'),
                confirmed:        gr.getValue('confirmed'),
                training_session: gr.getValue('training_session'),
                session_title:    gr.getDisplayValue('training_session'),
                session_number:   gr.getDisplayValue('training_session.number'),
                start_datetime:   gr.getValue('training_session.start_datetime'),
                start_display:    gr.getDisplayValue('training_session.start_datetime'),
                room_name:        gr.getDisplayValue('training_session.room'),
                instructor_name:  gr.getDisplayValue('training_session.instructor'),
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
        var gr = new GlideRecordSecure('x_783010_tocc_a1_room_reservation');
        gr.addQuery('instructor', gs.getUserID());
        gr.orderByDesc('start_datetime');
        gr.query();

        while (gr.next()) {
            reservations.push({
                sys_id:               gr.getUniqueValue(),
                number:               gr.getValue('number'),
                status:               gr.getValue('status'),
                status_display:       gr.getDisplayValue('status'),
                course_name:          gr.getDisplayValue('course'),
                room_name:            gr.getDisplayValue('room'),
                start_datetime:       gr.getValue('start_datetime'),
                start_display:        gr.getDisplayValue('start_datetime'),
                end_display:          gr.getDisplayValue('end_datetime'),
                expected_participants:gr.getValue('expected_participants'),
                training_session:     gr.getValue('training_session'),
            });
        }

        return JSON.stringify({ success: true, reservations: reservations, count: reservations.length });
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

        var gr = new GlideRecordSecure('x_783010_tocc_a1_student_enrollment');
        if (!gr.get(enrollmentId)) {
            return JSON.stringify({ success: false, message: 'Enrollment not found.' });
        }

        // Ownership check — only the student themselves can confirm via this method.
        var studentId = this._getLoggedStudentId();
        if (gr.getValue('student') !== studentId) {
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
        if (session.get(gr.getValue('training_session'))) {
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

        var gr = new GlideRecordSecure('x_783010_tocc_a1_student_enrollment');
        if (!gr.get(enrollmentId)) {
            return JSON.stringify({ success: false, message: 'Enrollment not found.' });
        }

        if (gr.getValue('student') !== studentId) {
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
            var lateWindow = this._isLateCancellationWindow(gr.getValue('training_session'));
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
        enrollmentService.syncSessionAfterEnrollmentChange(gr.getValue('training_session'));

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
                kb: gs.getProperty('x_783010_tocc_a1.portal.kb_url', '?id=kb_home'),
            },
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
        var student = new GlideRecordSecure('x_783010_tocc_a1_student');
        student.addQuery('user', gs.getUserID());
        student.addQuery('active', true);
        student.setLimit(1);
        student.query();
        return student.next() ? student.getUniqueValue() : null;
    },

    _getStudentEnrollmentForSession: function(sessionId) {
        var studentId = this._getLoggedStudentId();
        if (!studentId) { return null; }

        var gr = new GlideRecordSecure('x_783010_tocc_a1_student_enrollment');
        gr.addQuery('student', studentId);
        gr.addQuery('training_session', sessionId);
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

        var session = new GlideRecordSecure('x_783010_tocc_a1_training_session');
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

    type: 'PortalApiService'
});`,
})
