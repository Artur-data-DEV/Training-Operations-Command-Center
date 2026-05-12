# CLAUDE.md — Training Operations Command Center

## Project Identity

| Key | Value |
|---|---|
| Project | Training Operations Command Center |
| App Scope | `x_783010_tocc_a1` |
| App Prefix | `x_783010_tocc_a1` |
| Instance Release | `Australia Patch 1 (build 2026-03-31)` |
| SDK | `now-sdk` v4.6 + `@servicenow/glide` v27 |
| TypeScript | 5.5.4 |

> **Naming note:** The scoped prefix registered on the PDI is `x_783010_tocc_a1`, not the shorthand `x_tocc` used in early planning docs. Always use the full prefix in code, table names, and ACL role references.

---

## Documentation Index

| Document | Purpose |
|---|---|
| `PRD.md` | Product requirements, personas, scope, business rules |
| `ARCHITECTURE.md` | Technical architecture, component diagram, SDK strategy |
| `DATA_MODEL.md` | Table definitions, fields, relationships, ER overview |
| `SECURITY_MODEL.md` | Roles, ACLs, User Criteria, access matrix |
| `NOW_CREATE_BACKLOG.md` | Epics, user stories, acceptance criteria, priorities |
| `FLOWS_AND_SUBFLOWS.md` | Flow Designer design specs and subflow contracts |
| `CMDB_MODEL.md` | CMDB light model, CSDM mapping, CI types |
| `VIRTUAL_AGENT_DESIGN.md` | VA topics, intent design, subflow references |
| `KNOWLEDGE_BASE_PLAN.md` | KB structure, article list, user criteria |
| `PLATFORM_ANALYTICS_KPIS.md` | KPI definitions, dashboards, data sources |
| `TEST_STRATEGY.md` | ATF plan, manual test scenarios, coverage goals |
| `DEPLOYMENT_GUIDE.md` | Deploy checklist, rollback, go-live validation |

---

## Project Structure

```
training-operations-command-center/
├── CLAUDE.md
├── PRD.md
├── ARCHITECTURE.md
├── DATA_MODEL.md
├── SECURITY_MODEL.md
├── NOW_CREATE_BACKLOG.md
├── FLOWS_AND_SUBFLOWS.md
├── CMDB_MODEL.md
├── VIRTUAL_AGENT_DESIGN.md
├── KNOWLEDGE_BASE_PLAN.md
├── PLATFORM_ANALYTICS_KPIS.md
├── TEST_STRATEGY.md
├── DEPLOYMENT_GUIDE.md
├── package.json
├── now.config.json
└── src/
    └── fluent/
        ├── app/
        │   └── application.now.ts
        ├── tables/
        │   └── core-tables.now.ts          ← All 11 domain tables
        ├── security/
        │   ├── roles.now.ts                ← 5 roles
        │   └── acls.now.ts                 ← Full CRUD ACL matrix
        ├── logic/                          ← Script Includes (grouped by domain)
        │   ├── training-config-service.now.ts
        │   ├── room-service.now.ts
        │   ├── training-session-service.now.ts
        │   ├── enrollment-service.now.ts
        │   ├── notification-helper.now.ts
        │   └── training-context-ajax.now.ts
        ├── business-rules/
        │   └── business-rules.now.ts       ← 7 BRs (thin routers to services)
        ├── catalog/
        │   └── record-producers.now.ts     ← 2 Record Producers
        ├── scheduled-jobs/
        │   └── scheduled-jobs.now.ts       ← 4 scheduled jobs
        ├── notifications/
        │   └── notifications.now.ts        ← 12 notification templates
        ├── ui-actions/
        │   └── ui-actions.now.ts           ← 8 UI Actions
        ├── client-scripts/
        │   └── client-scripts.now.ts       ← 5 Client Scripts
        ├── ui-policies/
        │   └── ui-policies.now.ts          ← 5 UI Policies
        ├── data/
        │   ├── training-config-seed.now.ts ← 8 config seed records
        │   └── course-seed.now.ts          ← 22 course seed records
        ├── tests/
        │   └── atf-smoke.now.ts            ← 3 ATF smoke tests
        ├── atf/
        │   ├── atf-config-service.now.ts       ← TEST-004–007 (TrainingConfigService)
        │   ├── atf-room-service.now.ts          ← TEST-008–012 (RoomService)
        │   ├── atf-enrollment-service.now.ts    ← TEST-013–020 (EnrollmentService)
        │   ├── atf-training-session-service.now.ts ← TEST-021–023 (TrainingSessionService)
        │   └── atf-notification-portal.now.ts   ← TEST-024–030 (NotificationHelper + PortalApiService)
        ├── flows/                          ← SDK-assisted; see FLOWS_AND_SUBFLOWS.md
        └── dashboards/                     ← SDK-assisted; see PLATFORM_ANALYTICS_KPIS.md
    └── server/                            ← React components for UI Builder Workspace
        ├── tsconfig.json
        ├── shared/
        │   └── tokens.ts                   ← Design tokens, domain types
        └── components/
            ├── ui.tsx                      ← StatusBadge, KpiCard, DataTable, LoadingSpinner, EmptyState
            ├── workspace-dashboard.tsx     ← Main dashboard (KPIs + 4 panels)
            ├── session-detail.tsx          ← Session detail + enrollment list
            └── workspace-root.tsx          ← Root router component (register in UI Builder)
```

---

## SDK Commands

```bash
# Install dependencies
npm install

# Authenticate with ServiceNow instance
now-sdk auth --add dev372264.service-now.com --type basic --alias dev

# Build / validate all Fluent artifacts
now-sdk build

# Install on target instance
now-sdk install --auth dev

# Package as installable zip (Update Set equivalent)
now-sdk pack

# Run ATF suite
now-sdk atf:run --suite x_783010_tocc_a1_atf_smoke

# Check SDK version
now-sdk --version
```

---

## SDK Artifact Strategy

| Artifact | Strategy |
|---|---|
| Tables / Fields / Choices | SDK-first |
| Roles | SDK-first |
| ACLs | SDK-first |
| Script Includes | SDK-first |
| Business Rules | SDK-first |
| Client Scripts | SDK-first |
| UI Policies | SDK-first |
| UI Actions | SDK-first |
| Scheduled Jobs | SDK-first |
| Notifications | SDK-first |
| Record Producers / Catalog Items | SDK-first |
| Seed Data (config + courses) | SDK-first |
| ATF Test Suites | SDK-first |
| Flow Designer / Subflows | SDK-assisted — requires verification on Australia release |
| Service Portal (pages/widgets) | SDK-assisted — visual layout requires instance UI |
| UI Builder / Workspace | SDK-assisted — verify per release |
| Platform Analytics / Dashboards | SDK-assisted — verify indicator API on Australia release |
| Knowledge Base | SDK-assisted — article content authored on instance |
| Virtual Agent | Manual configuration required — see `VIRTUAL_AGENT_DESIGN.md` |
| CMDB Relationships | SDK-assisted — relationship data depends on instance |

> **Rule:** If SDK support cannot be confirmed for a given artifact, mark it as `// requires verification` in code and provide a manual configuration runbook under `docs/manual-config/`.

---

## Naming Conventions

### Tables
- Pattern: `x_783010_tocc_a1_<entity>`
- Examples: `x_783010_tocc_a1_room`, `x_783010_tocc_a1_training_session`

### Fields
- snake_case always
- No entity prefix on field names (table prefix is sufficient)
- Correct: `x_783010_tocc_a1_room.capacity`
- Wrong: `x_783010_tocc_a1_room.room_capacity`

### Fluent Files
- Pattern: `<domain-or-artifact>.now.ts`
- One file per artifact group (e.g. all BRs in `business-rules.now.ts`)
- Script Includes each get their own file for clarity

### Script Includes
- Class name: PascalCase — `RoomService`, `EnrollmentService`
- File name: `<service-name>.now.ts` — `room-service.now.ts`
- Single Responsibility: one service class per domain

### Business Rules
- Label in ServiceNow: `<Action> <Entity>` — e.g. `Validate Room Reservation`
- `$id` key: `x_783010_tocc_a1_br_<action>_<entity>`

### Flows / Subflows
- Flow label: `[TOCC] <Descriptive Name>`
- Subflow label: `[TOCC] SF - <Descriptive Name>`

### Notifications
- Label: `[TOCC] <Event Description>`
- Event name: `x_783010_tocc_a1.<domain>.<action>`

### Scheduled Jobs
- Label: `[TOCC] <Descriptive Name>`
- `$id` key: `x_783010_tocc_a1_sch_<slug>`

### UI Actions
- Label: Human-readable action verb — `Approve Reservation`
- `$id` key: `x_783010_tocc_a1_uia_<action>_<entity>`

---

## Coding Rules

1. **No hardcoded sys_ids.** Use `GlideRecord` queries by field value.
2. **No business logic in Client Scripts.** Client Scripts are UX-only. All critical validation lives server-side (BR + Script Include).
3. **Business Rules are thin routers.** A BR calls a Script Include method. It does not contain inline logic beyond that call and the abort/error handling.
4. **Script Includes are stateless services.** No global mutable state. Each method receives what it needs as parameters.
5. **TrainingConfigService for all thresholds.** Never hardcode values like advance notice hours or cancellation windows. Read them from the config table via `TrainingConfigService`, which caches via `GlideSessionCache`.
6. **Work notes on critical state changes.** Any status transition affecting people (student, instructor) must leave a work note trail.
7. **Server-first validation.** Data Policy + BR = source of truth. UI Policy + Client Script = UX enhancement only.
8. **No logic duplication.** If two BRs need the same check, it belongs in a Script Include.
9. **Comment intent, not mechanics.** Comments explain *why* a decision was made, not *what* the code does.
10. **NotificationHelper for all event dispatch.** Never call `gs.eventQueue` directly from a BR. Route through `NotificationHelper`.
11. **`setWorkflow(false)` on internal updates.** When a Script Include or UI Action updates records internally (e.g. seat sync), use `setWorkflow(false)` to prevent BR re-entrancy unless the workflow trigger is intentional.
12. **Every deliverable has acceptance criteria** in `NOW_CREATE_BACKLOG.md` before implementation starts.

---

## Implementation Status

| Sprint | Focus | Status |
|---|---|---|
| 0 | SDK setup, documentation, CLAUDE.md, PRD, architecture | ✅ Complete |
| 1 | Core tables, roles, ACLs | ✅ Complete |
| 2 | Reservation core logic (BRs + Script Includes) | ✅ Complete |
| 3 | Enrollment core logic (BRs + Script Includes) | ✅ Complete |
| 4 | Scheduled Jobs, Notifications, UI Actions, Client Scripts, UI Policies | ✅ Complete |
| 5 | Record Producers + Portal | 🟡 Record Producers done; Service Portal pending |
| 6 | Cancellation + Confirmation + No-show + Waitlist | ✅ Covered by EnrollmentService + Scheduled Jobs |
| 7 | Knowledge Base + Virtual Agent design | ⬜ Pending |
| 8 | CMDB light + Service Model | ⬜ Pending |
| 9 | Platform Analytics + KPIs | ⬜ Pending |
| 10 | UI Builder / Workspace | ⬜ Pending |
| 11 | ATF + QA + Hardening + Final documentation | 🟡 Smoke tests done; full ATF pending |

---

## Pre-Deploy Checklist

- [ ] All `$id` values registered in `generated/keys.ts`
- [ ] No hardcoded sys_ids in any file
- [ ] `now-sdk build` passes with zero errors
- [ ] All Script Includes have ATF coverage or documented manual test plan
- [ ] All Business Rules tested on dev instance
- [ ] Notifications tested with real email recipients
- [ ] ACLs verified against each persona (Student, Instructor, Backoffice, Manager, Admin)
- [ ] Scheduled Jobs validated on dev instance with manual trigger
- [ ] `now.config.json` scope and instance are correct
- [ ] `DEPLOYMENT_GUIDE.md` checklist completed

---

*Last updated: Sprint 4 complete — Notifications, Scheduled Jobs, UI Actions, Client Scripts, UI Policies, TrainingConfigService cache.*
