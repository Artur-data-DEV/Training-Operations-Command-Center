import { CatalogClientScript } from '@servicenow/sdk/core'
import { createRoomReservationProducer } from './record-producers.now'

CatalogClientScript({
    $id: Now.ID['x_783010_tocc_a1_ccs_room_reservation_room_capacity_guard'],
    name: 'TOCC - Reservation Room Capacity Guard (onChange)',
    catalogItem: createRoomReservationProducer,
    type: 'onChange',
    variableName: 'room',
    uiType: 'all',
    active: true,
    script: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || !newValue) {
        return;
    }

    var ga = new GlideAjax('x_783010_tocc_a1.TrainingContextAjax');
    ga.addParam('sysparm_name', 'getRoomCapacity');
    ga.addParam('sysparm_room', newValue);
    ga.getXMLAnswer(function(answer) {
        if (!answer) {
            return;
        }

        var payload;
        try {
            payload = JSON.parse(answer);
        } catch (e) {
            return;
        }

        if (!payload || !payload.success) {
            return;
        }

        var capacity = parseInt(payload.capacity, 10) || 0;
        if (capacity <= 0) {
            return;
        }

        var currentParticipants = parseInt(g_form.getValue('expected_participants'), 10) || 0;
        if (currentParticipants > capacity) {
            g_form.setValue('expected_participants', String(capacity));
            g_form.showFieldMsg(
                'expected_participants',
                'Adjusted to room capacity (' + capacity + ').',
                'info'
            );
        } else {
            g_form.showFieldMsg(
                'expected_participants',
                'Room capacity: ' + capacity + ' participants.',
                'info'
            );
        }
    });
}`,
})

CatalogClientScript({
    $id: Now.ID['x_783010_tocc_a1_ccs_room_reservation_validate_submit'],
    name: 'TOCC - Validate Room Reservation (onSubmit)',
    catalogItem: createRoomReservationProducer,
    type: 'onSubmit',
    uiType: 'all',
    active: true,
    script: `function onSubmit() {
    g_form.hideAllFieldMsgs();
    g_form.clearMessages();

    var room = g_form.getValue('room');
    var course = g_form.getValue('course');
    var start = g_form.getValue('start_datetime');
    var end = g_form.getValue('end_datetime');
    var participantsRaw = g_form.getValue('expected_participants');
    var participants = parseInt(participantsRaw, 10) || 0;
    var minimumAdvanceHours = 48;
    var minimumDurationMinutes = 60;

    var hasError = false;

    if (!room) {
        g_form.showFieldMsg('room', 'Select a room.', 'error');
        hasError = true;
    }
    if (!course) {
        g_form.showFieldMsg('course', 'Select a course.', 'error');
        hasError = true;
    }
    if (!start) {
        g_form.showFieldMsg('start_datetime', 'Start date/time is required.', 'error');
        hasError = true;
    }
    if (!end) {
        g_form.showFieldMsg('end_datetime', 'End date/time is required.', 'error');
        hasError = true;
    }

    if (start && end) {
        var startMs = new Date(start.replace(' ', 'T')).getTime();
        var endMs = new Date(end.replace(' ', 'T')).getTime();
        if (!isNaN(startMs) && !isNaN(endMs) && endMs <= startMs) {
            g_form.showFieldMsg('end_datetime', 'End date/time must be after start date/time.', 'error');
            hasError = true;
        } else if (!isNaN(startMs) && !isNaN(endMs)) {
            var durationMs = endMs - startMs;
            if (durationMs < (minimumDurationMinutes * 60 * 1000)) {
                g_form.showFieldMsg(
                    'end_datetime',
                    'Reservation must have at least ' + minimumDurationMinutes + ' minutes between start and end date/time.',
                    'error'
                );
                hasError = true;
            }
        }
    }

    if (start) {
        var requestedStartMs = new Date(start.replace(' ', 'T')).getTime();
        var minimumAllowedStartMs = Date.now() + (minimumAdvanceHours * 3600 * 1000);
        if (!isNaN(requestedStartMs) && requestedStartMs < minimumAllowedStartMs) {
            g_form.showFieldMsg(
                'start_datetime',
                'Reservations must be submitted at least ' + minimumAdvanceHours + ' hours in advance.',
                'error'
            );
            hasError = true;
        }
    }

    // Capacity hard-stop is enforced server-side by RoomService.validateCapacity().
    // We intentionally avoid synchronous GlideAjax here because getXMLWait is deprecated.

    if (hasError) {
        g_form.addErrorMessage('Please review the highlighted fields.');
        return false;
    }
    return true;
}`,
})
