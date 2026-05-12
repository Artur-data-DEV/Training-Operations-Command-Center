# TOCC Flow Orchestration Map

This folder is now used as the flow implementation map for handoff and upcoming Fluent Flow objects.

## Current (Implemented in Script Includes + BR + Scheduled Jobs)

```mermaid
flowchart TD
    A[Reservation Submitted] --> B[Validate RoomService]
    B --> C{Approved?}
    C -->|Yes| D[TrainingSessionService syncFromReservation]
    C -->|No| E[NotificationHelper sendReservationDecision]
    D --> F[EnrollmentService seat orchestration]
    F --> G[NotificationHelper sendEnrollmentDecision]
    G --> H[PortalApiService / VA consume status]
```

## Next (Planned Fluent Flow API Objects)

```mermaid
flowchart LR
    P1[Flow: Reservation Intake] --> P2[Action: Conflict Audit Tagging]
    P2 --> P3[Action: Approval SLA Timer]
    P3 --> P4[Action: Backoffice Escalation]

    Q1[Flow: Session Lifecycle] --> Q2[Action: Attendance Window Release]
    Q2 --> Q3[Action: Feedback Request Dispatch]

    R1[Flow: Self-Service Signals] --> R2[Action: KB Engagement Snapshot]
    R2 --> R3[Action: KPI Refresh Trigger]
```

## Rationale

- Keep runtime logic stable in Script Includes while Flow API coverage evolves by release.
- Use this map as implementation sequencing for US-28, US-29, and US-31 automation.
