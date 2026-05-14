# FLOWS_AND_SUBFLOWS.md - Training Operations Command Center

> Scope: `x_783010_tocc_a1`
> Source of truth: `src/fluent/flows/training-orchestration-flows.now.ts`

## Implemented flow inventory

1. `[TOCC][FLOW] Reservation Approval`
1. `[TOCC][FLOW] Enrollment Approval`
1. `[TOCC][FLOW] Session Cancelled`
1. `[TOCC][FLOW] Attendance Confirmation Cadence`
1. `[TOCC][FLOW] Session Reminder Cadence`

## Implemented subflow inventory

1. `[TOCC][SF] Reservation Intake Processing`
1. `[TOCC][SF] Session Cancelled Processing`

## Runtime behavior

### FLOW-01 Reservation Approval

- Trigger: `x_783010_tocc_a1_room_reservation` when `status=submitted` (`createdOrUpdated`, `trigger_strategy=once`).
- Subflow call: emits `x_783010_tocc_a1.reservation.submitted`.
- Lookup group `[TOCC] Backoffice`.
- If group exists:
  - Runs `action.core.askForApproval` against reservation record.
  - Applies returned `approval_state` into reservation `status`.
  - Fires `x_783010_tocc_a1.reservation.<approval_state>`.
- If group missing:
  - Creates fallback task for manual routing.

### FLOW-02 Enrollment Approval

- Trigger: `x_783010_tocc_a1_student_enrollment` on create when `status=pending`.
- Looks up `x_783010_tocc_a1_training_config` for active row:
  - `name=enrollment_approval_mode`
  - `value=instructor_approval`
- If instructor mode:
  - Loads session from enrollment.
  - Runs `action.core.askForApproval` for session instructor.
  - Applies returned `approval_state` into enrollment `status`.
  - Fires `x_783010_tocc_a1.enrollment.<approval_state>`.
  - If session/instructor cannot be resolved, creates manual fallback task.
- If direct mode:
  - Sets enrollment to `approved`.
  - Fires `x_783010_tocc_a1.enrollment.approved`.

### FLOW-03 Session Cancelled

- Trigger: `x_783010_tocc_a1_training_session` when `status` changes to `cancelled`.
- Calls subflow that iterates approved enrollments and fires `x_783010_tocc_a1.session.cancelled`.
- Updates session work notes for traceability.

### FLOW-04 Attendance Confirmation Cadence

- Trigger: daily 08:00.
- Finds sessions in `statusINopen,full` with confirmation deadline today.
- Iterates approved and unconfirmed enrollments and fires `x_783010_tocc_a1.session.confirmation_request`.

### FLOW-05 Session Reminder Cadence

- Trigger: daily 07:00.
- Finds sessions in `statusINopen,full` starting tomorrow.
- Iterates approved enrollments and fires `x_783010_tocc_a1.session.reminder`.

## Required manual instance configuration

1. Register Event Registry entries for:
   - `x_783010_tocc_a1.reservation.submitted`
   - `x_783010_tocc_a1.reservation.approved`
   - `x_783010_tocc_a1.reservation.rejected`
   - `x_783010_tocc_a1.enrollment.approved`
   - `x_783010_tocc_a1.enrollment.rejected`
   - `x_783010_tocc_a1.session.cancelled`
   - `x_783010_tocc_a1.session.confirmation_request`
   - `x_783010_tocc_a1.session.reminder`
1. Ensure group `[TOCC] Backoffice` exists and has approvers.
1. Activate all six flows after deploy.
1. Validate approvals from real personas (Backoffice and Instructor).
