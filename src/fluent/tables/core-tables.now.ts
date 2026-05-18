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

export const x_783010_tocc_a1_course = Table({
    name: 'x_783010_tocc_a1_course',
    label: 'Course',
    display: 'course_name',
    schema: {
        course_id: StringColumn({ label: 'Course ID', mandatory: true, unique: true, maxLength: 40 }),
        course_name: StringColumn({ label: 'Course Name', mandatory: true, maxLength: 160 }),
        description: StringColumn({ label: 'Description', mandatory: true, maxLength: 4000 }),
        duration_hours: IntegerColumn({ label: 'Duration (Hours)', mandatory: true }),
        delivery_category: StringColumn({
            label: 'Delivery Category',
            mandatory: true,
            choices: {
                vilt: { label: 'VILT' },
                in_person: { label: 'In Person' },
            },
        }),
        status: StringColumn({
            label: 'Status',
            mandatory: true,
            default: 'draft',
            choices: {
                draft: { label: 'Draft' },
                active: { label: 'Active' },
                inactive: { label: 'Inactive' },
            },
        }),
    },
    autoNumber: {
        prefix: 'COU',
        number: 1,
        numberOfDigits: 7,
    },
})

export const x_783010_tocc_a1_room_reservation = Table({
    name: 'x_783010_tocc_a1_room_reservation',
    label: 'Room Reservation',
    display: 'number',
    extends: 'task',
    schema: {
        course: ReferenceColumn({ label: 'Legacy Course', referenceTable: 'x_783010_tocc_a1_course' }),
        instructor: ReferenceColumn({ label: 'Legacy Instructor', referenceTable: 'sys_user' }),
        room: ReferenceColumn({ label: 'Legacy Room', referenceTable: 'x_783010_tocc_a1_room' }),
        tocc_course: ReferenceColumn({ label: 'Course', referenceTable: 'x_783010_tocc_a1_course', mandatory: true }),
        tocc_instructor: ReferenceColumn({ label: 'Instructor', referenceTable: 'sys_user', mandatory: true }),
        tocc_room: ReferenceColumn({ label: 'Room', referenceTable: 'x_783010_tocc_a1_room', mandatory: true }),
        training_session: ReferenceColumn({ label: 'Training Session', referenceTable: 'x_783010_tocc_a1_training_session' }),
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
        reservation: ReferenceColumn({ label: 'Legacy Reservation', referenceTable: 'x_783010_tocc_a1_room_reservation' }),
        course: ReferenceColumn({ label: 'Legacy Course', referenceTable: 'x_783010_tocc_a1_course' }),
        room: ReferenceColumn({ label: 'Room', referenceTable: 'x_783010_tocc_a1_room', mandatory: true }),
        tocc_reservation: ReferenceColumn({ label: 'Reservation', referenceTable: 'x_783010_tocc_a1_room_reservation' }),
        tocc_course: ReferenceColumn({ label: 'Course', referenceTable: 'x_783010_tocc_a1_course', mandatory: true }),
        tocc_instructor: ReferenceColumn({ label: 'Instructor', referenceTable: 'sys_user', mandatory: true }),
        title: StringColumn({ label: 'Title', mandatory: true, maxLength: 160 }),
        instructor: ReferenceColumn({ label: 'Legacy Instructor', referenceTable: 'sys_user' }),
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
        tocc_student: ReferenceColumn({ label: 'Student', referenceTable: 'x_783010_tocc_a1_student', mandatory: true }),
        tocc_training_session: ReferenceColumn({
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
        checked_by: ReferenceColumn({ label: 'Checked By', referenceTable: 'sys_user' }),
        checked_in_datetime: DateTimeColumn({ label: 'Checked In Date/Time' }),
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

export const x_783010_tocc_a1_kpi_snapshot = Table({
    name: 'x_783010_tocc_a1_kpi_snapshot',
    label: 'KPI Snapshot',
    display: 'kpi_label',
    schema: {
        kpi_key: StringColumn({ label: 'KPI Key', mandatory: true, maxLength: 120 }),
        kpi_label: StringColumn({ label: 'KPI Label', mandatory: true, maxLength: 200 }),
        kpi_category: StringColumn({
            label: 'KPI Category',
            mandatory: true,
            choices: {
                executive: { label: 'Executive' },
                enrollment: { label: 'Enrollment' },
                operations: { label: 'Operations' },
                self_service: { label: 'Self-Service' },
            },
        }),
        kpi_value: StringColumn({ label: 'KPI Value', mandatory: true, maxLength: 80 }),
        kpi_unit: StringColumn({
            label: 'KPI Unit',
            mandatory: true,
            choices: {
                percent: { label: 'Percent' },
                count: { label: 'Count' },
                hours: { label: 'Hours' },
                rating: { label: 'Rating' },
            },
        }),
        period_start: DateTimeColumn({ label: 'Period Start', mandatory: true }),
        period_end: DateTimeColumn({ label: 'Period End', mandatory: true }),
        snapshot_date: DateTimeColumn({ label: 'Snapshot Date', mandatory: true }),
        source_table: StringColumn({ label: 'Source Table', mandatory: true, maxLength: 120 }),
        details: StringColumn({ label: 'Details', maxLength: 2000 }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
    },
})
