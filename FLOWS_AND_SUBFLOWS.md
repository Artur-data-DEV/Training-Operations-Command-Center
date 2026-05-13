# FLOWS_AND_SUBFLOWS.md — Training Operations Command Center

> **Version:** 2.0 — Sprint 4 (revised)
> **Scope:** `x_783010_tocc_a1`
> **Implementation:** `src/fluent/flows/training-orchestration-flows.now.ts`
> **Strategy:** SDK-first via `@servicenow/sdk/automation` (`Flow`, `Subflow`, `wfa`, `trigger`, `action`)

---

## Design Principles

- Flows own: approval routing, condition branching, notification dispatch, work note updates.
- **No business logic inside Flows.** Validation and data operations are delegated to Script Includes via `action.core.executeScript` steps.
- Subflows encapsulate reusable units called from multiple parent flows — no logic duplication.
- `askForApproval` is the authoritative approval mechanism — not UI Actions alone.
- All Script Include calls inside flows use `fd_data` for input/output binding.

---

## Event Registry

Register these events in **System Policy → Events → Event Registry** before activating flows.

| Event Name | Table | Triggered By |
|---|---|---|
| `x_783010_tocc_a1.reservation.submitted` | `x_783010_tocc_a1_room_reservation` | Record Producer on submit |
| `x_783010_tocc_a1.reservation.approved` | `x_783010_tocc_a1_room_reservation` | SF-01 via `NotificationHelper` |
| `x_783010_tocc_a1.reservation.rejected` | `x_783010_tocc_a1_room_reservation` | SF-01 via `NotificationHelper` |
| `x_783010_tocc_a1.enrollment.approved` | `x_783010_tocc_a1_student_enrollment` | SF-02 via `NotificationHelper` |
| `x_783010_tocc_a1.enrollment.rejected` | `x_783010_tocc_a1_student_enrollment` | SF-02 via `NotificationHelper` |
| `x_783010_tocc_a1.enrollment.waitlisted` | `x_783010_tocc_a1_student_enrollment` | `EnrollmentService` |
| `x_783010_tocc_a1.enrollment.waitlist_promoted` | `x_783010_tocc_a1_student_enrollment` | `EnrollmentService` |
| `x_783010_tocc_a1.enrollment.cancelled` | `x_783010_tocc_a1_student_enrollment` | UI Action / `EnrollmentService` |
| `x_783010_tocc_a1.session.reminder` | `x_783010_tocc_a1_student_enrollment` | FLOW-05 / SCH-001 |
| `x_783010_tocc_a1.session.confirmation_request` | `x_783010_tocc_a1_student_enrollment` | FLOW-04 |
| `x_783010_tocc_a1.session.cancelled` | `x_783010_tocc_a1_student_enrollment` | FLOW-03 |
| `x_783010_tocc_a1.session.feedback_request` | `x_783010_tocc_a1_student_enrollment` | SCH-003 / UI Action |

---

## Subflows

### SF-01 — [TOCC][SF] Process Reservation Decision

**Inputs:** `reservationId`, `decision` (approved|rejected), `decidedBy`, `rejectionNote`

**Logic:**
1. Updates reservation `status` via GlideRecord (triggers BR → session sync if approved)
2. Writes descriptive `work_notes` with actor and reason
3. Calls `NotificationHelper.sendReservationDecision()` to queue the correct event

**Called by:** FLOW-01 (both approved and rejected branches)

---

### SF-02 — [TOCC][SF] Process Enrollment Decision

**Inputs:** `enrollmentId`, `decision` (approved|rejected), `decidedBy`

**Logic:**
1. Calls `EnrollmentService.approve()` or `EnrollmentService.reject()` as appropriate
2. Seat decrement/increment handled inside `EnrollmentService`
3. Calls `NotificationHelper.sendEnrollmentDecision()` to notify student

**Called by:** FLOW-02 (direct mode, instructor approved, instructor rejected branches)

---

### SF-03 — [TOCC][SF] Notify Session Participants

**Inputs:** `sessionId`, `notificationType` (cancelled | reminder | confirmation_request | feedback_request)

**Logic:**
1. Routes to the correct `NotificationHelper` method based on `notificationType`
2. Each method iterates approved enrollments and queues the appropriate event

**Called by:** FLOW-03, FLOW-04, FLOW-05

---

### SF-04 — [TOCC][SF] Promote Waitlisted Student

**Inputs:** `sessionId`

**Logic:**
1. Calls `EnrollmentService._promoteWaitlistedEnrollments(sessionId, 1)`
2. Promotion handles seat decrement and notification internally

**Called by:** Invocable from FLOW-02 cancellation path or directly from `EnrollmentService` (already synchronous within service)

---

## Flows

### FLOW-01 — [TOCC] Reservation Approval

**Trigger:** Record created or updated — `x_783010_tocc_a1_room_reservation` where `status = submitted` (once)

**Approval:** `askForApproval` → Backoffice group (configured via `approval_group` field on reservation)

```
submitted
    └── Ask for Approval (Backoffice group)
            ├── Approved → SF-01 (approved) → BR fires → session created → instructor notified
            └── Rejected → SF-01 (rejected)             → instructor notified
```

**Acceptance Criteria:**
- Backoffice group receives an approval task when reservation is submitted
- Approving triggers session creation automatically via BR
- Rejecting notifies instructor with work note and event
- Flow does not re-trigger on subsequent status updates (`trigger_strategy: once`)

---

### FLOW-02 — [TOCC] Enrollment Approval

**Trigger:** Record created — `x_783010_tocc_a1_student_enrollment` where `status = pending`

**Config-driven:** reads `TrainingConfigService.getEnrollmentApprovalMode()` at runtime

```
pending
    └── Read config: enrollment_approval_mode
            ├── direct            → SF-02 (approved) → seats decremented → student notified
            └── instructor_approval → Ask for Approval (session instructor)
                    ├── Approved  → SF-02 (approved) → seats decremented → student notified
                    └── Rejected  → SF-02 (rejected)                    → student notified
```

**Acceptance Criteria:**
- Direct mode enrollments are auto-approved without manual intervention
- Instructor-gated mode sends approval task to the session's instructor
- Both paths notify the student with the correct status
- Waitlist behavior is handled by `EnrollmentService` before this flow triggers (session full = waitlisted, not pending)

---

### FLOW-03 — [TOCC] Session Cancellation Notification

**Trigger:** Record updated — `x_783010_tocc_a1_training_session` where `status changes to cancelled` (unique changes)

```
status → cancelled
    └── SF-03 (cancelled) → all approved enrollments notified
    └── Update work notes on session
```

**Acceptance Criteria:**
- All students with `approved` enrollments receive exactly one cancellation notification
- Work note added to session confirming dispatch
- Flow fires only when status transitions to cancelled, not on every update

---

### FLOW-04 — [TOCC] Attendance Confirmation Request

**Trigger:** Scheduled daily at 08:00

```
08:00
    └── Script: find sessions with confirmation_deadline in next [leadHours] hours
    └── SF-03 (confirmation_request) for each matching session
```

**Acceptance Criteria:**
- Only sessions in `open` or `full` status with a `confirmation_deadline` within the lead window receive confirmations
- Does not re-send to students who already confirmed (`confirmed = true` filter inside `NotificationHelper`)
- Lead window sourced from `TrainingConfigService.getConfirmationLeadHours()`

---

### FLOW-05 — [TOCC] Session Reminder Dispatch

**Trigger:** Scheduled daily at 07:00

```
07:00
    └── Script: find sessions starting within [leadHours ± 30min] from now
    └── SF-03 (reminder) for each matching session
```

**Acceptance Criteria:**
- Reminders sent to all approved enrolled students for sessions in the lead window
- Complements SCH-001 (hourly) — FLOW-05 handles the morning batch; SCH-001 handles late-added sessions
- Lead window sourced from `TrainingConfigService.getReminderLeadHours()`

---

## Manual Configuration Steps

### Step 1 — Register Events
Navigate to **System Policy → Events → Event Registry**
Create one entry per event in the Event Registry table above.

### Step 2 — Create Backoffice Approval Group
Navigate to **User Administration → Groups → New**
- Name: `[TOCC] Backoffice`
- Add all Backoffice-role users as members

### Step 3 — Set Approval Group on Reservations
The `askForApproval` step in FLOW-01 uses `approval_group` from the reservation record.
Set a default via a Business Rule or Data Policy if no group is specified on the record.

### Step 4 — Activate Flows
Navigate to **Flow Designer → Flows**
For each flow: open → **Activate**
Test with a real reservation/enrollment in the dev instance before activating in production.

### Step 5 — Validate Approval Tasks
After activating FLOW-01:
1. Submit a room reservation from an Instructor account
2. Navigate to **Approvals** as a Backoffice user
3. Confirm approval task is present
4. Approve — verify session is created and instructor receives email

After activating FLOW-02 with `enrollment_approval_mode = instructor_approval`:
1. Student enrolls in a session
2. Navigate to **Approvals** as the session's Instructor
3. Confirm approval task is present
4. Approve — verify student is notified and seat is decremented

---

*Last updated: Sprint 4 revised — 5 flows, 4 subflows, real approval orchestration, SDK-first implementation.*
