# DATA_MODEL.md - Training Operations Command Center

## Scope

Application scope: `x_tocc`

## Core Tables

- `x_783010_tocc_a1_room`
- `x_783010_tocc_a1_room_resource`
- `x_783010_tocc_a1_room_reservation`
- `x_783010_tocc_a1_reservation_resource`
- `x_783010_tocc_a1_training_session`
- `x_783010_tocc_a1_student`
- `x_783010_tocc_a1_student_enrollment`
- `x_783010_tocc_a1_attendance`
- `x_783010_tocc_a1_training_feedback`
- `x_783010_tocc_a1_training_config`

## Notes

- Full field-level dictionary to be finalized in Sprint 1.
- Use snake_case field naming.
- Add unique index for enrollment duplication guard (`student + training_session`).

