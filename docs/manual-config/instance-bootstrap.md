# Instance Bootstrap Runbook

## Objective

Prepare `https://dev372264.service-now.com` for this repository.

## Application Identity

| Property | Value |
|---|---|
| Name | Training Operations Command Center |
| Scope | `x_783010_tocc_a1` |
| Scope sys_id | `c550db709e9c4118920deb53e10aba07` |
| Version | 1.0.0 |
| Release | Australia Patch 1 (build 2026-03-31) |

> **Important:** The registered scope prefix is `x_783010_tocc_a1`. Do NOT create a new app
> with shorthand `x_tocc` — it will conflict with the SDK-deployed scope.

## Required Manual Actions

1. Log in to `https://dev372264.service-now.com` as `admin`.
2. Navigate to **System Applications → Studio**.
3. Confirm the app **Training Operations Command Center** with scope `x_783010_tocc_a1` exists.
   - If it does not exist: create it via **Create Application**, set scope to `x_783010_tocc_a1`.
4. Ensure `admin` user has rights to update app artifacts under this scope.
5. Confirm application scope is visible and active in Studio.
6. Open `sys_scope.list` and verify a record with `scope = x_783010_tocc_a1` exists.

## SDK Auth Setup

```bash
now-sdk auth --add dev372264.service-now.com --type basic --alias dev
```

Enter admin credentials when prompted. Verify with:

```bash
now-sdk auth --list
```

## Deploy After Bootstrap

```bash
npm run build       # validate all Fluent artifacts
now-sdk install --auth dev   # push to instance
```

## Validation Checklist

- [ ] `sys_scope` has record with `scope = x_783010_tocc_a1`
- [ ] `now-sdk build` exits with code 0
- [ ] `now-sdk install --auth dev` completes without errors
- [ ] Script Includes visible in instance under scope `x_783010_tocc_a1`
- [ ] ATF suite runs from instance test runner
