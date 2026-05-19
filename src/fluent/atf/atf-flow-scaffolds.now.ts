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
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                function assertFlowExists(flowName) {
                    var gr = new GlideRecord('sys_hub_flow');
                    gr.addQuery('name', flowName);
                    gr.setLimit(1);
                    gr.query();
                    assertTrue(gr.next(), 'Flow not found: ' + flowName);
                }

                assertFlowExists('[TOCC][FLOW] Reservation Approval');
                assertFlowExists('[TOCC][FLOW] Reservation Decision Applied');
                assertFlowExists('[TOCC][FLOW] Session Cancelled');
                assertFlowExists('[TOCC][FLOW] Enrollment Approval');
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
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                function assertFlowExists(flowName) {
                    var gr = new GlideRecord('sys_hub_flow');
                    gr.addQuery('name', flowName);
                    gr.setLimit(1);
                    gr.query();
                    assertTrue(gr.next(), 'Subflow not found: ' + flowName);
                }

                assertFlowExists('[TOCC][SF] Reservation Approval Routing');
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
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                function countByPrefix(prefix) {
                    var count = 0;
                    var gr = new GlideRecord('sys_hub_flow');
                    gr.addQuery('name', 'STARTSWITH', prefix);
                    gr.query();
                    while (gr.next()) { count++; }
                    return count;
                }

                var flowCount = countByPrefix('[TOCC][FLOW]');
                var subflowCount = countByPrefix('[TOCC][SF]');
                assertTrue(flowCount >= 6, 'Expected at least 6 [TOCC][FLOW] records, got: ' + flowCount);
                assertTrue(subflowCount >= 1, 'Expected at least 1 [TOCC][SF] record, got: ' + subflowCount);
            `,
        })
    }
)

