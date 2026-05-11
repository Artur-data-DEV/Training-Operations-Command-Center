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
    var sessionId = current.getValue('training_session');
    var studentId = current.getValue('student');

    if (!sessionId || !studentId) {
        gs.addErrorMessage('Student and Training Session are required.');
        current.setAbortAction(true);
        return;
    }

    var duplicate = new GlideRecord('x_783010_tocc_a1_student_enrollment');
    duplicate.addQuery('training_session', sessionId);
    duplicate.addQuery('student', studentId);
    duplicate.addQuery('sys_id', '!=', current.getUniqueValue());
    duplicate.query();

    if (duplicate.next()) {
        gs.addErrorMessage('Student is already enrolled in this training session.');
        current.setAbortAction(true);
        return;
    }

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    if (!session.get(sessionId)) {
        gs.addErrorMessage('Training Session not found.');
        current.setAbortAction(true);
        return;
    }

    var capacity = parseInt(session.getValue('total_seats'), 10) || 0;
    var agg = new GlideAggregate('x_783010_tocc_a1_student_enrollment');
    agg.addQuery('training_session', sessionId);
    agg.addQuery('status', 'NOT IN', 'rejected,cancelled');
    agg.addAggregate('COUNT');
    agg.query();
    agg.next();

    var total = parseInt(agg.getAggregate('COUNT'), 10) || 0;
    if (capacity > 0 && total >= capacity) {
        gs.addErrorMessage('Training session is full.');
        current.setAbortAction(true);
    }
})(current, previous);`,
})

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_sync_session_from_reservation'],
    table: 'x_783010_tocc_a1_room_reservation',
    name: 'Sync Training Session From Reservation',
    when: 'after',
    action: ['insert'],
    active: true,
    order: 100,
    script: `(function executeRule(current, previous) {
    if (current.getValue('training_session')) {
        return;
    }

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    session.initialize();
    session.setValue('course', current.getValue('course'));
    session.setValue('reservation', current.getUniqueValue());
    session.setValue('room', current.getValue('room'));
    session.setValue('title', 'Session - ' + current.course.getDisplayValue());
    session.setValue('instructor', current.getValue('instructor'));
    session.setValue('start_datetime', current.getValue('start_datetime'));
    session.setValue('end_datetime', current.getValue('end_datetime'));
    session.setValue('total_seats', current.getValue('expected_participants'));
    session.setValue('available_seats', current.getValue('expected_participants'));
    session.setValue('status', 'draft');

    var sessionSysId = session.insert();
    if (!sessionSysId) {
        gs.error('Failed to create training session from reservation ' + current.getValue('number'));
        return;
    }

    current.setValue('training_session', sessionSysId);
    current.update();
})(current, previous);`,
})
