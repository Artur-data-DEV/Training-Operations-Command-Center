import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_training_context_ajax'],
    name: 'TrainingContextAjax',
    apiName: 'x_783010_tocc_a1.TrainingContextAjax',
    accessibleFrom: 'package_private',
    clientCallable: true,
    protectionPolicy: 'read',
    script: `var TrainingContextAjax = Class.create();
TrainingContextAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getLoggedStudent: function() {
        var student = new GlideRecordSecure('x_783010_tocc_a1_student');
        student.addQuery('user', gs.getUserID());
        student.addQuery('active', true);
        student.setLimit(1);
        student.query();

        if (!student.next()) {
            return JSON.stringify({
                success: false,
                message: 'No active student profile was found for the logged-in user.'
            });
        }

        return JSON.stringify({
            success: true,
            student_sys_id: student.getUniqueValue()
        });
    },

    getSessionContext: function() {
        var sessionId = this.getParameter('sysparm_training_session');
        if (!sessionId) {
            return JSON.stringify({
                success: false,
                message: 'Training session is required.'
            });
        }

        var session = new GlideRecordSecure('x_783010_tocc_a1_training_session');
        if (!session.get(sessionId)) {
            return JSON.stringify({
                success: false,
                message: 'Training session not found.'
            });
        }

        var course = new GlideRecordSecure('x_783010_tocc_a1_course');
        var deliveryCategory = '';
        if (course.get(session.getValue('course'))) {
            deliveryCategory = course.getValue('delivery_category');
        }

        return JSON.stringify({
            success: true,
            training_session: session.getUniqueValue(),
            course: session.getValue('course'),
            course_name: session.getDisplayValue('course'),
            delivery_category: deliveryCategory,
            status: session.getValue('status'),
            room: session.getValue('room'),
            room_name: session.getDisplayValue('room'),
            location: this._getRoomLocation(session.getValue('room'))
        });
    },

    getAvailableRoomsByLocation: function() {
        var locationId = this.getParameter('sysparm_location');
        if (!locationId) {
            return JSON.stringify({
                success: false,
                message: 'Location is required.'
            });
        }

        var rooms = [];
        var room = new GlideRecordSecure('x_783010_tocc_a1_room');
        room.addQuery('location', locationId);
        room.addQuery('status', 'active');
        room.orderBy('room_name');
        room.query();

        while (room.next()) {
            rooms.push({
                sys_id: room.getUniqueValue(),
                room_name: room.getValue('room_name'),
                capacity: room.getValue('capacity'),
                room_type: room.getValue('room_type')
            });
        }

        return JSON.stringify({
            success: true,
            location: locationId,
            rooms: rooms,
            has_rooms: rooms.length > 0
        });
    },

    checkRoomAvailability: function() {
        var roomId = this.getParameter('sysparm_room');
        var startDateTime = this.getParameter('sysparm_start_datetime');
        var endDateTime = this.getParameter('sysparm_end_datetime');
        var excludeReservationId = this.getParameter('sysparm_exclude_reservation');

        var missing = [];
        if (!roomId) { missing.push('Room'); }
        if (!startDateTime) { missing.push('Start date/time'); }
        if (!endDateTime) { missing.push('End date/time'); }

        if (missing.length > 0) {
            var msg = '';
            if (missing.length === 1) {
                msg = missing[0] + ' is required.';
            } else {
                msg = missing.slice(0, -1).join(', ') + ' and ' + missing[missing.length - 1] + ' are required.';
            }
            return JSON.stringify({
                success: false,
                message: msg
            });
        }

        var svc = new RoomService();
        var hasConflict = svc.hasConflict(roomId, startDateTime, endDateTime, excludeReservationId);

        return JSON.stringify({
            success: true,
            room: roomId,
            available: !hasConflict,
            conflict: hasConflict
        });
    },

    _getRoomLocation: function(roomId) {
        if (!roomId) {
            return '';
        }

        var room = new GlideRecordSecure('x_783010_tocc_a1_room');
        if (!room.get(roomId)) {
            return '';
        }

        return room.getValue('location');
    },

    type: 'TrainingContextAjax'
});`,
})
