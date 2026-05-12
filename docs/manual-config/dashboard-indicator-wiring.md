# Dashboard Indicator Wiring (Manual Layer)

This runbook covers manual Platform Analytics indicator wiring that remains after SDK dashboard scaffold deployment.

## Delivered by SDK

- Dashboard: `Training Operations Performance Dashboard`
- Tabs: `Executive Summary`, `Operational Intelligence`
- Widgets scaffolded with metric/group placeholders
- KPI collector service and scheduled collection path

## Remaining Manual Wiring

1. Open Platform Analytics and create/verify indicators for all expected KPI keys.
2. Bind each dashboard widget to the correct indicator/source.
3. Configure breakdowns and time series where relevant.
4. Validate audience access (Manager, Backoffice, Admin).

## Indicator Checklist

- Session Fill Rate
- No-Show Rate
- Attendance Confirmation Rate
- Reservation Approval Time
- Sessions by Status
- Reservations by Status
- Most Used Rooms
- Most Requested Resources
- Feedback Average Rating
- KB Article Views

## Validation

- Dashboard widgets render data (not empty placeholder).
- Daily snapshot collector remains idempotent.
- Manager role can read dashboard without admin privileges.

