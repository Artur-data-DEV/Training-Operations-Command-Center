import {
    CatalogItemRecordProducer,
    DateTimeVariable,
    MultiLineTextVariable,
    NumericScaleVariable,
    ReferenceVariable,
} from '@servicenow/sdk/core'

CatalogItemRecordProducer({
    $id: Now.ID['x_783010_tocc_a1_record_producer_create_room_reservation'],
    name: 'Create Room Reservation',
    table: 'x_783010_tocc_a1_room_reservation',
    active: true,
    shortDescription: 'For instructors to submit room reservation requests.',
    roles: ['x_783010_tocc_a1.instructor'],
    variables: {
        reservation_room: ReferenceVariable({
            question: 'Select Room',
            order: 100,
            mandatory: true,
            referenceTable: 'x_783010_tocc_a1_room',
            mapToField: true,
            field: 'room',
        }),
        reservation_course: ReferenceVariable({
            question: 'Select Course',
            order: 200,
            mandatory: true,
            referenceTable: 'x_783010_tocc_a1_course',
            mapToField: true,
            field: 'course',
        }),
        reservation_start_datetime: DateTimeVariable({
            question: 'Start Date/Time',
            order: 300,
            mandatory: true,
            mapToField: true,
            field: 'start_datetime',
        }),
        reservation_end_datetime: DateTimeVariable({
            question: 'End Date/Time',
            order: 400,
            mandatory: true,
            mapToField: true,
            field: 'end_datetime',
        }),
        reservation_expected_participants: NumericScaleVariable({
            question: 'Expected Participants',
            order: 500,
            mandatory: true,
            scaleMin: 1,
            scaleMax: 500,
            mapToField: true,
            field: 'expected_participants',
        }),
        reservation_notes: MultiLineTextVariable({
            question: 'Additional Notes',
            order: 600,
            mandatory: false,
            mapToField: true,
            field: 'description',
        }),
    },
    script: `(function execute(producer, current) {
    current.setValue('instructor', gs.getUserID());
    current.setValue('status', 'submitted');

    if (gs.nil(current.getValue('short_description'))) {
        current.setValue(
            'short_description',
            'Room reservation request for ' + current.getDisplayValue('course')
        );
    }
})(producer, current);`,
})

CatalogItemRecordProducer({
    $id: Now.ID['x_783010_tocc_a1_record_producer_request_training_enrollment'],
    name: 'Request Training Enrollment',
    table: 'x_783010_tocc_a1_student_enrollment',
    active: true,
    shortDescription: 'For students to request enrollment in training sessions.',
    roles: ['x_783010_tocc_a1.student'],
    variables: {
        enrollment_training_session: ReferenceVariable({
            question: 'Training Session',
            order: 100,
            mandatory: true,
            referenceTable: 'x_783010_tocc_a1_training_session',
            useReferenceQualifier: 'simple',
            referenceQualCondition: 'statusINopen,full',
            mapToField: true,
            field: 'training_session',
        }),
        enrollment_notes: MultiLineTextVariable({
            question: 'Additional Notes',
            order: 200,
            mandatory: false,
            mapToField: true,
            field: 'description',
        }),
    },
    script: `(function execute(producer, current) {
    var student = new GlideRecord('x_783010_tocc_a1_student');
    student.addQuery('user', gs.getUserID());
    student.addQuery('active', true);
    student.setLimit(1);
    student.query();

    if (!student.next()) {
        gs.addErrorMessage('Student profile not found for the logged-in user.');
        current.setAbortAction(true);
        return;
    }

    current.setValue('student', student.getUniqueValue());
    current.setValue('status', 'pending');

    if (gs.nil(current.getValue('short_description'))) {
        current.setValue(
            'short_description',
            'Enrollment request for ' + current.getDisplayValue('training_session')
        );
    }
})(producer, current);`,
})
