# Dashboard Scaffold Tuning Runbook

## Scope

This runbook applies after deploying `platform-analytics-dashboard.now.ts`.

## Objective

Finalize KPI widgets with real indicator sources in Platform Analytics UI.

## Steps

1. Open **Performance Analytics -> Dashboards**.
2. Locate **Training Operations Performance Dashboard**.
3. Validate tabs:
   - `Executive Summary`
   - `Operational Intelligence`
4. For each widget, bind the correct indicator/source as defined in `PLATFORM_ANALYTICS_KPIS.md`.
5. Confirm dashboard permissions:
   - `x_783010_tocc_a1.manager` (read)
   - `x_783010_tocc_a1.backoffice` (read)
   - `x_783010_tocc_a1.admin` (owner/write/share)

## Acceptance

- Dashboard is visible to Manager and Backoffice roles.
- Widgets render with real data (not empty placeholders) after data collection run.
