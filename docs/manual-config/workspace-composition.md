# Workspace Composition (Manual Layer)

This runbook tracks remaining UI Builder composition tasks after SDK scaffold deployment.

## Delivered by SDK

- Workspace registry: `tocc-backoffice-ops`
- List menu config: `TOCC Backoffice List Configuration`
- Backoffice counters API: `PortalApiService.getOperationsSnapshot()`
- Categories:
  - Reservations
  - Training Sessions
  - Enrollments
  - Attendance
  - Assets and Resources

## Remaining Manual Composition

1. Open UI Builder and load `tocc-backoffice-ops`.
2. Build the landing page sections:
   - Pending reservations panel
   - Today's sessions panel
   - Pending enrollments panel
   - Attendance operations panel
   - Resource/CMDB hygiene panel
3. Add KPI tiles linked to the dashboard metrics where available.
   - Optional data source for operational count tiles: `PortalApiService.getOperationsSnapshot()`
4. Validate role-based visibility for Backoffice and Admin.

## Hard Rules

- Reuse existing list configs from SDK scaffold; do not create duplicate lists.
- Keep labels aligned with TOCC domain terms.
- Preserve scoped table filters and avoid global table exposure.

## Validation

- Opening workspace as Backoffice shows all five categories.
- Lists load without ACL errors.
- Navigation paths remain stable after publish.
