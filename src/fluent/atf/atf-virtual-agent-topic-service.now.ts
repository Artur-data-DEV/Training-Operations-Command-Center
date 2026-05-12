import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: VirtualAgentTopicService
// TEST-041 to TEST-042
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_menu_contract'],
        name: '[TOCC][VA] topic service exposes 6-item main menu contract',
        description: 'Validates VirtualAgentTopicService main menu payload required by VA greeting flow.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_menu_contract_script'],
            script: `
                var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                var payload = svc.getMainMenu();

                gs.assertTrue(payload && payload.success === true, 'Main menu should return success.');
                gs.assertTrue(payload.menu && payload.menu.length === 6, 'Expected 6 main menu options.');

                var keys = {};
                for (var i = 0; i < payload.menu.length; i++) {
                    var item = payload.menu[i];
                    gs.assertTrue(!gs.nil(item.key), 'Menu item key is mandatory.');
                    gs.assertTrue(!gs.nil(item.label), 'Menu item label is mandatory.');
                    keys[item.key] = true;
                }

                gs.assertTrue(keys.find_sessions === true, 'find_sessions option missing.');
                gs.assertTrue(keys.my_enrollments === true, 'my_enrollments option missing.');
                gs.assertTrue(keys.confirm_attendance === true, 'confirm_attendance option missing.');
                gs.assertTrue(keys.cancel_enrollment === true, 'cancel_enrollment option missing.');
                gs.assertTrue(keys.training_policies === true, 'training_policies option missing.');
                gs.assertTrue(keys.escalate_backoffice === true, 'escalate_backoffice option missing.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_policies_and_escalation'],
        name: '[TOCC][VA] policies topic payload includes policy values and escalation',
        description: 'Validates policy topic contract for VA: policies, KB link, and escalation channel.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_policies_and_escalation_script'],
            script: `
                var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                var payload = svc.getTrainingPolicies();

                gs.assertTrue(payload && payload.success === true, 'Policy payload should return success.');
                gs.assertTrue(payload.policies, 'Policy payload must include policies object.');
                gs.assertTrue(payload.links, 'Policy payload must include links object.');
                gs.assertTrue(payload.escalation, 'Policy payload must include escalation object.');

                gs.assertTrue(
                    payload.policies.minimum_advance_notice_hours !== undefined,
                    'minimum_advance_notice_hours is required.'
                );
                gs.assertTrue(
                    payload.policies.late_cancellation_window_hours !== undefined,
                    'late_cancellation_window_hours is required.'
                );
                gs.assertTrue(
                    payload.policies.waitlist_mode !== undefined,
                    'waitlist_mode is required.'
                );
                gs.assertTrue(
                    payload.links.kb !== undefined && payload.links.kb !== '',
                    'KB link should be present.'
                );
                gs.assertTrue(
                    payload.escalation.email !== undefined && payload.escalation.email !== '',
                    'Escalation email should be present.'
                );
            `,
        })
    }
)

