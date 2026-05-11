# Instance Bootstrap Runbook

## Objective

Prepare `https://dev372264.service-now.com` for this repository.

## Required Manual Actions

1. In ServiceNow Studio, create scoped app:
   - Name: `Training Operations Command Center`
   - Scope: `x_tocc`
   - Version: `1.0.0`
2. Ensure user `admin` has rights to update app artifacts.
3. Confirm application scope is visible and active in Studio.
4. Re-run scope check API or open `sys_scope.list` and confirm `x_tocc` exists.

## Validation

- `sys_scope` has record with `scope=x_tocc`.
- Studio can create a sample file under the app.

