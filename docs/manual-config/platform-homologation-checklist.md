# Platform Homologation Checklist (US-33 to US-38)

Objective: execute and evidence the manual closure for Virtual Agent, Platform Analytics, CMDB Light and Workspace before go-live.

References:
- `docs/manual-config/platform-alignment-runbook.md`
- `docs/backlog/platform-finalization-user-stories.md`

## 1) Execution Header

- Instance: `dev372264.service-now.com`
- Scope: `x_783010_tocc_a1`
- Branch: `release/v1-platform-closure`
- Executed by:
- Date/time start:
- Date/time end:

## 2) Mandatory Pre-check

Mark each item and attach evidence (print + sys_id/log):

- [ ] Build/deploy validated (`npm run build`, `now-sdk install --auth dev`)
- [ ] Scheduled Jobs active:
  - [ ] `[TOCC] Collect KPI Snapshots`
  - [ ] `[TOCC] Send Session Reminders`
  - [ ] `[TOCC] Release Unconfirmed Seats`
  - [ ] `[TOCC] Close Past Training Sessions`
  - [ ] `[TOCC] Detect Stale Pending Approvals`
- [ ] Flow Designer active flows (minimum 5)
- [ ] Event Registry complete (12 events `x_783010_tocc_a1.*`)
- [ ] Approval group exists: `[TOCC] Backoffice`

Evidence:
- Link/attachments:
- Notes:

## 3) Story-by-Story Homologation

### [US-33] KB publish
- [ ] `KnowledgeBaseBootstrapService.bootstrap()` returned `success=true`
- [ ] 13 articles visible by correct User Criteria
- [ ] Portal Help Center returns valid `kb_url`
- [ ] VA policies topic links to KB and escalation

Evidence:
- Background script log:
- Article sample sys_ids:
- Portal print:

### [US-34] VA topics (6)
- [ ] 6 topics published in Web channel
- [ ] Topics call `VirtualAgentTopicService` only (no direct GlideRecord nodes)
- [ ] Confirm/cancel supports `number` and `sys_id`
- [ ] Error path returns controlled message + escalation option

Evidence:
- Topic sys_ids:
- Conversation test transcript:
- Negative test transcript:

### [US-35] Analytics wiring
- [ ] `TrainingKpiService.collectDailySnapshot(30)` writes 16 KPI rows/day
- [ ] Dashboard widgets bound to expected KPI keys
- [ ] Widget values match snapshot table checks
- [ ] Manager/Backoffice read access valid; Student blocked

Evidence:
- Snapshot query print:
- Dashboard print:
- ACL test notes:

### [US-36] CMDB links
- [ ] BR `Validate Room Resource CI Reference` active
- [ ] Invalid/retired CI blocked on save
- [ ] Enrichment fills `resource_name` and `resource_type`
- [ ] `Resources Missing CI Link` list reflects true backlog

Evidence:
- BR sys_id:
- Validation logs:
- Workspace list print:

### [US-37] Workspace composition
- [ ] Workspace shows 5 categories and 10 lists
- [ ] Key filters match spec (`statusINopen,full`, etc.)
- [ ] KPI tiles consume `PortalApiService.getOperationsSnapshot()`
- [ ] Highlights block shows 4 KPI metrics

Evidence:
- Workspace print:
- Component config print:
- Snapshot payload print:

### [US-38] Integrated go/no-go
- [ ] End-to-end runbook executed with evidence per module
- [ ] Core ATF suite executed without blocker failures
- [ ] Residual risks documented with owner/date

Evidence:
- ATF run link:
- Risk register note:

## 4) Persona Smoke Matrix

- [ ] Student: browse sessions, enroll, confirm attendance, VA self-service
- [ ] Instructor: reservation, own sessions, attendance marking
- [ ] Backoffice: approvals, operational lists, conflict handling
- [ ] Manager: dashboard + workspace read-only
- [ ] Admin: config + CMDB maintenance

Evidence:
- Test accounts:
- Smoke outcome:

## 5) Release Decision

- Go/No-Go: 
- Approved by:
- Date:
- Blocking items (if No-Go):

## 6) Post-Go-Live 24h Monitoring

- [ ] Scheduler jobs execution confirmed
- [ ] Error log check (`syslog` level error)
- [ ] KPI snapshot generated for next day
- [ ] VA conversations without critical failures
