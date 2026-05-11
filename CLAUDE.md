# CLAUDE.md — Training Operations Command Center

## Project Identity

| Key | Value |
|---|---|
| Project | Training Operations Command Center |
| App Scope | `x_tocc` |
| App Prefix | `x_tocc` |
| Instance Release | `Australia Patch 1 (build 2026-03-31)` — update before Sprint 1 |
| SDK Strategy | `now-sdk` + Fluent TypeScript (`src/fluent/**/*.now.ts`) |

---

## Documentation Index

| Document | Purpose |
|---|---|
| `PRD.md` | Product Requirements, personas, scope, business rules |
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
    ├── fluent/
    │   ├── app/application.now.ts
    │   ├── tables/
    │   ├── security/
    │   ├── business-rules/
    │   ├── script-includes/
    │   ├── ui-actions/
    │   ├── client-scripts/
    │   ├── ui-policies/
    │   ├── flows/
    │   ├── catalog/
    │   ├── notifications/
    │   ├── scheduled-jobs/
    │   ├── dashboards/
    │   └── atf/
    └── scripts/
        ├── services/
        └── shared/
```

---

## SDK Commands

```bash
# Install dependencies for local build
npm install

# Configure authentication alias
now-sdk auth --add dev372264.service-now.com --type basic --alias dev

# Build / validate Fluent artifacts
now-sdk build

# Install on target instance
now-sdk install --auth dev

# Generate installable package
now-sdk pack

# Check SDK version
now-sdk --version
```

---

## SDK Artifact Strategy

| Artefato | Estratégia |
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
| ATF Test Suites | SDK-first |
| Flows / Subflows | SDK-first (requires verification on target release) |
| Service Catalog / Record Producers | SDK-first (requires verification on target release) |
| Service Portal (pages/widgets) | SDK-assisted; visual config may require instance UI |
| UI Builder / Workspace | SDK-assisted; verify per release |
| Platform Analytics / Dashboards | SDK-first (requires verification on target release) |
| Knowledge Base | SDK-assisted; article content created on instance |
| Virtual Agent | Manual configuration required — see `VIRTUAL_AGENT_DESIGN.md` |
| CMDB Relationships | SDK-assisted; relationship data depends on instance |

> **Rule:** If an artifact's SDK support cannot be confirmed, mark as `requires verification` in code comments and provide a manual configuration runbook in `docs/manual-config/`.

---

## Naming Conventions

### Tables
- Pattern: `x_783010_tocc_a1_<entity>`
- Examples: `x_783010_tocc_a1_room`, `x_783010_tocc_a1_training_session`, `x_783010_tocc_a1_student_enrollment`

### Fields
- snake_case always
- No redundant prefix on field names (table prefix is enough)
- Example: `x_783010_tocc_a1_room.capacity` not `x_783010_tocc_a1_room.room_capacity`

### Fluent Files
- Pattern: `<entity-name>.now.ts`
- One primary artifact per file
- Related supporting definitions can co-locate if small

### Script Includes
- PascalCase class name: `RoomAvailabilityService`
- File: `room-availability-service.now.ts`
- Single Responsibility: one service per class

### Business Rules
- Naming: `BR_<Action>_<Table>` in ServiceNow label
- File: `<action>-<table>.now.ts`

### Flows / Subflows
- Flow label: `[TOCC] <Descriptive Name>`
- Subflow label: `[TOCC] SF - <Descriptive Name>`

### Notifications
- Label: `[TOCC] <Event Description>`

---

## Coding Rules

1. **No hardcoded sys_ids.** Use `GlideRecord` queries by field value or use `GlideSysReference` lookups.
2. **No business logic in Client Scripts.** Client Scripts handle UX only; all validation must have a server-side counterpart.
3. **Business Rules must be thin.** BR calls a Script Include service; it does not contain inline logic beyond routing.
4. **Script Includes are stateless services.** No global mutable state; each method receives what it needs.
5. **TrainingConfigService for all parameters.** Never hardcode thresholds (min advance hours, late cancel window, etc.).
6. **Work notes on critical state changes.** Any status transition that affects people must leave a work note trail.
7. **Validate server-side first, then enhance client-side.** Data Policy + BR = source of truth. UI Policy + CS = UX layer only.
8. **No logic duplication.** If two BRs need the same validation, it lives in a Script Include.
9. **Comment intent, not mechanics.** Code should be readable; comments explain *why*, not *what*.
10. **Every deliverable has acceptance criteria** defined in `NOW_CREATE_BACKLOG.md` before implementation starts.

---

## Pre-Deploy Checklist

- [ ] `Australia Patch 1 (build 2026-03-31)` replaced with actual release
- [ ] No hardcoded sys_ids in any file
- [ ] All Script Includes have ATF coverage or manual test plan
- [ ] All Business Rules have been tested in dev instance
- [ ] All Flows validated end-to-end in dev
- [ ] Notifications tested with real email/user
- [ ] ACLs verified against each persona (Student, Instructor, Backoffice, Manager, Admin)
- [ ] `now.config.json` points to correct scope and instance
- [ ] `DEPLOYMENT_GUIDE.md` checklist completed

---

## Sprint Roadmap

| Sprint | Focus |
|---|---|
| 0 | SDK setup, documentation, CLAUDE.md, PRD, architecture |
| 1 | Core tables, roles, ACLs, User Criteria |
| 2 | Reservation core logic (BRs + Script Includes) |
| 3 | Enrollment core logic (BRs + Script Includes) |
| 4 | Flow Designer + Subflows + Notifications |
| 5 | Catalog + Record Producers + Portal básico |
| 6 | Cancellation + Confirmation + No-show + Waitlist |
| 7 | Knowledge Base + Virtual Agent design |
| 8 | CMDB light + Service Model |
| 9 | Platform Analytics + KPIs |
| 10 | UI Builder / Workspace |
| 11 | ATF + QA + Hardening + Final documentation |

---

*Last updated: Sprint 0 — Documentation baseline*
