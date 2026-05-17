# Platform Execution Backlog (Actionable)

Scope: `x_783010_tocc_a1`  
Purpose: convert baseline architecture into executable delivery work.

## Execution Progress (2026-05-17)

- `TOCC-P0-01`: code-level ACL expansion implemented in `src/fluent/security/acls.now.ts` and build validated.
- `TOCC-P0-01` still requires instance-level impersonation validation before closing.
- Deploy checkpoint completed:
  - `now-sdk install --auth dev` finished successfully
  - flow activation result: `7/7 succeeded`

## Priority Legend

- `P0`: blocking release / security / data integrity
- `P1`: required for operational readiness
- `P2`: hardening and maturity

## P0 - Release Blockers

### TOCC-P0-01: Align ACL implementation with official role matrix

- Area: Security
- Problem: code ACL baseline is still minimal and mostly read/execute-only; full CRUD/field policy matrix is not fully enforced in code.
- Evidence:
  - `src/fluent/security/acls.now.ts`
  - `docs/foundation/role-acl-control-matrix.md`
  - `SECURITY_MODEL.md`
- Deliverables:
  - Expand `acls.now.ts` to enforce per-table CRUD by role.
  - Add field-level ACL rules for status/config/sensitive operational fields.
  - Preserve manager as read-only across scoped operational tables.
- Done when:
  - Role impersonation checks pass for student, instructor, backoffice, manager, admin.
  - Unauthorized write attempts fail server-side.

### TOCC-P0-02: Close persona boundary leaks across Portal and Workspace

- Area: Experience governance
- Problem: portal pages are intentionally broad for convenience, but the final model requires strict persona boundaries.
- Evidence:
  - `src/fluent/portal/service-portal.now.ts`
  - `docs/foundation/persona-experience-architecture.md`
- Deliverables:
  - Validate page/menu role visibility against official matrix.
  - Confirm student/instructor cannot access backoffice-only operations.
  - Document exceptions explicitly if any shared page remains.
- Done when:
  - Persona smoke matrix passes with no boundary violations.

### TOCC-P0-03: Publish VA topics using backend adapter contract only

- Area: Virtual Agent
- Problem: backend adapter is implemented, but topic publication/homologation remains manual.
- Evidence:
  - `src/fluent/logic/virtual-agent-topic-service.now.ts`
  - `docs/manual-config/virtual-agent-authoring.md`
- Deliverables:
  - Publish 6 topics in VA Designer Web channel.
  - Bind topic actions to adapter methods only.
  - Validate confirm/cancel by enrollment `number` and `sys_id`.
- Done when:
  - All 6 topics are live and negative-path responses remain controlled.

## P1 - Operational Readiness

### TOCC-P1-01: Finish Workspace home composition as command center

- Area: Workspace
- Current baseline:
  - Workspace/list scaffolding exists with 5 categories and 10 lists.
  - Source: `src/fluent/workspace/backoffice-workspace.now.ts`
- Missing:
  - Home operational cards and highlights layout in UI Builder.
  - Quick action ergonomics for approvals and exception handling.
- Deliverables:
  - Compose home sections per `docs/manual-config/workspace-composition.md`.
  - Bind cards to `PortalApiService.getOperationsSnapshot()`.
  - Validate role-based visibility for backoffice/manager/admin.
- Done when:
  - Backoffice lands on one screen with queue-first operational context.

### TOCC-P1-02: Complete analytics indicator wiring to live KPIs

- Area: Platform Analytics
- Current baseline:
  - Dashboard scaffold and permissions are in code.
  - KPI service and daily collector are in code.
  - Sources:
    - `src/fluent/dashboards/platform-analytics-dashboard.now.ts`
    - `src/fluent/logic/training-kpi-service.now.ts`
    - `src/fluent/scheduled-jobs/scheduled-jobs.now.ts`
- Missing:
  - Indicator creation/wiring in Analytics Hub.
- Deliverables:
  - Map dashboard widgets to KPI keys and verify values.
  - Validate read permissions for manager/backoffice and deny student.
- Done when:
  - Dashboard shows real values and passes cross-check with snapshot table.

### TOCC-P1-03: Execute integrated homologation checklist with evidence

- Area: Release quality
- Problem: docs exist, but a completed evidence-based run is still pending.
- Evidence:
  - `docs/manual-config/platform-homologation-checklist.md`
- Deliverables:
  - Run full checklist US-33..US-38.
  - Attach evidence references (sys_ids, logs, screenshots).
  - Produce Go/No-Go decision record.
- Done when:
  - Checklist is fully filled and signed for release decision.

## P2 - Hardening

### TOCC-P2-00: Generated metadata drift control (`keys.ts`)

- Area: Build/release governance
- Problem: `now-sdk build` can mutate `src/fluent/generated/keys.ts` even in doc-focused work.
- Deliverables:
  - Add release checklist step to review generated key diffs before commit.
  - Annotate whether diff is intentional metadata evolution or regeneration noise.
- Done when:
  - Every release PR classifies `keys.ts` change intent explicitly.

### TOCC-P2-01: ATF execution evidence and regression gate

- Area: Testing
- Current baseline:
  - ATF definitions are implemented.
  - Build succeeds (`npm run build`).
  - Source: `TEST_STRATEGY.md`
- Missing:
  - Validated full ATF run evidence in target instance.
- Deliverables:
  - Execute core ATF suite for security/lifecycle/analytics/VA.
  - Record pass/fail rates and residual risks.
- Done when:
  - ATF pass evidence is attached to release decision.

### TOCC-P2-02: CMDB resource hygiene closure

- Area: Data quality
- Current baseline:
  - Resource lists and validation service are implemented.
  - Sources:
    - `src/fluent/logic/cmdb-resource-service.now.ts`
    - `src/fluent/workspace/backoffice-workspace.now.ts`
- Missing:
  - Final clean-state evidence (`Resources Missing CI Link` backlog treatment).
- Deliverables:
  - Validate CI link rules with negative tests.
  - Reduce unresolved resource-CI gaps per operations threshold.
- Done when:
  - CMDB link exceptions are within accepted operational threshold.

## Sequenced Execution Plan

1. `TOCC-P0-01` ACL alignment
2. `TOCC-P0-02` persona boundary checks
3. `TOCC-P0-03` VA publication and validation
4. `TOCC-P1-01` workspace home composition
5. `TOCC-P1-02` analytics wiring
6. `TOCC-P1-03` integrated homologation
7. `TOCC-P2-01` ATF evidence gate
8. `TOCC-P2-02` CMDB hygiene closure

## Status Snapshot (Code-Only)

- Build status: success (`npm run build` on 2026-05-17)
- Core backend services: present
- Flows: present (5)
- Scheduled jobs: present (6)
- Workspace scaffold: present
- Dashboard scaffold and permissions: present
- Manual publication/configuration items: pending in instance
