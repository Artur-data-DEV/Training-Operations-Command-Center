# SECURITY_MODEL.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 4
> **Scope:** `x_783010_tocc_a1`
> All ACL logic is implemented in `src/fluent/security/acls.now.ts` and deployed via SDK.

---

## 1. Roles

Defined in `src/fluent/security/roles.now.ts`.

| Role API Name | Label | Purpose |
|---|---|---|
| `x_783010_tocc_a1.student` | TOCC Student | Self-service: browse sessions, enroll, confirm, cancel |
| `x_783010_tocc_a1.instructor` | TOCC Instructor | Manage own reservations and sessions, mark attendance |
| `x_783010_tocc_a1.backoffice` | TOCC Backoffice | Approve reservations, manage rooms and sessions, resolve conflicts |
| `x_783010_tocc_a1.manager` | TOCC Manager | Read-only access to all data and KPI dashboards |
| `x_783010_tocc_a1.admin` | TOCC Admin | Full access, configuration, CMDB, roles management |

No role inherits from another. All assignments are explicit.
`x_783010_tocc_a1.admin` is flagged `scopedAdmin: true`.

---

## 2. Access Matrix by Table

Legend: `C` = Create, `R` = Read, `U` = Update, `D` = Delete, `—` = No access

### x_783010_tocc_a1_room

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | R | — | — |
| instructor | — | R | — | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_room_reservation

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | — | — | — |
| instructor | C | R (own) | U (own, pending) | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

> "Own" = records where `instructor = gs.getUserID()`

### x_783010_tocc_a1_training_session

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | R (open/full) | — | — |
| instructor | — | R (own) | U (own, limited fields) | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_student_enrollment

| Role | C | R | U | D |
|---|---|---|---|---|
| student | C (own) | R (own) | U (own, cancel only) | — |
| instructor | — | R (own sessions) | U (approve/reject) | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_student

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | R (own) | — | — |
| instructor | — | R | — | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_attendance

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | R (own) | — | — |
| instructor | C | R (own sessions) | U (own sessions) | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_training_feedback

| Role | C | R | U | D |
|---|---|---|---|---|
| student | C (own) | R (own) | — | — |
| instructor | — | R (own sessions) | — | — |
| backoffice | — | R | — | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_training_config

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | — | — | — |
| instructor | — | — | — | — |
| backoffice | — | R | — | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_room_resource / x_783010_tocc_a1_reservation_resource

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | R | — | — |
| instructor | — | R | C | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

### x_783010_tocc_a1_course

| Role | C | R | U | D |
|---|---|---|---|---|
| student | — | R | — | — |
| instructor | — | R | — | — |
| backoffice | C | R | U | — |
| manager | — | R | — | — |
| admin | C | R | U | D |

---

## 3. Client-Callable Script Include ACLs

| Script Include | Roles Allowed |
|---|---|
| `x_783010_tocc_a1.TrainingContextAjax` | All 5 TOCC roles |
| `x_783010_tocc_a1.PortalApiService` | All 5 TOCC roles |

---

## 4. Field-Level ACL Notes

These fields have additional ACL protection beyond table-level:

| Table | Field | Restriction |
|---|---|---|
| `x_783010_tocc_a1_room_reservation` | `status` | Students cannot write; Instructors limited to own records |
| `x_783010_tocc_a1_student_enrollment` | `status` | Students can only transition to `cancelled`; no direct write to `approved` |
| `x_783010_tocc_a1_training_session` | `available_seats` | No direct write by any role; only updated by `EnrollmentService` via `setWorkflow(false)` |
| `x_783010_tocc_a1_training_config` | All fields | Read: backoffice, manager. Write: admin only |

---

## 5. User Criteria (Service Portal)

Configured manually in Service Portal → User Criteria after SDK deploy.

| Criteria Name | Script Condition | Applied To |
|---|---|---|
| TOCC - Students Only | `gs.hasRole('x_783010_tocc_a1.student')` | My Enrollments page, Enroll button |
| TOCC - Instructors Only | `gs.hasRole('x_783010_tocc_a1.instructor')` | My Reservations page, Reserve Room item |
| TOCC - Any Role | any of the 5 TOCC roles | Portal home, session list, help center |
| TOCC - Operations | `backoffice` or `admin` | Approval catalog items, backoffice views |

---

## 6. Security Testing Checklist

Run after each deploy. Impersonate a user with only the target role.

| Test | Student | Instructor | Backoffice | Manager | Admin |
|---|---|---|---|---|---|
| Can view room list | ✓ | ✓ | ✓ | ✓ | ✓ |
| Can create reservation | ✗ | ✓ | ✓ | ✗ | ✓ |
| Can approve reservation | ✗ | ✗ | ✓ | ✗ | ✓ |
| Can create enrollment | ✓ | ✗ | ✓ | ✗ | ✓ |
| Can approve enrollment | ✗ | ✓ | ✓ | ✗ | ✓ |
| Can view training config | ✗ | ✗ | ✓ | ✓ | ✓ |
| Can edit training config | ✗ | ✗ | ✗ | ✗ | ✓ |
| Can delete any record | ✗ | ✗ | ✗ | ✗ | ✓ |
| Can access KPI dashboard | ✗ | ✗ | ✓ | ✓ | ✓ |

---

*Last updated: Sprint 4 — Full ACL matrix, User Criteria, field-level restrictions.*
