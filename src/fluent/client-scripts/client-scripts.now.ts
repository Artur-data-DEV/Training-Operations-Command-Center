import { ClientScript } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// Client Scripts — Room Reservation form
// ---------------------------------------------------------------------------

ClientScript({
    $id: Now.ID['x_783010_tocc_a1_cs_reservation_autofill_instructor'],
    name: 'Reservation - Auto-fill Instructor',
    table: 'x_783010_tocc_a1_room_reservation',
    type: 'onLoad',
    active: true,
    script: `function onLoad() {
    // Pre-fill instructor with the logged-in user on new records.
    if (g_form.isNewRecord()) {
        g_form.setValue('tocc_instructor', g_user.userID, g_user.getFullName());
    }
}`,
})

ClientScript({
    $id: Now.ID['x_783010_tocc_a1_cs_reservation_check_room_availability'],
    name: 'Reservation - Check Room Availability',
    table: 'x_783010_tocc_a1_room_reservation',
    type: 'onChange',
    field: 'tocc_room,start_datetime,end_datetime',
    active: true,
    script: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }

    var room = g_form.getValue('tocc_room');
    var startDt = g_form.getValue('start_datetime');
    var endDt = g_form.getValue('end_datetime');

    if (!room || !startDt || !endDt) {
        g_form.hideFieldMsg('tocc_room', true);
        return;
    }

    // Client-side UX check only — server-side BR is the authoritative validation.
    var ga = new GlideAjax('x_783010_tocc_a1.TrainingContextAjax');
    ga.addParam('sysparm_name', 'checkRoomAvailability');
    ga.addParam('sysparm_room', room);
    ga.addParam('sysparm_start_datetime', startDt);
    ga.addParam('sysparm_end_datetime', endDt);
    ga.addParam('sysparm_exclude_reservation', g_form.getUniqueValue());
    ga.getXMLAnswer(function(answer) {
        try {
            var result = JSON.parse(answer);
            if (result.conflict) {
                g_form.showFieldMsg('tocc_room', 'This room has a scheduling conflict in the selected period.', 'error');
            } else {
                g_form.hideFieldMsg('tocc_room', true);
            }
        } catch(e) {
            // Silent fail — server BR will enforce.
        }
    });
}`,
})

ClientScript({
    $id: Now.ID['x_783010_tocc_a1_cs_reservation_calculate_duration'],
    name: 'Reservation - Calculate Duration',
    table: 'x_783010_tocc_a1_room_reservation',
    type: 'onChange',
    field: 'start_datetime,end_datetime',
    active: true,
    script: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }

    var startDt = g_form.getValue('start_datetime');
    var endDt = g_form.getValue('end_datetime');

    if (!startDt || !endDt) {
        return;
    }

    // Warn if end is before or equal to start — BR will block on save.
    if (endDt <= startDt) {
        g_form.showFieldMsg('end_datetime', 'End date/time must be after start date/time.', 'error');
    } else {
        g_form.hideFieldMsg('end_datetime', true);
    }
}`,
})

ClientScript({
    $id: Now.ID['x_783010_tocc_a1_cs_reservation_capacity_guard'],
    name: 'Reservation - Capacity Guard',
    table: 'x_783010_tocc_a1_room_reservation',
    type: 'onChange',
    field: 'tocc_room,expected_participants',
    active: true,
    script: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }

    var roomId = g_form.getValue('tocc_room');
    if (!roomId) {
        return;
    }

    var participants = parseInt(g_form.getValue('expected_participants'), 10) || 0;
    if (participants <= 0) {
        return;
    }

    var ga = new GlideAjax('x_783010_tocc_a1.TrainingContextAjax');
    ga.addParam('sysparm_name', 'getRoomCapacity');
    ga.addParam('sysparm_room', roomId);
    ga.getXMLAnswer(function(answer) {
        try {
            var payload = JSON.parse(answer || '{}');
            if (!payload.success) {
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
                return;
            }

            g_form.showFieldMsg(
                'expected_participants',
                'Room capacity: ' + capacity + ' participants.',
                'info'
            );
        } catch (e) {
            // Server-side BR still enforces the limit.
        }
    });
}`,
})

// ---------------------------------------------------------------------------
// Client Scripts — Training Session form
// ---------------------------------------------------------------------------

ClientScript({
    $id: Now.ID['x_783010_tocc_a1_cs_session_load_context'],
    name: 'Session - Load Context from Room',
    table: 'x_783010_tocc_a1_training_session',
    type: 'onChange',
    field: 'room',
    active: true,
    script: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || !newValue) {
        return;
    }

    // Fetch room context to inform the user about capacity.
    var ga = new GlideAjax('x_783010_tocc_a1.TrainingContextAjax');
    ga.addParam('sysparm_name', 'getAvailableRoomsByLocation');
    // No action needed — capacity is displayed via reference field.
    // This hook is reserved for future UI enrichment (e.g. showing resources).
}`,
})

// ---------------------------------------------------------------------------
// Client Scripts — Student Enrollment form
// ---------------------------------------------------------------------------

ClientScript({
    $id: Now.ID['x_783010_tocc_a1_cs_enrollment_autofill_student'],
    name: 'Enrollment - Auto-fill Student from Logged User',
    table: 'x_783010_tocc_a1_student_enrollment',
    type: 'onLoad',
    active: true,
    script: `function onLoad() {
    if (!g_form.isNewRecord()) {
        return;
    }

    // Pre-fill student reference from the logged-in user's student profile.
    var ga = new GlideAjax('x_783010_tocc_a1.TrainingContextAjax');
    ga.addParam('sysparm_name', 'getLoggedStudent');
    ga.getXMLAnswer(function(answer) {
        try {
            var result = JSON.parse(answer);
            if (result.success) {
                g_form.setValue('tocc_student', result.student_sys_id);
            }
        } catch(e) {
            // Silent fail — BR will enforce student resolution.
        }
    });
}`,
})
