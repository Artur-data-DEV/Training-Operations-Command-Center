# FLOWS_AND_SUBFLOWS.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 4
> **Scope:** `x_783010_tocc_a1`
> **Status:** SDK-assisted. Flows are configured in the Flow Designer UI on the instance.
> All business logic lives in Script Includes — Flows are orchestrators only.

---

## Design Principles

- Flows handle orchestration, approval routing, and notification dispatch.
- **No business logic inside Flows.** Validation is delegated to Script Includes via Action steps or inline Script steps that call service methods.
- Subflows encapsulate reusable orchestration units called from multiple parent flows.
- All notification dispatch goes through `NotificationHelper` event queuing, not inline email actions in the Flow.

---

## Event Registry

Flows and Scheduled Jobs dispatch notifications via `gs.eventQueue`. Register these events in **System Policy → Events → Event Registry** before creating notifications.

| Event Name | Table | Triggered By |
|---|---|---|
| `x_783010_tocc_a1.reservation.submitted` | `x_783010_tocc_a1_room_reservation` | Record Producer script |
| `x_783010_tocc_a1.reservation.approved` | `x_783010_tocc_a1_room_reservation` | UI Action: Approve Reservation |
| `x_783010_tocc_a1.reservation.rejected` | `x_783010_tocc_a1_room_reservation` | UI Action: Reject Reservation |
| `x_783010_tocc_a1.enrollment.approved` | `x_783010_tocc_a1_student_enrollment` | UI Action: Approve Enrollment |
| `x_783010_tocc_a1.enrollment.rejected` | `x_783010_tocc_a1_student_enrollment` | UI Action: Reject Enrollment |
| `x_783010_tocc_a1.enrollment.waitlisted` | `x_783010_tocc_a1_student_enrollment` | EnrollmentService |
| `x_783010_tocc_a1.enrollment.waitlist_promoted` | `x_783010_tocc_a1_student_enrollment` | EnrollmentService |
| `x_783010_tocc_a1.enrollment.cancelled` | `x_783010_tocc_a1_student_enrollment` | UI Action / EnrollmentService |
| `x_783010_tocc_a1.session.reminder` | `x_783010_tocc_a1_student_enrollment` | SCH: Send Session Reminders |
| `x_783010_tocc_a1.session.confirmation_request` | `x_783010_tocc_a1_student_enrollment` | SCH: Release Unconfirmed Seats |
| `x_783010_tocc_a1.session.cancelled` | `x_783010_tocc_a1_student_enrollment` | UI Action / TrainingSessionService |
| `x_783010_tocc_a1.session.feedback_request` | `x_783010_tocc_a1_student_enrollment` | SCH: Close Past Sessions / UI Action |

---

## Flows

### FLOW-01 — [TOCC] Reservation Approval Flow

**Trigger:** Record created or updated — `x_783010_tocc_a1_room_reservation` where `status = submitted`

**Purpose:** Routes the reservation to the Backoffice approval group. On approval, the BR `Sync Training Session From Reservation` fires and `TrainingSessionService.syncFromReservation()` creates the session. On rejection, notifies the instructor.

**Steps:**

```
1. Trigger: Record → status changes to "submitted"
2. Ask for Approval
   └── Approval group: [TOCC] Backoffice (sys_user_group — configure manually)
   └── Approver: Group manager or any member
3. If Approved:
   └── Set field: status = "approved"  [BR fires → session created automatically]
   └── Script: new NotificationHelper().sendReservationDecision(current.sys_id)
4. If Rejected:
   └── Set field: status = "rejected"
   └── Script: new NotificationHelper().sendReservationDecision(current.sys_id)
```

**Acceptance Criteria:**
- Backoffice group receives approval task when reservation is submitted
- Approving sets status to `approved` and creates a Training Session automatically
- Rejecting sets status to `rejected` and notifies the instructor
- Work notes are appended on each transition (BR handles this)

---

### FLOW-02 — [TOCC] Enrollment Approval Flow (Instructor-Gated Mode)

**Trigger:** Record created — `x_783010_tocc_a1_student_enrollment` where `status = pending`

**Condition:** Only active when `enrollment_approval_mode = instructor_approval` in Training Config.
When mode is `direct`, the BR auto-approves and this flow does not need to trigger.

**Steps:**

```
1. Trigger: Record created, status = "pending"
2. Check Config (Script step):
   └── var mode = new TrainingConfigService().getEnrollmentApprovalMode();
   └── if (mode !== 'instructor_approval') → End flow
3. Ask for Approval
   └── Approver: Instructor on the linked Training Session
4. If Approved:
   └── Set field: status = "approved"
   └── Script: new NotificationHelper().sendEnrollmentDecision(current.sys_id)
5. If Rejected:
   └── Set field: status = "rejected"
   └── Script: new NotificationHelper().sendEnrollmentDecision(current.sys_id)
```

**Acceptance Criteria:**
- Instructor receives approval task for each enrollment when mode is `instructor_approval`
- Approval/rejection updates status and notifies student
- Direct mode enrollments bypass this flow entirely

---

### FLOW-03 — [TOCC] Session Cancellation Notification Flow

**Trigger:** Record updated — `x_783010_tocc_a1_training_session` where `status` changes to `cancelled`

**Purpose:** Notifies all enrolled students when a session is cancelled. The session status transition is handled by `TrainingSessionService` or UI Action; this flow handles the mass notification.

**Steps:**

```
1. Trigger: Record updated → status changes to "cancelled"
2. Script step:
   └── new NotificationHelper().sendSessionCancelled(current.sys_id)
3. End
```

**Acceptance Criteria:**
- All students with `approved` enrollments receive cancellation notification
- Notification is sent once, not per enrollment record update

---

### FLOW-04 — [TOCC] Attendance Confirmation Request Flow

**Trigger:** Scheduled — runs daily, or called from the scheduled job `Release Unconfirmed Seats`

**Purpose:** Sends confirmation requests to all approved, unconfirmed students before their session's confirmation deadline. This is handled directly by the Scheduled Job `SCH-002` in the current implementation, so this flow is optional/supplementary.

**Steps:**

```
1. Trigger: Scheduled daily
2. Query: Training Sessions where confirmation_deadline between now+0h and now+confirmation_lead_hours
3. For each session → Script: new NotificationHelper().sendConfirmationRequests(session.sys_id)
4. End
```

**Note:** The Scheduled Job `[TOCC] Release Unconfirmed Seats` already handles seat release. This flow adds the proactive confirmation request dispatch as a separate concern.

---

## Subflows

### SF-01 — [TOCC] SF - Promote Waitlisted Student

**Purpose:** Promotes the next waitlisted enrollment to `approved` when a seat becomes available.
Called internally by `EnrollmentService._promoteWaitlistedEnrollments()` — no separate flow needed in the current implementation since promotion is synchronous within the service.

**If a Flow Designer subflow is preferred:**

```
Inputs: training_session_sys_id (String), max_promotions (Integer)
Steps:
  1. Script: var svc = new EnrollmentService(); svc._promoteWaitlistedEnrollments(inputs.training_session_sys_id, inputs.max_promotions);
  2. End
```

---

### SF-02 — [TOCC] SF - Send Training Notification

**Purpose:** Generic notification dispatch subflow. Wraps `NotificationHelper` for Flow Designer consumption.

```
Inputs: enrollment_sys_id (String), notification_type (String)
  Accepted values: approved | rejected | waitlisted | waitlist_promoted | cancelled |
                   reminder | confirmation_request | feedback_request

Steps:
  1. Script step:
     var helper = new NotificationHelper();
     var type = inputs.notification_type;
     if (type === 'approved' || type === 'rejected' || type === 'waitlisted' || type === 'cancelled') {
         helper.sendEnrollmentDecision(inputs.enrollment_sys_id);
     } else if (type === 'waitlist_promoted') {
         helper.sendWaitlistPromotion(inputs.enrollment_sys_id);
     }
  2. End
```

---

## Manual Configuration Steps

### Step 1 — Register Events

Navigate to: **System Policy → Events → Event Registry**

Create one entry per event listed in the Event Registry table above. Set:
- Event name: as listed
- Table: as listed
- Description: human-readable description of when it fires

### Step 2 — Link Notifications to Events

Each notification in `notifications/notifications.now.ts` references an event name.
After SDK install, navigate to each notification record and confirm the event binding is correct under the **When to send** tab.

### Step 3 — Create Approval Groups

Navigate to: **User Administration → Groups**

Create group: `[TOCC] Backoffice`
- Add Backoffice-role users as members
- Reference this group's sys_id in FLOW-01 approval step

### Step 4 — Create Flows in Flow Designer

Navigate to: **Flow Designer → Create New Flow**

Follow the step definitions above for each flow. All script steps call existing Script Includes — no inline logic should be written in Flow Designer.

### Step 5 — Activate Flows

Set each flow to Active and test with a real reservation/enrollment record in the dev instance.

---

*Last updated: Sprint 4 — Flows runbook, event registry, subflow contracts.*
