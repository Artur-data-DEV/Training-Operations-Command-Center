import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_room_service'],
    name: 'RoomService',
    apiName: 'x_783010_tocc_a1.RoomService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var RoomService = Class.create();
RoomService.prototype = {
    initialize: function() {
        this.roomTable = 'x_783010_tocc_a1_room';
        this.reservationTable = 'x_783010_tocc_a1_room_reservation';
        this.config = new TrainingConfigService();
    },

    hasConflict: function(roomId, startDateTime, endDateTime, excludeId) {
        var gr = new GlideRecord(this.reservationTable);
        gr.addQuery('room', roomId);
        gr.addQuery('status', '!=', 'cancelled');

        if (excludeId) {
            gr.addQuery('sys_id', '!=', excludeId);
        }

        gr.addQuery('start_datetime', '<', endDateTime);
        gr.addQuery('end_datetime', '>', startDateTime);
        gr.query();

        return gr.hasNext();
    },

    validateCapacity: function(roomId, participants) {
        var room = new GlideRecord(this.roomTable);
        if (!room.get(roomId)) {
            return 'Room not found.';
        }

        var capacity = parseInt(room.getValue('capacity'), 10) || 0;
        var requested = parseInt(participants, 10) || 0;

        if (capacity > 0 && requested > capacity) {
            return 'Participants exceed room capacity.';
        }

        return '';
    },

    validateReservation: function(current) {
        var roomId = current.getValue('room');
        var start = current.getValue('start_datetime');
        var end = current.getValue('end_datetime');
        var participants = current.getValue('expected_participants');
        var currentId = current.getUniqueValue();
        var status = current.getValue('status');

        if (status == 'cancelled' || status == 'rejected') {
            return '';
        }

        if (!roomId || !start || !end) {
            return 'Room, start date/time and end date/time are required.';
        }

        var startGdt = new GlideDateTime(start);
        var endGdt = new GlideDateTime(end);
        if (endGdt.compareTo(startGdt) <= 0) {
            return 'End date/time must be greater than start date/time.';
        }

        var advanceNoticeError = this.validateAdvanceNotice(start);
        if (advanceNoticeError) {
            return advanceNoticeError;
        }

        var capacityError = this.validateCapacity(roomId, participants);
        if (capacityError) {
            return capacityError;
        }

        if (this.hasConflict(roomId, start, end, currentId)) {
            return 'There is already a reservation for this room in the selected period.';
        }

        return '';
    },

    validateAdvanceNotice: function(startDateTime) {
        var minimumAdvanceHours = this.config.getMinimumAdvanceNoticeHours();
        if (minimumAdvanceHours <= 0) {
            return '';
        }

        var now = new GlideDateTime();
        var minimumAllowedStart = new GlideDateTime(now.getValue());
        minimumAllowedStart.addSeconds(minimumAdvanceHours * 3600);

        var requestedStart = new GlideDateTime(startDateTime);
        if (requestedStart.compareTo(minimumAllowedStart) < 0) {
            return 'Reservations must be submitted at least ' + minimumAdvanceHours + ' hours in advance.';
        }

        return '';
    },

    type: 'RoomService'
};`,
})
