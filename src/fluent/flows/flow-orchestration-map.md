# TOCC Flow Orchestration Map

This map reflects the current implementation in:
`src/fluent/flows/training-orchestration-flows.now.ts`

## Flows

| Flow | Trigger | Purpose |
|---|---|---|
| Reservation Approval | Reservation `status=submitted` | Backoffice approval and reservation decision application |
| Enrollment Approval | Enrollment created with `status=pending` | Direct approval or instructor-gated approval |
| Session Cancelled | Session status changed to `cancelled` | Notify approved enrollments |
| Attendance Confirmation Cadence | Daily 08:00 | Send confirmation requests for due sessions |
| Session Reminder Cadence | Daily 07:00 | Send reminder notifications for tomorrow sessions |

## Subflows

| Subflow | Purpose |
|---|---|
| Reservation Intake Processing | Emit reservation submitted event |
| Session Cancelled Processing | Iterate approved enrollments and emit cancellation events |

## High-level sequence

```mermaid
flowchart TD
    R1[Reservation submitted] --> R2[Find [TOCC] Backoffice group]
    R2 -->|Found| R3[Ask for Approval]
    R3 --> R4[Apply reservation status from approval_state]
    R4 --> R5[Emit reservation.<approval_state> event]
    R2 -->|Missing| R6[Create manual fallback task]

    E1[Enrollment pending on create] --> E2[Read enrollment_approval_mode from training_config]
    E2 -->|instructor_approval| E3[Resolve session instructor]
    E3 -->|Found| E4[Ask for Approval]
    E4 --> E5[Apply enrollment status from approval_state]
    E5 --> E6[Emit enrollment.<approval_state> event]
    E3 -->|Missing| E7[Create manual fallback task]
    E2 -->|direct| E8[Set approved and emit enrollment.approved]

    C1[Session cancelled] --> C2[Subflow: notify approved enrollments]
```

## Notes

- Reservation and enrollment approval decisions are now Flow-native (`action.core.askForApproval`).
- Seat recalculation remains in business-rule/service layer (`EnrollmentService.syncSessionAfterEnrollmentChange`).
- Session creation/cascade remains in service layer (`TrainingSessionService.syncFromReservation`).
