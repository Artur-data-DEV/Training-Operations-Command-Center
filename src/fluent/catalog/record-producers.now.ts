import {
    CatalogItemRecordProducer,
    DateTimeVariable,
    ListCollectorVariable,
    MultiLineTextVariable,
    SelectBoxVariable,
    SingleLineTextVariable,
    ReferenceVariable,
    MultipleChoiceVariable,
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
    catalogs: [toccServiceCatalog],
    categories: [toccServiceCategory],
    variables: {
        reservation_room: ReferenceVariable({
            question: 'Select Room',
            order: 100,
            mandatory: true,
            referenceTable: 'x_783010_tocc_a1_room',
            referenceQual: 'status=active',
            mapToField: true,
            field: 'tocc_room',
        }),
        reservation_course: ReferenceVariable({
            question: 'Select Course',
            order: 200,
            mandatory: true,
            referenceTable: 'x_783010_tocc_a1_course',
            referenceQual: 'status=active',
            mapToField: true,
            field: 'tocc_course',
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
        reservation_expected_participants: SelectBoxVariable({
            question: 'Expected Participants',
            order: 500,
            mandatory: true,
            mapToField: true,
            field: 'expected_participants',
            includeNone: true,
            choices: {
                1: { label: '1' },
            },
        }),
        reservation_requested_resources: ListCollectorVariable({
            question: 'Optional Room Resources',
            order: 550,
            mandatory: false,
            listTable: 'x_783010_tocc_a1_room_resource',
            referenceQual: 'active=true',
            helpText: 'Select the optional resources required for this reservation.',
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
    current.setValue('tocc_instructor', gs.getUserID());
    current.setValue('status', 'submitted');

    function resolveBackofficeGroup() {
        var group = new GlideRecord('sys_user_group');
        group.addEncodedQuery('name=[TOCC] Backoffice^ORname=TOCC Backoffice^ORnameLIKEBackoffice');
        group.orderBy('name');
        group.setLimit(1);
        group.query();
        if (group.next()) {
            return group;
        }
        return null;
    }

    function resolveBackofficeAssignee(groupSysId) {
        if (gs.nil(groupSysId)) {
            return '';
        }

        var member = new GlideRecord('sys_user_grmember');
        member.addQuery('group', groupSysId);
        member.addQuery('user.active', true);
        member.orderBy('sys_created_on');
        member.setLimit(1);
        member.query();
        if (member.next()) {
            return String(member.getValue('user') || '');
        }
        return '';
    }

    var roomId = current.getValue('tocc_room') || producer.reservation_room;
    var participants = parseInt(producer.reservation_expected_participants, 10);

    if (isNaN(participants) || participants < 1) {
        gs.addErrorMessage('Expected participants must be greater than zero.');
        current.setAbortAction(true);
        return;
    }

    if (gs.nil(roomId)) {
        gs.addErrorMessage('Room is required for reservation submission.');
        current.setAbortAction(true);
        return;
    }

    var room = new GlideRecord('x_783010_tocc_a1_room');
    if (!room.get(roomId)) {
        gs.addErrorMessage('Selected room was not found.');
        current.setAbortAction(true);
        return;
    }

    var capacity = parseInt(room.getValue('capacity'), 10) || 0;
    if (capacity <= 0) {
        gs.addErrorMessage('Selected room has no valid capacity configured.');
        current.setAbortAction(true);
        return;
    }

    if (participants > capacity) {
        gs.addErrorMessage(
            'Expected participants (' +
                participants +
                ') cannot exceed room capacity (' +
                capacity +
                ').'
        );
        current.setAbortAction(true);
        return;
    }

    current.setValue('expected_participants', participants);
    current.setValue('tocc_room', roomId);
    current.setValue('tocc_course', producer.reservation_course);

    var backofficeGroup = resolveBackofficeGroup();
    if (backofficeGroup && gs.nil(current.getValue('assignment_group'))) {
        current.setValue('assignment_group', backofficeGroup.getUniqueValue());
    }
    if (gs.nil(current.getValue('assigned_to'))) {
        var backofficeAssignee = resolveBackofficeAssignee(current.getValue('assignment_group'));
        if (!gs.nil(backofficeAssignee)) {
            current.setValue('assigned_to', backofficeAssignee);
        }
    }

    if (gs.nil(current.getValue('short_description')) || /for\\s+null$/i.test(String(current.getValue('short_description')))) {
        var courseLabel = '';
        var course = new GlideRecord('x_783010_tocc_a1_course');
        if (course.get(producer.reservation_course)) {
            courseLabel = String(course.getDisplayValue('course_name') || '').trim();
            if (gs.nil(courseLabel)) {
                courseLabel = String(course.getDisplayValue() || '').trim();
            }
        }

        if (gs.nil(courseLabel)) {
            courseLabel = 'selected course';
        }

        current.setValue(
            'short_description',
            'Room reservation request for ' + courseLabel
        );
    }
})(producer, current);`,
    postInsertScript: `(function executePostInsert(producer, current, cat_item) {
    var selectedResourcesRaw = producer.reservation_requested_resources;
    if (!selectedResourcesRaw) {
        return;
    }

    var selectedResources = [];
    if (Object.prototype.toString.call(selectedResourcesRaw) === '[object Array]') {
        selectedResources = selectedResourcesRaw;
    } else if (typeof selectedResourcesRaw === 'string') {
        selectedResources = selectedResourcesRaw.split(',');
    } else {
        selectedResources = [selectedResourcesRaw];
    }

    var currentRoom = current.getValue('tocc_room');
    var insertedCount = 0;

    for (var i = 0; i < selectedResources.length; i++) {
        var resourceId = (selectedResources[i] + '').trim();
        if (!resourceId) {
            continue;
        }

        var roomResource = new GlideRecord('x_783010_tocc_a1_room_resource');
        if (!roomResource.get(resourceId)) {
            continue;
        }

        var activeVal = roomResource.getValue('active');
        if (!(activeVal == true || String(activeVal) === 'true')) {
            continue;
        }

        if (currentRoom && roomResource.getValue('room') != currentRoom) {
            continue;
        }

        var link = new GlideRecord('x_783010_tocc_a1_reservation_resource');
        link.initialize();
        link.setValue('reservation', current.getUniqueValue());
        link.setValue('room_resource', roomResource.getUniqueValue());
        link.setValue('resource_name', roomResource.getValue('resource_name'));
        link.setValue('quantity', 1);
        link.insert();
        insertedCount++;
    }

    if (insertedCount === 0) {
        current.setValue(
            'work_notes',
            'No valid room resources were linked from the Record Producer submission. Verify room-resource selection.'
        );
        current.update();
    }
})(producer, current, cat_item);`,
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
    catalogs: [toccServiceCatalog],
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
            field: 'tocc_training_session',
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
        if (!(gs.hasRole('x_783010_tocc_a1.student') || gs.hasRole('admin') || gs.hasRole('x_783010_tocc_a1.admin'))) {
            gs.addErrorMessage('Student profile not found for the logged-in user.');
            current.setAbortAction(true);
            return;
        }

        var newStudent = new GlideRecord('x_783010_tocc_a1_student');
        newStudent.initialize();
        newStudent.setValue('user', gs.getUserID());
        newStudent.setValue('active', true);
        var createdStudentId = newStudent.insert();
        if (!createdStudentId) {
            gs.addErrorMessage('Unable to create student profile for the logged-in user.');
            current.setAbortAction(true);
            return;
        }
        current.setValue('tocc_student', createdStudentId);
    } else {
        current.setValue('tocc_student', student.getUniqueValue());
    }

    current.setValue('status', 'pending');

    if (gs.nil(current.getValue('short_description'))) {
        current.setValue(
            'short_description',
            'Enrollment request for ' + current.getDisplayValue('tocc_training_session')
        );
    }
})(producer, current);`,
})

export const createCourseProducer = CatalogItemRecordProducer({
    $id: Now.ID['x_783010_tocc_a1_record_producer_create_course'],
    name: 'Create Course',
    table: 'x_783010_tocc_a1_course',
    active: true,
    state: 'published',
    shortDescription: 'For instructors to create courses before reservation and session planning.',
    meta: ['training', 'course', 'instructor'],
    roles: ['x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.admin'],
    catalogs: [toccServiceCatalog],
    categories: [toccServiceCategory],
    redirectUrl: 'catalogHomePage',
    variables: {
        course_code: SingleLineTextVariable({
            question: 'Course Code',
            order: 100,
            mandatory: true,
            mapToField: true,
            field: 'course_id',
        }),
        course_name: SingleLineTextVariable({
            question: 'Course Name',
            order: 200,
            mandatory: true,
            mapToField: true,
            field: 'course_name',
        }),
        course_description: MultiLineTextVariable({
            question: 'Course Description',
            order: 300,
            mandatory: true,
            mapToField: true,
            field: 'description',
        }),
        course_duration_hours: MultipleChoiceVariable({
            question: 'Duration (hours)',
            order: 400,
            mandatory: true,
            mapToField: true,
            field: 'duration_hours',
            choices: {
                1: { label: '1h' },
                2: { label: '2h' },
                3: { label: '3h' },
                4: { label: '4h' },
                5: { label: '5h' },
                6: { label: '6h' },
            },
        }),
        course_delivery_category: MultipleChoiceVariable({
            question: 'Delivery Category (Online or In Person)',
            order: 500,
            mandatory: true,
            mapToField: true,
            field: 'delivery_category',
            
            choices: {
                vilt: { label: 'Online (VILT)' },
                in_person: { label: 'In Person' },
            },
        }),
    },
    script: `(function execute(producer, current) {
    current.setValue('tocc_owner', gs.getUserID());

    function firstProducerValue(names) {
        for (var i = 0; i < names.length; i++) {
            var value = producer[names[i]];
            if (!gs.nil(value)) {
                return String(value).trim();
            }
        }
        return '';
    }

    function parsePositiveInteger(value) {
        var raw = String(value || '').trim();
        var match = raw.match(/\\d+/);
        if (!match) {
            return NaN;
        }
        return parseInt(match[0], 10);
    }

    var duration = parsePositiveInteger(firstProducerValue(['course_duration_hours', 'duration_hours']));
    if (isNaN(duration) || duration < 1) {
        gs.addErrorMessage('Duration (hours) must be a positive number.');
        current.setAbortAction(true);
        return;
    }

    var delivery = firstProducerValue(['course_delivery_category', 'delivery_category']).toLowerCase();
    if (delivery !== 'vilt' && delivery !== 'in_person') {
        gs.addErrorMessage('Delivery category must be either "vilt" or "in_person".');
        current.setAbortAction(true);
        return;
    }

    current.setValue('duration_hours', duration);
    current.setValue('delivery_category', delivery);

    if (gs.nil(current.getValue('status'))) {
        current.setValue('status', 'draft');
    }

    producer.portal_redirect = '?id=tocc_my_courses';
    producer.redirect = '?id=tocc_my_courses';
})(producer, current);`,
    postInsertScript: `(function execute(producer, current, cat_item) {
    producer.portal_redirect = '?id=tocc_my_courses';
    producer.redirect = '?id=tocc_my_courses';
})(producer, current, cat_item);`,
})
