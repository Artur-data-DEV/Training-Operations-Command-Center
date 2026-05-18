import { UiPolicy } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// UI Policies — Room Reservation form
// ---------------------------------------------------------------------------

// When status is 'cancelled', make cancellation_reason visible and mandatory.
// Note: cancellation_reason must exist as a field on x_783010_tocc_a1_room_reservation.
// This policy is UX-only; Data Policy enforces server-side.
UiPolicy({
    $id: Now.ID['x_783010_tocc_a1_uip_reservation_cancelled_reason'],
    shortDescription: 'Reservation - Cancellation Reason Required When Cancelled',
    table: 'x_783010_tocc_a1_room_reservation',
    active: true,
    conditions: 'status=cancelled',
    actions: [
        {
            field: 'description',
            mandatory: true,
            visible: true,
            readOnly: false,
        },
    ],
    reverseIfFalse: true,
})

// ---------------------------------------------------------------------------
// UI Policies - Attendance form
// ---------------------------------------------------------------------------

UiPolicy({
    $id: Now.ID['x_783010_tocc_a1_uip_attendance_show_checkin_when_present'],
    shortDescription: 'Attendance - Show check-in metadata when Present',
    table: 'x_783010_tocc_a1_attendance',
    active: true,
    conditions: 'attendance_status=present',
    actions: [
        { field: 'checked_by', visible: true, readOnly: true },
        { field: 'checked_in_datetime', visible: true, readOnly: true },
    ],
    reverseIfFalse: true,
})

// When status is 'approved' or 'rejected', make the form read-only for non-admin users.
UiPolicy({
    $id: Now.ID['x_783010_tocc_a1_uip_reservation_readonly_when_decided'],
    shortDescription: 'Reservation - Read Only After Decision',
    table: 'x_783010_tocc_a1_room_reservation',
    active: true,
    conditions: 'status=approved^ORstatus=rejected^ORstatus=cancelled',
    actions: [
        { field: 'tocc_room', readOnly: true },
        { field: 'tocc_course', readOnly: true },
        { field: 'start_datetime', readOnly: true },
        { field: 'end_datetime', readOnly: true },
        { field: 'expected_participants', readOnly: true },
    ],
    reverseIfFalse: true,
})

// ---------------------------------------------------------------------------
// UI Policies — Training Session form
// ---------------------------------------------------------------------------

// When status is 'cancelled' or 'completed', lock core session fields.
UiPolicy({
    $id: Now.ID['x_783010_tocc_a1_uip_session_readonly_when_closed'],
    shortDescription: 'Session - Read Only When Completed or Cancelled',
    table: 'x_783010_tocc_a1_training_session',
    active: true,
    conditions: 'status=completed^ORstatus=cancelled',
    actions: [
        { field: 'room', readOnly: true },
        { field: 'tocc_instructor', readOnly: true },
        { field: 'start_datetime', readOnly: true },
        { field: 'end_datetime', readOnly: true },
        { field: 'total_seats', readOnly: true },
        { field: 'enrollment_deadline', readOnly: true },
        { field: 'confirmation_deadline', readOnly: true },
    ],
    reverseIfFalse: true,
})

// ---------------------------------------------------------------------------
// UI Policies — Student Enrollment form
// ---------------------------------------------------------------------------

// When enrollment is approved, show the confirmed field prominently.
UiPolicy({
    $id: Now.ID['x_783010_tocc_a1_uip_enrollment_show_confirmed_when_approved'],
    shortDescription: 'Enrollment - Show Confirmed Field When Approved',
    table: 'x_783010_tocc_a1_student_enrollment',
    active: true,
    conditions: 'status=approved',
    actions: [
        { field: 'confirmed', visible: true, readOnly: false },
    ],
    reverseIfFalse: true,
})

// When enrollment is in a terminal state, lock key fields.
UiPolicy({
    $id: Now.ID['x_783010_tocc_a1_uip_enrollment_readonly_when_terminal'],
    shortDescription: 'Enrollment - Read Only When Terminal',
    table: 'x_783010_tocc_a1_student_enrollment',
    active: true,
    conditions: 'status=cancelled^ORstatus=rejected',
    actions: [
        { field: 'student', readOnly: true },
        { field: 'training_session', readOnly: true },
        { field: 'confirmed', readOnly: true },
    ],
    reverseIfFalse: true,
})
