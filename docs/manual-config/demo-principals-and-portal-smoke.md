# Demo Principals + Portal Smoke Seed

This package is deployed from:

- `src/fluent/data/demo-principals-and-smoke-seed.now.ts`

It creates idempotent baseline data so impersonation tests are immediately usable.

## Seeded users (impersonation)

- `tocc.student`
- `tocc.student2`
- `tocc.instructor`
- `tocc.backoffice`
- `tocc.manager`
- `tocc.admin`

## Seeded access model

- Group: `[TOCC] Backoffice`
- Direct role assignments:
  - `tocc.student` -> `x_783010_tocc_a1.student`
  - `tocc.student2` -> `x_783010_tocc_a1.student`
  - `tocc.instructor` -> `x_783010_tocc_a1.instructor`
  - `tocc.backoffice` -> `x_783010_tocc_a1.backoffice`
  - `tocc.manager` -> `x_783010_tocc_a1.manager`
  - `tocc.admin` -> `x_783010_tocc_a1.admin`
- Group role assignment:
  - `[TOCC] Backoffice` -> `x_783010_tocc_a1.backoffice`

## Seeded functional records

- 1 room (`x_783010_tocc_a1_room`)
- 1 room resource (`x_783010_tocc_a1_room_resource`)
- 1 demo course (`x_783010_tocc_a1_course`)
- 1 open session (`x_783010_tocc_a1_training_session`)
- 1 submitted reservation (`x_783010_tocc_a1_room_reservation`)
- 2 enrollments (approved + pending) (`x_783010_tocc_a1_student_enrollment`)
- 1 attendance record (`x_783010_tocc_a1_attendance`)

## Home route preference

Each seeded user receives:

- `sys_user_preference.name = my_home_navigation_page`
- `value = /now/sow/home`

This is applied per user (not globally) and aligns the first-entry home route with SOW for seeded test principals.

## Quick validation checklist

1. Impersonate `tocc.student` and open `/sp?id=tocc_home` (or your TOCC portal suffix).
2. Validate `My Enrollments` returns at least one row.
3. Impersonate `tocc.instructor` and validate `My Reservations`.
4. Impersonate `tocc.backoffice` and validate quick links operational snapshot block.
5. Open `/now/sow/home` while impersonating any seeded user and validate route access.
