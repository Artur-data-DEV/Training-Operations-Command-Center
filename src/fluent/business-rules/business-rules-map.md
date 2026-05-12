# TOCC Business Rule Map

## Active Rule Domains

```mermaid
flowchart TB
    BR1[Reservation BRs] --> V1[Validate Room Reservation]
    BR1 --> V2[Sync Session From Reservation]
    BR1 --> V3[Status Transition Logging]

    BR2[Enrollment BRs] --> E1[Validate Enrollment]
    BR2 --> E2[Seat Sync + Waitlist Promotion]
    BR2 --> E3[Enrollment Status Logging]

    BR3[Attendance BRs] --> A1[Validate Attendance Marking]
    BR3 --> A2[Stamp Attendance Metadata]

    BR4[CMDB BRs] --> C1[Validate Room Resource CI Reference]
```

## Why this file exists

- Keeps business-rule scope explicit for future contributors.
- Provides a quick visual index for pending migrations to dedicated BR modules.
