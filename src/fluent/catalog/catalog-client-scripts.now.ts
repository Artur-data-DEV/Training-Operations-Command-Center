import { CatalogClientScript } from '@servicenow/sdk/core'
import { createRoomReservationProducer } from './record-producers.now'

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
        }
    }

    if (hasError) {
        g_form.addErrorMessage('Please review the highlighted fields.');
        return false;
    }
    return true;
}`,
})

