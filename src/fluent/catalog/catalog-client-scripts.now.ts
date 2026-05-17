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

        try {
            window.__toccRoomCapacity = capacity;
        } catch (e) {
            // Ignore browser storage issues.
        }

        var participantControl = g_form.getControl('expected_participants');
        if (participantControl && participantControl.setAttribute) {
            participantControl.setAttribute('type', 'number');
            participantControl.setAttribute('min', '1');
            participantControl.setAttribute('max', String(capacity));
        }

        var currentParticipants = parseInt(g_form.getValue('expected_participants'), 10) || 0;
        if (!currentParticipants || currentParticipants > capacity) {
            g_form.setValue('expected_participants', String(capacity));
            g_form.showFieldMsg(
                'expected_participants',
                'Expected participants was adjusted to room capacity (' + capacity + ').',
                'info'
            );
        } else {
            g_form.showFieldMsg(
                'expected_participants',
                'Room capacity: ' + capacity + ' participants.',
                'info'
            );
        }

        // Refresh resource selection after room change.
        g_form.setValue('reservation_requested_resources', '');
        try {
            var query = 'active=true^room=' + newValue;
            if (window.g_list && window.g_list.get) {
                var collector = window.g_list.get('IO:reservation_requested_resources');
                if (collector && collector.setQuery) {
                    collector.setQuery(query);
                }
                if (collector && collector.reset) {
                    collector.reset();
                }
                if (collector && collector.refresh) {
                    collector.refresh();
                }
            }
        } catch (ignore) {
            // List collector APIs vary by UI; server-side checks still apply.
        }
    });
}`,
})

CatalogClientScript({
    $id: Now.ID['x_783010_tocc_a1_ccs_room_reservation_participants_guard'],
    name: 'TOCC - Reservation Participants Guard (onChange)',
    catalogItem: createRoomReservationProducer,
    type: 'onChange',
    variableName: 'expected_participants',
    uiType: 'all',
    active: true,
    script: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }

    var participants = parseInt(newValue, 10) || 0;
    if (participants <= 0) {
        return;
    }

    var capacity = 0;
    try {
        capacity = parseInt(window.__toccRoomCapacity, 10) || 0;
    } catch (e) {
        capacity = 0;
    }

    if (capacity > 0 && participants > capacity) {
        g_form.setValue('expected_participants', String(capacity));
        g_form.showFieldMsg(
            'expected_participants',
            'Expected participants cannot exceed room capacity (' + capacity + ').',
            'error'
        );
    }
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
    var resources = g_form.getValue('reservation_requested_resources');
    var start = g_form.getValue('start_datetime');
    var end = g_form.getValue('end_datetime');
    var participantsRaw = g_form.getValue('expected_participants');
    var participants = parseInt(participantsRaw, 10) || 0;
    var minimumAdvanceHours = 48;
    var minimumDurationMinutes = 60;
    var roomCapacity = 0;

    try {
        roomCapacity = parseInt(window.__toccRoomCapacity, 10) || 0;
    } catch (e) {
        roomCapacity = 0;
    }

    var hasError = false;

    if (!room) {
        g_form.showFieldMsg('room', 'Select a room.', 'error');
        hasError = true;
    }
    if (!course) {
        g_form.showFieldMsg('course', 'Select a course.', 'error');
        hasError = true;
    }
    if (!resources) {
        g_form.showFieldMsg('reservation_requested_resources', 'Select at least one room resource.', 'error');
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

    if (participants <= 0) {
        g_form.showFieldMsg('expected_participants', 'Expected participants must be greater than zero.', 'error');
        hasError = true;
    }

    if (roomCapacity > 0 && participants > roomCapacity) {
        g_form.showFieldMsg(
            'expected_participants',
            'Expected participants cannot exceed room capacity (' + roomCapacity + ').',
            'error'
        );
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

