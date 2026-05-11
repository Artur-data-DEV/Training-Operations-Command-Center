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
