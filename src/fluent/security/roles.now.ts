import { Role } from '@servicenow/sdk/core'

export const toccStudentRole = Role({
    name: 'x_783010_tocc_a1.student',
    description: 'Student self-service access',
})

export const toccInstructorRole = Role({
    name: 'x_783010_tocc_a1.instructor',
    description: 'Instructor session management access',
})

export const toccBackofficeRole = Role({
    name: 'x_783010_tocc_a1.backoffice',
    description: 'Operations and approvals access',
    containsRoles: ['canvas_user'],
})

export const toccManagerRole = Role({
    name: 'x_783010_tocc_a1.manager',
    description: 'Read-only KPI and reporting access',
    containsRoles: ['canvas_user'],
})

export const toccAdminRole = Role({
    name: 'x_783010_tocc_a1.admin',
    description: 'Full administrative access',
    containsRoles: ['canvas_user'],
    scopedAdmin: true,
})
