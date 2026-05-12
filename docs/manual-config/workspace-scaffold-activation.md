# Workspace Scaffold Activation Runbook

## Scope

This runbook applies after deploying `backoffice-workspace.now.ts`.

## Objective

Activate and validate the TOCC backoffice workspace scaffold:

- Workspace: `TOCC Backoffice Operations Workspace`
- Path: `/now/tocc-backoffice-ops/home`

## Steps

1. Open **All -> sys_ux_page_registry.list** and verify the workspace record exists.
2. Open workspace record and ensure `Active = true`.
3. Validate list menu config entries:
   - Reservations
   - Training Sessions
   - Enrollments
4. Test route access with an admin user:
   - `https://<instance>/now/tocc-backoffice-ops/home`
5. Test with a backoffice user and confirm list visibility.

## Notes

- If route access is blocked by security policy, add explicit ACL entries for workspace route patterns in the next increment.
- UI composition (KPI tiles and page layout) can evolve incrementally while preserving this scaffold.
