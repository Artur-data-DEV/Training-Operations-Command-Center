import { Dashboard } from '@servicenow/sdk/core'
import { toccBackofficeWorkspace } from '../workspace/backoffice-workspace.now'

Dashboard({
    $id: Now.ID['x_783010_tocc_a1_dashboard_training_operations_performance'],
    name: 'Training Operations Performance Dashboard',
    active: true,
    visibilities: [
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_visibility_backoffice_workspace'],
            experience: toccBackofficeWorkspace,
        },
    ],
    tabs: [
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_tab_exec_summary'],
            name: 'Executive Summary',
            widgets: [
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_fill_rate'],
                    component: 'single-score',
                    componentProps: {
                        headerTitle: 'Pending Reservations',
                        description: 'Reservations awaiting backoffice approval.',
                        dataSources: [
                            {
                                label: 'Room Reservation',
                                sourceType: 'table',
                                tableOrViewName: 'x_783010_tocc_a1_room_reservation',
                                filterQuery: 'status=submitted',
                                id: 'tocc_pending_reservations_ds',
                                dataCategories: ['simple'],
                            },
                        ],
                        metrics: [
                            {
                                dataSource: 'tocc_pending_reservations_ds',
                                id: 'tocc_pending_reservations_count',
                                aggregateFunction: 'COUNT',
                                axisId: 'primary',
                            },
                        ],
                    },
                    height: 8,
                    width: 6,
                    position: { x: 0, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_no_show'],
                    component: 'single-score',
                    componentProps: {
                        headerTitle: 'Sessions Today',
                        description: 'Open, full, or in-progress sessions scheduled for today.',
                        dataSources: [
                            {
                                label: 'Training Session',
                                sourceType: 'table',
                                tableOrViewName: 'x_783010_tocc_a1_training_session',
                                filterQuery:
                                    'start_datetimeONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^statusINopen,full,in_progress',
                                id: 'tocc_sessions_today_ds',
                                dataCategories: ['simple'],
                            },
                        ],
                        metrics: [
                            {
                                dataSource: 'tocc_sessions_today_ds',
                                id: 'tocc_sessions_today_count',
                                aggregateFunction: 'COUNT',
                                axisId: 'primary',
                            },
                        ],
                    },
                    height: 8,
                    width: 6,
                    position: { x: 6, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_confirmation_rate'],
                    component: 'single-score',
                    componentProps: {
                        headerTitle: 'Pending Enrollments',
                        description: 'Enrollment requests awaiting approval.',
                        dataSources: [
                            {
                                label: 'Student Enrollment',
                                sourceType: 'table',
                                tableOrViewName: 'x_783010_tocc_a1_student_enrollment',
                                filterQuery: 'status=pending',
                                id: 'tocc_pending_enrollments_ds',
                                dataCategories: ['simple'],
                            },
                        ],
                        metrics: [
                            {
                                dataSource: 'tocc_pending_enrollments_ds',
                                id: 'tocc_pending_enrollments_count',
                                aggregateFunction: 'COUNT',
                                axisId: 'primary',
                            },
                        ],
                    },
                    height: 8,
                    width: 6,
                    position: { x: 0, y: 8 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_reservation_approval_time'],
                    component: 'single-score',
                    componentProps: {
                        headerTitle: 'Resources Missing CMDB CI',
                        description: 'Active room resources that still need CMDB linkage.',
                        dataSources: [
                            {
                                label: 'Room Resource',
                                sourceType: 'table',
                                tableOrViewName: 'x_783010_tocc_a1_room_resource',
                                filterQuery: 'active=true^ci_referenceISEMPTY',
                                id: 'tocc_resources_missing_ci_ds',
                                dataCategories: ['simple'],
                            },
                        ],
                        metrics: [
                            {
                                dataSource: 'tocc_resources_missing_ci_ds',
                                id: 'tocc_resources_missing_ci_count',
                                aggregateFunction: 'COUNT',
                                axisId: 'primary',
                            },
                        ],
                    },
                    height: 8,
                    width: 6,
                    position: { x: 6, y: 8 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_sessions_by_status'],
                    component: 'donut',
                    componentProps: {
                        headerTitle: 'Sessions by Status',
                        dataSources: [
                            {
                                label: 'Training Session',
                                sourceType: 'table',
                                tableOrViewName: 'x_783010_tocc_a1_training_session',
                                filterQuery: '',
                                id: 'tocc_sessions_status_ds',
                                dataCategories: ['group'],
                            },
                        ],
                        metrics: [
                            {
                                dataSource: 'tocc_sessions_status_ds',
                                id: 'tocc_sessions_status_count',
                                aggregateFunction: 'COUNT',
                                axisId: 'primary',
                            },
                        ],
                        groupBy: [
                            {
                                groupBy: [{ dataSource: 'tocc_sessions_status_ds', groupByField: 'status' }],
                                maxNumberOfGroups: 'ALL',
                                showOthers: false,
                            },
                        ],
                        sortBy: 'value',
                    },
                    height: 10,
                    width: 6,
                    position: { x: 0, y: 16 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_reservations_by_status'],
                    component: 'vertical-bar',
                    componentProps: {
                        headerTitle: 'Reservations by Status',
                        dataSources: [
                            {
                                label: 'Room Reservation',
                                sourceType: 'table',
                                tableOrViewName: 'x_783010_tocc_a1_room_reservation',
                                filterQuery: '',
                                id: 'tocc_reservations_status_ds',
                                dataCategories: ['group'],
                            },
                        ],
                        metrics: [
                            {
                                dataSource: 'tocc_reservations_status_ds',
                                id: 'tocc_reservations_status_count',
                                aggregateFunction: 'COUNT',
                                axisId: 'primary',
                            },
                        ],
                        groupBy: [
                            {
                                groupBy: [{ dataSource: 'tocc_reservations_status_ds', groupByField: 'status' }],
                                maxNumberOfGroups: 'ALL',
                                showOthers: false,
                            },
                        ],
                        sortBy: 'value',
                    },
                    height: 10,
                    width: 6,
                    position: { x: 6, y: 16 },
                },
            ],
        },
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_tab_operational_intelligence'],
            name: 'Operational Intelligence',
            widgets: [
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_most_used_rooms'],
                    component: 'list',
                    componentProps: {
                        title: 'Latest KPI Snapshot',
                        table: 'x_783010_tocc_a1_kpi_snapshot',
                        encodedQuery: 'active=true',
                        fields: ['kpi_label', 'kpi_value', 'kpi_unit', 'kpi_category', 'snapshot_date'],
                        orderBy: 'kpi_category,kpi_label',
                        limit: 10,
                    },
                    height: 10,
                    width: 12,
                    position: { x: 0, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_most_requested_resources'],
                    component: 'horizontal-bar',
                    componentProps: {
                        title: 'Most Requested Resources',
                        table: 'x_783010_tocc_a1_reservation_resource',
                        groupBy: 'resource_name',
                        aggregation: 'count',
                        limit: 10,
                    },
                    height: 10,
                    width: 12,
                    position: { x: 0, y: 10 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_feedback_avg_rating'],
                    component: 'vertical-bar',
                    componentProps: {
                        title: 'Attendance by Status',
                        table: 'x_783010_tocc_a1_attendance',
                        groupBy: 'attendance_status',
                        aggregation: 'count',
                    },
                    height: 8,
                    width: 12,
                    position: { x: 0, y: 20 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_kb_article_views'],
                    component: 'list',
                    componentProps: {
                        title: 'Course Catalog Readiness',
                        table: 'x_783010_tocc_a1_course',
                        encodedQuery: 'statusISNOTEMPTY',
                        fields: ['course_id', 'course_name', 'owner', 'duration_hours', 'delivery_category', 'status'],
                        orderBy: 'course_name',
                        limit: 10,
                    },
                    height: 8,
                    width: 12,
                    position: { x: 0, y: 28 },
                },
            ],
        },
    ],
    permissions: [
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_perm_manager'],
            role: 'x_783010_tocc_a1.manager',
            canRead: true,
        },
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_perm_backoffice'],
            role: 'x_783010_tocc_a1.backoffice',
            canRead: true,
        },
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_perm_admin_owner'],
            role: 'x_783010_tocc_a1.admin',
            canRead: true,
            canWrite: true,
            canShare: true,
            owner: true,
        },
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_perm_global_admin'],
            role: 'admin',
            canRead: true,
            canWrite: true,
            canShare: true,
        },
    ],
})
