# ARCHITECTURE.md — Training Operations Command Center

> **Version:** 1.0 — Sprint 0 Baseline
> **App Scope:** `x_tocc`

---

## 1. Architecture Overview

The Training Operations Command Center is a **ServiceNow Scoped Application** built following platform-native patterns. It uses the ServiceNow SDK/Fluent (`now-sdk`) as the primary development and deployment vehicle, with manual configuration runbooks for artifacts not yet fully supported by the SDK on the target release.

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER-FACING LAYER                            │
│                                                                 │
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │
│  │    Service Portal        │   │  UI Builder / Workspace     │ │
│  │  (Student / Instructor)  │   │  (Backoffice / Manager)     │ │
│  └────────────┬────────────┘   └──────────────┬──────────────┘ │
└───────────────┼──────────────────────────────┼─────────────────┘
                │                              │
┌───────────────▼──────────────────────────────▼─────────────────┐
│                    CATALOG & SELF-SERVICE LAYER                 │
│                                                                 │
│  Record Producers      Catalog Items        Knowledge Base      │
│  ─────────────────     ─────────────        ─────────────────── │
│  Create Reservation    Resource Request     Training KB         │
│  Request Enrollment    Room Issue Report    FAQ Articles        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    AUTOMATION & FLOW LAYER                      │
│                                                                 │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Flow Designer   │  │  Scheduled Jobs│  │  Notifications │  │
│  │  ─────────────── │  │  ─────────────  │  │  ──────────── │  │
│  │  Reservation     │  │  Reminders 24h  │  │  Email/Push   │  │
│  │  Enrollment      │  │  Release Seats  │  │  Templates    │  │
│  │  Cancellation    │  │  Close Sessions │  │               │  │
│  │  Waitlist        │  │  Stale Approvals│  │               │  │
│  │  Feedback        │  └────────────────┘  └────────────────┘  │
│  └──────────────────┘                                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    CORE BUSINESS LOGIC LAYER                    │
│                                                                 │
│  Business Rules                Script Includes                  │
│  ──────────────                ──────────────────               │
│  BR_ValidateRoomReservation    RoomAvailabilityService          │
│  BR_SyncTrainingSession        ReservationValidationService     │
│  BR_CancelTrainingSession      TrainingSessionService           │
│  BR_ValidateEnrollment         EnrollmentService                │
│  BR_UpdateAvailableSeats       NotificationHelper               │
│  BR_PreventLateCancellation    TrainingConfigService            │
│  BR_GenerateAttendance                                          │
│  BR_UpdateSessionStatusFull    UI Actions / UI Policies         │
│                                Client Scripts (UX only)         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    DATA LAYER                                   │
│                                                                 │
│  x_783010_tocc_a1_room                   x_783010_tocc_a1_room_resource             │
│  x_783010_tocc_a1_room_reservation       x_783010_tocc_a1_reservation_resource      │
│  x_783010_tocc_a1_training_session       x_783010_tocc_a1_attendance                │
│  x_783010_tocc_a1_student                x_783010_tocc_a1_training_feedback         │
│  x_783010_tocc_a1_student_enrollment     x_783010_tocc_a1_training_config           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    INTELLIGENCE & ANALYTICS LAYER               │
│                                                                 │
│  Virtual Agent              Platform Analytics                  │
│  ─────────────              ───────────────────                 │
│  5+ Topics                  Training Ops Dashboard              │
│  NLU Intents                16 KPIs                             │
│  KB Integration             Indicators + Breakdowns             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Scoped Application Design

### Application Identity

```
Name:        Training Operations Command Center
Scope:       x_tocc
Prefix:      x_tocc
Version:     1.0.0
Vendor:      [Your Organization]
```

### Scope Isolation Principles

- All custom tables are prefixed `x_783010_tocc_a1_`
- All Script Includes are scoped; no cross-scope calls without explicit API exposure
- ACLs are defined within the scoped app; no reliance on global ACLs
- `TrainingConfigService` is the single gateway to configuration parameters; no hardcoded thresholds in logic (sys_properties override + training_config fallback).
- Script Includes do not access tables outside the scope unless referencing standard platform tables (`sys_user`, `cmn_location`, `cmdb_ci`)

---

## 3. Layered Architecture Principles

### 3.1 Presentation Layer (Client Scripts, UI Policies)
- UX enhancement only
- Must never be the sole validation for a business rule
- Client Scripts: auto-populate fields, calculate durations, show/hide sections
- UI Policies: enforce field visibility and mandatory states reactively

### 3.2 API / Catalog Layer (Record Producers, Catalog Items)
- Entry points for self-service requests
- Variables map to table fields
- Execution of catalog items triggers Flows or creates records directly

### 3.3 Automation Layer (Flows, Subflows, Scheduled Jobs)
- Orchestration, approval routing, notification dispatch
- Flows compose Subflows for reusability
- Scheduled Jobs handle temporal logic (reminders, closures, seat release)
- No business validation in Flows — delegated to Script Includes via Action steps

### 3.4 Business Logic Layer (Business Rules, Script Includes)
- Business Rules are thin routers: they call Script Include methods
- Script Includes hold all domain logic
- One Script Include per service domain (single responsibility)
- All services read configuration from `TrainingConfigService` (property override first, table fallback second).

### 3.5 Data Layer (Tables, Fields, Data Policies)
- Tables represent domain entities with clear ownership
- Data Policies enforce mandatory fields at the platform level
- No denormalized fields; relationships use reference fields
- `number` field auto-generated via platform number mechanism on key tables

---

## 4. Key Design Decisions

### Decision 1: Business Rules call Script Includes (not inline logic)
**Rationale:** Enables unit testing via ATF, prevents logic duplication, keeps BRs readable and short.

### Decision 2: TrainingConfigService as single config gateway
**Rationale:** All operational thresholds remain centrally governed by `TrainingConfigService` with `sys_properties` override support and `x_783010_tocc_a1_training_config` fallback. Zero hardcoded values in logic.

### Decision 3: Subflows for reusable orchestration units
**Rationale:** `Promote Waitlisted Student` and `Send Training Notification` are called from multiple parent flows. Subflow encapsulation prevents duplication in Flow Designer.

### Decision 4: Service Portal first, UI Builder second
**Rationale:** Service Portal has broader SDK support and production maturity. UI Builder Workspace targets backoffice and manager experience in later sprint.

### Decision 5: CMDB is purposefully minimal
**Rationale:** Over-engineering CMDB creates maintenance overhead without operational value. Only room-level CIs (projector, AV, computer) are tracked. Rooms are represented as custom table records, not full CMDB CIs, to avoid CSDM complexity beyond project scope.

---

## 5. Integration Points

| Integration | Type | Direction | Notes |
|---|---|---|---|
| `sys_user` | Platform table | Read | Student, Instructor user references |
| `cmn_location` | Platform table | Read | Room location references |
| `sys_user_group` | Platform table | Read | Approval group references |
| `cmdb_ci` | Platform table | Read/Write | Room resource CI references |
| `sc_request` / `sc_req_item` | Platform table | Write | Catalog item submissions |
| Email notifications | Platform service | Write | Outbound notifications only |
| Virtual Agent | Platform service | Read/Write | VA topics call Subflows and query tables |
| Platform Analytics | Platform service | Read | Reads scoped app tables for KPIs |

---

## 6. Security Architecture Summary

> Full detail in `SECURITY_MODEL.md`

| Role | Prefix | Purpose |
|---|---|---|
| `x_783010_tocc_a1_student` | `x_tocc` | Student self-service access |
| `x_783010_tocc_a1_instructor` | `x_tocc` | Instructor session management |
| `x_783010_tocc_a1_backoffice` | `x_tocc` | Operations and approvals |
| `x_783010_tocc_a1_manager` | `x_tocc` | Read-only KPI and reporting |
| `x_783010_tocc_a1_admin` | `x_tocc` | Full administrative access |

ACLs are defined per table/operation combination. No role inherits from another automatically — role assignments are explicit.

---

## 7. Deployment Architecture

```
Developer Machine
    │
    ├── now-sdk (SDK)
    │       │
    │       ├── now-sdk build          → validates Fluent artifacts
    │       ├── now-sdk install --auth dev → pushes to instance
    │       └── ATF Suite on instance  → runs tests
    │
    └── ServiceNow PDI Instance
            │
            ├── Scoped App: x_tocc
            ├── Update Set (export for transfer)
            └── ATF Suite: x_783010_tocc_a1_tests
```

---

## 8. Release-Dependent Features

The following features require validation against the actual instance release (`Australia Patch 1 (build 2026-03-31)`):

| Feature | Dependency | Action Required |
|---|---|---|
| Flow Designer SDK support | Xanadu+ preferred | Verify `now-sdk` support on target release |
| UI Builder Workspace components | Yokohama/Xanadu | Verify workspace page creation via SDK |
| Platform Analytics API | All recent releases | Verify indicator creation via Fluent |
| Virtual Agent topic export | All releases | Manual only; export/import via instance |
| Record Producer Fluent API | Requires verification | Check SDK docs for `catalog_item` type |

---

*Last updated: Sprint 0 — Documentation baseline*

