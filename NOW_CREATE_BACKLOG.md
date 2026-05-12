# NOW_CREATE_BACKLOG.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 4 Complete
> **Methodology:** Now Create (Initiate → Plan → Execute → Deliver → Close)
> **Format:** Epic → User Story → Acceptance Criteria → Priority → Status

---

## Epic 1 — Room Management

### US-01 Maintain Room Catalog
**As** Admin, **I want** to create and manage room records so that instructors can book them.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 1)
**Components:** `x_783010_tocc_a1_room` table, Admin ACL
**Acceptance Criteria:**
- Admin can create, read, update, deactivate rooms
- Room has name, code, location, capacity, type, status, active flag
- Inactive rooms do not appear in reservation form dropdowns

### US-02 Manage Room Resources
**As** Admin/Backoffice, **I want** to associate physical resources with rooms.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 1)
**Components:** `x_783010_tocc_a1_room_resource` table
**Acceptance Criteria:**
- Resource has name, type, room reference, optional CI link, status
- Resources visible to Instructors when creating reservations

---

## Epic 2 — Room Reservation

### US-03 Submit Room Reservation
**As** Instructor, **I want** to request a room for a training session via the catalog.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 2 + 5)
**Components:** Record Producer, BR `ValidateRoomReservation`, `RoomService`
**Acceptance Criteria:**
- Instructor can submit reservation with course, room, dates, expected participants
- System blocks conflicts, past dates, short-notice, over-capacity at submission
- Confirmation notification sent on submission
- Reservation number auto-generated (RR prefix)

### US-04 Approve / Reject Reservation
**As** Backoffice, **I want** to approve or reject reservation requests.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Components:** UI Actions `Approve Reservation`, `Reject Reservation`, `NotificationHelper`
**Acceptance Criteria:**
- Backoffice sees all submitted reservations
- Approve action creates Training Session automatically
- Reject action notifies Instructor with work note
- Both transitions logged as work notes

### US-05 Cancel Reservation
**As** Instructor or Backoffice, **I want** to cancel a reservation and cascade to the session.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Components:** UI Action `Cancel Reservation`, BR `CancelTrainingSession`, `TrainingSessionService`
**Acceptance Criteria:**
- Cancellation updates linked Training Session to cancelled
- All enrolled students notified of session cancellation
- Work note logged on both records

### US-06 Request Extra Room Resources
**As** Instructor, **I want** to request specific resources (projector, AV) with my reservation.
**Priority:** Should Have | **Status:** ✅ Done (Sprint 2)
**Components:** `x_783010_tocc_a1_reservation_resource` table, catalog variables
**Acceptance Criteria:**
- Instructor can add resource requests to a reservation
- Backoffice confirms or denies resource availability

---

## Epic 3 — Training Session Lifecycle

### US-07 Auto-Create Session from Reservation
**As** the system, **I want** to create a Training Session when a reservation is approved.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 2)
**Components:** BR `SyncTrainingSession`, `TrainingSessionService.syncFromReservation()`
**Acceptance Criteria:**
- Session created with matching room, instructor, dates, capacity from reservation
- Session number auto-generated (TS prefix)
- Session status = open, available_seats = total_seats

### US-08 Track Session Status Lifecycle
**As** Backoffice/Instructor, **I want** the session status to reflect real enrollment state.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 3)
**Components:** BR `UpdateSessionStatusWhenFull`, `EnrollmentService`
**Acceptance Criteria:**
- Status transitions: draft → open → full → in_progress → completed / cancelled
- Status updates to `full` when available_seats = 0
- Status reverts to `open` when seats become available again

### US-09 Auto-Close Past Sessions
**As** the system, **I want** past sessions closed automatically each night.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Components:** Scheduled Job `[TOCC] Close Past Training Sessions`
**Acceptance Criteria:**
- Sessions with end_datetime in the past and status open/full/in_progress are set to completed
- Feedback request notification sent to all enrolled students
- Work note appended to each closed session

### US-10 Start Session Manually
**As** Instructor, **I want** to mark a session as In Progress and generate attendance records.
**Priority:** Should Have | **Status:** ✅ Done (Sprint 4)
**Components:** UI Action `Start Session`
**Acceptance Criteria:**
- UI Action visible for open and full sessions only
- Status set to in_progress
- Attendance records auto-generated for all approved enrollments
- Work note logged

---

## Epic 4 — Student Enrollment

### US-11 Enroll in Training Session
**As** Student, **I want** to enroll in an available session via the portal or catalog.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 3 + 5)
**Components:** Record Producer, BR `ValidateEnrollment`, `EnrollmentService`
**Acceptance Criteria:**
- Student can enroll in open/full sessions with available seats
- Duplicate enrollment blocked
- Cancelled/closed sessions block new enrollments
- Enrollment number auto-generated (EN prefix)
- Notification sent on enrollment status change

### US-12 Handle Full Session — Waitlist
**As** Student, **I want** to be placed on a waitlist when a session is full.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 3)
**Components:** `EnrollmentService`, `TrainingConfigService.getWaitlistMode()`
**Acceptance Criteria:**
- When mode = `waitlist`: enrollment created with status = waitlisted and position assigned
- When mode = `block`: enrollment blocked with clear error message
- Waitlist position is sequential and maintained on cancellations

### US-13 Approve Enrollment (Instructor-Gated)
**As** Instructor, **I want** to approve or reject student enrollments when required.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Components:** UI Actions `Approve Enrollment`, `Reject Enrollment`
**Acceptance Criteria:**
- Visible only when enrollment_approval_mode = instructor_approval
- Approval decrements available_seats and notifies student
- Rejection notifies student with work note

### US-14 Cancel Enrollment
**As** Student, **I want** to cancel my enrollment when I can no longer attend.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 3 + 4)
**Components:** `EnrollmentService`, BR `PreventLateCancellation`, UI Action
**Acceptance Criteria:**
- Student can cancel from My Enrollments page
- Late cancellation (within configured window) is blocked for Students
- Backoffice can override late cancellation
- Cancellation frees seat and triggers waitlist promotion
- Student notified on cancellation

### US-15 Waitlist Promotion
**As** Student, **I want** to be automatically promoted when a seat becomes available.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 3)
**Components:** `EnrollmentService._promoteWaitlistedEnrollments()`
**Acceptance Criteria:**
- Next waitlisted student (by position) promoted to approved on seat release
- Available seats decremented after promotion
- Promotion notification sent immediately

---

## Epic 5 — Attendance & Confirmation

### US-16 Request Attendance Confirmation
**As** the system, **I want** to ask enrolled students to confirm attendance before the session.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Components:** Scheduled Job `Release Unconfirmed Seats`, `NotificationHelper.sendConfirmationRequests()`
**Acceptance Criteria:**
- Confirmation request sent to all approved unconfirmed students
- Deadline configurable via TrainingConfigService
- Students can confirm via portal or VA

### US-17 Confirm Attendance
**As** Student, **I want** to confirm I will attend my approved session.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4 + 5)
**Components:** UI Action `Confirm Attendance`, `PortalApiService.confirmMyAttendance()`
**Acceptance Criteria:**
- Available from My Enrollments page and VA
- Blocked after confirmation deadline
- Sets confirmed = true, logged as work note

### US-18 Release Unconfirmed Seats
**As** the system, **I want** to release seats from students who did not confirm in time.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Components:** Scheduled Job `[TOCC] Release Unconfirmed Seats`
**Acceptance Criteria:**
- Runs every 30 minutes
- Cancels approved unconfirmed enrollments past deadline
- Freed seats trigger waitlist promotion

### US-19 Mark Attendance
**As** Instructor, **I want** to mark each student as present, absent, or no-show.
**Priority:** Must Have | **Status:** Done (Sprint 11 - Attendance workflow + ACL + UI + ATF)
**Components:** `x_783010_tocc_a1_attendance` table, Instructor form
**Acceptance Criteria:**
- Attendance records auto-created when session starts
- Instructor can set status per record
- Checked-in timestamp and checked_by user recorded

---

## Epic 6 — Notifications

### US-20 Reservation Notifications
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Coverage:** Submitted, Approved, Rejected — all via `NotificationHelper` + events

### US-21 Enrollment Notifications
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Coverage:** Approved, Rejected, Waitlisted, Waitlist Promoted, Cancelled

### US-22 Session Notifications
**Priority:** Must Have | **Status:** ✅ Done (Sprint 4)
**Coverage:** Reminder 24h before, Confirmation Request, Cancelled, Feedback Request

---

## Epic 7 — Self-Service & Portal

### US-23 Browse Training Sessions (Portal)
**As** Student, **I want** to browse available sessions from the portal home.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 12)
**Components:** `PortalApiService.getAvailableSessions()`, SP widgets

### US-24 View My Enrollments (Portal)
**As** Student, **I want** to see all my enrollments and their status.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 12)
**Components:** `PortalApiService.getMyEnrollments()`, SP widget

### US-25 View My Reservations (Portal)
**As** Instructor, **I want** to see all my reservation requests.
**Priority:** Must Have | **Status:** ✅ Done (Sprint 12)
**Components:** `PortalApiService.getMyReservations()`, SP widget

### US-26 Help Center (Portal)
**As** any user, **I want** a self-service hub with KB search and VA access.
**Priority:** Should Have | **Status:** Done (Sprint 13 - property-driven links + support escalation aligned)
**Components:** `tocc_help` SP page, `TOCC - Help Center` widget, property-driven KB/VA links

---

## Epic 8 — Knowledge Base

### US-27 Publish KB Articles
**As** Backoffice/Admin, **I want** to publish at least 13 KB articles for all personas.
**Priority:** Must Have | **Status:** 🟡 In Progress (Sprint 12 - KB bootstrap service + ATF delivered)
**Components:** Knowledge Base, User Criteria, `KnowledgeBaseBootstrapService`, ATF TEST-031
**Acceptance Criteria:** Articles KB001–KB013 published and accessible per User Criteria

---

## Epic 9 — Virtual Agent

### US-28 VA Topics for Student Self-Service
**As** Student, **I want** to interact with a bot to browse sessions, view enrollments, confirm, or cancel.
**Priority:** Must Have | **Status:** 🟡 In Progress (Sprint 12 - topic backend adapter + ATF contract + flow orchestration scaffolds delivered; Designer/NLU publication pending)
**Components:** VA Topics 1–6, `PortalApiService`, `VirtualAgentTopicService`, NLU model
**Acceptance Criteria:** 6 topics configured, NLU trained, bot linked to portal

---

## Epic 10 — Platform Analytics

### US-29 Training Operations KPI Dashboard
**As** Manager, **I want** a dashboard with 16 operational KPIs to track program health.
**Priority:** Must Have | **Status:** In Progress (Sprint 12 - dashboard scaffold + automated KPI snapshot collector + flow signal scaffold + ATF)
**Components:** Platform Analytics indicators, dashboard, `TrainingKpiService`, `x_783010_tocc_a1_kpi_snapshot`, scheduled data collector
**Acceptance Criteria:** All 16 KPIs defined and collecting data; dashboard visible to Manager role; daily collector is idempotent

---

## Epic 11 — CMDB Light

### US-30 Track Room Assets in CMDB
**As** Admin, **I want** room equipment (projectors, AV, etc.) tracked as CMDB CIs.
**Priority:** Should Have | **Status:** In Progress (Sprint 12 - CMDB validation/enrichment/bootstrap automation delivered)
**Components:** `cmdb_ci`, `x_783010_tocc_a1_room_resource.ci_reference`
**Acceptance Criteria:** At least 3 CIs created and linked to room resources via ci_reference field; bootstrap remains idempotent across reruns

---

## Epic 12 — UI Builder / Workspace (Backoffice)

### US-31 Backoffice Operations Workspace
**As** Backoffice, **I want** a modern workspace to manage reservations, sessions, and enrollments.
**Priority:** Should Have | **Status:** In Progress (Sprint 12 - workspace SDK scaffold delivered)
**Components:** UI Builder workspace, React components, Performance Analytics widgets
**Acceptance Criteria:** Workspace has pending reservations, today's sessions, open enrollments, and KPI tiles

---

## Epic 13 — ATF & Quality

### US-32 ATF Suite — Core Logic Coverage
**As** Developer, **I want** automated tests covering all core Script Include methods.
**Priority:** Must Have | **Status:** In Progress (Sprint 12 - expanded to dashboard/workspace/CMDB bootstrap/flow scaffolds)
**Components:** ATF tests TEST-001 to TEST-045
**Acceptance Criteria:** >= 70% coverage across core services and scaffolds; all tests green after deploy

---

## Sprint Status Summary

| Sprint | Deliverable | Status |
|---|---|---|
| 0 | SDK setup, documentation baseline | ✅ Complete |
| 1 | Tables, roles, ACLs, seed data | ✅ Complete |
| 2 | Reservation BRs + Script Includes | ✅ Complete |
| 3 | Enrollment BRs + Script Includes | ✅ Complete |
| 4 | Scheduled Jobs, Notifications, UI Actions, Client Scripts, UI Policies | ✅ Complete |
| 5 | Record Producers, PortalApiService, Service Portal widgets/pages | ✅ Complete |
| 6 | Cancellation, confirmation, no-show, waitlist | ✅ Covered by Sprint 3–4 services |
| 7 | Knowledge Base + Virtual Agent | 🟡 In Progress (KB bootstrap automated; VA backend adapter + flow scaffolds + ATF delivered; topic/NLU authoring pending) |
| 8 | CMDB light | In Progress (CI reference validation + enrichment + bootstrap automation delivered) |
| 9 | Platform Analytics + KPIs | In Progress (dashboard scaffold + daily KPI snapshot collector + flow signal scaffold delivered; indicator widgets still need final PA wiring) |
| 10 | UI Builder / Workspace | In Progress (workspace SDK scaffold delivered; UI composition pending) |
| 11 | ATF full suite + QA hardening | In Progress (attendance + KB + CMDB bootstrap + KPI collector + VA adapter + flow scaffolds + dashboard/workspace ATF blocks delivered) |

---

*Last updated: Sprint 13 in progress - Help Center finalized with unified property-driven escalation links; KB, CMDB, KPI, VA, Flow, Dashboard, and Workspace scaffolds remain active.*
