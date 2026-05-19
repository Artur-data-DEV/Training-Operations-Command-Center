import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: Dashboard + Workspace scaffolds
// TEST-034 to TEST-036
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_dashboard_scaffold_materialized'],
        name: '[TOCC][DASHBOARD] analytics dashboard scaffold is materialized',
        description: 'Validates dashboard, tabs, and widgets were deployed by Fluent SDK.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_dashboard_scaffold_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var dashboard = new GlideRecord('par_dashboard');
                dashboard.addQuery('name', 'Training Operations Performance Dashboard');
                dashboard.setLimit(1);
                dashboard.query();
                assertTrue(dashboard.next(), 'Dashboard not found.');
                var dashActive = dashboard.getValue('active');
                assertTrue(dashActive == true || String(dashActive) === 'true', 'Dashboard must be active.');

                var dashboardId = dashboard.getUniqueValue();

                var tabCount = 0;
                var tab = new GlideRecord('par_dashboard_tab');
                tab.addQuery('dashboard', dashboardId);
                tab.query();
                while (tab.next()) { tabCount++; }
                assertTrue(tabCount === 2, 'Expected 2 dashboard tabs, got: ' + tabCount);

                var widgetCount = 0;
                var widget = new GlideRecord('par_dashboard_widget');
                widget.addQuery('canvas.dashboard', dashboardId);
                widget.query();
                while (widget.next()) { widgetCount++; }
                assertTrue(widgetCount === 10, 'Expected 10 dashboard widgets, got: ' + widgetCount);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_workspace_scaffold_materialized'],
        name: '[TOCC][WORKSPACE] backoffice workspace scaffold is materialized',
        description: 'Validates workspace page registry, list config, categories, and list counts.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_workspace_scaffold_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var workspace = new GlideRecord('sys_ux_page_registry');
                workspace.addQuery('title', 'TOCC Backoffice Operations Workspace');
                workspace.addQuery('path', 'tocc-backoffice-ops');
                workspace.setLimit(1);
                workspace.query();
                assertTrue(workspace.next(), 'Workspace registry not found.');
                var wsActive = workspace.getValue('active');
                assertTrue(wsActive == true || String(wsActive) === 'true', 'Workspace registry must be active.');

                var config = new GlideRecord('sys_ux_list_menu_config');
                config.addQuery('name', 'TOCC Backoffice List Configuration');
                config.setLimit(1);
                config.query();
                assertTrue(config.next(), 'Workspace list menu config not found.');
                var cfgActive = config.getValue('active');
                assertTrue(cfgActive == true || String(cfgActive) === 'true', 'Workspace list menu config must be active.');

                var configId = config.getUniqueValue();

                var categoryCount = 0;
                var category = new GlideRecord('sys_ux_list_category');
                category.addQuery('configuration', configId);
                category.query();
                while (category.next()) { categoryCount++; }
                assertTrue(categoryCount === 5, 'Expected 5 workspace categories, got: ' + categoryCount);

                var listCount = 0;
                var list = new GlideRecord('sys_ux_list');
                list.addQuery('configuration', configId);
                list.query();
                while (list.next()) { listCount++; }
                assertTrue(listCount === 10, 'Expected 10 workspace lists, got: ' + listCount);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_workspace_lists_cover_core_tables'],
        name: '[TOCC][WORKSPACE] list scaffold covers reservation session enrollment tables',
        description: 'Validates workspace list configuration includes the core operational tables.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_workspace_lists_core_tables_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                function assertTableCoverage(tableName, expectedMin) {
                    var count = 0;
                    var gr = new GlideRecord('sys_ux_list');
                    gr.addQuery('table', tableName);
                    gr.addQuery('configuration.name', 'TOCC Backoffice List Configuration');
                    gr.query();
                    while (gr.next()) { count++; }
                    assertTrue(
                        count >= expectedMin,
                        'Expected at least ' + expectedMin + ' list(s) for table ' + tableName + ', got: ' + count
                    );
                }

                assertTableCoverage('x_783010_tocc_a1_room_reservation', 2);
                assertTableCoverage('x_783010_tocc_a1_training_session', 2);
                assertTableCoverage('x_783010_tocc_a1_student_enrollment', 2);
                assertTableCoverage('x_783010_tocc_a1_attendance', 2);
                assertTableCoverage('x_783010_tocc_a1_room_resource', 2);
            `,
        })
    }
)
