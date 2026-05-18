import { UiAction } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// UI Actions — Room Reservation
// ---------------------------------------------------------------------------

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_approve_reservation'],
    name: 'Approve Reservation',
    table: 'x_783010_tocc_a1_room_reservation',
    active: true,
    actionName: 'approve_reservation',
    hint: 'Approve this room reservation and create the training session.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    showUpdate: true,
    form: { showButton: true, style: 'primary' },
    list: { showButton: true, showListChoice: true, showBannerButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    condition: 'current.status == "submitted"',
    script: `(function approveReservation() {
    if (current.getValue('status') !== 'submitted') {
        gs.addErrorMessage('Only submitted reservations can be approved.');
        action.setRedirectURL(current);
        return;
    }

    var missing = [];
    if (gs.nil(current.getValue('tocc_course'))) {
        missing.push('course');
    }
    if (gs.nil(current.getValue('tocc_room'))) {
        missing.push('room');
    }
    if (gs.nil(current.getValue('tocc_instructor'))) {
        missing.push('instructor');
    }
    if (gs.nil(current.getValue('start_datetime'))) {
        missing.push('start date/time');
    }
    if (gs.nil(current.getValue('end_datetime'))) {
        missing.push('end date/time');
    }
    if ((parseInt(current.getValue('expected_participants'), 10) || 0) < 1) {
        missing.push('expected participants');
    }

    if (missing.length > 0) {
        gs.addErrorMessage('Cannot approve this reservation. Missing or invalid data: ' + missing.join(', ') + '.');
        action.setRedirectURL(current);
        return;
    }

    current.setValue('status', 'approved');
    current.setValue('work_notes', 'Reservation approved by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    var updatedId = current.update();

    if (!updatedId) {
        gs.addErrorMessage('Reservation approval failed. Check the required fields and room schedule.');
        action.setRedirectURL(current);
        return;
    }

    var sync = new TrainingSessionService();
    sync.syncFromReservation(current);

    var refreshed = new GlideRecord('x_783010_tocc_a1_room_reservation');
    if (refreshed.get(current.getUniqueValue()) && !gs.nil(refreshed.getValue('training_session'))) {
        gs.addInfoMessage('Reservation approved. Training session created: ' + refreshed.getDisplayValue('training_session') + '.');
    } else {
        gs.addErrorMessage('Reservation was approved, but no training session was linked. Review the Sync Training Session From Reservation business rule.');
    }
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_reject_reservation'],
    name: 'Reject Reservation',
    table: 'x_783010_tocc_a1_room_reservation',
    active: true,
    actionName: 'reject_reservation',
    hint: 'Reject this room reservation request.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    showUpdate: true,
    form: { showButton: true, style: 'destructive' },
    list: { showButton: true, showListChoice: true, showBannerButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 110,
    condition: 'current.status == "submitted"',
    script: `(function rejectReservation() {
    if (current.getValue('status') !== 'submitted') {
        gs.addErrorMessage('Only submitted reservations can be rejected.');
        action.setRedirectURL(current);
        return;
    }

    current.setValue('status', 'rejected');
    current.setValue('work_notes', 'Reservation rejected by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    current.update();

    var helper = new NotificationHelper();
    helper.sendReservationDecision(current.getUniqueValue());

    gs.addInfoMessage('Reservation rejected.');
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_cancel_reservation'],
    name: 'Cancel Reservation',
    table: 'x_783010_tocc_a1_room_reservation',
    active: true,
    actionName: 'cancel_reservation',
    hint: 'Cancel this reservation and the linked training session.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    showUpdate: true,
    form: { showButton: true },
    list: { showListChoice: true },
    workspace: { isConfigurableWorkspace: true, showFormMenuButtonV2: true },
    order: 120,
    condition: 'current.status != "cancelled" && current.status != "rejected"',
    script: `(function cancelReservation() {
    var status = current.getValue('status');
    if (status === 'cancelled' || status === 'rejected') {
        gs.addErrorMessage('Reservation is already ' + status + '.');
        action.setRedirectURL(current);
        return;
    }

    current.setValue('status', 'cancelled');
    current.setValue('work_notes', 'Reservation cancelled by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    current.update();

    gs.addInfoMessage('Reservation cancelled. Linked training session updated.');
    action.setRedirectURL(current);
})();`,
})

// ---------------------------------------------------------------------------
// UI Actions — Student Enrollment
// ---------------------------------------------------------------------------

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_approve_enrollment'],
    name: 'Approve Enrollment',
    table: 'x_783010_tocc_a1_student_enrollment',
    active: true,
    actionName: 'approve_enrollment',
    hint: 'Approve this enrollment and reserve a seat for the student.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.status == "pending"',
    script: `(function approveEnrollment() {
    if (current.getValue('status') !== 'pending') {
        gs.addErrorMessage('Only pending enrollments can be approved.');
        action.setRedirectURL(current);
        return;
    }

    current.setValue('status', 'approved');
    current.setValue('work_notes', 'Enrollment approved by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    current.update();

    var helper = new NotificationHelper();
    helper.sendEnrollmentDecision(current.getUniqueValue());

    gs.addInfoMessage('Enrollment approved. Student notified.');
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_reject_enrollment'],
    name: 'Reject Enrollment',
    table: 'x_783010_tocc_a1_student_enrollment',
    active: true,
    actionName: 'reject_enrollment',
    hint: 'Reject this enrollment request.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.status == "pending"',
    script: `(function rejectEnrollment() {
    if (current.getValue('status') !== 'pending') {
        gs.addErrorMessage('Only pending enrollments can be rejected.');
        action.setRedirectURL(current);
        return;
    }

    current.setValue('status', 'rejected');
    current.setValue('work_notes', 'Enrollment rejected by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    current.update();

    var helper = new NotificationHelper();
    helper.sendEnrollmentDecision(current.getUniqueValue());

    gs.addInfoMessage('Enrollment rejected. Student notified.');
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_confirm_attendance'],
    name: 'Confirm Attendance',
    table: 'x_783010_tocc_a1_student_enrollment',
    active: true,
    actionName: 'confirm_attendance',
    hint: 'Confirm your attendance for this training session.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.student', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.status == "approved" && !current.confirmed',
    script: `(function confirmAttendance() {
    if (current.getValue('status') !== 'approved') {
        gs.addErrorMessage('Only approved enrollments can be confirmed.');
        action.setRedirectURL(current);
        return;
    }

    if (current.getValue('confirmed') === 'true') {
        gs.addInfoMessage('Attendance already confirmed.');
        action.setRedirectURL(current);
        return;
    }

    // Validate confirmation deadline.
    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    if (session.get(current.getValue('tocc_training_session'))) {
        var deadline = session.getValue('confirmation_deadline');
        if (deadline) {
            var now = new GlideDateTime();
            var deadlineGdt = new GlideDateTime(deadline);
            if (now.compareTo(deadlineGdt) > 0) {
                gs.addErrorMessage('Confirmation deadline has passed. Please contact the training team.');
                action.setRedirectURL(current);
                return;
            }
        }
    }

    current.setValue('confirmed', true);
    current.setValue('work_notes', 'Attendance confirmed by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(false);
    current.update();

    gs.addInfoMessage('Attendance confirmed. See you at the session!');
    action.setRedirectURL(current);
})();`,
})

// ---------------------------------------------------------------------------
// UI Actions — Training Session
// ---------------------------------------------------------------------------

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_close_session'],
    name: 'Close Session',
    table: 'x_783010_tocc_a1_training_session',
    active: true,
    actionName: 'close_session',
    hint: 'Manually close this session and trigger feedback notifications.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.status == "open" || current.status == "full" || current.status == "in_progress"',
    script: `(function closeSession() {
    var status = current.getValue('status');
    var allowed = ['open', 'full', 'in_progress'];
    if (allowed.indexOf(status) === -1) {
        gs.addErrorMessage('Session cannot be closed from its current status.');
        action.setRedirectURL(current);
        return;
    }

    current.setValue('status', 'completed');
    current.setValue('work_notes', 'Session manually closed by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(false);
    current.update();

    var helper = new NotificationHelper();
    helper.sendFeedbackRequests(current.getUniqueValue());

    gs.addInfoMessage('Session closed. Feedback notifications dispatched.');
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_reopen_session'],
    name: 'Reopen Session',
    table: 'x_783010_tocc_a1_training_session',
    active: true,
    actionName: 'reopen_session',
    hint: 'Reopen a completed session. Use with caution.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.status == "completed"',
    script: `(function reopenSession() {
    if (current.getValue('status') !== 'completed') {
        gs.addErrorMessage('Only completed sessions can be reopened.');
        action.setRedirectURL(current);
        return;
    }

    var availableSeats = parseInt(current.getValue('available_seats'), 10) || 0;
    var newStatus = availableSeats > 0 ? 'open' : 'full';

    current.setValue('status', newStatus);
    current.setValue('work_notes', 'Session reopened by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(false);
    current.update();

    gs.addInfoMessage('Session reopened with status: ' + newStatus + '.');
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_start_session'],
    name: 'Start Session',
    table: 'x_783010_tocc_a1_training_session',
    active: true,
    actionName: 'start_session',
    hint: 'Mark this session as In Progress and generate attendance records.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.status == "open" || current.status == "full"',
    script: `(function startSession() {
    var status = current.getValue('status');
    if (status !== 'open' && status !== 'full') {
        gs.addErrorMessage('Session can only be started from Open or Full status.');
        action.setRedirectURL(current);
        return;
    }

    current.setValue('status', 'in_progress');
    current.setValue('work_notes', 'Session started by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(false);
    current.update();

    // Auto-generate attendance records for all approved enrollments.
    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
    enrollment.addQuery('tocc_training_session', current.getUniqueValue());
    enrollment.addQuery('status', 'approved');
    enrollment.query();

    var generated = 0;
    while (enrollment.next()) {
        var existing = new GlideRecord('x_783010_tocc_a1_attendance');
        existing.addQuery('enrollment', enrollment.getUniqueValue());
        existing.setLimit(1);
        existing.query();

        if (!existing.next()) {
            var attendance = new GlideRecord('x_783010_tocc_a1_attendance');
            attendance.initialize();
            attendance.setValue('training_session', current.getUniqueValue());
            attendance.setValue('enrollment', enrollment.getUniqueValue());
            attendance.setValue('attendance_status', 'pending');
            attendance.setWorkflow(false);
            attendance.insert();
            generated++;
        }
    }

    gs.addInfoMessage('Session started. ' + generated + ' attendance record(s) generated.');
    action.setRedirectURL(current);
})();`,
})

// ---------------------------------------------------------------------------
// UI Actions - Attendance
// ---------------------------------------------------------------------------

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_attendance_mark_present'],
    name: 'Mark Present',
    table: 'x_783010_tocc_a1_attendance',
    active: true,
    actionName: 'mark_present',
    hint: 'Set attendance status to Present.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.attendance_status != "present"',
    script: `(function markPresent() {
    current.setValue('attendance_status', 'present');
    current.setValue('work_notes', 'Attendance marked as Present by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    current.update();

    gs.addInfoMessage('Attendance marked as Present.');
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_attendance_mark_absent'],
    name: 'Mark Absent',
    table: 'x_783010_tocc_a1_attendance',
    active: true,
    actionName: 'mark_absent',
    hint: 'Set attendance status to Absent.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.attendance_status != "absent"',
    script: `(function markAbsent() {
    current.setValue('attendance_status', 'absent');
    current.setValue('work_notes', 'Attendance marked as Absent by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    current.update();

    gs.addInfoMessage('Attendance marked as Absent.');
    action.setRedirectURL(current);
})();`,
})

UiAction({
    $id: Now.ID['x_783010_tocc_a1_uia_attendance_mark_no_show'],
    name: 'Mark No Show',
    table: 'x_783010_tocc_a1_attendance',
    active: true,
    actionName: 'mark_no_show',
    hint: 'Set attendance status to No Show.',
    client: { isClient: false },
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    condition: 'current.attendance_status != "no_show"',
    script: `(function markNoShow() {
    current.setValue('attendance_status', 'no_show');
    current.setValue('work_notes', 'Attendance marked as No Show by ' + gs.getUserDisplayName() + '.');
    current.setWorkflow(true);
    current.update();

    gs.addInfoMessage('Attendance marked as No Show.');
    action.setRedirectURL(current);
})();`,
})
