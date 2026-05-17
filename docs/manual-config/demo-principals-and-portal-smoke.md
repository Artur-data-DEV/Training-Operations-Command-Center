# Demo Principals + Portal Smoke Seed

This package is deployed from:

- `src/fluent/data/demo-principals-and-smoke-seed.now.ts`

It creates idempotent baseline data so impersonation tests are immediately usable.

## Seeded users (impersonation)

- `tocc.student`
- `tocc.student2`
- `tocc.student3`
- `tocc.instructor`
- `tocc.backoffice`
- `tocc.manager`
- `tocc.admin`

## Seeded access model

- Group: `[TOCC] Backoffice`
- Direct role assignments:
  - `tocc.student` -> `x_783010_tocc_a1.student`
  - `tocc.student2` -> `x_783010_tocc_a1.student`
  - `tocc.student3` -> `x_783010_tocc_a1.student`
  - `tocc.instructor` -> `x_783010_tocc_a1.instructor`
  - `tocc.backoffice` -> `x_783010_tocc_a1.backoffice`
  - `tocc.manager` -> `x_783010_tocc_a1.manager`
  - `tocc.admin` -> `x_783010_tocc_a1.admin`
- Group role assignment:
  - `[TOCC] Backoffice` -> `x_783010_tocc_a1.backoffice`

## Seeded functional records

- 3 rooms (`x_783010_tocc_a1_room`)
- 4 room resources (`x_783010_tocc_a1_room_resource`)
- 3 demo courses (`x_783010_tocc_a1_course`)
- 4 sessions across lifecycle (`open`, `full`, `in_progress`, `completed`) (`x_783010_tocc_a1_training_session`)
- 4 reservations across lifecycle (`submitted`, `approved`, `rejected`) (`x_783010_tocc_a1_room_reservation`)
- 3 reservation resource lines (`x_783010_tocc_a1_reservation_resource`)
- 6 enrollments (`approved`, `pending`, `waitlisted`, `cancelled`) (`x_783010_tocc_a1_student_enrollment`)
- 3 attendance records (`pending`, `present`) (`x_783010_tocc_a1_attendance`)
- 1 feedback record (`x_783010_tocc_a1_training_feedback`)

## Home route preference

Each seeded user receives:

- `sys_user_preference.name = my_home_navigation_page`
- `value = /now/sow/home`

This is applied per user (not globally) and aligns the first-entry home route with SOW for seeded test principals.

## Quick validation checklist

1. Impersonate `tocc.student` and open `/tocc?id=tocc_home` (canonical portal URL).
2. Validate `My Enrollments` returns at least one row for each status mix (`approved`/`pending`/`waitlisted`/`cancelled`).
3. Impersonate `tocc.instructor` and validate `My Reservations` plus resource lines.
4. Impersonate `tocc.backoffice` and validate quick links operational snapshot block.
5. Validate `Request Catalog` menu and open:
   - `Create Room Reservation`
   - `Request Training Enrollment`
6. Open `/now/sow/home` while impersonating any seeded user and validate route access.

## Portal URL recommendation

- Canonical URL: `/tocc`
- Keep `/sp` and `/swp` as legacy/OOB portals; avoid repointing OOB suffixes from scoped app metadata.
- For compatibility links in docs, emails, and notifications, always use full TOCC URLs, e.g.:
  - `/tocc?id=tocc_home`
  - `/tocc?id=sc_home`
  - `/tocc?id=search&t=sc&q=<term>`
