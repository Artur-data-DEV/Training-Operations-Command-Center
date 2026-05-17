# Increment Acceptance Criteria Baseline

Scope: `x_783010_tocc_a1`  
Status: Execution contract for product finalization

## Goal

Convert the current scaffold-plus-runbook baseline into a robust ServiceNow product through four controlled increments with objective acceptance criteria.

## Increment 1: Core Operational Domain

### Objective

Finalize canonical domain behavior for reservations, sessions, enrollments, attendance, and configuration policy.

### Must Deliver

- Roles and ACLs aligned to the official matrix
- Core Script Includes and Business Rules active and policy-driven
- Record Producers and Portal self-service endpoints working for student/instructor
- Conflict, capacity, cancellation window, and duplicate enrollment protections

### Acceptance Criteria

1. Student can request enrollment, and duplicate enrollment is blocked.
2. Instructor can request room reservation, and time conflict is blocked.
3. Enrollment capacity and waitlist behavior follows `TrainingConfigService`.
4. Cancellation policy window is enforced server-side.
5. No critical ACL leak found in role-impersonation smoke.

### Evidence

- ATF results for core service tests
- Manual E2E trace for student and instructor flows
- ACL verification log per role

## Increment 2: Operational Workspace

### Objective

Deliver a real backoffice command center experience in UI Builder Workspace.

### Must Deliver

- Workspace home with operational cards and queue-first layout
- List categories and filters aligned to operational process
- Quick actions for approve/reject/cancel/resolve
- Role-based access for backoffice, manager, admin

### Acceptance Criteria

1. Workspace home shows at least: pending reservations, today sessions, pending enrollments, attendance pending, resource hygiene.
2. List filters are aligned to operational statuses and validated in live data.
3. Cards are sourced from backend snapshot contract, not direct client queries.
4. Backoffice can execute operational actions without ACL errors.
5. Student and instructor cannot access workspace operations.

### Evidence

- Workspace screenshots with role impersonation
- Query/filter definitions and sample record counts
- ATF or scripted smoke for workspace accessibility

## Increment 3: Intelligence and Automation

### Objective

Operationalize data-driven management and reduce manual workload.

### Must Deliver

- Flow Designer approvals and lifecycle automations
- Scheduled jobs for reminders/no-show/seat release/snapshot collection
- KPI snapshot table and collector service
- Dashboard indicators wired to real data

### Acceptance Criteria

1. Daily KPI snapshot runs without duplication for the same date.
2. Dashboard scorecards and charts display live values from scoped data.
3. Reservation approval time and no-show metrics are traceable to source records.
4. Notification flow paths execute for key transitions.
5. Manager and backoffice have read access; student does not.

### Evidence

- Scheduled job run history
- Indicator and widget wiring proof
- KPI sample snapshots
- Notification event trail

## Increment 4: Advanced Experience and Hardening

### Objective

Close product maturity for support, conversational UX, asset context, and release confidence.

### Must Deliver

- Virtual Agent topics published and validated
- Knowledge Base integrated across Portal, VA, and operations
- Minimal CMDB/resource integrity in reservation operations
- Complete ATF regression pack for critical paths

### Acceptance Criteria

1. VA topics for session discovery, enrollments, attendance confirm, cancellation, policy lookup, and escalation are live.
2. VA topics use backend adapters only; no duplicated topic-side business logic.
3. KB content is role-segmented and linked from Portal and VA responses.
4. Room resources maintain valid CMDB linkage according to policy.
5. Critical ATF pack passes for security, lifecycle, and reporting flows.

### Evidence

- VA topic publish and conversation logs
- KB publication records and role tests
- CMDB integrity report
- ATF full-run report and residual risk list

## Exit Gate for "Product-Ready V1"

Release only when all conditions are true:

1. All four increments meet acceptance criteria with evidence.
2. Open defects are triaged with severity and owner.
3. No unresolved High severity security or ACL issue.
4. Runbooks are updated to reflect real final behavior.
5. Go/No-Go record is approved by app admin and technical owner.

## Source Anchors

- `NOW_CREATE_BACKLOG.md`
- `docs/backlog/platform-finalization-user-stories.md`
- `docs/manual-config/platform-homologation-checklist.md`
- `TEST_STRATEGY.md`
