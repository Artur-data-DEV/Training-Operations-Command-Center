import { Acl } from '@servicenow/sdk/core'
import { toccAdminRole, toccBackofficeRole, toccInstructorRole, toccManagerRole, toccStudentRole } from './roles.now'

const allRoles = [
    toccAdminRole.name,
    toccBackofficeRole.name,
    toccManagerRole.name,
    toccInstructorRole.name,
    toccStudentRole.name,
    'snc_internal'
]

// ---------------------------------------------------------------------------
// TOCC MINIMAL OOB SECURITY MODEL
// ---------------------------------------------------------------------------

// 1. SIMPLE TABLE READ ACCESS
const tables = [
    'x_783010_tocc_a1_room',
    'x_783010_tocc_a1_course',
    'x_783010_tocc_a1_training_session',
    'x_783010_tocc_a1_room_reservation',
    'x_783010_tocc_a1_student_enrollment',
    'x_783010_tocc_a1_student',
    'x_783010_tocc_a1_attendance',
    'x_783010_tocc_a1_training_feedback'
]

tables.forEach(table => {
    // Table level
    Acl({
        $id: Now.ID[`read_${table}`],
        type: 'record',
        table: table,
        operation: 'read',
        roles: allRoles,
        decisionType: 'allow'
    });
    // Field level (*)
    Acl({
        $id: Now.ID[`read_${table}_fields`],
        type: 'record',
        table: `${table}.*`,
        operation: 'read',
        roles: allRoles,
        decisionType: 'allow'
    });
});

// 2. EXECUTION ACCESS FOR THE REACT COMPONENT BACKEND
Acl({
    $id: Now.ID['exec_portal_api_minimal'],
    type: 'client_callable_script_include',
    name: 'x_783010_tocc_a1.PortalApiService',
    operation: 'execute',
    roles: allRoles,
    decisionType: 'allow',
    active: true,
})
