# Role and ACL Control Matrix (Official Baseline)

Scope: `x_783010_tocc_a1`  
Status: Canonical access-control baseline for implementation and validation

## Role Model

| Role | Type | Intent |
|---|---|---|
| `admin` | Platform native | Technical instance administration |
| `x_783010_tocc_a1.admin` | App role | Full scoped-app administration and ownership |
| `x_783010_tocc_a1.manager` | App role | Read-only operations and KPI access |
| `x_783010_tocc_a1.backoffice` | App role | Reservation/session/enrollment/attendance operations |
| `x_783010_tocc_a1.instructor` | App role | Own reservations and own session operations |
| `x_783010_tocc_a1.student` | App role | Self-service enrollment and attendance confirmation |

## Experience Access Matrix

| Surface | Student | Instructor | Backoffice | Manager | App Admin | System Admin |
|---|---|---|---|---|---|---|
| Service Portal home/sessions/help | Read/use | Read/use | Read/use | Read/use | Read/use | Read/use |
| Service Portal my enrollments | Full own scope | No | No | No | Full | Full |
| Service Portal my reservations | No | Full own scope | No | No | Full | Full |
| Record producer: room reservation | No | Create own | Optional support | Optional read | Full | Full |
| Backoffice workspace lists | No | No | Full | Read-only | Full | Full |
| Performance dashboard | No | No | Read | Read | Owner | Owner |
| App configuration records | No | No | Read-only | Read-only | Full | Full |
| Virtual Agent self-service topics | Full | Partial | Escalation/support | Escalation/read | Full | Full |

## Data and Operation Policy Baseline

Legend: `C` create, `R` read, `U` update, `D` delete

| Table | Student | Instructor | Backoffice | Manager | App Admin |
|---|---|---|---|---|---|
| `x_783010_tocc_a1_room` | R | R | C,R,U | R | C,R,U,D |
| `x_783010_tocc_a1_room_reservation` | No | C,R,U own pending | C,R,U | R | C,R,U,D |
| `x_783010_tocc_a1_training_session` | R open/full | R own, U own limited | C,R,U | R | C,R,U,D |
| `x_783010_tocc_a1_student_enrollment` | C,R,U own (cancel policy) | R own sessions, U approve/reject | C,R,U | R | C,R,U,D |
| `x_783010_tocc_a1_attendance` | R own | C,R,U own sessions | C,R,U | R | C,R,U,D |
| `x_783010_tocc_a1_training_feedback` | C,R own | R own sessions | R | R | C,R,U,D |
| `x_783010_tocc_a1_training_config` | No | No | R | R | C,R,U,D |
| `x_783010_tocc_a1_room_resource` | R | R,request links | C,R,U | R | C,R,U,D |
| `x_783010_tocc_a1_course` | R | R | C,R,U | R | C,R,U,D |

## Control Points to Enforce

| Control Point | Required Enforcement | Baseline Status |
|---|---|---|
| Table ACL (`record`) | CRUD by role policy | Partial in code (`src/fluent/security/acls.now.ts`) |
| Field ACL (`record.*` + sensitive fields) | Restrict status/config/manual seat fields | Partial in code and docs; complete in instance validation |
| Client-callable Script Include ACL | Restrict execute scope to TOCC roles | Partial (`PortalApiService` present; expand as needed) |
| Service Portal visibility | Page/menu and user-criteria segmentation | Partial (pages in code, criteria manual runbook) |
| Workspace visibility | Role-based experience access | Partial (workspace exists, final role checks in manual composition) |
| Dashboard permissions | manager/backoffice read, app admin owner | Implemented scaffold |
| UI Actions and Flow approvals | Role-aware transitions and approval authority | Pending full hardening |
| Virtual Agent topic access | Role-based topic routing and backend validation | Pending publication and homologation |

## Governance Rules

1. Business authorization must be validated server-side in Script Includes and Business Rules.
2. Client/UI checks are usability only; they do not replace ACLs.
3. Any new table or API must be added to this matrix before deploy.
4. Any role expansion requires ATF security regression tests before release.
5. Role assignment is explicit; no hidden inheritance assumptions.

## Validation Checklist

| Check | Expected Result |
|---|---|
| Student reads `training_config` | Denied |
| Student can confirm own attendance | Allowed |
| Instructor approves own reservation without permission exception | Denied unless policy explicitly allows |
| Backoffice updates reservation/session/enrollment status | Allowed |
| Manager opens workspace and dashboard read-only | Allowed |
| Student opens backoffice workspace | Denied |
| App admin edits configuration and dashboard | Allowed |

## Source Anchors

- `src/fluent/security/roles.now.ts`
- `src/fluent/security/acls.now.ts`
- `src/fluent/portal/service-portal.now.ts`
- `src/fluent/workspace/backoffice-workspace.now.ts`
- `src/fluent/dashboards/platform-analytics-dashboard.now.ts`
- `SECURITY_MODEL.md`
