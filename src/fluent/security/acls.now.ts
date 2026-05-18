import { Acl } from '@servicenow/sdk/core'
import { toccAdminRole, toccBackofficeRole, toccInstructorRole, toccManagerRole, toccStudentRole } from './roles.now'

const roleStudent = toccStudentRole
const roleInstructor = toccInstructorRole
const roleBackoffice = toccBackofficeRole
const roleManager = toccManagerRole
const roleAppAdmin = toccAdminRole
const rolePlatformAdmin = 'admin'
const roleInternal = 'snc_internal'

const rolesReadAll = [
    roleStudent,
    roleInstructor,
    roleBackoffice,
    roleManager,
    roleAppAdmin,
    rolePlatformAdmin,
    roleInternal,
]

const rolesAdminOnly = [roleAppAdmin, rolePlatformAdmin]
const rolesBackofficeAndAdmin = [roleBackoffice, roleAppAdmin, rolePlatformAdmin]
const rolesInstructorBackofficeAndAdmin = [roleInstructor, roleBackoffice, roleAppAdmin, rolePlatformAdmin]
const rolesStudentBackofficeAndAdmin = [roleStudent, roleBackoffice, roleAppAdmin, rolePlatformAdmin]
const rolesInstructorBackofficeStudentAndAdmin = [
    roleInstructor,
    roleBackoffice,
    roleStudent,
    roleAppAdmin,
    rolePlatformAdmin,
]
const rolesConfigRead = [roleBackoffice, roleManager, roleAppAdmin, rolePlatformAdmin, roleInternal]
const rolesWorkspaceRoute = [roleBackoffice, roleManager, roleAppAdmin, rolePlatformAdmin, roleInternal]

// x_783010_tocc_a1_room
Acl({ $id: Now.ID['read_x_783010_tocc_a1_room'], type: 'record', table: 'x_783010_tocc_a1_room', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_room_fields'], type: 'record', table: 'x_783010_tocc_a1_room.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_room'], type: 'record', table: 'x_783010_tocc_a1_room', operation: 'create', roles: rolesBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_room'], type: 'record', table: 'x_783010_tocc_a1_room', operation: 'write', roles: rolesBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_room'], type: 'record', table: 'x_783010_tocc_a1_room', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_course
Acl({ $id: Now.ID['read_x_783010_tocc_a1_course'], type: 'record', table: 'x_783010_tocc_a1_course', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_course_fields'], type: 'record', table: 'x_783010_tocc_a1_course.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_course'], type: 'record', table: 'x_783010_tocc_a1_course', operation: 'create', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_course'], type: 'record', table: 'x_783010_tocc_a1_course', operation: 'write', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_course'], type: 'record', table: 'x_783010_tocc_a1_course', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_room_resource
Acl({ $id: Now.ID['read_x_783010_tocc_a1_room_resource'], type: 'record', table: 'x_783010_tocc_a1_room_resource', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_room_resource_fields'], type: 'record', table: 'x_783010_tocc_a1_room_resource.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_room_resource'], type: 'record', table: 'x_783010_tocc_a1_room_resource', operation: 'create', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_room_resource'], type: 'record', table: 'x_783010_tocc_a1_room_resource', operation: 'write', roles: rolesBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_room_resource'], type: 'record', table: 'x_783010_tocc_a1_room_resource', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_reservation_resource
Acl({ $id: Now.ID['read_x_783010_tocc_a1_reservation_resource'], type: 'record', table: 'x_783010_tocc_a1_reservation_resource', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_reservation_resource_fields'], type: 'record', table: 'x_783010_tocc_a1_reservation_resource.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_reservation_resource'], type: 'record', table: 'x_783010_tocc_a1_reservation_resource', operation: 'create', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_reservation_resource'], type: 'record', table: 'x_783010_tocc_a1_reservation_resource', operation: 'write', roles: rolesBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_reservation_resource'], type: 'record', table: 'x_783010_tocc_a1_reservation_resource', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_room_reservation
Acl({ $id: Now.ID['read_x_783010_tocc_a1_room_reservation'], type: 'record', table: 'x_783010_tocc_a1_room_reservation', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_room_reservation_fields'], type: 'record', table: 'x_783010_tocc_a1_room_reservation.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_room_reservation'], type: 'record', table: 'x_783010_tocc_a1_room_reservation', operation: 'create', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_room_reservation'], type: 'record', table: 'x_783010_tocc_a1_room_reservation', operation: 'write', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_room_reservation'], type: 'record', table: 'x_783010_tocc_a1_room_reservation', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_training_session
Acl({ $id: Now.ID['read_x_783010_tocc_a1_training_session'], type: 'record', table: 'x_783010_tocc_a1_training_session', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_training_session_fields'], type: 'record', table: 'x_783010_tocc_a1_training_session.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_training_session'], type: 'record', table: 'x_783010_tocc_a1_training_session', operation: 'create', roles: rolesBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_training_session'], type: 'record', table: 'x_783010_tocc_a1_training_session', operation: 'write', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_training_session'], type: 'record', table: 'x_783010_tocc_a1_training_session', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_student
Acl({ $id: Now.ID['read_x_783010_tocc_a1_student'], type: 'record', table: 'x_783010_tocc_a1_student', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_student_fields'], type: 'record', table: 'x_783010_tocc_a1_student.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_student'], type: 'record', table: 'x_783010_tocc_a1_student', operation: 'create', roles: rolesBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_student'], type: 'record', table: 'x_783010_tocc_a1_student', operation: 'write', roles: rolesBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_student'], type: 'record', table: 'x_783010_tocc_a1_student', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_student_enrollment
Acl({ $id: Now.ID['read_x_783010_tocc_a1_student_enrollment'], type: 'record', table: 'x_783010_tocc_a1_student_enrollment', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_student_enrollment_fields'], type: 'record', table: 'x_783010_tocc_a1_student_enrollment.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_student_enrollment'], type: 'record', table: 'x_783010_tocc_a1_student_enrollment', operation: 'create', roles: rolesStudentBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_student_enrollment'], type: 'record', table: 'x_783010_tocc_a1_student_enrollment', operation: 'write', roles: rolesInstructorBackofficeStudentAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_student_enrollment'], type: 'record', table: 'x_783010_tocc_a1_student_enrollment', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_attendance
Acl({ $id: Now.ID['read_x_783010_tocc_a1_attendance'], type: 'record', table: 'x_783010_tocc_a1_attendance', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_attendance_fields'], type: 'record', table: 'x_783010_tocc_a1_attendance.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_attendance'], type: 'record', table: 'x_783010_tocc_a1_attendance', operation: 'create', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_attendance'], type: 'record', table: 'x_783010_tocc_a1_attendance', operation: 'write', roles: rolesInstructorBackofficeAndAdmin, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_attendance'], type: 'record', table: 'x_783010_tocc_a1_attendance', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_training_feedback
Acl({ $id: Now.ID['read_x_783010_tocc_a1_training_feedback'], type: 'record', table: 'x_783010_tocc_a1_training_feedback', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_training_feedback_fields'], type: 'record', table: 'x_783010_tocc_a1_training_feedback.*', operation: 'read', roles: rolesReadAll, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_training_feedback'], type: 'record', table: 'x_783010_tocc_a1_training_feedback', operation: 'create', roles: [roleStudent, roleAppAdmin, rolePlatformAdmin], decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_training_feedback'], type: 'record', table: 'x_783010_tocc_a1_training_feedback', operation: 'write', roles: rolesAdminOnly, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_training_feedback'], type: 'record', table: 'x_783010_tocc_a1_training_feedback', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_training_config
Acl({ $id: Now.ID['read_x_783010_tocc_a1_training_config'], type: 'record', table: 'x_783010_tocc_a1_training_config', operation: 'read', roles: rolesConfigRead, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_training_config_fields'], type: 'record', table: 'x_783010_tocc_a1_training_config.*', operation: 'read', roles: rolesConfigRead, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_training_config'], type: 'record', table: 'x_783010_tocc_a1_training_config', operation: 'create', roles: rolesAdminOnly, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_training_config'], type: 'record', table: 'x_783010_tocc_a1_training_config', operation: 'write', roles: rolesAdminOnly, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_training_config'], type: 'record', table: 'x_783010_tocc_a1_training_config', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// x_783010_tocc_a1_kpi_snapshot
Acl({ $id: Now.ID['read_x_783010_tocc_a1_kpi_snapshot'], type: 'record', table: 'x_783010_tocc_a1_kpi_snapshot', operation: 'read', roles: rolesConfigRead, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['read_x_783010_tocc_a1_kpi_snapshot_fields'], type: 'record', table: 'x_783010_tocc_a1_kpi_snapshot.*', operation: 'read', roles: rolesConfigRead, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['create_x_783010_tocc_a1_kpi_snapshot'], type: 'record', table: 'x_783010_tocc_a1_kpi_snapshot', operation: 'create', roles: rolesAdminOnly, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['write_x_783010_tocc_a1_kpi_snapshot'], type: 'record', table: 'x_783010_tocc_a1_kpi_snapshot', operation: 'write', roles: rolesAdminOnly, decisionType: 'allow', active: true })
Acl({ $id: Now.ID['delete_x_783010_tocc_a1_kpi_snapshot'], type: 'record', table: 'x_783010_tocc_a1_kpi_snapshot', operation: 'delete', roles: rolesAdminOnly, decisionType: 'allow', active: true })

// Client-callable Script Includes
Acl({
    $id: Now.ID['exec_portal_api_service'],
    type: 'client_callable_script_include',
    name: 'x_783010_tocc_a1.PortalApiService',
    operation: 'execute',
    roles: rolesReadAll,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['exec_training_context_ajax'],
    type: 'client_callable_script_include',
    name: 'x_783010_tocc_a1.TrainingContextAjax',
    operation: 'execute',
    roles: rolesReadAll,
    decisionType: 'allow',
    active: true,
})

// Workspace route ACL (required by Workspace API for path-based access control)
Acl({
    $id: Now.ID['read_workspace_route_tocc_backoffice_ops'],
    type: 'ux_route',
    name: 'tocc-backoffice-ops.*',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

// Compatibility alias for instances evaluating route name with `now.` prefix
Acl({
    $id: Now.ID['read_workspace_route_tocc_backoffice_ops_now_alias'],
    type: 'ux_route',
    name: 'now.tocc-backoffice-ops.*',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['read_workspace_route_tocc_backoffice_ops_x_scope'],
    type: 'ux_route',
    name: 'x.783010.tocc-backoffice-ops.*',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['execute_workspace_route_tocc_backoffice_ops'],
    type: 'ux_route',
    name: 'tocc-backoffice-ops.*',
    operation: 'execute',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['execute_workspace_route_tocc_backoffice_ops_now_alias'],
    type: 'ux_route',
    name: 'now.tocc-backoffice-ops.*',
    operation: 'execute',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['execute_workspace_route_tocc_backoffice_ops_x_scope'],
    type: 'ux_route',
    name: 'x.783010.tocc-backoffice-ops.*',
    operation: 'execute',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['read_workspace_page_tocc_backoffice_ops'],
    type: 'ux_page',
    name: 'tocc-backoffice-ops.*',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['read_workspace_route_tocc_backoffice_ops_slash'],
    type: 'ux_route',
    name: 'x/783010/tocc-backoffice-ops/*',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['execute_workspace_route_tocc_backoffice_ops_slash'],
    type: 'ux_route',
    name: 'x/783010/tocc-backoffice-ops/*',
    operation: 'execute',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

// Explicit list-route aliases used by some instances/navigation entries.
Acl({
    $id: Now.ID['read_workspace_route_tocc_backoffice_ops_list'],
    type: 'ux_route',
    name: 'tocc-backoffice-ops/list',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['execute_workspace_route_tocc_backoffice_ops_list'],
    type: 'ux_route',
    name: 'tocc-backoffice-ops/list',
    operation: 'execute',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['read_workspace_route_tocc_backoffice_ops_scoped_list'],
    type: 'ux_route',
    name: 'x/783010/tocc-backoffice-ops/list',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['execute_workspace_route_tocc_backoffice_ops_scoped_list'],
    type: 'ux_route',
    name: 'x/783010/tocc-backoffice-ops/list',
    operation: 'execute',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['read_workspace_route_tocc_backoffice_ops_scoped_list_slash_prefix'],
    type: 'ux_route',
    name: '/x/783010/tocc-backoffice-ops/list',
    operation: 'read',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})

Acl({
    $id: Now.ID['execute_workspace_route_tocc_backoffice_ops_scoped_list_slash_prefix'],
    type: 'ux_route',
    name: '/x/783010/tocc-backoffice-ops/list',
    operation: 'execute',
    roles: rolesWorkspaceRoute,
    decisionType: 'allow',
    active: true,
})


