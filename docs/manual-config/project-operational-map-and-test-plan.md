# TOCC Operational Map and Test Plan

Use this document to understand the current project shape and to plan business-rule validation before a client presentation or homologation round.

Scope: `x_783010_tocc_a1`  
Branch baseline: `release/v1-platform-closure`

## 1. Architecture Summary

The reliable operational path is:

```text
Instructor reservation -> Backoffice approval -> Training session sync -> Student enrollment -> Attendance/notifications/KPIs
```

The implementation is split as follows:

| Layer | Main files | Purpose |
|---|---|---|
| Data model | `src/fluent/tables/core-tables.now.ts` | Core TOCC tables and fields |
| Business rules | `src/fluent/logic/business-rules.now.ts`, `src/fluent/business-rules/cmdb-resource-validation.now.ts` | Validation, sync, status side effects |
| Script Includes | `src/fluent/logic/*.now.ts` | Main business logic |
| Portal | `src/fluent/portal/*`, `src/fluent/portal/service-portal.now.ts` | Student, instructor and backoffice portal views |
| Catalog | `src/fluent/catalog/*` | Reservation, enrollment and course producers |
| Flows/Subflows | `src/fluent/flows/training-orchestration-flows.now.ts` | Approval/scaffold orchestration |
| Scheduled jobs | `src/fluent/scheduled-jobs/scheduled-jobs.now.ts` | Operational automation |
| Properties | `src/fluent/app/training-config-properties.now.ts` | Runtime override configuration |
| Seed config | `src/fluent/data/training-config-seed.now.ts` | Default config values and sample locations/rooms |
| Fix scripts | `src/fluent/data/platform-hotfixes.now.ts` | Instance repair/sanitization |
| ATF tests | `src/fluent/atf/*`, `src/fluent/tests/atf-smoke.now.ts` | Automated coverage |

## 2. Field Model

The current runtime model uses the `tocc_*` fields for business references.

| Concept | Current field | Legacy/avoid where possible |
|---|---|---|
| Reservation course | `x_783010_tocc_a1_room_reservation.tocc_course` | `course` |
| Reservation room | `x_783010_tocc_a1_room_reservation.tocc_room` | `room` |
| Reservation instructor | `x_783010_tocc_a1_room_reservation.tocc_instructor` | `instructor` |
| Training session course | `x_783010_tocc_a1_training_session.tocc_course` | `course` |
| Training session instructor | `x_783010_tocc_a1_training_session.tocc_instructor` | `instructor` |
| Training session reservation | `x_783010_tocc_a1_training_session.tocc_reservation` | `reservation` |
| Enrollment student | `x_783010_tocc_a1_student_enrollment.tocc_student` | `student` |
| Enrollment session | `x_783010_tocc_a1_student_enrollment.tocc_training_session` | `training_session` |

Important:
- Portal, services, scheduled jobs and hardened flows should use `tocc_*`.
- Some legacy fields still exist for compatibility and migration. Treat them as not authoritative.
- The platform hotfix copies legacy values into `tocc_*` when possible and removes legacy fields from generated forms/lists.

## 3. Properties and Config Resolution

Runtime policy reads go through `TrainingConfigService`.

Resolution order:

```text
sys_property x_783010_tocc_a1.config.<name> when non-empty
-> x_783010_tocc_a1_training_config active row
-> hardcoded default in TrainingConfigService getter
```

### Configuration Properties

| Property | Default seed | Used by | Business meaning |
|---|---:|---|---|
| `x_783010_tocc_a1.config.minimum_advance_notice_hours` | `48` | `RoomService`, `TrainingSessionService` | Minimum time before start for reservations/sessions |
| `x_783010_tocc_a1.config.minimum_reservation_duration_minutes` | `60` | `RoomService` | Minimum allowed reservation duration |
| `x_783010_tocc_a1.config.late_cancellation_window_hours` | `4` | `EnrollmentService`, portal cancellation checks | Student cancellation lock window |
| `x_783010_tocc_a1.config.waitlist_mode` | `waitlist` | `EnrollmentService` | `waitlist` or `block` when no seats remain |
| `x_783010_tocc_a1.config.enrollment_approval_mode` | `direct` | `EnrollmentService` | `direct` or `instructor_approval` |
| `x_783010_tocc_a1.config.confirmation_lead_hours` | `24` | `TrainingSessionService` | Confirmation deadline calculation |
| `x_783010_tocc_a1.config.reminder_lead_hours` | `24` | `[TOCC] Send Session Reminders` | Reminder send window |
| `x_783010_tocc_a1.config.feedback_window_hours` | `48` | `TrainingConfigService`, notification/VA policy payloads | Feedback policy window |
| `x_783010_tocc_a1.config.stale_approval_hours` | `48` | `[TOCC] Detect Stale Pending Approvals` | Pending approval alert threshold |

### Portal and Support Properties

| Property | Default | Used by |
|---|---|---|
| `x_783010_tocc_a1.portal.support_page` | `?id=tocc_help` | Portal/VA support links |
| `x_783010_tocc_a1.portal.kb_url` | `?id=kb_home` | Help Center/VA |
| `x_783010_tocc_a1.backoffice.email` | `training-backoffice@example.com` | Help Center/VA escalation |
| `x_783010_tocc_a1.portal.va_url` | `/$sn-va-web-client-app.do` | Help Center |
| `x_783010_tocc_a1.portal.support_catalog_url` | `?id=tocc_sessions` | Help Center quick action |

## 4. Main Services

| Service | File | What to validate |
|---|---|---|
| `TrainingConfigService` | `src/fluent/logic/training-config-service.now.ts` | Property override, table fallback, typed getters |
| `RoomService` | `src/fluent/logic/room-service.now.ts` | Room conflict, capacity, advance notice, minimum duration |
| `TrainingSessionService` | `src/fluent/logic/training-session-service.now.ts` | Reservation approval creates/updates session, deadlines, repair missing room |
| `EnrollmentService` | `src/fluent/logic/enrollment-service.now.ts` | Direct approval, instructor approval pending state, duplicate block, waitlist/block, seat sync, late cancellation |
| `PortalApiService` | `src/fluent/logic/portal-api-service.now.ts` | Public sessions, my enrollments, my reservations, backoffice queue, data quality, role checks |
| `NotificationHelper` | `src/fluent/logic/notification-helper.now.ts` | Event queue mappings for reservation/enrollment/session reminders |
| `TrainingKpiService` | `src/fluent/logic/training-kpi-service.now.ts` | Daily KPI snapshot generation and idempotency |
| `CmdbBootstrapService` | `src/fluent/logic/cmdb-bootstrap-service.now.ts` | CI/resource sample bootstrap |
| `CmdbResourceService` | `src/fluent/logic/cmdb-resource-service.now.ts` | Resource CI validation/enrichment |
| `VirtualAgentTopicService` | `src/fluent/logic/virtual-agent-topic-service.now.ts` | VA menu, policies, escalation, user actions |

## 5. Business Rules

Map: `src/fluent/business-rules/business-rules-map.md`

| Domain | Rule intent | Main dependency |
|---|---|---|
| Reservation | Validate reservation fields, capacity, conflicts and timing | `RoomService` |
| Reservation -> Session | Sync Training Session after reservation approval/cancellation | `TrainingSessionService` |
| Enrollment | Validate duplicate/session status/seats/config | `EnrollmentService` |
| Enrollment -> Seats | Sync seats and promote waitlist after changes | `EnrollmentService` |
| Attendance | Block invalid attendance marking and stamp metadata | Attendance BRs |
| CMDB resources | Block invalid CI reference and enrich resource data | `CmdbResourceService` |

## 6. Flows and Subflows

Map: `src/fluent/flows/flow-orchestration-map.md`

| Flow/Subflow | Current role | Validation expectation |
|---|---|---|
| `[TOCC][FLOW] Reservation Approval` | Backoffice approval orchestration | Creates approval path and applies decision |
| `[TOCC][FLOW] Enrollment Approval` | Handles enrollments that remain `pending` after `EnrollmentService` config evaluation | Uses `tocc_training_session` and `tocc_instructor` |
| `[TOCC][FLOW] Session Cancelled` | Cancellation scaffold and enrollment lookup | Uses `tocc_training_session` |
| `[TOCC][FLOW] Attendance Confirmation Cadence` | Scaffold/log-only cadence | Do not treat as notification source of truth |
| `[TOCC][FLOW] Session Reminder Cadence` | Scaffold/log-only cadence | Do not treat as notification source of truth |
| `[TOCC][SF] Reservation Approval Routing` | Reusable approval-routing unit for submitted reservations | Present, active, finds Backoffice group, assigns reservation, requests approval and applies decision |

Log-only subflows were removed. Session cancellation currently keeps the lookup/log path inside the flow until there is a real reusable notification action to encapsulate.

Important:
- The reliable notification path is scheduled jobs plus `NotificationHelper`.
- Flow Designer is useful for approval/scaffold visibility, but business rules and services own core policy.

## 7. Scheduled Jobs

File: `src/fluent/scheduled-jobs/scheduled-jobs.now.ts`

| Job | Frequency | Main behavior | Config used |
|---|---|---|---|
| `[TOCC] Send Session Reminders` | Hourly | Finds open/full sessions in reminder window and calls `NotificationHelper.sendSessionReminders()` | `reminder_lead_hours` |
| `[TOCC] Release Unconfirmed Seats` | Hourly | Cancels approved, unconfirmed enrollments after confirmation deadline | deadline from `TrainingSessionService` |
| `[TOCC] Close Past Training Sessions` | Daily 02:00 | Marks past open/full/in-progress sessions completed and sends feedback requests | feedback policy indirectly |
| `[TOCC] Detect Stale Pending Approvals` | Daily 06:00 | Adds work notes on stale submitted reservations/pending enrollments | `stale_approval_hours` |
| `[TOCC] Collect KPI Snapshots` | Daily 01:15 | Runs `TrainingKpiService.collectDailySnapshot(30)` | KPI service rules |
| `[TOCC] Repair Sessions Missing Room` | Daily 01:40 | Calls `TrainingSessionService.repairMissingRooms(500)` | Session repair logic |

## 8. Platform Fix Script

File: `src/fluent/data/platform-hotfixes.now.ts`  
Record: `[TOCC] Cleanup legacy default_view and backoffice role mapping`

This fix script is intentionally broad and should be treated as an instance stabilization/repair tool.

It handles:
- hiding/removing legacy `default_view` artifacts;
- normalizing room reservation form sections;
- ensuring `[TOCC] Backoffice` group and `tocc.backoffice` user role/membership;
- granting workspace-related roles where needed;
- creating/patching workspace route ACLs;
- enabling `ws_access` for scoped tables;
- remapping Backoffice module to `/tocc?id=tocc_backoffice_queue`;
- linking demo resources to rooms and CIs;
- patching demo sessions with course/room/instructor;
- migrating legacy fields into `tocc_*`;
- removing legacy operational fields from forms/lists;
- enforcing UI Action button flags for approve/reject.

Use it when the instance is visibly out of sync after deploy or generated metadata changed platform layout unexpectedly. Do not treat it as normal business logic.

## 9. ATF Coverage Map

Primary test docs: `TEST_STRATEGY.md`  
ATF source: `src/fluent/atf/*`, `src/fluent/tests/atf-smoke.now.ts`

| Area | Tests |
|---|---|
| Basic smoke | Room CRUD, student cannot create course, instructor can create reservation |
| Config | Seed default, property override, empty property fallback, number/boolean parsing, advance notice getter |
| Room service | Conflict/no conflict, ignore cancelled, advance notice, capacity |
| Enrollment | Duplicate block, cancelled session block, waitlist mode, block mode, seat decrement/increment, waitlist promotion, late cancellation |
| Training session | Session created on approval, cancelled on reservation cancellation, full status when seats reach zero |
| Notification/Portal | Reservation events, enrollment events, available sessions, own enrollments, confirmation/cancellation guards, operations snapshot |
| Attendance | Mark present, block before session starts, mark absent clears timestamp |
| CMDB | Bootstrap, idempotency, invalid CI block, resource enrichment |
| KPI | 16 daily KPI rows, idempotency, latest snapshot contract |
| Flow | Flow records present, subflows present, namespace count |
| Dashboard/Workspace | Dashboard scaffold, workspace scaffold, list scaffold |
| KB/VA | KB bootstrap, VA menu, escalation properties, policy payload, confirmation/actionable enrollments |
| Closure | Runtime field validity, approval creates one linked session, student enrollment reserves seat and blocks duplicate |

## 10. Business Validation Checklist

Use this as your manual homologation list. Mark each item as Pass/Fail with record numbers and screenshots.

### A. Configuration

| Test | Steps | Expected |
|---|---|---|
| Property override works | Set `minimum_advance_notice_hours=72`; call `TrainingConfigService.getMinimumAdvanceNoticeHours()` | Returns `72` |
| Table fallback works | Clear property; ensure table value is `48`; call getter | Returns `48` |
| Enrollment direct mode | Set `enrollment_approval_mode=direct`; create enrollment | Enrollment becomes `approved` |
| Instructor approval mode | Set `enrollment_approval_mode=instructor_approval`; create enrollment | Enrollment remains `pending` and approval flow can route to instructor |
| Waitlist mode | Set `waitlist_mode=waitlist`; enroll into full session | Enrollment becomes `waitlisted` |
| Block mode | Set `waitlist_mode=block`; enroll into full session | Enrollment is blocked/rejected with clear error |

### B. Instructor Reservation

| Test | Steps | Expected |
|---|---|---|
| Create valid reservation | Instructor uses catalog/portal with course, room, dates, participants | Reservation `submitted`, assigned/routable to backoffice |
| Capacity validation | Participants greater than room capacity | Save/submit blocked |
| Minimum duration | End time before configured minimum duration | Save/submit blocked |
| Advance notice | Start inside minimum advance notice window | Save/submit blocked |
| Conflict validation | Same room overlapping approved/submitted reservation | Conflict blocked |

### C. Backoffice Queue

| Test | Steps | Expected |
|---|---|---|
| Backoffice sees queue | Login/impersonate backoffice and open `/tocc?id=tocc_backoffice_queue` | Submitted reservations listed |
| Manager view only | Login/impersonate manager | Can view queue, cannot approve/reject |
| Invalid data quality | Create/locate incomplete reservation | Shows `Needs review`; approve disabled |
| Approve valid reservation | Backoffice approves clean reservation | Status `approved`; `training_session` populated |
| Reject reservation | Backoffice rejects submitted reservation | Status `rejected`; work notes updated |

### D. Training Session Publication

| Test | Steps | Expected |
|---|---|---|
| Session created from approval | Approve clean reservation | Exactly one linked Training Session |
| Student portal filters invalid sessions | Create/open session missing course/room/instructor or inactive room | Not listed in `/tocc?id=tocc_sessions` |
| Full status | Fill all seats | Session status `full`; still visible as full |
| Cancel reservation | Cancel approved reservation | Linked session cancelled |

### E. Student Enrollment

| Test | Steps | Expected |
|---|---|---|
| Student sees public sessions | Student opens `/tocc?id=tocc_sessions` | Only valid future open/full sessions |
| Enroll once | Student enrolls in open session | Enrollment created and seat count updated according to mode |
| Duplicate enrollment | Same student enrolls again | Blocked |
| Own enrollment visibility | Student opens my enrollments | Only own enrollments returned |
| Confirm attendance | Student confirms before deadline | `confirmed=true` |
| Confirm after deadline | Try after confirmation deadline | Blocked |
| Cancel outside late window | Cancel approved enrollment early | Cancelled and seat released |
| Cancel inside late window | Cancel near start | Blocked for student; backoffice/admin can override if supported by path |

### F. Scheduled Jobs and Notifications

| Test | Steps | Expected |
|---|---|---|
| Reminder job active | Run scheduled jobs health check | All jobs found/active |
| Session reminder | Create approved enrollment in reminder window; run job | Reminder event/email queued |
| Release unconfirmed seats | Approved unconfirmed enrollment past deadline; run job | Enrollment cancelled; seats recalculated |
| Close past sessions | Past open/full/in-progress session; run job | Session completed; feedback request queued |
| Stale approvals | Old submitted/pending record; run job | Work note alert added |
| KPI snapshot | Run KPI collector | 16 KPI rows, no duplicate groups |
| Repair missing room | Session with reservation but missing room; run job | Room restored from reservation |

### G. CMDB and Resources

| Test | Steps | Expected |
|---|---|---|
| Active resources linked | Query active room resources | Every active resource has room and CI |
| Invalid CI blocked | Save resource with bad CI reference | Blocked |
| Bootstrap idempotent | Run CMDB bootstrap twice for same room | No duplicate CIs/resources |

### H. Flow/Subflow

| Test | Steps | Expected |
|---|---|---|
| Flow records exist | Run flow active smoke | Expected flows and the reusable reservation approval subflow found |
| Enrollment flow field model | Inspect flow source/runtime | Uses `tocc_training_session` and `tocc_instructor` |
| Session cancelled lookup | Cancel session with approved enrollments | Flow lookup uses `tocc_training_session`; no legacy field dependency |
| Cadence flows expectation | Review logs | Logs/scaffold only; notification source remains scheduled jobs |

## 11. Recommended Test Order

1. Run `npm run check:sdk` and `npm run build`.
2. Run Platform Validation Scripts sections 6, 8, 9 and 10.
3. Validate properties and config modes.
4. Validate instructor reservation creation.
5. Validate backoffice approval/rejection.
6. Validate session publication in student portal.
7. Validate student enrollment and seat sync.
8. Validate scheduled jobs and notification events.
9. Validate CMDB resources and CIs.
10. Run ATF suite or selected ATF tests for the touched area.

## 12. Open Risks to Watch During Homologation

| Risk | How to detect | Likely fix area |
|---|---|---|
| Old dirty data appears in portal | Blank display values, invalid references, missing room/course | Fix script/data cleanup |
| Approval does not create session | Reservation approved but `training_session` empty | Business Rule / `TrainingSessionService` |
| Student enrollment error is huge/unclear | Portal shows server script error | `PortalApiService`, `EnrollmentService`, BR validation |
| Manager can approve | Manager sees active approve/reject buttons | `PortalApiService` queue permissions |
| Flow does not find enrollments | Session cancellation/reminder logs show zero despite records | Flow field query, `tocc_training_session` |
| Scheduled job does not send notifications | No events/emails after job | `NotificationHelper`, event registration, email notifications |
| Property override ignored | Getter returns table value despite property | `TrainingConfigService`, property name/value |
| ATF failures from schema drift | Field not found or invalid query | ATF fixture fields vs current `tocc_*` model |
