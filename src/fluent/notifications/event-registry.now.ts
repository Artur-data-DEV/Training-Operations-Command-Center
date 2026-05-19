import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['x_783010_tocc_a1_event_reservation_submitted'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.reservation.submitted',
        table: 'x_783010_tocc_a1_room_reservation',
        description: 'TOCC room reservation submitted.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_reservation_approved'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.reservation.approved',
        table: 'x_783010_tocc_a1_room_reservation',
        description: 'TOCC room reservation approved.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_reservation_rejected'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.reservation.rejected',
        table: 'x_783010_tocc_a1_room_reservation',
        description: 'TOCC room reservation rejected.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_enrollment_approved'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.enrollment.approved',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC student enrollment approved.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_enrollment_rejected'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.enrollment.rejected',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC student enrollment rejected.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_enrollment_waitlisted'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.enrollment.waitlisted',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC student enrollment waitlisted.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_enrollment_cancelled'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.enrollment.cancelled',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC student enrollment cancelled.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_enrollment_waitlist_promoted'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.enrollment.waitlist_promoted',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC waitlisted enrollment promoted.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_session_reminder'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.session.reminder',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC session reminder for approved enrollment.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_session_confirmation_request'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.session.confirmation_request',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC attendance confirmation request.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_session_cancelled'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.session.cancelled',
        table: 'x_783010_tocc_a1_student_enrollment',
        description: 'TOCC session cancellation notification.',
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_event_session_feedback_request'],
    table: 'sysevent_register',
    data: {
        event_name: 'x_783010_tocc_a1.session.feedback_request',
        table: 'x_783010_tocc_a1_training_session',
        description: 'TOCC post-session feedback request.',
    },
})
