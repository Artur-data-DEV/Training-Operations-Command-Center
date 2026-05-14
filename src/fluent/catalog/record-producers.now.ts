import {
    CatalogItemRecordProducer,
    DateTimeVariable,
    MultiLineTextVariable,
    NumericScaleVariable,
    ReferenceVariable,
} from '@servicenow/sdk/core'
import { toccServiceCatalog, toccServiceCategory } from './catalog-structure.now'

export const createRoomReservationProducer = CatalogItemRecordProducer({
    $id: Now.ID['x_783010_tocc_a1_record_producer_create_room_reservation'],
    name: 'Create Room Reservation',
    table: 'x_783010_tocc_a1_room_reservation',
    active: true,
    state: 'published',
    shortDescription: 'For instructors to submit room reservation requests.',
    meta: ['training', 'room', 'reservation', 'instructor'],
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.admin'],
    catalogs: [toccServiceCatalog, Now.ref('sc_catalog', { title: 'Service Catalog' })],
    categories: [toccServiceCategory],
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
    // Explicitly map producer vars before BR validation to avoid timing/mapping gaps.
    current.setValue('room', producer.reservation_room);
    current.setValue('course', producer.reservation_course);
    current.setValue('start_datetime', producer.reservation_start_datetime);
    current.setValue('end_datetime', producer.reservation_end_datetime);
    current.setValue('expected_participants', producer.reservation_expected_participants);
    current.setValue('description', producer.reservation_notes);

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

export const requestTrainingEnrollmentProducer = CatalogItemRecordProducer({
    $id: Now.ID['x_783010_tocc_a1_record_producer_request_training_enrollment'],
    name: 'Request Training Enrollment',
    table: 'x_783010_tocc_a1_student_enrollment',
    active: true,
    state: 'published',
    shortDescription: 'For students to request enrollment in training sessions.',
    meta: ['training', 'enrollment', 'student', 'session'],
    roles: ['x_783010_tocc_a1.student', 'x_783010_tocc_a1.admin'],
    catalogs: [toccServiceCatalog, Now.ref('sc_catalog', { title: 'Service Catalog' })],
    categories: [toccServiceCategory],
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
