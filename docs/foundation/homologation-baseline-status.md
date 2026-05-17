# Homologation Baseline Status

Scope: `x_783010_tocc_a1`  
Date: 2026-05-17  
Method: code and runbook evidence review + local build validation.

## Overall Read

- Product direction: strong
- Scaffold maturity: high
- Release readiness: partial (manual closure and role-hardening still required)

## Increment Status Board

| Increment | Status | Summary |
|---|---|---|
| 1. Core operational domain | Partial | Core services and policy logic exist; ACL matrix was expanded in code and now needs instance impersonation validation. |
| 2. Operational workspace | Partial | Workspace scaffold and list model exist; command-center home composition still manual/pending. |
| 3. Intelligence and automation | Partial | KPI collector, flows, jobs, and dashboard scaffold exist; indicator wiring evidence still pending. |
| 4. Advanced and hardening | Partial | VA backend adapter and KB/bootstrap services exist; topic publication and full ATF evidence pending. |

## Verified Evidence

### Build and baseline validity

- `npm run build` completed successfully on 2026-05-17.
- Build side effect observed: `src/fluent/generated/keys.ts` updated by SDK generation pass (catalog-key mappings).
- ACL expansion build validated:
  - `src/fluent/security/acls.now.ts`
- Deploy validated:
  - command: `now-sdk install --auth dev`
  - result: installation completed successfully
  - flow activation: `7/7 succeeded`
  - rollback contexts:
    - `adf2ecaf833003101d6b75a6feaad3e8`
    - `29d368eb833003101d6b75a6feaad3ea` (post-ACL hardening deploy)
- Source:
  - `package.json`
  - local build execution

### Orchestration and automation footprint

- Flows present: 5
  - `src/fluent/flows/training-orchestration-flows.now.ts`
- Scheduled jobs present: 6
  - `src/fluent/scheduled-jobs/scheduled-jobs.now.ts`

### Operational backend contracts

- `PortalApiService` supports:
  - self-service actions (`confirmMyAttendance`, `cancelMyEnrollment`)
  - operations snapshot (`getOperationsSnapshot`)
  - policy/help context (`getTrainingPolicies`, `getHelpCenterContext`)
- `VirtualAgentTopicService` supports:
  - session discovery, my enrollments, confirm/cancel, policies, escalation
  - adapter pattern via PortalApiService calls

### Workspace and analytics baseline

- Workspace scaffold:
  - 5 categories and 10 lists
  - `src/fluent/workspace/backoffice-workspace.now.ts`
- Dashboard scaffold and permissions:
  - manager/backoffice read, admin owner
  - `src/fluent/dashboards/platform-analytics-dashboard.now.ts`

## Gaps Blocking Product-Ready V1

### Gap A: ACL depth vs official matrix

- Current code ACL baseline does not yet represent the full role-by-operation policy from the official matrix.
- Action reference: `docs/foundation/platform-execution-backlog.md` -> `TOCC-P0-01`

### Gap B: Manual publication layers still open

- VA topics publication/homologation
- Analytics indicator wiring
- Workspace home composition in UI Builder
- Action references:
  - `docs/manual-config/virtual-agent-authoring.md`
  - `docs/manual-config/dashboard-indicator-wiring.md`
  - `docs/manual-config/workspace-composition.md`

### Gap C: Integrated evidence package still pending

- No completed evidence bundle for the full checklist US-33..US-38 in current repo state.
- Action reference:
  - `docs/manual-config/platform-homologation-checklist.md`

## Commit Scope Note (Important)

- `src/fluent/generated/keys.ts` is generated and may change after `now-sdk build`.
- Any release commit must classify this diff explicitly:
  - include it when it reflects intended metadata state changes;
  - exclude or regenerate when it is unrelated noise.
- Do not merge blind generated-key diffs without review context.

## Immediate Next Checks (Suggested Order)

1. Complete ACL role-depth alignment and rerun persona matrix smoke.
2. Publish and validate VA topics with backend adapter methods only.
3. Wire dashboard indicators and cross-check snapshot table values.
4. Finish workspace home composition and card permissions.
5. Execute integrated homologation checklist and issue Go/No-Go record.

## Release Readiness Score (Current Snapshot)

- Architecture baseline: 9/10
- Core domain implementation: 8/10
- Security enforcement maturity: 7/10
- Operational UX completeness: 7/10
- Evidence and release governance: 6/10

Composite: 7.4/10 (not yet product-ready without manual closure and impersonation-validated controls)
