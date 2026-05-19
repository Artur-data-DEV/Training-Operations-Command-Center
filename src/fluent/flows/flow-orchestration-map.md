# TOCC Flow Orchestration Map

This map reflects the current implementation in:
`src/fluent/flows/training-orchestration-flows.now.ts`

## Flows

| Flow | Trigger | Purpose |
|---|---|---|
| Reservation Approval | Reservation `status=submitted` | Backoffice approval and reservation decision application |
| Enrollment Approval | Enrollment created with `status=pending` | Instructor-gated approval for enrollments that remain pending after `EnrollmentService` evaluates configuration |
| Session Cancelled | Session status changed to `cancelled` | Notify approved enrollments |
| Attendance Confirmation Cadence | Daily 08:00 | Scaffold/log-only cadence for due confirmation work; real notifications are owned by scheduled jobs and `NotificationHelper` |
| Session Reminder Cadence | Daily 07:00 | Scaffold/log-only cadence for reminder visibility; real notifications are owned by scheduled jobs and `NotificationHelper` |

## Subflows

| Subflow | Purpose |
|---|---|
| Reservation Approval Routing | Reusable single-responsibility route: find Backoffice group, assign reservation, request approval, apply decision, or create fallback task |

## High-level sequence

```mermaid
flowchart TD
    R1[Reservation submitted] --> R0[Subflow: Reservation Approval Routing]
    R0 --> R2[Find [TOCC] Backoffice group]
    R2 -->|Found| R3[Ask for Approval]
    R3 --> R4[Apply reservation status from approval_state]
    R4 --> R5[Emit reservation.<approval_state> event]
    R2 -->|Missing| R6[Create manual fallback task]

    E1[Enrollment pending on create] --> E2[EnrollmentService already evaluated TrainingConfigService]
    E2 --> E3[Resolve session via tocc_training_session]
    E3 -->|Found| E4[Ask for Approval]
    E4 --> E5[Apply enrollment status from approval_state]
    E5 --> E6[Emit enrollment.<approval_state> event]
    E3 -->|Missing| E7[Create manual fallback task]

    C1[Session cancelled] --> C2[Flow lookup: approved enrollments by tocc_training_session]
```

## Notes

- Reservation and enrollment approval decisions are now Flow-native (`action.core.askForApproval`).
- Reservation approval routing is encapsulated in a real reusable subflow. Log-only subflows were removed to avoid fake reuse.
- Enrollment configuration is not read directly by Flow. `EnrollmentService` and `TrainingConfigService` decide whether a record remains `pending`; the Flow only handles those pending records.
- Flow enrollment and cancellation lookups use `tocc_training_session`, not legacy `training_session`.
- Seat recalculation remains in business-rule/service layer (`EnrollmentService.syncSessionAfterEnrollmentChange`).
- Session creation/cascade remains in service layer (`TrainingSessionService.syncFromReservation`).
- Reminder and confirmation cadence flows are operational scaffolds. Production notification dispatch remains `ScheduledScript -> NotificationHelper -> eventQueue -> EmailNotification`.
