# Platform Analytics Layout (SDK + Manual Refinement)

This diagram mirrors the dashboard scaffold implemented in `platform-analytics-dashboard.now.ts`.

```mermaid
flowchart TB
    D[Training Operations Performance Dashboard]
    D --> T1[Tab: Executive Summary]
    D --> T2[Tab: Operational Intelligence]

    T1 --> W1[Single Score: Session Fill Rate]
    T1 --> W2[Single Score: No-Show Rate]
    T1 --> W3[Single Score: Confirmation Rate]
    T1 --> W4[Single Score: Avg Reservation Approval Time]
    T1 --> W5[Donut: Sessions by Status]
    T1 --> W6[Vertical Bar: Reservations by Status]

    T2 --> W7[Horizontal Bar: Most Used Rooms]
    T2 --> W8[Horizontal Bar: Most Requested Resources]
    T2 --> W9[Gauge: Feedback Avg Rating]
    T2 --> W10[Line: KB Article Views]
```

## Operational note

- Widget rendering is delivered via SDK metadata.
- Final indicator formulas and data collectors continue in Performance Analytics UI as planned in `PLATFORM_ANALYTICS_KPIS.md`.
