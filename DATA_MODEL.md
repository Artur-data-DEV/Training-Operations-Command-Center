# DATA_MODEL.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 1
> **Scope:** `x_783010_tocc_a1`
> All tables defined in `src/fluent/tables/core-tables.now.ts` and deployed via SDK.

---

## 1. Entity Relationship Overview

```
x_783010_tocc_a1_course
        │
        └──< x_783010_tocc_a1_room_reservation >──── x_783010_tocc_a1_room
                        │                                     │
                        │                          x_783010_tocc_a1_room_resource
                        │                          x_783010_tocc_a1_reservation_resource
                        ▼
        x_783010_tocc_a1_training_session
                        │
                        └──< x_783010_tocc_a1_student_enrollment >── x_783010_tocc_a1_student
                                        │
                                        └──> x_783010_tocc_a1_attendance
                                        └──> x_783010_tocc_a1_training_feedback
```

---

## 2. Tables

### x_783010_tocc_a1_room

Physical or virtual training room.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `name` | String(100) | Display name |
| `code` | String(20) | Short unique identifier |
| `location` | Reference(cmn_location) | Building/floor reference |
| `capacity` | Integer | Max occupants |
| `room_type` | Choice | `classroom`, `lab`, `auditorium`, `virtual` |
| `status` | Choice | `available`, `maintenance`, `retired` |
| `active` | Boolean | Soft-delete flag |
| `description` | String(500) | |

---

### x_783010_tocc_a1_room_resource

Physical resource (projector, AV, etc.) associated with a room.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `name` | String(100) | |
| `resource_type` | Choice | `projector`, `av_system`, `computer`, `microphone`, `display` |
| `room` | Reference(x_783010_tocc_a1_room) | Owning room |
| `related_ci` | Reference(cmdb_ci) | Optional CMDB CI link |
| `status` | Choice | `available`, `in_use`, `maintenance` |
| `active` | Boolean | |
| `description` | String(500) | |

---

### x_783010_tocc_a1_course

Course catalog entry. Training sessions are instances of a course.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `name` | String(200) | Course title |
| `code` | String(30) | Unique course code |
| `description` | String(2000) | |
| `duration_hours` | Decimal | Expected duration in hours |
| `delivery_category` | Choice | `in_person`, `virtual`, `hybrid` |
| `status` | Choice | `active`, `archived` |
| `active` | Boolean | |

---

### x_783010_tocc_a1_room_reservation

Request for a room made by an Instructor. Auto-creates a Training Session on approval.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `number` | String | Auto-generated `RR0001001` |
| `course` | Reference(x_783010_tocc_a1_course) | Mandatory |
| `room` | Reference(x_783010_tocc_a1_room) | Mandatory |
| `instructor` | Reference(sys_user) | Mandatory |
| `start_datetime` | DateTime | Mandatory |
| `end_datetime` | DateTime | Mandatory; must be > start |
| `expected_participants` | Integer | Must be ≤ room.capacity |
| `status` | Choice | `draft`, `submitted`, `approved`, `rejected`, `cancelled` |
| `description` | String(2000) | Notes / cancellation reason |
| `training_session` | Reference(x_783010_tocc_a1_training_session) | Populated on approval |

**Indexes:** `(room, start_datetime, end_datetime)` — used by `RoomService` conflict check.

**Auto-number prefix:** `RR`

---

### x_783010_tocc_a1_reservation_resource

Resources requested alongside a room reservation.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `reservation` | Reference(x_783010_tocc_a1_room_reservation) | Parent reservation |
| `resource` | Reference(x_783010_tocc_a1_room_resource) | Requested resource |
| `quantity` | Integer | Default 1 |
| `status` | Choice | `requested`, `confirmed`, `unavailable` |
| `notes` | String(500) | |

---

### x_783010_tocc_a1_training_session

Live instance of a course, created automatically when a reservation is approved.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `number` | String | Auto-generated `TS0001001` |
| `title` | String(200) | Derived from course name + date |
| `course` | Reference(x_783010_tocc_a1_course) | |
| `reservation` | Reference(x_783010_tocc_a1_room_reservation) | Source reservation |
| `room` | Reference(x_783010_tocc_a1_room) | |
| `instructor` | Reference(sys_user) | |
| `start_datetime` | DateTime | |
| `end_datetime` | DateTime | |
| `total_seats` | Integer | Copied from reservation.expected_participants |
| `available_seats` | Integer | Decremented by EnrollmentService |
| `status` | Choice | `draft`, `open`, `full`, `in_progress`, `completed`, `cancelled` |
| `active` | Boolean | |
| `enrollment_deadline` | DateTime | After this, no new enrollments |
| `confirmation_deadline` | DateTime | Students must confirm by this time |
| `description` | String(2000) | |

**Auto-number prefix:** `TS`

---

### x_783010_tocc_a1_student

Student profile. One per sys_user. Created by Admin when onboarding a user.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `user` | Reference(sys_user) | Unique; one profile per user |
| `registration_code` | String(30) | Org-assigned ID |
| `department` | Reference(cmn_department) | Optional |
| `active` | Boolean | |
| `notes` | String(500) | |

---

### x_783010_tocc_a1_student_enrollment

A student's enrollment in a training session.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `number` | String | Auto-generated `EN0001001` |
| `student` | Reference(x_783010_tocc_a1_student) | Mandatory |
| `training_session` | Reference(x_783010_tocc_a1_training_session) | Mandatory |
| `status` | Choice | `pending`, `approved`, `waitlisted`, `rejected`, `cancelled` |
| `confirmed` | Boolean | Attendance confirmation flag |
| `waitlist_position` | Integer | Position in waitlist; null if not waitlisted |
| `requested_at` | DateTime | Auto-set on create |
| `approved_at` | DateTime | Auto-set on approval |
| `confirmed_at` | DateTime | Auto-set on confirmation |
| `cancelled_at` | DateTime | Auto-set on cancellation |
| `cancellation_reason` | String(500) | Required when status = cancelled |

**Unique index:** `(student, training_session)` — prevents duplicate enrollment.

**Auto-number prefix:** `EN`

---

### x_783010_tocc_a1_attendance

Per-student attendance record, auto-generated when session moves to `in_progress`.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `training_session` | Reference(x_783010_tocc_a1_training_session) | |
| `enrollment` | Reference(x_783010_tocc_a1_student_enrollment) | |
| `attendance_status` | Choice | `pending`, `present`, `absent`, `no_show` |
| `checked_in_at` | DateTime | Timestamp when marked present |
| `checked_by` | Reference(sys_user) | Instructor or Backoffice who marked attendance |
| `notes` | String(500) | |

---

### x_783010_tocc_a1_training_feedback

Post-session feedback submitted by students.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `training_session` | Reference(x_783010_tocc_a1_training_session) | |
| `student` | Reference(x_783010_tocc_a1_student) | |
| `rating` | Integer | 1–5; validated by BR |
| `comments` | String(2000) | |
| `submitted_at` | DateTime | Auto-set on insert |

**Unique index:** `(training_session, student)` — one feedback per student per session.

---

### x_783010_tocc_a1_training_config

Operational configuration parameters. Read at runtime by `TrainingConfigService` with session-level cache.

| Field | Type | Notes |
|---|---|---|
| `sys_id` | GUID | PK |
| `name` | String(100) | Unique key; used in `getValue(name)` calls |
| `value` | String(500) | String representation of the value |
| `active` | Boolean | Inactive records are ignored by TrainingConfigService |
| `description` | String(500) | Human-readable explanation |

**Seed records (8 defaults):**

| Name | Default | Purpose |
|---|---|---|
| `minimum_advance_notice_hours` | `24` | Min hours before session start to submit a reservation |
| `late_cancellation_window_hours` | `4` | Hours before session start within which cancellation is blocked |
| `waitlist_mode` | `waitlist` | `waitlist` or `block` — behavior when session is full |
| `enrollment_approval_mode` | `direct` | `direct` or `instructor_approval` |
| `confirmation_lead_hours` | `24` | Hours before session start to send confirmation request |
| `reminder_lead_hours` | `24` | Hours before session start to send reminder |
| `feedback_window_hours` | `48` | Hours after session completion for feedback submission |
| `stale_approval_hours` | `48` | Hours after which pending approvals are flagged stale |

---

## 3. Key Business Constraints

| Constraint | Enforcement |
|---|---|
| No room double-booking | `RoomService.checkConflict()` called from BR |
| End datetime > start datetime | BR + Data Policy |
| Advance notice minimum | `RoomService` reads `TrainingConfigService.getMinimumAdvanceNoticeHours()` |
| Participants ≤ room capacity | `RoomService.validateCapacity()` |
| No duplicate enrollment | Unique index on `(student, training_session)` + `EnrollmentService` |
| One feedback per student/session | Unique index on `(training_session, student)` + BR |
| Feedback rating 1–5 | BR validates before insert |
| Late cancellation blocked | `EnrollmentService` reads `TrainingConfigService.getLateCancellationWindowHours()` |

---

*Last updated: Sprint 1 — Full field dictionary, constraints, seed data.*
