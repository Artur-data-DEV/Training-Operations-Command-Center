import { UxListMenuConfig, Workspace } from '@servicenow/sdk/core'

const toccBackofficeListConfig = UxListMenuConfig({
    $id: Now.ID['x_783010_tocc_a1_workspace_backoffice_list_config'],
    name: 'TOCC Backoffice List Configuration',
    active: true,
    description: 'Primary list navigation for TOCC backoffice workspace.',
    categories: [
        {
            $id: Now.ID['x_783010_tocc_a1_workspace_category_reservations'],
            title: 'Reservations',
            order: 100,
            active: true,
            lists: [
                {
                    $id: Now.ID['x_783010_tocc_a1_workspace_list_reservations_submitted'],
                    title: 'Submitted Reservations',
                    order: 100,
                    table: 'x_783010_tocc_a1_room_reservation',
                    columns: 'number,status,course,instructor,room,start_datetime',
                    condition: 'status=submitted',
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_workspace_list_reservations_recent'],
                    title: 'Recent Reservations',
                    order: 200,
                    table: 'x_783010_tocc_a1_room_reservation',
                    columns: 'number,status,course,instructor,room,sys_updated_on',
                    condition: 'sys_updated_onONLast 30 days@javascript:gs.daysAgoStart(30)@javascript:gs.endOfToday()',
                },
            ],
        },
        {
            $id: Now.ID['x_783010_tocc_a1_workspace_category_sessions'],
            title: 'Training Sessions',
            order: 200,
            active: true,
            lists: [
                {
                    $id: Now.ID['x_783010_tocc_a1_workspace_list_sessions_open'],
                    title: 'Open Sessions',
                    order: 100,
                    table: 'x_783010_tocc_a1_training_session',
                    columns: 'number,status,title,room,instructor,start_datetime,available_seats',
                    condition: 'statusINopen,full',
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_workspace_list_sessions_today'],
                    title: 'Today Sessions',
                    order: 200,
                    table: 'x_783010_tocc_a1_training_session',
                    columns: 'number,status,title,room,instructor,start_datetime,end_datetime',
                    condition: 'start_datetimeONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()',
                },
            ],
        },
        {
            $id: Now.ID['x_783010_tocc_a1_workspace_category_enrollments'],
            title: 'Enrollments',
            order: 300,
            active: true,
            lists: [
                {
                    $id: Now.ID['x_783010_tocc_a1_workspace_list_enrollments_pending'],
                    title: 'Pending Enrollments',
                    order: 100,
                    table: 'x_783010_tocc_a1_student_enrollment',
                    columns: 'number,status,student,training_session,sys_created_on',
                    condition: 'status=pending',
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_workspace_list_enrollments_waitlisted'],
                    title: 'Waitlisted Enrollments',
                    order: 200,
                    table: 'x_783010_tocc_a1_student_enrollment',
                    columns: 'number,status,student,training_session,sys_created_on',
                    condition: 'status=waitlisted',
                },
            ],
        },
    ],
})

Workspace({
    $id: Now.ID['x_783010_tocc_a1_workspace_backoffice_operations'],
    title: 'TOCC Backoffice Operations Workspace',
    path: 'tocc-backoffice-ops',
    landingPath: 'home',
    order: 100,
    active: true,
    listConfig: toccBackofficeListConfig,
    tables: [
        'x_783010_tocc_a1_room_reservation',
        'x_783010_tocc_a1_training_session',
        'x_783010_tocc_a1_student_enrollment',
        'x_783010_tocc_a1_attendance',
    ],
})
