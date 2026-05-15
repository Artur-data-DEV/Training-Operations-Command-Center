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
                        title: 'Session Fill Rate',
                        table: 'x_783010_tocc_a1_training_session',
                        metric: 'avg_fill_rate',
                        description: 'Average percentage of occupied seats in completed sessions.',
                    },
                    height: 6,
                    width: 3,
                    position: { x: 0, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_no_show'],
                    component: 'single-score',
                    componentProps: {
                        title: 'No-Show Rate',
                        table: 'x_783010_tocc_a1_attendance',
                        metric: 'no_show_rate',
                        description: 'Percentage of no-show records in the selected period.',
                    },
                    height: 6,
                    width: 3,
                    position: { x: 3, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_confirmation_rate'],
                    component: 'single-score',
                    componentProps: {
                        title: 'Attendance Confirmation Rate',
                        table: 'x_783010_tocc_a1_student_enrollment',
                        metric: 'confirmation_rate',
                        description: 'Percentage of approved enrollments confirmed by students.',
                    },
                    height: 6,
                    width: 3,
                    position: { x: 6, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_reservation_approval_time'],
                    component: 'single-score',
                    componentProps: {
                        title: 'Avg Reservation Approval Time',
                        table: 'x_783010_tocc_a1_room_reservation',
                        metric: 'avg_reservation_approval_hours',
                        description: 'Average approval elapsed time for room reservations.',
                    },
                    height: 6,
                    width: 3,
                    position: { x: 9, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_sessions_by_status'],
                    component: 'donut',
                    componentProps: {
                        title: 'Sessions by Status',
                        table: 'x_783010_tocc_a1_training_session',
                        groupBy: 'status',
                    },
                    height: 8,
                    width: 6,
                    position: { x: 0, y: 6 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_reservations_by_status'],
                    component: 'vertical-bar',
                    componentProps: {
                        title: 'Reservations by Status',
                        table: 'x_783010_tocc_a1_room_reservation',
                        groupBy: 'status',
                        aggregation: 'count',
                    },
                    height: 8,
                    width: 6,
                    position: { x: 6, y: 6 },
                },
            ],
        },
        {
            $id: Now.ID['x_783010_tocc_a1_dashboard_tab_operational_intelligence'],
            name: 'Operational Intelligence',
            widgets: [
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_most_used_rooms'],
                    component: 'horizontal-bar',
                    componentProps: {
                        title: 'Most Used Rooms',
                        table: 'x_783010_tocc_a1_training_session',
                        groupBy: 'room',
                        aggregation: 'count',
                        limit: 10,
                    },
                    height: 8,
                    width: 6,
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
                    height: 8,
                    width: 6,
                    position: { x: 6, y: 0 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_feedback_avg_rating'],
                    component: 'gauge',
                    componentProps: {
                        title: 'Feedback Average Rating',
                        table: 'x_783010_tocc_a1_training_feedback',
                        metric: 'avg_rating',
                        min: 1,
                        max: 5,
                    },
                    height: 6,
                    width: 6,
                    position: { x: 0, y: 8 },
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_dashboard_widget_kb_article_views'],
                    component: 'line',
                    componentProps: {
                        title: 'KB Article Views (TOCC)',
                        table: 'kb_view',
                        metric: 'kb_views',
                        description: 'Trend of article views for the TOCC knowledge base.',
                    },
                    height: 6,
                    width: 6,
                    position: { x: 6, y: 8 },
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
