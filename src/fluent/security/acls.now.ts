import { Acl } from '@servicenow/sdk/core'
import { toccAdminRole, toccBackofficeRole, toccInstructorRole, toccManagerRole, toccStudentRole } from './roles.now'

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_room_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_course_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_course_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_course_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_course_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_course_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_resource_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_resource',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_resource_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_resource',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_resource_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_resource',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_resource_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_resource',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_room_resource_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_resource',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_reservation_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_reservation_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_reservation_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_room_reservation_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_room_reservation_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_reservation_resource_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_reservation_resource',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_reservation_resource_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_reservation_resource',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_reservation_resource_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_reservation_resource',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_reservation_resource_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_reservation_resource',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_reservation_resource_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_reservation_resource',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_session_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_session_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_session_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_session_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_training_session_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_student_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_enrollment_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_enrollment_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_enrollment_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_student_enrollment_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_student_enrollment_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_attendance_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_attendance',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_attendance_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_attendance',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_attendance_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_attendance',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_attendance_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_attendance',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_attendance_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_attendance',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_feedback_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_feedback_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_feedback_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_feedback_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_training_feedback_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_config_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_config',
    operation: 'create',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_config_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_config',
    operation: 'read',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_config_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_config',
    operation: 'write',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['admin_x_783010_tocc_a1_training_config_delete'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_config',
    operation: 'delete',
    roles: [toccAdminRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['manager_x_783010_tocc_a1_training_config_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_config',
    operation: 'read',
    roles: [toccManagerRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_room_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'read',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_room_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'read',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_room_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room',
    operation: 'read',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_course_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'read',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_course_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'read',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_course_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_course',
    operation: 'read',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_room_reservation_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'create',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_room_reservation_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'read',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_room_reservation_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'write',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_room_reservation_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'read',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_room_reservation_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_room_reservation',
    operation: 'write',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_training_session_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'read',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_training_session_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'read',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_training_session_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'write',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_training_session_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'read',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_training_session_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_session',
    operation: 'write',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_student_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'read',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_student_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'read',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_student_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_student',
    operation: 'write',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_student_enrollment_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'create',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_student_enrollment_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'read',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_student_enrollment_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'write',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_student_enrollment_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'read',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_student_enrollment_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'write',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_student_enrollment_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'read',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_student_enrollment_write'],
    type: 'record',
    table: 'x_783010_tocc_a1_student_enrollment',
    operation: 'write',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_training_feedback_create'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'create',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['student_x_783010_tocc_a1_training_feedback_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'read',
    roles: [toccStudentRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['instructor_x_783010_tocc_a1_training_feedback_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'read',
    roles: [toccInstructorRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['backoffice_x_783010_tocc_a1_training_feedback_read'],
    type: 'record',
    table: 'x_783010_tocc_a1_training_feedback',
    operation: 'read',
    roles: [toccBackofficeRole.name],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
})

Acl({
    $id: Now.ID['execute_x_783010_tocc_a1_training_context_ajax'],
    type: 'client_callable_script_include',
    name: 'x_783010_tocc_a1.TrainingContextAjax',
    operation: 'execute',
    roles: [
        toccAdminRole.name,
        toccBackofficeRole.name,
        toccInstructorRole.name,
        toccManagerRole.name,
        toccStudentRole.name,
    ],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
    active: true,
})


// PortalApiService — accessible to all app personas via Service Portal widgets.
Acl({
    $id: Now.ID['execute_x_783010_tocc_a1_portal_api_service'],
    type: 'client_callable_script_include',
    name: 'x_783010_tocc_a1.PortalApiService',
    operation: 'execute',
    roles: [
        toccAdminRole.name,
        toccBackofficeRole.name,
        toccInstructorRole.name,
        toccManagerRole.name,
        toccStudentRole.name,
    ],
    decisionType: 'allow',
    localOrExisting: 'Local',
    adminOverrides: true,
    active: true,
})
