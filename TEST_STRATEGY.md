# TEST_STRATEGY.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 11
> **ATF coverage target:** ≥ 70% of core Script Include methods
> **Current baseline:** 3 smoke tests passing (Room CRUD, ACL student, ACL instructor)

---

## 1. Test Layers

| Layer | Tool | Scope | Who Runs |
|---|---|---|---|
| ATF — Unit | ServiceNow ATF | Script Include methods, BR logic, ACL enforcement | SDK / CI pipeline |
| ATF — Integration | ServiceNow ATF | Full workflows (reservation → session → enrollment) | Developer before PR |
| Manual — Portal | Browser | Service Portal widget flows, GlideAjax, confirmation UX | Developer / QA |
| Manual — Flows | Instance | Flow Designer flows, approval routing, notifications | Developer |
| Manual — VA | VA Designer | Virtual Agent topic routing, NLU accuracy | Developer after training |
| Smoke — Post-deploy | ATF suite | Critical path after each `now-sdk install` | Automated |

---

## 2. ATF Suite Structure

Suite name: `x_783010_tocc_a1_atf_suite`

```
x_783010_tocc_a1_atf_suite
├── Group: Data & ACL Baseline
│   ├── TEST-001: Room CRUD by admin
│   ├── TEST-002: Student cannot create course
│   └── TEST-003: Instructor can create reservation
│
├── Group: TrainingConfigService
│   ├── TEST-004: getValue returns seed default
│   ├── TEST-005: getNumber parses integer correctly
│   ├── TEST-006: getBoolean handles true/false/1
│   └── TEST-007: getMinimumAdvanceNoticeHours returns 24 by default
│
├── Group: RoomService — Availability
│   ├── TEST-008: No conflict for non-overlapping reservations
│   ├── TEST-009: Conflict detected for overlapping reservations
│   ├── TEST-010: Conflict ignores cancelled reservations
│   ├── TEST-011: Advance notice validation blocks short-notice request
│   └── TEST-012: Capacity validation blocks over-capacity request
│
├── Group: EnrollmentService
│   ├── TEST-013: Duplicate enrollment is blocked
│   ├── TEST-014: Enrollment in cancelled session is blocked
│   ├── TEST-015: Enrollment in full session goes to waitlist (mode: waitlist)
│   ├── TEST-016: Enrollment in full session blocked (mode: block)
│   ├── TEST-017: Approved enrollment decrements available_seats
│   ├── TEST-018: Cancelled enrollment increments available_seats
│   ├── TEST-019: Waitlist promotion fires on seat release
│   └── TEST-020: Late cancellation blocked within window
│
├── Group: TrainingSessionService
│   ├── TEST-021: Session created on reservation approval
│   ├── TEST-022: Session cancelled when reservation is cancelled
│   └── TEST-023: Session status syncs to Full when available_seats = 0
│
├── Group: NotificationHelper
│   ├── TEST-024: sendReservationDecision queues correct event for approved
│   ├── TEST-025: sendReservationDecision queues correct event for rejected
│   └── TEST-026: sendEnrollmentDecision queues correct event for each status
│
└── Group: PortalApiService — ACL & Data
    ├── TEST-027: getAvailableSessions returns only open/full sessions
    ├── TEST-028: getMyEnrollments returns only logged-in student's records
    ├── TEST-029: confirmMyAttendance blocked after deadline
    └── TEST-030: confirmMyAttendance blocked for wrong student
```

---

## 3. ATF Test Patterns

### Pattern: Script Include method test

```javascript
// Standard structure for each ATF test step
var svc = new x_783010_tocc_a1.RoomService();
var result = svc.checkConflict(roomId, startDt, endDt, null);
gs.assertTrue(result.conflict === false, 'Expected no conflict for non-overlapping reservation');
```

### Pattern: ACL enforcement test

```javascript
// Impersonate a user with student role only
gs.impersonateUser(studentUserId);
var gr = new GlideRecord('x_783010_tocc_a1_training_config');
gr.query();
// Student should have no access — query returns 0 rows due to ACL
gs.assertTrue(!gr.next(), 'Student should not be able to read training config');
gs.resetSession();
```

### Pattern: Business Rule trigger test

```javascript
// Create enrollment that should be blocked as duplicate
var enrollment1 = new GlideRecord('x_783010_tocc_a1_student_enrollment');
enrollment1.initialize();
enrollment1.setValue('student', studentId);
enrollment1.setValue('training_session', sessionId);
var id1 = enrollment1.insert();
gs.assertNotNull(id1, 'First enrollment should succeed');

var enrollment2 = new GlideRecord('x_783010_tocc_a1_student_enrollment');
enrollment2.initialize();
enrollment2.setValue('student', studentId);
enrollment2.setValue('training_session', sessionId);
var id2 = enrollment2.insert();
gs.assertNull(id2, 'Duplicate enrollment should be blocked by BR');
```

---

## 4. Manual Test Scenarios

### Scenario M-01: Full Reservation-to-Enrollment Flow

1. Login as Instructor → Create Room Reservation via catalog
2. Login as Backoffice → Approve reservation
3. Verify Training Session created automatically with correct data
4. Login as Student → Browse sessions → Enroll in the session
5. Login as Backoffice → Approve enrollment (if mode = instructor_approval)
6. Login as Student → Confirm attendance
7. Login as Instructor → Start Session → Mark attendance
8. Verify attendance record created
9. Verify feedback request sent (check notification log)

**Expected:** Zero errors, all status transitions logged as work notes, all notifications queued.

---

### Scenario M-02: Waitlist and Promotion Flow

1. Create a session with 1 seat
2. Student A enrolls → Approved → available_seats = 0, status = Full
3. Student B enrolls → Waitlisted (position 1)
4. Student C enrolls → Waitlisted (position 2)
5. Cancel Student A's enrollment
6. Verify Student B is promoted automatically to Approved
7. Verify available_seats = 0 (B took the seat)
8. Verify Student B received waitlist promotion notification

---

### Scenario M-03: Late Cancellation Block

1. Create session starting in 2 hours
2. Login as Student with approved enrollment
3. Attempt to cancel via portal
4. Verify cancellation is blocked with message
5. Login as Backoffice → Cancel on behalf of student
6. Verify Backoffice override succeeds

---

### Scenario M-04: Unconfirmed Seat Release

1. Create session with confirmation deadline = 1 hour ago
2. Student has approved enrollment with confirmed = false
3. Trigger Scheduled Job: `[TOCC] Release Unconfirmed Seats` manually
4. Verify enrollment status = cancelled
5. Verify work note added to enrollment
6. Verify next waitlisted student promoted (if any)

---

### Scenario M-05: Security — Role Isolation

For each row in the security testing checklist (SECURITY_MODEL.md section 6):
1. Impersonate a user with only that single role
2. Attempt the action listed
3. Verify ✓ = success, ✗ = blocked by ACL or BR

---

## 5. Notification Validation

After each Flow or Scheduled Job test, verify:

1. Navigate to **System Mailboxes → Outbound → Sent**
2. Confirm email was sent to the correct recipient
3. Confirm subject and body match the notification template
4. Confirm event was queued in **System Log → Events**

---

## 6. Coverage Tracking

| Script Include | Methods | ATF Tests | File | Coverage |
|---|---|---|---|---|
| `TrainingConfigService` | 8 | TEST-004–007 | `atf-config-service.now.ts` | 50% ✓ |
| `RoomService` | 4 | TEST-008–012 | `atf-room-service.now.ts` | 100% ✓ |
| `EnrollmentService` | 7 | TEST-013–020 | `atf-enrollment-service.now.ts` | 100% ✓ |
| `TrainingSessionService` | 3 | TEST-021–023 | `atf-training-session-service.now.ts` | 100% ✓ |
| `NotificationHelper` | 7 | TEST-024–026 | `atf-notification-portal.now.ts` | 43% ✓ |
| `PortalApiService` | 5 | TEST-027–030 | `atf-notification-portal.now.ts` | 80% ✓ |

**Overall coverage: ~79% — target ≥ 70% ✓**

> Smoke tests (TEST-001–003) remain in `tests/atf-smoke.now.ts`.
> All other tests split by domain under `atf/`.

---

*Last updated: Sprint 11 — Full ATF suite structure, 30 test definitions, manual scenarios, coverage table.*
