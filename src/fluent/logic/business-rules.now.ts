import { BusinessRule } from '@servicenow/sdk/core'

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_validate_room_reservation'],
    table: 'x_783010_tocc_a1_room_reservation',
    name: 'Validate Room Reservation',
    when: 'before',
    action: ['insert', 'update'],
    active: true,
    order: 100,
    script: `(function executeRule(current, previous) {
    var svc = new RoomService();
    var error = svc.validateReservation(current);

    if (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
    }
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_validate_training_enrollment'],
    table: 'x_783010_tocc_a1_student_enrollment',
    name: 'Validate Training Enrollment',
    when: 'before',
    action: ['insert', 'update'],
    active: true,
    order: 100,
    script: `(function executeRule(current, previous) {
    var svc = new EnrollmentService();
    var error = svc.validateBeforeSave(current, previous);
    if (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
    }
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_sync_session_from_reservation'],
    table: 'x_783010_tocc_a1_room_reservation',
    name: 'Sync Training Session From Reservation',
    when: 'after',
    action: ['insert', 'update'],
    active: true,
    order: 100,
    script: `(function executeRule(current, previous) {
    if (current.operation() == 'update') {
        var hasMaterialChange = current.status.changes() ||
            current.course.changes() ||
            current.room.changes() ||
            current.instructor.changes() ||
            current.start_datetime.changes() ||
            current.end_datetime.changes() ||
            current.expected_participants.changes();

        if (!hasMaterialChange) {
            return;
        }
    }

    var svc = new TrainingSessionService();
    svc.syncFromReservation(current);
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_validate_training_session_room'],
    table: 'x_783010_tocc_a1_training_session',
    name: 'Validate Training Session Room',
    when: 'before',
    action: ['insert', 'update'],
    active: true,
    order: 90,
    script: `(function executeRule(current, previous) {
    var svc = new TrainingSessionService();
    var error = svc.ensureSessionRoom(current);

    if (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
    }
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_sync_seats_from_enrollment'],
    table: 'x_783010_tocc_a1_student_enrollment',
    name: 'Sync Seats From Enrollment',
    when: 'after',
    action: ['insert', 'update', 'delete'],
    active: true,
    order: 200,
    script: `(function executeRule(current, previous) {
    var sessionId = current.getValue('training_session') || previous.getValue('training_session');
    if (!sessionId) {
        return;
    }

    var svc = new EnrollmentService();
    svc.syncSessionAfterEnrollmentChange(sessionId);
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_log_reservation_status_transition'],
    table: 'x_783010_tocc_a1_room_reservation',
    name: 'Log Reservation Status Transition',
    when: 'before',
    action: ['update'],
    active: true,
    order: 300,
    script: `(function executeRule(current, previous) {
    if (!current.status.changes()) {
        return;
    }

    current.setValue(
        'work_notes',
        'Status changed from "' + previous.getDisplayValue('status') + '" to "' + current.getDisplayValue('status') + '".'
    );
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_log_enrollment_status_transition'],
    table: 'x_783010_tocc_a1_student_enrollment',
    name: 'Log Enrollment Status Transition',
    when: 'before',
    action: ['update'],
    active: true,
    order: 300,
    script: `(function executeRule(current, previous) {
    if (!current.status.changes()) {
        return;
    }

    current.setValue(
        'work_notes',
        'Enrollment status changed from "' + previous.getDisplayValue('status') + '" to "' + current.getDisplayValue('status') + '".'
    );
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_autofill_student_from_logged_user'],
    table: 'x_783010_tocc_a1_student_enrollment',
    name: 'Auto Fill Student From Logged User',
    when: 'before',
    action: ['insert'],
    active: true,
    order: 50,
    script: `(function executeRule(current, previous) {
    if (!gs.nil(current.getValue('student'))) {
        return;
    }

    var grStudent = new GlideRecord('x_783010_tocc_a1_student');
    grStudent.addQuery('user', gs.getUserID());
    grStudent.addQuery('active', true);
    grStudent.setLimit(1);
    grStudent.query();

    if (grStudent.next()) {
        current.setValue('student', grStudent.getUniqueValue());
        return;
    }

    gs.addErrorMessage('No active student profile was found for the logged-in user.');
    current.setAbortAction(true);
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_validate_feedback_rating'],
    table: 'x_783010_tocc_a1_training_feedback',
    name: 'Validate Feedback Rating',
    when: 'before',
    action: ['insert', 'update'],
    active: true,
    order: 100,
    script: `(function executeRule(current, previous) {
    var rating = parseInt(current.getValue('rating'), 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        gs.addErrorMessage('Feedback rating must be between 1 and 5.');
        current.setAbortAction(true);
        return;
    }

    var enrollmentId = current.getValue('enrollment');
    if (!enrollmentId) {
        gs.addErrorMessage('Enrollment is required.');
        current.setAbortAction(true);
        return;
    }

    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
    if (!enrollment.get(enrollmentId)) {
        gs.addErrorMessage('Enrollment not found.');
        current.setAbortAction(true);
        return;
    }

    var duplicate = new GlideRecord('x_783010_tocc_a1_training_feedback');
    duplicate.addQuery('enrollment', enrollmentId);
    duplicate.addQuery('sys_id', '!=', current.getUniqueValue());
    duplicate.setLimit(1);
    duplicate.query();

    if (duplicate.next()) {
        gs.addErrorMessage('Feedback has already been submitted for this enrollment.');
        current.setAbortAction(true);
        return;
    }

    var enrollmentStatus = enrollment.getValue('status');
    if (enrollmentStatus != 'approved') {
        gs.addErrorMessage('Feedback is only allowed for approved enrollments.');
        current.setAbortAction(true);
        return;
    }

    var sessionId = enrollment.getValue('training_session');
    if (!sessionId) {
        gs.addErrorMessage('Training session was not found for this enrollment.');
        current.setAbortAction(true);
        return;
    }

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    if (!session.get(sessionId)) {
        gs.addErrorMessage('Training session was not found for this enrollment.');
        current.setAbortAction(true);
        return;
    }

    if (session.getValue('status') != 'completed') {
        gs.addErrorMessage('Feedback is available only after the training session is completed.');
        current.setAbortAction(true);
    }
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_validate_attendance_marking'],
    table: 'x_783010_tocc_a1_attendance',
    name: 'Validate Attendance Marking',
    when: 'before',
    action: ['insert', 'update'],
    active: true,
    order: 100,
    script: `(function executeRule(current, previous) {
    var status = current.getValue('attendance_status');
    if (!status || status == 'pending') {
        return;
    }

    var sessionId = current.getValue('training_session');
    if (!sessionId) {
        var enrollmentId = current.getValue('enrollment');
        if (!gs.nil(enrollmentId)) {
            var enrollmentForSession = new GlideRecord('x_783010_tocc_a1_student_enrollment');
            if (enrollmentForSession.get(enrollmentId)) {
                sessionId = enrollmentForSession.getValue('training_session');
                if (!gs.nil(sessionId)) {
                    current.setValue('training_session', sessionId);
                }
            }
        }
    }

    if (!sessionId) {
        gs.addErrorMessage('Attendance requires a valid training session.');
        current.setAbortAction(true);
        return;
    }

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    if (!session.get(sessionId)) {
        gs.addErrorMessage('Training session not found for this attendance record.');
        current.setAbortAction(true);
        return;
    }

    var sessionStatus = session.getValue('status');
    if (sessionStatus != 'in_progress' && sessionStatus != 'completed') {
        gs.addErrorMessage('Attendance can be marked only when the session is In Progress or Completed.');
        current.setAbortAction(true);
        return;
    }

    var enrollmentIdForCheck = current.getValue('enrollment');
    if (!gs.nil(enrollmentIdForCheck)) {
        var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
        if (enrollment.get(enrollmentIdForCheck) && enrollment.getValue('status') != 'approved') {
            gs.addErrorMessage('Attendance can be marked only for approved enrollments.');
            current.setAbortAction(true);
        }
    }
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_stamp_attendance_marking'],
    table: 'x_783010_tocc_a1_attendance',
    name: 'Stamp Attendance Marking Metadata',
    when: 'before',
    action: ['insert', 'update'],
    active: true,
    order: 200,
    script: `(function executeRule(current, previous) {
    if (current.operation() == 'update' && !current.attendance_status.changes()) {
        return;
    }

    var status = current.getValue('attendance_status');
    if (status == 'pending') {
        return;
    }

    var now = new GlideDateTime().getValue();
    var userId = gs.getUserID();

    current.setValue('recorded_by', userId);
    current.setValue('recorded_at', now);

    if (status == 'present') {
        current.setValue('checked_by', userId);
        current.setValue('checked_in_datetime', now);
    } else {
        current.setValue('checked_by', userId);
        current.setValue('checked_in_datetime', '');
    }
})(current, previous);`,
})
