# Homologation Run Log - 2026-05-17

Scope: `x_783010_tocc_a1`  
Instance: `dev372264.service-now.com`  
Branch context: `release/v1-platform-closure` (as documented baseline)

## Automated Evidence Collected

### 1) Build

- Command: `npm run build`
- Result: success
- Evidence: local CLI output (`now-sdk build completed successfully`)

### 2) Deploy

- Command: `now-sdk install --auth dev`
- Result: success
- Flow activation result: `7/7 succeeded`
- Rollback contexts:
  - `https://dev372264.service-now.com/sys_rollback_context.do?sys_id=adf2ecaf833003101d6b75a6feaad3e8`
  - `https://dev372264.service-now.com/sys_rollback_context.do?sys_id=29d368eb833003101d6b75a6feaad3ea` (post-ACL hardening deploy)
- App record:
  - `https://dev372264.service-now.com/sys_app.do?sys_id=c550db709e9c4118920deb53e10aba07`

### 3) Code-level controls

- ACL baseline expanded and build-validated:
  - `src/fluent/security/acls.now.ts`
- Foundation tracker updated:
  - `docs/foundation/platform-execution-backlog.md`
  - `docs/foundation/homologation-baseline-status.md`

## Pending Instance Validation (Manual)

These require direct instance verification:

1. Scheduled jobs active/next_action checks (`platform-validation-scripts.md`, section 6).
2. Persona ACL smoke with test users (`platform-validation-scripts.md`, section 7).
3. VA topic publication and conversation tests (6 topics).
4. Dashboard indicator wiring and data cross-check.
5. Workspace home composition and role visibility smoke.

## Suggested Immediate Operator Sequence

1. Run section 6 and section 7 from:
   - `docs/manual-config/platform-validation-scripts.md`
2. Fill execution evidence in:
   - `docs/manual-config/platform-homologation-checklist.md`
3. Publish VA topics and capture transcripts.
4. Wire analytics indicators and screenshot widget values.
5. Run persona smoke matrix and issue Go/No-Go.
