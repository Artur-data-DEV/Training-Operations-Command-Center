# PLATFORM_ANALYTICS_KPIS.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 9
> **Strategy:** SDK-assisted. Indicator definitions configured on instance via Performance Analytics.
> Dashboard layout composed in Analytics Hub UI, with app-scoped KPI daily collector for baseline persistence.

---

## 1. Dashboard Identity

| Property | Value |
|---|---|
| Dashboard Name | Training Operations Performance Dashboard |
| Audience | Manager (primary), Backoffice (secondary), Admin |
| Refresh Cadence | Daily (automated) |
| Data Source | All `x_783010_tocc_a1_*` scoped app tables |

---

## 2. KPI Definitions

### KPI-01 — Room Conflict Rate

| Property | Value |
|---|---|
| **Objective** | Measure how often reservation submissions are blocked by room conflicts |
| **Source Table** | `x_783010_tocc_a1_room_reservation` |
| **Formula** | `(Reservations rejected for conflict / Total submissions) × 100` |
| **Filters** | Date range: rolling 30 days |
| **Visualization** | Single score widget + trend line |
| **Target** | 0% — any conflict is a scheduling failure |
| **Note** | System prevents conflicts at submission time; this measures misuse patterns |

---

### KPI-02 — Room Occupancy Rate

| Property | Value |
|---|---|
| **Objective** | Track how efficiently rooms are being used vs. available hours |
| **Source Table** | `x_783010_tocc_a1_training_session` + `x_783010_tocc_a1_room` |
| **Formula** | `(Total session hours in room / Total available room hours in period) × 100` |
| **Filters** | Status: `completed`, `in_progress`; date range: rolling 30 days |
| **Visualization** | Bar chart by room |
| **Target** | > 70% |

---

### KPI-03 — Training Session Fill Rate

| Property | Value |
|---|---|
| **Objective** | Measure how full sessions are when they run |
| **Source Table** | `x_783010_tocc_a1_training_session` |
| **Formula** | `((total_seats - available_seats) / total_seats) × 100` averaged across completed sessions |
| **Filters** | Status: `completed`; date range: rolling 30 days |
| **Visualization** | Gauge + trend |
| **Target** | > 75% |

---

### KPI-04 — No-Show Rate

| Property | Value |
|---|---|
| **Objective** | Track the percentage of enrolled students who don't attend |
| **Source Table** | `x_783010_tocc_a1_attendance` |
| **Formula** | `(Records with status = no_show / Total attendance records) × 100` |
| **Filters** | Date range: rolling 30 days |
| **Visualization** | Single score + trend line |
| **Target** | < 15% |

---

### KPI-05 — Attendance Confirmation Rate

| Property | Value |
|---|---|
| **Objective** | Track what percentage of approved students confirm attendance before the deadline |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | `(Enrollments with confirmed = true / Total approved enrollments) × 100` |
| **Filters** | Status: `approved`; date range: rolling 30 days |
| **Visualization** | Gauge |
| **Target** | > 85% |

---

### KPI-06 — Average Reservation Approval Time

| Property | Value |
|---|---|
| **Objective** | Measure how quickly Backoffice approves room reservations |
| **Source Table** | `x_783010_tocc_a1_room_reservation` |
| **Formula** | Average of `(approval timestamp - submission timestamp)` in hours |
| **Filters** | Status: `approved`; date range: rolling 30 days |
| **Visualization** | Single score (hours) + trend |
| **Target** | < 4 hours |

---

### KPI-07 — Average Enrollment Approval Time

| Property | Value |
|---|---|
| **Objective** | Measure how quickly instructor-gated enrollments are approved |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | Average of `(approved_at - requested_at)` in hours |
| **Filters** | Status: `approved`; enrollment_approval_mode: `instructor_approval`; rolling 30 days |
| **Visualization** | Single score (hours) |
| **Target** | < 4 hours |

---

### KPI-08 — Enrollment Cancellation Rate

| Property | Value |
|---|---|
| **Objective** | Track how often approved enrollments are later cancelled |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | `(Cancelled enrollments / Total approved enrollments) × 100` |
| **Filters** | Rolling 30 days |
| **Visualization** | Single score + trend |
| **Target** | < 20% |

---

### KPI-09 — Blocked Late Cancellations

| Property | Value |
|---|---|
| **Objective** | Track how often students attempt to cancel within the late-cancel window |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | Count of work notes containing `[BLOCKED] Late cancellation` in rolling 30 days |
| **Filters** | Date range: rolling 30 days |
| **Visualization** | Count widget |
| **Target** | Informational — no target; high values indicate scheduling behavior issue |

---

### KPI-10 — Waitlist Conversion Rate

| Property | Value |
|---|---|
| **Objective** | Measure how often waitlisted students eventually get a seat |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | `(Enrollments that moved from waitlisted → approved / Total ever-waitlisted enrollments) × 100` |
| **Filters** | Rolling 30 days |
| **Visualization** | Gauge |
| **Target** | > 40% |

---

### KPI-11 — Sessions by Status

| Property | Value |
|---|---|
| **Objective** | Snapshot of session pipeline |
| **Source Table** | `x_783010_tocc_a1_training_session` |
| **Formula** | Count grouped by `status` |
| **Filters** | Active sessions; current month |
| **Visualization** | Donut chart |
| **Target** | Informational |

---

### KPI-12 — Reservations by Status

| Property | Value |
|---|---|
| **Objective** | Snapshot of reservation pipeline |
| **Source Table** | `x_783010_tocc_a1_room_reservation` |
| **Formula** | Count grouped by `status` |
| **Filters** | Rolling 30 days |
| **Visualization** | Bar chart |
| **Target** | Informational |

---

### KPI-13 — Most Used Rooms

| Property | Value |
|---|---|
| **Objective** | Identify which rooms are most in demand |
| **Source Table** | `x_783010_tocc_a1_training_session` |
| **Formula** | Count of completed sessions grouped by `room` |
| **Filters** | Status: `completed`; rolling 90 days |
| **Visualization** | Horizontal bar chart (top 10) |
| **Target** | Informational — informs room investment decisions |

---

### KPI-14 — Most Requested Resources

| Property | Value |
|---|---|
| **Objective** | Identify which room resources are most requested |
| **Source Table** | `x_783010_tocc_a1_reservation_resource` |
| **Formula** | Count grouped by `resource` |
| **Filters** | Rolling 90 days |
| **Visualization** | Bar chart |
| **Target** | Informational |

---

### KPI-15 — Knowledge Article Views

| Property | Value |
|---|---|
| **Objective** | Measure KB effectiveness and self-service usage |
| **Source Table** | `kb_view` (platform table) |
| **Formula** | Count of views where knowledge base = TOCC KB |
| **Filters** | Rolling 30 days |
| **Visualization** | Trend line + top 5 articles |
| **Target** | Increasing trend = positive signal |

---

### KPI-16 — Feedback Average Rating

| Property | Value |
|---|---|
| **Objective** | Measure student satisfaction with training sessions |
| **Source Table** | `x_783010_tocc_a1_training_feedback` |
| **Formula** | Average of `rating` field across all submitted feedback |
| **Filters** | Rolling 30 days |
| **Visualization** | Gauge (1–5 scale) + trend |
| **Target** | > 4.0 / 5.0 |

---

## 3. Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ROW 1 — Executive Summary (4 score widgets)                    │
│  [Occupancy Rate] [Fill Rate] [No-Show Rate] [Avg Approval Time]│
├─────────────────────────────────────────────────────────────────┤
│  ROW 2 — Session & Reservation Pipeline (2 charts)              │
│  [Sessions by Status — donut] [Reservations by Status — bar]    │
├─────────────────────────────────────────────────────────────────┤
│  ROW 3 — Enrollment Health (3 widgets)                          │
│  [Confirmation Rate] [Cancellation Rate] [Waitlist Conversion]  │
├─────────────────────────────────────────────────────────────────┤
│  ROW 4 — Room & Resource Intelligence (2 charts)                │
│  [Most Used Rooms — bar] [Most Requested Resources — bar]       │
├─────────────────────────────────────────────────────────────────┤
│  ROW 5 — Self-Service & Satisfaction (2 widgets)                │
│  [Feedback Avg Rating — gauge] [KB Article Views — trend]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Manual Configuration Steps

### Step 0 - Validate App-Scoped KPI Collector
Run in **Scripts - Background**:

```javascript
new x_783010_tocc_a1.TrainingKpiService().collectDailySnapshot(30);
```

Confirm 16 rows in `x_783010_tocc_a1_kpi_snapshot` for current `snapshot_date`.


### Step 1 — Enable Performance Analytics
Navigate to **Performance Analytics → Activate** if not already enabled on the PDI.

### Step 2 — Create Indicators
Navigate to **Performance Analytics → Indicators → New** for each KPI.
Set source table, formula type (percentage / count / average), and filters per definitions above.

### Step 3 — Schedule Data Collection
Navigate to **Performance Analytics → Data Collector → New**
Set each indicator to collect daily at midnight.

### Step 4 — Build Dashboard
Navigate to **Performance Analytics → Dashboards → New**
- Name: `Training Operations Performance Dashboard`
- Add widgets per layout in section 3
- Set audience visibility to roles: `x_783010_tocc_a1.manager`, `x_783010_tocc_a1.backoffice`, `x_783010_tocc_a1.admin`

### Step 5 — Validate with Real Data
After first data collection run, verify each KPI value is plausible given the test data in the dev instance.

---

*Last updated: Sprint 12 — 16 KPIs defined, dashboard layout, and app-scoped collector integrated.*
