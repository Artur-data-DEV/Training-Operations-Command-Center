import {
    CatalogItemRecordProducer,
    DateTimeVariable,
    LookupSelectBoxVariable,
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
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.admin', 'admin'],
    catalogs: [toccServiceCatalog, Now.ref('sc_catalog', { title: 'Service Catalog' })],
    categories: [toccServiceCategory],
    variables: {
        room: LookupSelectBoxVariable({
            question: 'Select Room',
            order: 100,
            mandatory: true,
            lookupFromTable: 'x_783010_tocc_a1_room',
            lookupValueField: 'sys_id',
            lookupLabelFields: ['room_name', 'room_code'],
            referenceQual: 'status=active',
            includeNone: false,
            mapToField: true,
            field: 'room',
        }),
        course: LookupSelectBoxVariable({
            question: 'Select Course',
            order: 200,
            mandatory: true,
            lookupFromTable: 'x_783010_tocc_a1_course',
            lookupValueField: 'sys_id',
            lookupLabelFields: ['course_name', 'course_id'],
            referenceQual: 'status=active',
            includeNone: false,
            mapToField: true,
            field: 'course',
        }),
        start_datetime: DateTimeVariable({
            question: 'Start Date/Time',
            order: 300,
            mandatory: true,
            mapToField: true,
            field: 'start_datetime',
        }),
        end_datetime: DateTimeVariable({
            question: 'End Date/Time',
            order: 400,
            mandatory: true,
            mapToField: true,
            field: 'end_datetime',
        }),
        expected_participants: NumericScaleVariable({
            question: 'Expected Participants',
            order: 500,
            mandatory: true,
            scaleMin: 1,
            scaleMax: 500,
            mapToField: true,
            field: 'expected_participants',
        }),
        description: MultiLineTextVariable({
            question: 'Additional Notes',
            order: 600,
            mandatory: false,
            mapToField: true,
            field: 'description',
        }),
    },
    script: `(function execute(producer, current) {
    // mapToField should handle core fields; keep fallback for portal/runtime mapping edge-cases.
    function pick() {
        for (var i = 0; i < arguments.length; i++) {
            if (!gs.nil(arguments[i])) return arguments[i];
        }
        return '';
    }

    function extractRawValue(value) {
        if (gs.nil(value)) return '';
        try {
            if (typeof value.getValue === 'function') {
                var gv = value.getValue();
                if (!gs.nil(gv)) return gv;
            }
        } catch (e1) {}
        if (value && value.sys_id) return value.sys_id;
        if (value && value.value) return value.value;
        return value;
    }

    function resolveReferenceId(raw, tableName, displayFields) {
        var value = extractRawValue(raw);
        if (gs.nil(value)) return '';
        var s = String(value);
        if (/^[0-9a-f]{32}$/i.test(s)) return s;

        var gr = new GlideRecord(tableName);
        for (var i = 0; i < displayFields.length; i++) {
            gr.initialize();
            gr.addQuery(displayFields[i], s);
            gr.setLimit(1);
            gr.query();
            if (gr.next()) return gr.getUniqueValue();
        }
        return '';
    }

    function setReferenceIfEmpty(fieldName, raw, tableName, displayFields) {
        if (!gs.nil(current.getValue(fieldName))) return;
        var refId = resolveReferenceId(raw, tableName, displayFields);
        if (!gs.nil(refId)) current.setValue(fieldName, refId);
    }

    function resolveReferenceLabel(raw, tableName, displayFields) {
        var refId = resolveReferenceId(raw, tableName, displayFields);
        if (gs.nil(refId)) return '';

        var gr = new GlideRecord(tableName);
        if (!gr.get(refId)) return '';

        for (var i = 0; i < displayFields.length; i++) {
            var label = String(gr.getDisplayValue(displayFields[i]) || '').trim();
            if (!gs.nil(label)) return label;
        }

        return String(gr.getDisplayValue() || '').trim();
    }

    function setValueIfEmpty(fieldName, value) {
        if (!gs.nil(current.getValue(fieldName)) || gs.nil(value)) return;
        current.setValue(fieldName, extractRawValue(value));
    }

    function setDateIfEmpty(fieldName, value) {
        if (!gs.nil(current.getValue(fieldName)) || gs.nil(value)) return;
        try {
            current.setDisplayValue(fieldName, String(value));
        } catch (e) {
            current.setValue(fieldName, String(value));
        }
    }

    var roomRaw = pick(producer.room, producer.reservation_room);
    var courseRaw = pick(producer.course, producer.reservation_course);
    var startRaw = pick(producer.start_datetime, producer.reservation_start_datetime, producer.reservation_start_date_time);
    var endRaw = pick(producer.end_datetime, producer.reservation_end_datetime, producer.reservation_end_date_time);
    var participantsRaw = pick(producer.expected_participants, producer.reservation_expected_participants);
    var notesRaw = pick(producer.description, producer.reservation_notes);

    setReferenceIfEmpty('room', roomRaw, 'x_783010_tocc_a1_room', ['room_code', 'room_name']);
    setReferenceIfEmpty('course', courseRaw, 'x_783010_tocc_a1_course', ['course_id', 'course_name']);
    setDateIfEmpty('start_datetime', startRaw);
    setDateIfEmpty('end_datetime', endRaw);
    setValueIfEmpty('expected_participants', participantsRaw);
    setValueIfEmpty('description', notesRaw);

    current.setValue('instructor', gs.getUserID());
    current.setValue('status', 'submitted');

    if (gs.nil(current.getValue('short_description'))) {
        var courseLabel = current.getDisplayValue('course');
        if (/^[0-9a-f]{32}$/i.test(String(courseLabel || ''))) {
            courseLabel = '';
        }
        if (gs.nil(courseLabel)) {
            courseLabel = resolveReferenceLabel(courseRaw, 'x_783010_tocc_a1_course', ['course_name', 'course_id']);
        }
        if (gs.nil(courseLabel)) {
            courseLabel = String(extractRawValue(courseRaw) || '').trim();
        }
        if (gs.nil(courseLabel)) {
            current.setValue('short_description', 'Room reservation request');
        } else {
            current.setValue('short_description', 'Room reservation request for ' + courseLabel);
        }
    }

    if (gs.nil(current.getValue('room'))) {
        gs.error('[TOCC][RP][CreateRoomReservation] room unresolved | user=' + gs.getUserID() +
            ' | roomRaw=' + extractRawValue(roomRaw) +
            ' | courseRaw=' + extractRawValue(courseRaw) +
            ' | startRaw=' + extractRawValue(startRaw) +
            ' | endRaw=' + extractRawValue(endRaw));
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
    roles: ['x_783010_tocc_a1.student', 'x_783010_tocc_a1.admin', 'admin'],
    catalogs: [toccServiceCatalog, Now.ref('sc_catalog', { title: 'Service Catalog' })],
    categories: [toccServiceCategory],
    variables: {
        training_session: ReferenceVariable({
            question: 'Training Session',
            order: 100,
            mandatory: true,
            referenceTable: 'x_783010_tocc_a1_training_session',
            useReferenceQualifier: 'simple',
            referenceQualCondition: 'statusINopen,full',
            mapToField: true,
            field: 'training_session',
        }),
        description: MultiLineTextVariable({
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
