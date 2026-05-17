# Homologation Checklist Snapshot - 2026-05-17

Reference template: `docs/manual-config/platform-homologation-checklist.md`

## 1) Execution Header

- Instance: `dev372264.service-now.com`
- Scope: `x_783010_tocc_a1`
- Branch context: `release/v1-platform-closure`
- Executed by: Codex assisted run
- Date/time start: 2026-05-17
- Date/time end: in progress

## 2) Mandatory Pre-check

- [x] Build/deploy validated (`npm run build`, `now-sdk install --auth dev`)
- [x] Flow activation completed during install (`7/7 succeeded`)
- [ ] Scheduled Jobs active check executed in instance (section 6 script)
- [ ] Event Registry complete (12 events `x_783010_tocc_a1.*`)
- [ ] Approval group exists: `[TOCC] Backoffice`

Evidence links:
- Rollback context:
  - `https://dev372264.service-now.com/sys_rollback_context.do?sys_id=adf2ecaf833003101d6b75a6feaad3e8`
  - `https://dev372264.service-now.com/sys_rollback_context.do?sys_id=29d368eb833003101d6b75a6feaad3ea` (post-ACL hardening)
- App record:
  - `https://dev372264.service-now.com/sys_app.do?sys_id=c550db709e9c4118920deb53e10aba07`

## 3) Story-by-Story Status

### US-33 KB publish
- [ ] Pending instance validation

### US-34 VA topics
- [ ] Pending publication and transcript evidence

### US-35 Analytics wiring
- [ ] Pending indicator binding and widget validation

### US-36 CMDB links
- [ ] Pending CMDB audit run

### US-37 Workspace composition
- [ ] Pending UI Builder composition validation

### US-38 Integrated go/no-go
- [ ] Pending after US-33..US-37 closure

## 4) Persona Smoke Matrix

- [ ] Student
- [ ] Instructor
- [ ] Backoffice
- [ ] Manager
- [ ] Admin

## 5) Next Operator Actions

1. Run `docs/manual-config/platform-validation-scripts.md` sections 6 and 7.
2. Publish VA topics and validate via Web channel.
3. Complete dashboard indicator wiring and cross-check snapshot rows.
4. Validate workspace home cards, filters, and role visibility.
5. Update this checklist to final Go/No-Go.
