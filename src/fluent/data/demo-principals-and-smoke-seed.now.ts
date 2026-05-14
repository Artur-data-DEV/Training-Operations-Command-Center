import { Record } from '@servicenow/sdk/core'

const demoGroupBackofficeId = Now.ID['x_783010_tocc_a1_seed_group_backoffice']

const demoUserStudentId = Now.ID['x_783010_tocc_a1_seed_user_student']
const demoUserStudent2Id = Now.ID['x_783010_tocc_a1_seed_user_student_2']
const demoUserInstructorId = Now.ID['x_783010_tocc_a1_seed_user_instructor']
const demoUserBackofficeId = Now.ID['x_783010_tocc_a1_seed_user_backoffice']
const demoUserManagerId = Now.ID['x_783010_tocc_a1_seed_user_manager']
const demoUserScopedAdminId = Now.ID['x_783010_tocc_a1_seed_user_scoped_admin']

const demoStudentProfileId = Now.ID['x_783010_tocc_a1_seed_student_profile']
const demoStudentProfile2Id = Now.ID['x_783010_tocc_a1_seed_student_profile_2']

const demoRoomId = Now.ID['x_783010_tocc_a1_seed_room_001']
const demoRoomResourceId = Now.ID['x_783010_tocc_a1_seed_room_resource_001']
const demoCourseId = Now.ID['x_783010_tocc_a1_seed_course_001']
const demoSessionId = Now.ID['x_783010_tocc_a1_seed_session_001']
const demoReservationId = Now.ID['x_783010_tocc_a1_seed_reservation_001']
const demoEnrollmentApprovedId = Now.ID['x_783010_tocc_a1_seed_enrollment_approved_001']
const demoEnrollmentPendingId = Now.ID['x_783010_tocc_a1_seed_enrollment_pending_001']
const demoAttendanceId = Now.ID['x_783010_tocc_a1_seed_attendance_001']

const studentRoleRef = Now.ref('sys_user_role', { name: 'x_783010_tocc_a1.student' })
const instructorRoleRef = Now.ref('sys_user_role', { name: 'x_783010_tocc_a1.instructor' })
const backofficeRoleRef = Now.ref('sys_user_role', { name: 'x_783010_tocc_a1.backoffice' })
const managerRoleRef = Now.ref('sys_user_role', { name: 'x_783010_tocc_a1.manager' })
const scopedAdminRoleRef = Now.ref('sys_user_role', { name: 'x_783010_tocc_a1.admin' })

Record({
    $id: demoGroupBackofficeId,
    table: 'sys_user_group',
    data: {
        name: '[TOCC] Backoffice',
        description: 'Approval and operations group for the Training Operations Command Center.',
        active: true,
    },
})

Record({
    $id: demoUserStudentId,
    table: 'sys_user',
    data: {
        user_name: 'tocc.student',
        first_name: 'TOCC',
        last_name: 'Student',
        email: 'tocc.student@example.com',
        title: 'Training Student',
        time_zone: 'America/Sao_Paulo',
        active: true,
    },
})

Record({
    $id: demoUserStudent2Id,
    table: 'sys_user',
    data: {
        user_name: 'tocc.student2',
        first_name: 'TOCC',
        last_name: 'Student Two',
        email: 'tocc.student2@example.com',
        title: 'Training Student',
        time_zone: 'America/Sao_Paulo',
        active: true,
    },
})

Record({
    $id: demoUserInstructorId,
    table: 'sys_user',
    data: {
        user_name: 'tocc.instructor',
        first_name: 'TOCC',
        last_name: 'Instructor',
        email: 'tocc.instructor@example.com',
        title: 'Training Instructor',
        time_zone: 'America/Sao_Paulo',
        active: true,
    },
})

Record({
    $id: demoUserBackofficeId,
    table: 'sys_user',
    data: {
        user_name: 'tocc.backoffice',
        first_name: 'TOCC',
        last_name: 'Backoffice',
        email: 'tocc.backoffice@example.com',
        title: 'Backoffice Analyst',
        time_zone: 'America/Sao_Paulo',
        active: true,
    },
})

Record({
    $id: demoUserManagerId,
    table: 'sys_user',
    data: {
        user_name: 'tocc.manager',
        first_name: 'TOCC',
        last_name: 'Manager',
        email: 'tocc.manager@example.com',
        title: 'Training Operations Manager',
        time_zone: 'America/Sao_Paulo',
        active: true,
    },
})

Record({
    $id: demoUserScopedAdminId,
    table: 'sys_user',
    data: {
        user_name: 'tocc.admin',
        first_name: 'TOCC',
        last_name: 'Admin',
        email: 'tocc.admin@example.com',
        title: 'TOCC Scoped Administrator',
        time_zone: 'America/Sao_Paulo',
        active: true,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_group_member_backoffice'],
    table: 'sys_user_grmember',
    data: {
        group: demoGroupBackofficeId,
        user: demoUserBackofficeId,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_group_role_backoffice'],
    table: 'sys_group_has_role',
    data: {
        group: demoGroupBackofficeId,
        role: backofficeRoleRef,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_user_role_student'],
    table: 'sys_user_has_role',
    data: {
        user: demoUserStudentId,
        role: studentRoleRef,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_user_role_student_2'],
    table: 'sys_user_has_role',
    data: {
        user: demoUserStudent2Id,
        role: studentRoleRef,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_user_role_instructor'],
    table: 'sys_user_has_role',
    data: {
        user: demoUserInstructorId,
        role: instructorRoleRef,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_user_role_backoffice'],
    table: 'sys_user_has_role',
    data: {
        user: demoUserBackofficeId,
        role: backofficeRoleRef,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_user_role_manager'],
    table: 'sys_user_has_role',
    data: {
        user: demoUserManagerId,
        role: managerRoleRef,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_user_role_scoped_admin'],
    table: 'sys_user_has_role',
    data: {
        user: demoUserScopedAdminId,
        role: scopedAdminRoleRef,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_pref_student_home'],
    table: 'sys_user_preference',
    data: {
        user: demoUserStudentId,
        name: 'my_home_navigation_page',
        type: 'string',
        value: '/now/sow/home',
        system: false,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_pref_student_2_home'],
    table: 'sys_user_preference',
    data: {
        user: demoUserStudent2Id,
        name: 'my_home_navigation_page',
        type: 'string',
        value: '/now/sow/home',
        system: false,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_pref_instructor_home'],
    table: 'sys_user_preference',
    data: {
        user: demoUserInstructorId,
        name: 'my_home_navigation_page',
        type: 'string',
        value: '/now/sow/home',
        system: false,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_pref_backoffice_home'],
    table: 'sys_user_preference',
    data: {
        user: demoUserBackofficeId,
        name: 'my_home_navigation_page',
        type: 'string',
        value: '/now/sow/home',
        system: false,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_pref_manager_home'],
    table: 'sys_user_preference',
    data: {
        user: demoUserManagerId,
        name: 'my_home_navigation_page',
        type: 'string',
        value: '/now/sow/home',
        system: false,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_pref_scoped_admin_home'],
    table: 'sys_user_preference',
    data: {
        user: demoUserScopedAdminId,
        name: 'my_home_navigation_page',
        type: 'string',
        value: '/now/sow/home',
        system: false,
    },
})

Record({
    $id: demoStudentProfileId,
    table: 'x_783010_tocc_a1_student',
    data: {
        user: demoUserStudentId,
        active: true,
    },
})

Record({
    $id: demoStudentProfile2Id,
    table: 'x_783010_tocc_a1_student',
    data: {
        user: demoUserStudent2Id,
        active: true,
    },
})

Record({
    $id: demoRoomId,
    table: 'x_783010_tocc_a1_room',
    data: {
        room_name: 'TOCC Demo Room',
        room_code: 'TOCC-DEMO-ROOM-01',
        capacity: 30,
        room_type: 'classroom',
        status: 'active',
    },
})

Record({
    $id: demoRoomResourceId,
    table: 'x_783010_tocc_a1_room_resource',
    data: {
        room: demoRoomId,
        resource_name: 'Projector - Demo Unit',
        resource_type: 'projector',
        quantity: 1,
        active: true,
    },
})

Record({
    $id: demoCourseId,
    table: 'x_783010_tocc_a1_course',
    data: {
        course_id: 'TOCC-DEMO-101',
        course_name: 'TOCC Demo Course',
        description: 'Seeded course for portal and workspace smoke tests.',
        duration_hours: 8,
        delivery_category: 'vilt',
        status: 'active',
    },
})

Record({
    $id: demoSessionId,
    table: 'x_783010_tocc_a1_training_session',
    data: {
        short_description: 'TOCC Demo Session',
        course: demoCourseId,
        room: demoRoomId,
        title: 'TOCC Demo Session - Foundations',
        instructor: demoUserInstructorId,
        start_datetime: '2026-06-20 09:00:00',
        end_datetime: '2026-06-20 17:00:00',
        total_seats: 30,
        available_seats: 29,
        enrollment_deadline: '2026-06-19 18:00:00',
        confirmation_deadline: '2026-06-20 07:00:00',
        status: 'open',
        active: true,
    },
})

Record({
    $id: demoReservationId,
    table: 'x_783010_tocc_a1_room_reservation',
    data: {
        short_description: 'TOCC Demo Reservation',
        course: demoCourseId,
        instructor: demoUserInstructorId,
        room: demoRoomId,
        training_session: demoSessionId,
        start_datetime: '2026-06-20 09:00:00',
        end_datetime: '2026-06-20 17:00:00',
        expected_participants: 25,
        status: 'submitted',
        active: true,
    },
})

Record({
    $id: demoEnrollmentApprovedId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Approved)',
        student: demoStudentProfileId,
        training_session: demoSessionId,
        status: 'approved',
        confirmed: false,
        active: true,
    },
})

Record({
    $id: demoEnrollmentPendingId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Pending)',
        student: demoStudentProfile2Id,
        training_session: demoSessionId,
        status: 'pending',
        confirmed: false,
        active: true,
    },
})

Record({
    $id: demoAttendanceId,
    table: 'x_783010_tocc_a1_attendance',
    data: {
        short_description: 'TOCC Demo Attendance',
        enrollment: demoEnrollmentApprovedId,
        training_session: demoSessionId,
        attendance_status: 'pending',
        recorded_by: demoUserInstructorId,
        active: true,
    },
})
