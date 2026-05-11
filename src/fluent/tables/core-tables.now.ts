import {
    BooleanColumn,
    DateTimeColumn,
    IntegerColumn,
    ReferenceColumn,
    StringColumn,
    Table,
} from '@servicenow/sdk/core'

export const x_783010_tocc_a1_room = Table({
    name: 'x_783010_tocc_a1_room',
    label: 'Room',
    display: 'room_name',
    schema: {
        room_name: StringColumn({ label: 'Room Name', mandatory: true, maxLength: 120 }),
        room_code: StringColumn({ label: 'Room Code', mandatory: true, maxLength: 40, unique: true }),
        location: ReferenceColumn({ label: 'Location', referenceTable: 'cmn_location' }),
        capacity: IntegerColumn({ label: 'Capacity', mandatory: true }),
        room_type: StringColumn({
            label: 'Room Type',
            choices: {
                classroom: { label: 'Classroom' },
                auditorium: { label: 'Auditorium' },
                lab: { label: 'Lab' },
                meeting_room: { label: 'Meeting Room' },
            },
        }),
        status: StringColumn({
            label: 'Status',
            mandatory: true,
            default: 'active',
            choices: {
                active: { label: 'Active' },
                inactive: { label: 'Inactive' },
                maintenance: { label: 'Maintenance' },
            },
        }),
    },
})

export const x_783010_tocc_a1_room_resource = Table({
    name: 'x_783010_tocc_a1_room_resource',
    label: 'Room Resource',
    display: 'resource_name',
    schema: {
        room: ReferenceColumn({ label: 'Room', referenceTable: 'x_783010_tocc_a1_room', mandatory: true }),
        resource_name: StringColumn({ label: 'Resource Name', mandatory: true, maxLength: 120 }),
        resource_type: StringColumn({
            label: 'Resource Type',
            choices: {
                projector: { label: 'Projector' },
                av: { label: 'AV Equipment' },
                computer: { label: 'Computer' },
                other: { label: 'Other' },
            },
        }),
        ci_reference: ReferenceColumn({ label: 'CMDB CI', referenceTable: 'cmdb_ci' }),
        quantity: IntegerColumn({ label: 'Quantity', default: '1' }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
    },
})

export const x_783010_tocc_a1_room_reservation = Table({
    name: 'x_783010_tocc_a1_room_reservation',
    label: 'Room Reservation',
    display: 'number',
    extends: 'task',
    schema: {
        instructor: ReferenceColumn({ label: 'Instructor', referenceTable: 'sys_user', mandatory: true }),
        room: ReferenceColumn({ label: 'Room', referenceTable: 'x_783010_tocc_a1_room', mandatory: true }),
        start_datetime: DateTimeColumn({ label: 'Start Date/Time', mandatory: true }),
        end_datetime: DateTimeColumn({ label: 'End Date/Time', mandatory: true }),
        expected_participants: IntegerColumn({ label: 'Expected Participants', mandatory: true }),
        status: StringColumn({
            label: 'Status',
            mandatory: true,
            default: 'draft',
            choices: {
                draft: { label: 'Draft' },
                submitted: { label: 'Submitted' },
                approved: { label: 'Approved' },
                rejected: { label: 'Rejected' },
                cancelled: { label: 'Cancelled' },
            },
        }),
    },
    autoNumber: {
        prefix: 'RSV',
        number: 1,
        numberOfDigits: 7,
    },
})

export const x_783010_tocc_a1_reservation_resource = Table({
    name: 'x_783010_tocc_a1_reservation_resource',
    label: 'Reservation Resource',
    display: 'resource_name',
    schema: {
        reservation: ReferenceColumn({ label: 'Reservation', referenceTable: 'x_783010_tocc_a1_room_reservation', mandatory: true }),
        room_resource: ReferenceColumn({ label: 'Room Resource', referenceTable: 'x_783010_tocc_a1_room_resource' }),
        resource_name: StringColumn({ label: 'Resource Name', mandatory: true, maxLength: 120 }),
        quantity: IntegerColumn({ label: 'Quantity', default: '1' }),
    },
})

export const x_783010_tocc_a1_training_session = Table({
    name: 'x_783010_tocc_a1_training_session',
    label: 'Training Session',
    display: 'number',
    extends: 'task',
    schema: {
        reservation: ReferenceColumn({ label: 'Reservation', referenceTable: 'x_783010_tocc_a1_room_reservation' }),
        room: ReferenceColumn({ label: 'Room', referenceTable: 'x_783010_tocc_a1_room', mandatory: true }),
        title: StringColumn({ label: 'Title', mandatory: true, maxLength: 160 }),
        instructor: ReferenceColumn({ label: 'Instructor', referenceTable: 'sys_user', mandatory: true }),
        start_datetime: DateTimeColumn({ label: 'Start Date/Time', mandatory: true }),
        end_datetime: DateTimeColumn({ label: 'End Date/Time', mandatory: true }),
        total_seats: IntegerColumn({ label: 'Total Seats', mandatory: true }),
        available_seats: IntegerColumn({ label: 'Available Seats', mandatory: true }),
        enrollment_deadline: DateTimeColumn({ label: 'Enrollment Deadline' }),
        confirmation_deadline: DateTimeColumn({ label: 'Confirmation Deadline' }),
        status: StringColumn({
            label: 'Status',
            mandatory: true,
            default: 'draft',
            choices: {
                draft: { label: 'Draft' },
                open: { label: 'Open' },
                full: { label: 'Full' },
                in_progress: { label: 'In Progress' },
                completed: { label: 'Completed' },
                cancelled: { label: 'Cancelled' },
            },
        }),
    },
    autoNumber: {
        prefix: 'SES',
        number: 1,
        numberOfDigits: 7,
    },
})

export const x_783010_tocc_a1_student = Table({
    name: 'x_783010_tocc_a1_student',
    label: 'Student',
    display: 'user',
    schema: {
        user: ReferenceColumn({ label: 'User', referenceTable: 'sys_user', mandatory: true, unique: true }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
    },
})

export const x_783010_tocc_a1_student_enrollment = Table({
    name: 'x_783010_tocc_a1_student_enrollment',
    label: 'Student Enrollment',
    display: 'number',
    extends: 'task',
    schema: {
        student: ReferenceColumn({ label: 'Student', referenceTable: 'x_783010_tocc_a1_student', mandatory: true }),
        training_session: ReferenceColumn({
            label: 'Training Session',
            referenceTable: 'x_783010_tocc_a1_training_session',
            mandatory: true,
        }),
        status: StringColumn({
            label: 'Status',
            mandatory: true,
            default: 'pending',
            choices: {
                pending: { label: 'Pending' },
                approved: { label: 'Approved' },
                rejected: { label: 'Rejected' },
                waitlisted: { label: 'Waitlisted' },
                cancelled: { label: 'Cancelled' },
            },
        }),
        confirmed: BooleanColumn({ label: 'Confirmed Attendance', default: 'false' }),
        check_in_datetime: DateTimeColumn({ label: 'Check-in Date/Time' }),
    },
    autoNumber: {
        prefix: 'ENR',
        number: 1,
        numberOfDigits: 7,
    },
})

export const x_783010_tocc_a1_attendance = Table({
    name: 'x_783010_tocc_a1_attendance',
    label: 'Attendance',
    display: 'enrollment',
    extends: 'task',
    schema: {
        enrollment: ReferenceColumn({
            label: 'Enrollment',
            referenceTable: 'x_783010_tocc_a1_student_enrollment',
            mandatory: true,
        }),
        training_session: ReferenceColumn({
            label: 'Training Session',
            referenceTable: 'x_783010_tocc_a1_training_session',
            mandatory: true,
        }),
        attendance_status: StringColumn({
            label: 'Attendance Status',
            mandatory: true,
            default: 'pending',
            choices: {
                pending: { label: 'Pending' },
                present: { label: 'Present' },
                absent: { label: 'Absent' },
                no_show: { label: 'No Show' },
            },
        }),
        recorded_by: ReferenceColumn({ label: 'Recorded By', referenceTable: 'sys_user' }),
        recorded_at: DateTimeColumn({ label: 'Recorded At' }),
    },
})

export const x_783010_tocc_a1_training_feedback = Table({
    name: 'x_783010_tocc_a1_training_feedback',
    label: 'Training Feedback',
    display: 'enrollment',
    schema: {
        enrollment: ReferenceColumn({
            label: 'Enrollment',
            referenceTable: 'x_783010_tocc_a1_student_enrollment',
            mandatory: true,
        }),
        rating: IntegerColumn({ label: 'Rating', mandatory: true }),
        comments: StringColumn({ label: 'Comments', maxLength: 4000 }),
    },
})

export const x_783010_tocc_a1_training_config = Table({
    name: 'x_783010_tocc_a1_training_config',
    label: 'Training Configuration',
    display: 'name',
    schema: {
        name: StringColumn({ label: 'Name', mandatory: true, unique: true, maxLength: 120 }),
        value: StringColumn({ label: 'Value', mandatory: true, maxLength: 255 }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
        description: StringColumn({ label: 'Description', maxLength: 1000 }),
    },
})
