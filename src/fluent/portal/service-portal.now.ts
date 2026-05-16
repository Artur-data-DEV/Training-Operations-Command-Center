import { SPMenu, SPPage, SPWidget, ServicePortal } from '@servicenow/sdk/core'
import { toccServiceCatalog } from '../catalog/catalog-structure.now'

const toccQuickLinksWidget = SPWidget({
    $id: Now.ID['x_783010_tocc_a1_sp_widget_quick_links'],
    id: 'x_783010_tocc_a1-quick-links',
    name: 'TOCC - Quick Links',
    htmlTemplate: Now.include('./sp-quick-links.html'),
    customCss: Now.include('./sp-quick-links.css'),
    serverScript: Now.include('./sp-quick-links.server.js'),
})

const toccSessionBrowserWidget = SPWidget({
    $id: Now.ID['x_783010_tocc_a1_sp_widget_session_browser'],
    id: 'x_783010_tocc_a1-session-browser',
    name: 'TOCC - Session Browser',
    htmlTemplate: Now.include('./sp-session-browser.html'),
    customCss: Now.include('./sp-session-browser.css'),
    clientScript: Now.include('./sp-session-browser.client.js'),
    serverScript: Now.include('./sp-session-browser.server.js'),
})

const toccMyEnrollmentsWidget = SPWidget({
    $id: Now.ID['x_783010_tocc_a1_sp_widget_my_enrollments'],
    id: 'x_783010_tocc_a1-my-enrollments',
    name: 'TOCC - My Enrollments',
    htmlTemplate: Now.include('./sp-my-enrollments.html'),
    clientScript: Now.include('./sp-my-enrollments.client.js'),
    serverScript: Now.include('./sp-my-enrollments.server.js'),
})

const toccMyReservationsWidget = SPWidget({
    $id: Now.ID['x_783010_tocc_a1_sp_widget_my_reservations'],
    id: 'x_783010_tocc_a1-my-reservations',
    name: 'TOCC - My Reservations',
    htmlTemplate: Now.include('./sp-my-reservations.html'),
    customCss: Now.include('./sp-my-reservations.css'),
    serverScript: Now.include('./sp-my-reservations.server.js'),
})

const toccHelpCenterWidget = SPWidget({
    $id: Now.ID['x_783010_tocc_a1_sp_widget_help_center'],
    id: 'x_783010_tocc_a1-help-center',
    name: 'TOCC - Help Center',
    htmlTemplate: Now.include('./sp-help-center.html'),
    serverScript: Now.include('./sp-help-center.server.js'),
})

const toccHomePage = SPPage({
    pageId: 'tocc_home',
    title: 'Training Operations Home',
    shortDescription: 'TOCC landing page with quick links and upcoming sessions.',
    roles: [
        'snc_internal',
        'admin',
        'x_783010_tocc_a1.student',
        'x_783010_tocc_a1.instructor',
        'x_783010_tocc_a1.backoffice',
        'x_783010_tocc_a1.manager',
        'x_783010_tocc_a1.admin',
    ],
    containers: [
        {
            $id: Now.ID['x_783010_tocc_a1_sp_container_home_main'],
            width: 'container',
            order: 100,
            rows: [
                {
                    $id: Now.ID['x_783010_tocc_a1_sp_row_home_quick_links'],
                    order: 100,
                    columns: [
                        {
                            $id: Now.ID['x_783010_tocc_a1_sp_col_home_quick_links'],
                            size: 12,
                            instances: [
                                {
                                    $id: Now.ID['x_783010_tocc_a1_sp_inst_home_quick_links'],
                                    widget: toccQuickLinksWidget,
                                    title: 'Quick Actions',
                                    order: 100,
                                },
                            ],
                        },
                    ],
                },
                {
                    $id: Now.ID['x_783010_tocc_a1_sp_row_home_sessions'],
                    order: 200,
                    columns: [
                        {
                            $id: Now.ID['x_783010_tocc_a1_sp_col_home_sessions'],
                            size: 12,
                            instances: [
                                {
                                    $id: Now.ID['x_783010_tocc_a1_sp_inst_home_sessions'],
                                    widget: toccSessionBrowserWidget,
                                    title: 'Upcoming Sessions',
                                    order: 100,
                                    widgetParameters: {
                                        max_items: 5,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

SPPage({
    pageId: 'tocc_sessions',
    title: 'Available Training Sessions',
    shortDescription: 'Student self-service page with open/full sessions.',
    roles: [
        'snc_internal',
        'admin',
        'x_783010_tocc_a1.student',
        'x_783010_tocc_a1.instructor',
        'x_783010_tocc_a1.backoffice',
        'x_783010_tocc_a1.manager',
        'x_783010_tocc_a1.admin',
    ],
    containers: [
        {
            $id: Now.ID['x_783010_tocc_a1_sp_container_sessions_main'],
            width: 'container',
            order: 100,
            rows: [
                {
                    $id: Now.ID['x_783010_tocc_a1_sp_row_sessions_main'],
                    order: 100,
                    columns: [
                        {
                            $id: Now.ID['x_783010_tocc_a1_sp_col_sessions_main'],
                            size: 12,
                            instances: [
                                {
                                    $id: Now.ID['x_783010_tocc_a1_sp_inst_sessions_main'],
                                    widget: toccSessionBrowserWidget,
                                    title: 'Available Sessions',
                                    order: 100,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

SPPage({
    pageId: 'tocc_my_enrollments',
    title: 'My Enrollments',
    shortDescription: 'Student enrollment history and attendance confirmation.',
    roles: ['snc_internal', 'admin', 'x_783010_tocc_a1.student', 'x_783010_tocc_a1.admin'],
    containers: [
        {
            $id: Now.ID['x_783010_tocc_a1_sp_container_enrollments_main'],
            width: 'container',
            order: 100,
            rows: [
                {
                    $id: Now.ID['x_783010_tocc_a1_sp_row_enrollments_main'],
                    order: 100,
                    columns: [
                        {
                            $id: Now.ID['x_783010_tocc_a1_sp_col_enrollments_main'],
                            size: 12,
                            instances: [
                                {
                                    $id: Now.ID['x_783010_tocc_a1_sp_inst_enrollments_main'],
                                    widget: toccMyEnrollmentsWidget,
                                    title: 'Enrollment History',
                                    order: 100,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

SPPage({
    pageId: 'tocc_my_reservations',
    title: 'My Reservations',
    shortDescription: 'Instructor reservation requests with lifecycle status.',
    roles: ['snc_internal', 'admin', 'x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.admin'],
    containers: [
        {
            $id: Now.ID['x_783010_tocc_a1_sp_container_reservations_main'],
            width: 'container',
            order: 100,
            rows: [
                {
                    $id: Now.ID['x_783010_tocc_a1_sp_row_reservations_main'],
                    order: 100,
                    columns: [
                        {
                            $id: Now.ID['x_783010_tocc_a1_sp_col_reservations_main'],
                            size: 12,
                            instances: [
                                {
                                    $id: Now.ID['x_783010_tocc_a1_sp_inst_reservations_main'],
                                    widget: toccMyReservationsWidget,
                                    title: 'Reservation Requests',
                                    order: 100,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

SPPage({
    pageId: 'tocc_help',
    title: 'Help Center',
    shortDescription: 'Knowledge Base and Virtual Agent access point.',
    roles: [
        'snc_internal',
        'admin',
        'x_783010_tocc_a1.student',
        'x_783010_tocc_a1.instructor',
        'x_783010_tocc_a1.backoffice',
        'x_783010_tocc_a1.manager',
        'x_783010_tocc_a1.admin',
    ],
    containers: [
        {
            $id: Now.ID['x_783010_tocc_a1_sp_container_help_main'],
            width: 'container',
            order: 100,
            rows: [
                {
                    $id: Now.ID['x_783010_tocc_a1_sp_row_help_main'],
                    order: 100,
                    columns: [
                        {
                            $id: Now.ID['x_783010_tocc_a1_sp_col_help_main'],
                            size: 12,
                            instances: [
                                {
                                    $id: Now.ID['x_783010_tocc_a1_sp_inst_help_main'],
                                    widget: toccHelpCenterWidget,
                                    title: 'Help and Support',
                                    order: 100,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

const toccNotFoundPage = SPPage({
    pageId: 'tocc_not_found',
    title: 'Page Not Found',
    public: true,
    containers: [
        {
            $id: Now.ID['x_783010_tocc_a1_sp_container_not_found'],
            width: 'container',
            order: 100,
            rows: [
                {
                    $id: Now.ID['x_783010_tocc_a1_sp_row_not_found'],
                    columns: [
                        {
                            $id: Now.ID['x_783010_tocc_a1_sp_col_not_found'],
                            size: 12,
                            instances: [
                                {
                                    $id: Now.ID['x_783010_tocc_a1_sp_inst_not_found_quick_links'],
                                    widget: toccQuickLinksWidget,
                                    title: 'Navigation',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

const toccMainMenu = SPMenu({
    $id: Now.ID['x_783010_tocc_a1_sp_main_menu'],
    id: 'x_783010_tocc_a1-main-menu',
    title: 'TOCC Main Menu',
    items: [
        {
            $id: Now.ID['x_783010_tocc_a1_sp_main_menu_item_home'],
            label: 'Home',
            type: 'page',
            page: toccHomePage,
            order: 100,
            active: true,
            glyph: 'home',
        },
        {
            $id: Now.ID['x_783010_tocc_a1_sp_main_menu_item_sessions'],
            label: 'Sessions',
            type: 'page',
            page: Now.ref('sp_page', { id: 'tocc_sessions' }),
            order: 200,
            active: true,
            glyph: 'calendar',
        },
        {
            $id: Now.ID['x_783010_tocc_a1_sp_main_menu_item_my_enrollments'],
            label: 'My Enrollments',
            type: 'page',
            page: Now.ref('sp_page', { id: 'tocc_my_enrollments' }),
            order: 300,
            active: true,
            roles: ['admin', 'x_783010_tocc_a1.student', 'x_783010_tocc_a1.admin'],
            glyph: 'check-square-o',
        },
        {
            $id: Now.ID['x_783010_tocc_a1_sp_main_menu_item_my_reservations'],
            label: 'My Reservations',
            type: 'page',
            page: Now.ref('sp_page', { id: 'tocc_my_reservations' }),
            order: 400,
            active: true,
            roles: ['admin', 'x_783010_tocc_a1.instructor', 'x_783010_tocc_a1.admin'],
            glyph: 'building-o',
        },
        {
            $id: Now.ID['x_783010_tocc_a1_sp_main_menu_item_catalog'],
            label: 'Self-Service Home',
            type: 'page',
            page: Now.ref('sp_page', { id: 'tocc_home' }),
            order: 500,
            active: true,
            glyph: 'th-list',
        },
        {
            $id: Now.ID['x_783010_tocc_a1_sp_main_menu_item_help'],
            label: 'Help Center',
            type: 'page',
            page: Now.ref('sp_page', { id: 'tocc_help' }),
            order: 600,
            active: true,
            glyph: 'life-ring',
        },
    ],
})

ServicePortal({
    $id: Now.ID['x_783010_tocc_a1_service_portal'],
    title: 'Training Operations',
    urlSuffix: 'tocc',
    mainMenu: toccMainMenu,
    homePage: toccHomePage,
    notFoundPage: toccNotFoundPage,
    catalogs: [{ catalog: toccServiceCatalog, order: 100, active: true }],
})
