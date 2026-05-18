import { ApplicationMenu, Record } from '@servicenow/sdk/core'

const toccNavigationMenu = ApplicationMenu({
    $id: Now.ID['x_783010_tocc_a1_app_menu_navigation'],
    title: 'Training Operations Command Center',
    name: 'x_783010_tocc_a1_tocc',
    active: true,
    order: 900,
    hint: 'Training Operations Command Center',
    description: 'Primary navigation modules for TOCC operations and self-service.',
    roles: [
        'snc_internal',
        'admin',
        'x_783010_tocc_a1.student',
        'x_783010_tocc_a1.instructor',
        'x_783010_tocc_a1.backoffice',
        'x_783010_tocc_a1.manager',
        'x_783010_tocc_a1.admin',
    ],
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_workspace_ops'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'Backoffice Workspace',
        link_type: 'DIRECT',
        query: '/now/tocc-backoffice-ops/list',
        order: 100,
        active: true,
        roles: ['snc_internal', 'admin', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.manager', 'x_783010_tocc_a1.admin'],
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_service_portal_home'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'TOCC Portal Home',
        link_type: 'DIRECT',
        query: '/tocc?id=tocc_home',
        order: 150,
        active: true,
        roles: [
            'snc_internal',
            'admin',
            'x_783010_tocc_a1.student',
            'x_783010_tocc_a1.instructor',
            'x_783010_tocc_a1.backoffice',
            'x_783010_tocc_a1.manager',
            'x_783010_tocc_a1.admin',
        ],
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_room_reservations'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'Room Reservations',
        link_type: 'LIST',
        name: 'x_783010_tocc_a1_room_reservation',
        order: 200,
        active: true,
        roles: ['snc_internal', 'admin', 'x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.manager', 'x_783010_tocc_a1.admin'],
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_training_sessions'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'Training Sessions',
        link_type: 'LIST',
        name: 'x_783010_tocc_a1_training_session',
        order: 300,
        active: true,
        roles: [
            'snc_internal',
            'admin',
            'x_783010_tocc_a1.student',
            'x_783010_tocc_a1.instructor',
            'x_783010_tocc_a1.backoffice',
            'x_783010_tocc_a1.manager',
            'x_783010_tocc_a1.admin',
        ],
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_student_enrollments'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'Student Enrollments',
        link_type: 'LIST',
        name: 'x_783010_tocc_a1_student_enrollment',
        order: 400,
        active: true,
        roles: ['snc_internal', 'admin', 'x_783010_tocc_a1.student', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.manager', 'x_783010_tocc_a1.admin'],
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_attendance'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'Attendance',
        link_type: 'LIST',
        name: 'x_783010_tocc_a1_attendance',
        order: 500,
        active: true,
        roles: ['snc_internal', 'admin', 'x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.manager', 'x_783010_tocc_a1.admin'],
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_rooms'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'Rooms',
        link_type: 'LIST',
        name: 'x_783010_tocc_a1_room',
        order: 600,
        active: true,
        roles: ['snc_internal', 'admin', 'x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.manager', 'x_783010_tocc_a1.admin'],
    },
})

Record({
    $id: Now.ID['x_783010_tocc_a1_app_module_room_resources'],
    table: 'sys_app_module',
    data: {
        application: toccNavigationMenu,
        title: 'Room Resources',
        link_type: 'LIST',
        name: 'x_783010_tocc_a1_room_resource',
        order: 700,
        active: true,
        roles: ['snc_internal', 'x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.backoffice', 'x_783010_tocc_a1.manager', 'x_783010_tocc_a1.admin'],
    },
})
