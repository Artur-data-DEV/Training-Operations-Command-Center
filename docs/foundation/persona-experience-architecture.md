# Persona Experience Architecture Baseline

Scope: `x_783010_tocc_a1`  
Status: Official baseline for implementation alignment

## Purpose

Define the official TOCC experience architecture by persona so Portal, Workspace, Dashboard, and Virtual Agent are implemented as one product instead of disconnected surfaces.

## Persona to Experience Mapping

| Persona | Primary Experience | Secondary Experience | Must Not Depend On |
|---|---|---|---|
| Student | Service Portal | Virtual Agent, Knowledge Base | Workspace for self-service actions |
| Instructor | Service Portal | Record Producers, Virtual Agent | Workspace for day-to-day own-session flows |
| Backoffice | UI Builder Workspace | Dashboard (read), classic lists/forms | Service Portal for operational queue management |
| Manager | UI Builder Workspace (read) | Dashboard (read), reports | Service Portal as management cockpit |
| App Admin | Workspace + classic lists/forms | Dashboard (owner), configuration records | Portal-only administration |
| System Admin | Instance administration | App support and troubleshooting | App roles as technical admin replacement |

## Official Experience Boundaries

### Service Portal (Student and Instructor)

- Student:
  - Browse available sessions
  - Request enrollment
  - View my enrollments
  - Confirm attendance
  - Cancel enrollment within policy window
- Instructor:
  - Create room reservation (record producer)
  - View my reservations
  - View my sessions
  - View enrolled students for own sessions

### UI Builder Workspace (Backoffice and Manager)

- Backoffice:
  - Pending reservation queue
  - Today sessions
  - Pending enrollments
  - Attendance operations
  - Resource and CMDB hygiene
- Manager:
  - Read operational queues
  - Read KPI highlights
  - Escalate operational decisions

### Platform Analytics

- KPI dashboards for manager, backoffice, and app admin
- Indicators must be backed by real snapshot data, not static demo values

### Virtual Agent

- Channel for assisted self-service and escalation
- Topic orchestration calls backend services only; no duplicated business logic in topic nodes

## Current State vs Target

| Area | Current Baseline in Repo | Target Product State |
|---|---|---|
| Service Portal pages/widgets | Implemented | Keep and harden by persona rules |
| Workspace scaffold and list categories | Implemented | Complete home page and operational cards |
| Dashboard layout and permissions | Implemented scaffold | Wire to production indicators and scheduled snapshots |
| Virtual Agent backend adapter (`VirtualAgentTopicService`) | Implemented | Publish and validate operational topics |
| Persona boundary contract | Implicit | Explicit and enforced by this baseline |

## Non-Negotiable Architecture Rules

1. Portal is self-service entry, not full backoffice system.
2. Workspace is the operational cockpit for queues and exceptions.
3. Dashboard is management telemetry, not manual reporting.
4. Virtual Agent reuses backend services; never duplicates GlideRecord logic per topic node.
5. Access is role-driven and enforced consistently across Portal, Workspace, Dashboard, ACLs, and automation.

## Source Anchors

- `src/fluent/portal/service-portal.now.ts`
- `src/fluent/workspace/backoffice-workspace.now.ts`
- `src/fluent/dashboards/platform-analytics-dashboard.now.ts`
- `docs/manual-config/workspace-composition.md`
- `docs/manual-config/virtual-agent-topic-backend.md`
