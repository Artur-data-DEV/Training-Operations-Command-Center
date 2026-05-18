import { Record } from '@servicenow/sdk/core'

const demoGroupBackofficeId = Now.ID['x_783010_tocc_a1_seed_group_backoffice']

const demoUserStudentId = Now.ID['x_783010_tocc_a1_seed_user_student']
const demoUserStudent2Id = Now.ID['x_783010_tocc_a1_seed_user_student_2']
const demoUserStudent3Id = Now.ID['x_783010_tocc_a1_seed_user_student_3']
const demoUserInstructorId = Now.ID['x_783010_tocc_a1_seed_user_instructor']
const demoUserBackofficeId = Now.ID['x_783010_tocc_a1_seed_user_backoffice']
const demoUserManagerId = Now.ID['x_783010_tocc_a1_seed_user_manager']
const demoUserScopedAdminId = Now.ID['x_783010_tocc_a1_seed_user_scoped_admin']

const demoStudentProfileId = Now.ID['x_783010_tocc_a1_seed_student_profile']
const demoStudentProfile2Id = Now.ID['x_783010_tocc_a1_seed_student_profile_2']
const demoStudentProfile3Id = Now.ID['x_783010_tocc_a1_seed_student_profile_3']

const demoRoomId = Now.ID['x_783010_tocc_a1_seed_room_001']
const demoRoom2Id = Now.ID['x_783010_tocc_a1_seed_room_002']
const demoRoom3Id = Now.ID['x_783010_tocc_a1_seed_room_003']
const demoLocationSaoPauloId = Now.ID['x_783010_tocc_a1_seed_location_sp_001']
const demoLocationRioId = Now.ID['x_783010_tocc_a1_seed_location_rj_001']
const demoLocationCampinasId = Now.ID['x_783010_tocc_a1_seed_location_cps_001']

const demoRoomResourceId = Now.ID['x_783010_tocc_a1_seed_room_resource_001']
const demoRoomResource2Id = Now.ID['x_783010_tocc_a1_seed_room_resource_002']
const demoRoomResource3Id = Now.ID['x_783010_tocc_a1_seed_room_resource_003']
const demoRoomResource4Id = Now.ID['x_783010_tocc_a1_seed_room_resource_004']

const demoCourseId = Now.ID['x_783010_tocc_a1_seed_course_001']
const demoCourse2Id = Now.ID['x_783010_tocc_a1_seed_course_002']
const demoCourse3Id = Now.ID['x_783010_tocc_a1_seed_course_003']

const demoSessionId = Now.ID['x_783010_tocc_a1_seed_session_001']
const demoSession2Id = Now.ID['x_783010_tocc_a1_seed_session_002']
const demoSession3Id = Now.ID['x_783010_tocc_a1_seed_session_003']
const demoSession4Id = Now.ID['x_783010_tocc_a1_seed_session_004']

const demoReservationId = Now.ID['x_783010_tocc_a1_seed_reservation_001']
const demoReservation2Id = Now.ID['x_783010_tocc_a1_seed_reservation_002']
const demoReservation3Id = Now.ID['x_783010_tocc_a1_seed_reservation_003']
const demoReservation4Id = Now.ID['x_783010_tocc_a1_seed_reservation_004']

const demoReservationResource1Id = Now.ID['x_783010_tocc_a1_seed_reservation_resource_001']
const demoReservationResource2Id = Now.ID['x_783010_tocc_a1_seed_reservation_resource_002']
const demoReservationResource3Id = Now.ID['x_783010_tocc_a1_seed_reservation_resource_003']

const demoEnrollmentApprovedId = Now.ID['x_783010_tocc_a1_seed_enrollment_approved_001']
const demoEnrollmentPendingId = Now.ID['x_783010_tocc_a1_seed_enrollment_pending_001']
const demoEnrollmentWaitlistedId = Now.ID['x_783010_tocc_a1_seed_enrollment_waitlisted_001']
const demoEnrollmentInProgressApprovedId = Now.ID['x_783010_tocc_a1_seed_enrollment_in_progress_approved_001']
const demoEnrollmentCancelledId = Now.ID['x_783010_tocc_a1_seed_enrollment_cancelled_001']
const demoEnrollmentCompletedApprovedId = Now.ID['x_783010_tocc_a1_seed_enrollment_completed_approved_001']

const demoAttendanceId = Now.ID['x_783010_tocc_a1_seed_attendance_001']
const demoAttendance2Id = Now.ID['x_783010_tocc_a1_seed_attendance_002']
const demoAttendance3Id = Now.ID['x_783010_tocc_a1_seed_attendance_003']

const demoFeedbackId = Now.ID['x_783010_tocc_a1_seed_feedback_001']

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
        user_password: 'Training2026!',
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
        user_password: 'Training2026!',
        active: true,
    },
})

Record({
    $id: demoUserStudent3Id,
    table: 'sys_user',
    data: {
        user_name: 'tocc.student3',
        first_name: 'TOCC',
        last_name: 'Student Three',
        email: 'tocc.student3@example.com',
        title: 'Training Student',
        time_zone: 'America/Sao_Paulo',
        user_password: 'Training2026!',
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
        user_password: 'Training2026!',
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
        user_password: 'Training2026!',
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
        user_password: 'Training2026!',
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
        user_password: 'Training2026!',
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
    $id: Now.ID['x_783010_tocc_a1_seed_user_role_student_3'],
    table: 'sys_user_has_role',
    data: {
        user: demoUserStudent3Id,
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
        value: '/tocc',
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
        value: '/tocc',
        system: false,
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_seed_pref_student_3_home'],
    table: 'sys_user_preference',
    data: {
        user: demoUserStudent3Id,
        name: 'my_home_navigation_page',
        type: 'string',
        value: '/tocc',
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
        value: '/tocc',
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
        value: '/tocc',
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
        value: '/tocc',
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
        value: '/tocc',
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
    $id: demoStudentProfile3Id,
    table: 'x_783010_tocc_a1_student',
    data: {
        user: demoUserStudent3Id,
        active: true,
    },
})

Record({
    $id: demoLocationSaoPauloId,
    table: 'cmn_location',
    data: {
        name: 'TOCC Campus - Sao Paulo',
        city: 'Sao Paulo',
        state: 'SP',
        country: 'BR',
        active: true,
    },
})

Record({
    $id: demoLocationRioId,
    table: 'cmn_location',
    data: {
        name: 'TOCC Campus - Rio de Janeiro',
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'BR',
        active: true,
    },
})

Record({
    $id: demoLocationCampinasId,
    table: 'cmn_location',
    data: {
        name: 'TOCC Campus - Campinas',
        city: 'Campinas',
        state: 'SP',
        country: 'BR',
        active: true,
    },
})

Record({
    $id: demoRoomId,
    table: 'x_783010_tocc_a1_room',
    data: {
        room_name: 'TOCC Demo Room',
        room_code: 'TOCC-DEMO-ROOM-01',
        location: demoLocationSaoPauloId,
        capacity: 30,
        room_type: 'classroom',
        status: 'active',
    },
})

Record({
    $id: demoRoom2Id,
    table: 'x_783010_tocc_a1_room',
    data: {
        room_name: 'TOCC Demo Lab',
        room_code: 'TOCC-DEMO-LAB-01',
        location: demoLocationRioId,
        capacity: 20,
        room_type: 'lab',
        status: 'active',
    },
})

Record({
    $id: demoRoom3Id,
    table: 'x_783010_tocc_a1_room',
    data: {
        room_name: 'TOCC Demo Auditorium',
        room_code: 'TOCC-DEMO-AUD-01',
        location: demoLocationCampinasId,
        capacity: 80,
        room_type: 'auditorium',
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
    $id: demoRoomResource2Id,
    table: 'x_783010_tocc_a1_room_resource',
    data: {
        room: demoRoom2Id,
        resource_name: 'Lab Workstations',
        resource_type: 'computer',
        quantity: 20,
        active: true,
    },
})

Record({
    $id: demoRoomResource3Id,
    table: 'x_783010_tocc_a1_room_resource',
    data: {
        room: demoRoom3Id,
        resource_name: 'PA System',
        resource_type: 'av',
        quantity: 1,
        active: true,
    },
})

Record({
    $id: demoRoomResource4Id,
    table: 'x_783010_tocc_a1_room_resource',
    data: {
        room: demoRoom3Id,
        resource_name: 'Wireless Microphones',
        resource_type: 'other',
        quantity: 6,
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
    $id: demoCourse2Id,
    table: 'x_783010_tocc_a1_course',
    data: {
        course_id: 'TOCC-DEMO-201',
        course_name: 'TOCC Lab Operations',
        description: 'Hands-on lab training for advanced operations workflows.',
        duration_hours: 6,
        delivery_category: 'in_person',
        status: 'active',
    },
})

Record({
    $id: demoCourse3Id,
    table: 'x_783010_tocc_a1_course',
    data: {
        course_id: 'TOCC-DEMO-301',
        course_name: 'TOCC Leadership Briefing',
        description: 'Executive and manager-focused overview of training KPIs.',
        duration_hours: 4,
        delivery_category: 'vilt',
        status: 'active',
    },
})

Record({
    $id: demoSessionId,
    table: 'x_783010_tocc_a1_training_session',
    data: {
        short_description: 'TOCC Demo Session - Open',
        course: demoCourseId,
        tocc_course: demoCourseId,
        room: demoRoomId,
        title: 'TOCC Demo Session - Foundations',
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        start_datetime: '2026-06-20 09:00:00',
        end_datetime: '2026-06-20 17:00:00',
        total_seats: 30,
        available_seats: 28,
        enrollment_deadline: '2026-06-19 18:00:00',
        confirmation_deadline: '2026-06-20 07:00:00',
        status: 'open',
        active: true,
    },
})

Record({
    $id: demoSession2Id,
    table: 'x_783010_tocc_a1_training_session',
    data: {
        short_description: 'TOCC Demo Session - Full',
        course: demoCourse2Id,
        tocc_course: demoCourse2Id,
        room: demoRoom2Id,
        title: 'TOCC Demo Session - Lab Intensive',
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        start_datetime: '2026-06-27 08:30:00',
        end_datetime: '2026-06-27 15:30:00',
        total_seats: 20,
        available_seats: 0,
        enrollment_deadline: '2026-06-26 17:00:00',
        confirmation_deadline: '2026-06-27 07:45:00',
        status: 'full',
        active: true,
    },
})

Record({
    $id: demoSession3Id,
    table: 'x_783010_tocc_a1_training_session',
    data: {
        short_description: 'TOCC Demo Session - In Progress',
        course: demoCourse3Id,
        tocc_course: demoCourse3Id,
        room: demoRoom3Id,
        title: 'TOCC Demo Session - Leadership Briefing Live',
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        start_datetime: '2026-05-15 09:00:00',
        end_datetime: '2026-05-15 13:00:00',
        total_seats: 15,
        available_seats: 14,
        enrollment_deadline: '2026-05-14 18:00:00',
        confirmation_deadline: '2026-05-15 08:30:00',
        status: 'in_progress',
        active: true,
    },
})

Record({
    $id: demoSession4Id,
    table: 'x_783010_tocc_a1_training_session',
    data: {
        short_description: 'TOCC Demo Session - Completed',
        course: demoCourseId,
        tocc_course: demoCourseId,
        room: demoRoom3Id,
        title: 'TOCC Demo Session - Completed Cohort',
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        start_datetime: '2026-04-20 09:00:00',
        end_datetime: '2026-04-20 17:00:00',
        total_seats: 25,
        available_seats: 22,
        enrollment_deadline: '2026-04-19 18:00:00',
        confirmation_deadline: '2026-04-20 08:00:00',
        status: 'completed',
        active: true,
    },
})

Record({
    $id: demoReservationId,
    table: 'x_783010_tocc_a1_room_reservation',
    data: {
        short_description: 'TOCC Demo Reservation - Submitted',
        course: demoCourseId,
        tocc_course: demoCourseId,
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        room: demoRoomId,
        tocc_room: demoRoomId,
        training_session: demoSessionId,
        start_datetime: '2026-06-20 09:00:00',
        end_datetime: '2026-06-20 17:00:00',
        expected_participants: 25,
        status: 'submitted',
        active: true,
    },
})

Record({
    $id: demoReservation2Id,
    table: 'x_783010_tocc_a1_room_reservation',
    data: {
        short_description: 'TOCC Demo Reservation - Approved (Full Session)',
        course: demoCourse2Id,
        tocc_course: demoCourse2Id,
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        room: demoRoom2Id,
        tocc_room: demoRoom2Id,
        training_session: demoSession2Id,
        start_datetime: '2026-06-27 08:30:00',
        end_datetime: '2026-06-27 15:30:00',
        expected_participants: 20,
        status: 'approved',
        active: true,
    },
})

Record({
    $id: demoReservation3Id,
    table: 'x_783010_tocc_a1_room_reservation',
    data: {
        short_description: 'TOCC Demo Reservation - Approved (In Progress)',
        course: demoCourse3Id,
        tocc_course: demoCourse3Id,
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        room: demoRoom3Id,
        tocc_room: demoRoom3Id,
        training_session: demoSession3Id,
        start_datetime: '2026-05-15 09:00:00',
        end_datetime: '2026-05-15 13:00:00',
        expected_participants: 12,
        status: 'approved',
        active: true,
    },
})

Record({
    $id: demoReservation4Id,
    table: 'x_783010_tocc_a1_room_reservation',
    data: {
        short_description: 'TOCC Demo Reservation - Rejected',
        course: demoCourseId,
        tocc_course: demoCourseId,
        instructor: demoUserInstructorId,
        tocc_instructor: demoUserInstructorId,
        room: demoRoom3Id,
        tocc_room: demoRoom3Id,
        training_session: demoSession4Id,
        start_datetime: '2026-04-20 09:00:00',
        end_datetime: '2026-04-20 17:00:00',
        expected_participants: 24,
        status: 'rejected',
        active: true,
    },
})

Record({
    $id: demoReservationResource1Id,
    table: 'x_783010_tocc_a1_reservation_resource',
    data: {
        reservation: demoReservationId,
        room_resource: demoRoomResourceId,
        resource_name: 'Projector - Demo Unit',
        quantity: 1,
    },
})

Record({
    $id: demoReservationResource2Id,
    table: 'x_783010_tocc_a1_reservation_resource',
    data: {
        reservation: demoReservation2Id,
        room_resource: demoRoomResource2Id,
        resource_name: 'Lab Workstations',
        quantity: 20,
    },
})

Record({
    $id: demoReservationResource3Id,
    table: 'x_783010_tocc_a1_reservation_resource',
    data: {
        reservation: demoReservation3Id,
        room_resource: demoRoomResource4Id,
        resource_name: 'Wireless Microphones',
        quantity: 4,
    },
})

Record({
    $id: demoEnrollmentApprovedId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Approved - Open Session)',
        student: demoStudentProfileId,
        tocc_student: demoStudentProfileId,
        training_session: demoSessionId,
        tocc_training_session: demoSessionId,
        status: 'approved',
        confirmed: false,
        active: true,
    },
})

Record({
    $id: demoEnrollmentPendingId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Pending Review)',
        student: demoStudentProfile2Id,
        tocc_student: demoStudentProfile2Id,
        training_session: demoSessionId,
        tocc_training_session: demoSessionId,
        status: 'pending',
        confirmed: false,
        active: true,
    },
})

Record({
    $id: demoEnrollmentWaitlistedId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Waitlisted - Full Session)',
        student: demoStudentProfile2Id,
        tocc_student: demoStudentProfile2Id,
        training_session: demoSession2Id,
        tocc_training_session: demoSession2Id,
        status: 'waitlisted',
        confirmed: false,
        active: true,
    },
})

Record({
    $id: demoEnrollmentInProgressApprovedId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Approved - In Progress)',
        student: demoStudentProfile3Id,
        tocc_student: demoStudentProfile3Id,
        training_session: demoSession3Id,
        tocc_training_session: demoSession3Id,
        status: 'approved',
        confirmed: true,
        check_in_datetime: '2026-05-15 09:05:00',
        active: true,
    },
})

Record({
    $id: demoEnrollmentCancelledId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Cancelled)',
        student: demoStudentProfile3Id,
        tocc_student: demoStudentProfile3Id,
        training_session: demoSessionId,
        tocc_training_session: demoSessionId,
        status: 'cancelled',
        confirmed: false,
        active: true,
    },
})

Record({
    $id: demoEnrollmentCompletedApprovedId,
    table: 'x_783010_tocc_a1_student_enrollment',
    data: {
        short_description: 'TOCC Demo Enrollment (Approved - Completed Session)',
        student: demoStudentProfileId,
        tocc_student: demoStudentProfileId,
        training_session: demoSession4Id,
        tocc_training_session: demoSession4Id,
        status: 'approved',
        confirmed: true,
        check_in_datetime: '2026-04-20 08:55:00',
        active: true,
    },
})

Record({
    $id: demoAttendanceId,
    table: 'x_783010_tocc_a1_attendance',
    data: {
        short_description: 'TOCC Demo Attendance (Pending)',
        enrollment: demoEnrollmentApprovedId,
        training_session: demoSessionId,
        attendance_status: 'pending',
        recorded_by: demoUserInstructorId,
        active: true,
    },
})

Record({
    $id: demoAttendance2Id,
    table: 'x_783010_tocc_a1_attendance',
    data: {
        short_description: 'TOCC Demo Attendance (Present In Progress)',
        enrollment: demoEnrollmentInProgressApprovedId,
        training_session: demoSession3Id,
        attendance_status: 'present',
        checked_by: demoUserInstructorId,
        checked_in_datetime: '2026-05-15 09:06:00',
        recorded_by: demoUserInstructorId,
        recorded_at: '2026-05-15 09:07:00',
        active: true,
    },
})

Record({
    $id: demoAttendance3Id,
    table: 'x_783010_tocc_a1_attendance',
    data: {
        short_description: 'TOCC Demo Attendance (Present Completed)',
        enrollment: demoEnrollmentCompletedApprovedId,
        training_session: demoSession4Id,
        attendance_status: 'present',
        checked_by: demoUserInstructorId,
        checked_in_datetime: '2026-04-20 08:56:00',
        recorded_by: demoUserInstructorId,
        recorded_at: '2026-04-20 09:00:00',
        active: true,
    },
})

Record({
    $id: demoFeedbackId,
    table: 'x_783010_tocc_a1_training_feedback',
    data: {
        enrollment: demoEnrollmentCompletedApprovedId,
        rating: 5,
        comments: 'Excellent session quality and clear instruction.',
    },
})
