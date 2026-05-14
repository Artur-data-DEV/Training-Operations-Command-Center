import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: Flow + Subflow orchestration
// TEST-047 to TEST-049
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_flow_scaffold_presence'],
        name: '[TOCC][FLOW] orchestration flows are materialized',
        description: 'Validates the expected operational Flow records are present in sys_hub_flow.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_flow_scaffold_presence_script'],
            script: `
                function assertFlowExists(flowName) {
                    var gr = new GlideRecord('sys_hub_flow');
                    gr.addQuery('name', flowName);
                    gr.setLimit(1);
                    gr.query();
                    gs.assertTrue(gr.next(), 'Flow not found: ' + flowName);
                }

                assertFlowExists('[TOCC][FLOW] Reservation Intake');
                assertFlowExists('[TOCC][FLOW] Session Cancelled');
                assertFlowExists('[TOCC][FLOW] Daily KPI Refresh Observation');
                assertFlowExists('[TOCC][FLOW] Attendance Confirmation Cadence');
                assertFlowExists('[TOCC][FLOW] Session Reminder Cadence');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_subflow_scaffold_presence'],
        name: '[TOCC][FLOW] orchestration subflows are materialized',
        description: 'Validates reusable operational subflows are present.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_subflow_scaffold_presence_script'],
            script: `
                function assertFlowExists(flowName) {
                    var gr = new GlideRecord('sys_hub_flow');
                    gr.addQuery('name', flowName);
                    gr.setLimit(1);
                    gr.query();
                    gs.assertTrue(gr.next(), 'Subflow not found: ' + flowName);
                }

                assertFlowExists('[TOCC][SF] Reservation Intake Processing');
                assertFlowExists('[TOCC][SF] Session Cancelled Processing');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_flow_scaffold_count'],
        name: '[TOCC][FLOW] namespace has expected flow/subflow counts',
        description: 'Guards namespace drift by asserting expected record counts for operational prefixes.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_flow_scaffold_count_script'],
            script: `
                function countByPrefix(prefix) {
                    var count = 0;
                    var gr = new GlideRecord('sys_hub_flow');
                    gr.addQuery('name', 'STARTSWITH', prefix);
                    gr.query();
                    while (gr.next()) { count++; }
                    return count;
                }

                var flowCount = countByPrefix('[TOCC][FLOW]');
                var subflowCount = countByPrefix('[TOCC][SF]');
                gs.assertTrue(flowCount >= 5, 'Expected at least 5 [TOCC][FLOW] records, got: ' + flowCount);
                gs.assertTrue(subflowCount >= 2, 'Expected at least 2 [TOCC][SF] records, got: ' + subflowCount);
            `,
        })
    }
)

