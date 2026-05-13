import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: VirtualAgentTopicService
// TEST-041 to TEST-043
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
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_escalation_property_binding'],
        name: '[TOCC][VA] escalation payload honors help-center properties',
        description: 'Validates getBackofficeEscalation returns values sourced from configured properties.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_escalation_property_binding_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                function upsertProperty(name, value) {
                    var gr = new GlideRecord('sys_properties');
                    gr.addQuery('name', name);
                    gr.setLimit(1);
                    gr.query();
                    if (gr.next()) {
                        var original = {
                            existed: true,
                            sys_id: gr.getUniqueValue(),
                            value: gr.getValue('value'),
                        };
                        gr.setValue('value', value);
                        gr.update();
                        return original;
                    }

                    gr.initialize();
                    gr.setValue('name', name);
                    gr.setValue('type', 'string');
                    gr.setValue('value', value);
                    gr.setValue('description', 'ATF temporary property override');
                    var sysId = gr.insert();
                    return { existed: false, sys_id: sysId, value: '' };
                }

                function restoreProperty(name, original) {
                    var gr = new GlideRecord('sys_properties');
                    if (original.existed) {
                        if (gr.get(original.sys_id)) {
                            gr.setValue('value', original.value);
                            gr.update();
                        }
                        return;
                    }

                    gr.addQuery('name', name);
                    gr.addQuery('sys_id', original.sys_id);
                    gr.deleteMultiple();
                }

                var propEmail = 'x_783010_tocc_a1.backoffice.email';
                var propSupportPage = 'x_783010_tocc_a1.portal.support_page';
                var propSupportCatalog = 'x_783010_tocc_a1.portal.support_catalog_url';
                var propVaUrl = 'x_783010_tocc_a1.portal.va_url';

                var expectedEmail = 'atf-va-' + suffix + '@example.com';
                var expectedSupportPage = '?id=tocc_help_atf_' + suffix;
                var expectedSupportCatalog = '?id=tocc_sessions_atf_' + suffix;
                var expectedVaUrl = '/$sn-va-web-client-app.do?atf=' + suffix;

                var originalEmail = upsertProperty(propEmail, expectedEmail);
                var originalSupportPage = upsertProperty(propSupportPage, expectedSupportPage);
                var originalSupportCatalog = upsertProperty(propSupportCatalog, expectedSupportCatalog);
                var originalVaUrl = upsertProperty(propVaUrl, expectedVaUrl);

                try {
                    var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                    var escalation = svc.getBackofficeEscalation();

                    gs.assertTrue(escalation.success === true, 'Escalation payload must return success.');
                    gs.assertTrue(escalation.email === expectedEmail, 'Escalation email should match property override.');
                    gs.assertTrue(escalation.portal_support_page === expectedSupportPage, 'Support page should match property override.');
                    gs.assertTrue(escalation.support_catalog_url === expectedSupportCatalog, 'Support catalog should match property override.');
                    gs.assertTrue(escalation.va_url === expectedVaUrl, 'VA URL should match property override.');
                } finally {
                    restoreProperty(propEmail, originalEmail);
                    restoreProperty(propSupportPage, originalSupportPage);
                    restoreProperty(propSupportCatalog, originalSupportCatalog);
                    restoreProperty(propVaUrl, originalVaUrl);
                }
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
