# Platform Analytics Layout (SDK + Manual Refinement)

This diagram mirrors the dashboard scaffold implemented in `platform-analytics-dashboard.now.ts`.

```mermaid
flowchart TB
    D[Training Operations Performance Dashboard]
    D --> T1[Tab: Executive Summary]
    D --> T2[Tab: Operational Intelligence]

    T1 --> W1[Single Score: Pending Reservations]
    T1 --> W2[Single Score: Sessions Today]
    T1 --> W3[Single Score: Pending Enrollments]
    T1 --> W4[Single Score: Resources Missing CMDB CI]
    T1 --> W5[Donut: Sessions by Status]
    T1 --> W6[Vertical Bar: Reservations by Status]

    T2 --> W7[List: Latest KPI Snapshot]
    T2 --> W8[Horizontal Bar: Most Requested Resources]
    T2 --> W9[Vertical Bar: Attendance by Status]
    T2 --> W10[List: Course Catalog Readiness]
```

## Operational note

- Widget rendering is delivered via SDK metadata and uses operational tables plus the app-scoped `x_783010_tocc_a1_kpi_snapshot` table.
- The daily collector `[TOCC] Collect KPI Snapshots` writes the KPI snapshot used by the portal home and the Platform Analytics list widget.
- The portal home shows the high-signal operational snapshot for `backoffice`, `manager`, and `admin` personas so those users do not land on an empty home page before opening Platform Analytics.
