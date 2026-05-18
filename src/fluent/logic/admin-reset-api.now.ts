import { RestApi } from '@servicenow/sdk/core'

RestApi({
    $id: Now.ID['x_783010_tocc_a1_rest_admin_reset'],
    name: 'TOCC Admin Reset',
    serviceId: 'tocc_admin_reset',
    active: true,
    consumes: 'application/json',
    produces: 'application/json',
    shortDescription: 'Administrative reset for TOCC demo operational records.',
    routes: [
        {
            $id: Now.ID['x_783010_tocc_a1_rest_admin_reset_demo_route'],
            name: 'Reset Demo Operational Data',
            method: 'POST',
            path: '/reset_demo',
            active: true,
            authentication: true,
            authorization: true,
            internalRole: true,
            produces: 'application/json',
            script: `(function process(request, response) {
    if (!gs.hasRole('admin') && !gs.hasRole('x_783010_tocc_a1.admin')) {
        response.setStatus(403);
        response.setBody({ success: false, error: 'Admin role is required.' });
        return;
    }

    var summary = {
        success: true,
        deleted: {},
        form_cleanup: {},
        resources: [],
        reservations: [],
        approved_session: null,
        field_validity: {},
        queue_count: 0,
        dirty_queue_count: 0,
        resources_missing_ci: 0,
        notes: []
    };

    function deleteAll(tableName) {
        var count = 0;
        var gr = new GlideRecord(tableName);
        gr.query();
        while (gr.next()) {
            gr.deleteRecord();
            count++;
        }
        summary.deleted[tableName] = count;
    }

    function findOne(tableName, fieldName, value) {
        var gr = new GlideRecord(tableName);
        gr.addQuery(fieldName, value);
        gr.setLimit(1);
        gr.query();
        if (!gr.next()) {
            throw new Error('Missing ' + tableName + ' where ' + fieldName + '=' + value);
        }
        return String(gr.getUniqueValue());
    }

    function setIfPresent(gr, fieldName, value) {
        if (gr.isValidField(fieldName)) {
            gr.setValue(fieldName, value);
        }
    }

    function ensureCi(tableName, ciName, locationId) {
        var ci = new GlideRecord(tableName);
        ci.addQuery('name', ciName);
        ci.setLimit(1);
        ci.query();
        if (!ci.next()) {
            ci.initialize();
            ci.setValue('name', ciName);
            setIfPresent(ci, 'location', locationId);
            setIfPresent(ci, 'install_status', '1');
            setIfPresent(ci, 'short_description', 'TOCC managed room resource CI.');
            var ciId = ci.insert();
            if (!ciId) {
                throw new Error('Unable to create CI: ' + ciName);
            }
            return String(ciId);
        }

        var changed = false;
        if (locationId && ci.isValidField('location') && String(ci.getValue('location') || '') !== String(locationId)) {
            ci.setValue('location', locationId);
            changed = true;
        }
        if (ci.isValidField('install_status') && String(ci.getValue('install_status') || '') !== '1') {
            ci.setValue('install_status', '1');
            changed = true;
        }
        if (changed) {
            ci.update();
        }
        return String(ci.getUniqueValue());
    }

    function upsertResource(resourceName, resourceType, roomId, ciTable, ciName) {
        var room = new GlideRecord('x_783010_tocc_a1_room');
        if (!room.get(roomId)) {
            throw new Error('Room not found for resource: ' + resourceName);
        }
        var ciId = ensureCi(ciTable, ciName, room.getValue('location'));
        var resource = new GlideRecord('x_783010_tocc_a1_room_resource');
        resource.addQuery('resource_name', resourceName);
        resource.setLimit(1);
        resource.query();
        if (!resource.next()) {
            resource.initialize();
            resource.setValue('resource_name', resourceName);
        }
        resource.setValue('room', roomId);
        resource.setValue('resource_type', resourceType);
        resource.setValue('ci_reference', ciId);
        resource.setValue('quantity', 1);
        resource.setValue('active', true);
        if (resource.isNewRecord()) {
            resource.insert();
        } else {
            resource.update();
        }
        summary.resources.push({
            resource_name: resourceName,
            room: room.getDisplayValue('room_name'),
            ci: ciName
        });
    }

    function createReservation(def) {
        var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
        gr.initialize();
        gr.setValue('status', 'submitted');
        gr.setValue('tocc_course', def.course);
        gr.setValue('tocc_room', def.room);
        gr.setValue('tocc_instructor', def.instructor);
        gr.setValue('start_datetime', def.start);
        gr.setValue('end_datetime', def.end);
        gr.setValue('expected_participants', def.participants);
        gr.setValue('short_description', def.short_description);
        gr.setValue('description', 'Clean TOCC demo record recreated by the admin reset endpoint.');
        gr.setValue('assigned_to', def.backoffice);
        gr.setValue('assignment_group', def.backoffice_group);
        gr.setWorkflow(true);
        var id = gr.insert();
        if (!id) {
            throw new Error('Unable to create reservation: ' + def.short_description);
        }
        return String(id);
    }

    function loadReservation(id) {
        var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
        if (!gr.get(id)) {
            throw new Error('Reservation not found after create: ' + id);
        }
        return gr;
    }

    function reservationPayload(gr) {
        return {
            sys_id: String(gr.getUniqueValue()),
            number: String(gr.getValue('number') || ''),
            status: String(gr.getValue('status') || ''),
            course: String(gr.getDisplayValue('tocc_course') || ''),
            room: String(gr.getDisplayValue('tocc_room') || ''),
            instructor: String(gr.getDisplayValue('tocc_instructor') || ''),
            start: String(gr.getDisplayValue('start_datetime') || ''),
            end: String(gr.getDisplayValue('end_datetime') || ''),
            participants: parseInt(gr.getValue('expected_participants'), 10) || 0,
            training_session: String(gr.getDisplayValue('training_session') || ''),
            training_session_id: String(gr.getValue('training_session') || '')
        };
    }

    function cleanupForm() {
        var deletedBlankSections = 0;
        var deletedBlankElements = 0;
        var section = new GlideRecord('sys_ui_section');
        section.addQuery('name', 'x_783010_tocc_a1_room_reservation');
        section.query();
        while (section.next()) {
            var caption = String(section.getValue('caption') || '').trim();
            if (!caption || (caption != 'Reservation Details' && caption != 'Notes')) {
                var element = new GlideRecord('sys_ui_element');
                element.addQuery('sys_ui_section', section.getUniqueValue());
                element.query();
                while (element.next()) {
                    element.deleteRecord();
                    deletedBlankElements++;
                }
                var formSection = new GlideRecord('sys_ui_form_section');
                formSection.addQuery('sys_ui_section', section.getUniqueValue());
                formSection.query();
                while (formSection.next()) {
                    formSection.deleteRecord();
                }
                section.deleteRecord();
                deletedBlankSections++;
                continue;
            }
            if (caption == 'Reservation Details') {
                section.setValue('position', 0);
                section.update();
            }
            if (caption == 'Notes') {
                section.setValue('position', 1);
                section.update();
            }
        }
        summary.form_cleanup = {
            blank_sections_deleted: deletedBlankSections,
            blank_elements_deleted: deletedBlankElements
        };
    }

    function countDirtySubmitted() {
        var dirty = 0;
        var total = 0;
        var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
        gr.addQuery('status', 'submitted');
        gr.query();
        while (gr.next()) {
            total++;
            if (gs.nil(gr.getValue('tocc_course')) || gs.nil(gr.getValue('tocc_room')) || gs.nil(gr.getValue('tocc_instructor')) ||
                gs.nil(gr.getValue('start_datetime')) || gs.nil(gr.getValue('end_datetime')) ||
                ((parseInt(gr.getValue('expected_participants'), 10) || 0) < 1)) {
                dirty++;
            }
        }
        summary.queue_count = total;
        summary.dirty_queue_count = dirty;
    }

    function countResourcesMissingCi() {
        var count = 0;
        var gr = new GlideRecord('x_783010_tocc_a1_room_resource');
        gr.addQuery('active', true);
        gr.addNullQuery('ci_reference');
        gr.query();
        while (gr.next()) {
            count++;
        }
        summary.resources_missing_ci = count;
    }

    function captureFieldValidity() {
        var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
        var session = new GlideRecord('x_783010_tocc_a1_training_session');
        var fields = ['course', 'room', 'instructor', 'training_session', 'reservation', 'tocc_course', 'tocc_room', 'tocc_instructor', 'tocc_reservation', 'start_datetime', 'end_datetime', 'expected_participants'];
        summary.field_validity.reservation = {};
        summary.field_validity.session = {};
        for (var f = 0; f < fields.length; f++) {
            summary.field_validity.reservation[fields[f]] = reservation.isValidField(fields[f]);
            summary.field_validity.session[fields[f]] = session.isValidField(fields[f]);
        }
    }

    try {
        captureFieldValidity();
        cleanupForm();

        deleteAll('x_783010_tocc_a1_training_feedback');
        deleteAll('x_783010_tocc_a1_attendance');
        deleteAll('x_783010_tocc_a1_student_enrollment');
        deleteAll('x_783010_tocc_a1_reservation_resource');
        deleteAll('x_783010_tocc_a1_training_session');
        deleteAll('x_783010_tocc_a1_room_reservation');

        var roomMain = findOne('x_783010_tocc_a1_room', 'room_code', 'TOCC-DEMO-ROOM-01');
        var roomLab = findOne('x_783010_tocc_a1_room', 'room_code', 'TOCC-DEMO-LAB-01');
        var roomAud = findOne('x_783010_tocc_a1_room', 'room_code', 'TOCC-DEMO-AUD-01');
        var course101 = findOne('x_783010_tocc_a1_course', 'course_id', 'TOCC-DEMO-101');
        var course201 = findOne('x_783010_tocc_a1_course', 'course_id', 'TOCC-DEMO-201');
        var course301 = findOne('x_783010_tocc_a1_course', 'course_id', 'TOCC-DEMO-301');
        var instructor = findOne('sys_user', 'user_name', 'tocc.instructor');
        var backoffice = findOne('sys_user', 'user_name', 'tocc.backoffice');
        var backofficeGroup = findOne('sys_user_group', 'name', '[TOCC] Backoffice');

        upsertResource('Projector - Demo Unit', 'projector', roomMain, 'cmdb_ci_hardware', '[TOCC] Projector - Demo Unit');
        upsertResource('Lab Workstations', 'computer', roomLab, 'cmdb_ci_computer', '[TOCC] Lab Workstations');
        upsertResource('PA System', 'av', roomAud, 'cmdb_ci_hardware', '[TOCC] PA System');
        upsertResource('Wireless Microphones', 'other', roomAud, 'cmdb_ci_hardware', '[TOCC] Wireless Microphones');

        function reservationDef(values) {
            values.instructor = instructor;
            values.backoffice = backoffice;
            values.backoffice_group = backofficeGroup;
            return values;
        }

        var approvedId = createReservation(reservationDef({
            course: course101,
            room: roomMain,
            start: '2026-07-07 13:00:00',
            end: '2026-07-07 15:00:00',
            participants: 12,
            short_description: 'Backoffice approval smoke test - Git foundations'
        }));
        var rejectedId = createReservation(reservationDef({
            course: course201,
            room: roomLab,
            start: '2026-07-08 13:00:00',
            end: '2026-07-08 16:00:00',
            participants: 10,
            short_description: 'Backoffice rejection smoke test - Lab operations'
        }));
        var pendingOneId = createReservation(reservationDef({
            course: course301,
            room: roomAud,
            start: '2026-07-09 14:00:00',
            end: '2026-07-09 16:00:00',
            participants: 18,
            short_description: 'Backoffice pending review - Leadership briefing'
        }));
        var pendingTwoId = createReservation(reservationDef({
            course: course101,
            room: roomLab,
            start: '2026-07-10 13:00:00',
            end: '2026-07-10 15:00:00',
            participants: 8,
            short_description: 'Backoffice pending review - Git lab'
        }));

        var approve = loadReservation(approvedId);
        approve.setValue('status', 'approved');
        approve.setValue('work_notes', 'Approved during TOCC reset validation.');
        approve.setWorkflow(true);
        approve.update();
        var sync = new TrainingSessionService();
        sync.syncFromReservation(approve);

        var reject = loadReservation(rejectedId);
        reject.setValue('status', 'rejected');
        reject.setValue('work_notes', 'Rejected during TOCC reset validation.');
        reject.setWorkflow(true);
        reject.update();

        var ids = [approvedId, rejectedId, pendingOneId, pendingTwoId];
        for (var i = 0; i < ids.length; i++) {
            summary.reservations.push(reservationPayload(loadReservation(ids[i])));
        }

        var approved = loadReservation(approvedId);
        var sessionId = approved.getValue('training_session');
        if (gs.nil(sessionId)) {
            summary.success = false;
            summary.notes.push('Approved reservation did not receive a linked training session.');
        } else {
            var session = new GlideRecord('x_783010_tocc_a1_training_session');
            if (session.get(sessionId)) {
                summary.approved_session = {
                    sys_id: String(session.getUniqueValue()),
                    number: String(session.getValue('number') || ''),
                    title: String(session.getValue('title') || ''),
                    status: String(session.getValue('status') || ''),
                    course: String(session.getDisplayValue('tocc_course') || ''),
                    room: String(session.getDisplayValue('room') || ''),
                    instructor: String(session.getDisplayValue('tocc_instructor') || ''),
                    start: String(session.getDisplayValue('start_datetime') || ''),
                    seats: parseInt(session.getValue('total_seats'), 10) || 0,
                    reservation: String(session.getDisplayValue('reservation') || '')
                };
            }
        }

        countDirtySubmitted();
        countResourcesMissingCi();

        response.setStatus(summary.success ? 200 : 500);
        response.setBody(summary);
    } catch (e) {
        summary.success = false;
        summary.error = String(e && e.message ? e.message : e);
        response.setStatus(500);
        response.setBody(summary);
    }
})(request, response);`,
        },
    ],
})
