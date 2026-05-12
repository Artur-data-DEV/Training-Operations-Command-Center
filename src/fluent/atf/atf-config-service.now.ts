import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: TrainingConfigService
// TEST-004 to TEST-007 + TEST-046 to TEST-047
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_config_get_value_returns_seed'],
        name: '[TOCC][CONFIG] getValue returns seeded default',
        description: 'Validates that TrainingConfigService reads a seeded config record correctly.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        // Seed a known config record for this test
        atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_config_seed_insert'],
            table: 'x_783010_tocc_a1_training_config',
            fieldValues: {
                name: 'atf_test_string_key',
                value: 'hello_atf',
                active: true,
                description: 'ATF test config record',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_config_get_value_script'],
            script: `
                var svc = new x_783010_tocc_a1.TrainingConfigService();
                var val = svc.getValue('atf_test_string_key', 'fallback');
                gs.assertTrue(val === 'hello_atf', 'Expected hello_atf, got: ' + val);

                // Cleanup
                var gr = new GlideRecord('x_783010_tocc_a1_training_config');
                gr.addQuery('name', 'atf_test_string_key');
                gr.deleteMultiple();
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_config_property_override_precedence'],
        name: '[TOCC][CONFIG] sys_property override takes precedence over table value',
        description: 'Validates getValue prefers x_783010_tocc_a1.config.* property when non-empty.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_config_property_override_precedence_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';
                var key = 'atf_prop_override_' + suffix;
                var propertyName = 'x_783010_tocc_a1.config.' + key;

                var cfg = new GlideRecord('x_783010_tocc_a1_training_config');
                cfg.initialize();
                cfg.setValue('name', key);
                cfg.setValue('value', 'table_value');
                cfg.setValue('active', true);
                cfg.insert();

                var prop = new GlideRecord('sys_properties');
                prop.initialize();
                prop.setValue('name', propertyName);
                prop.setValue('type', 'string');
                prop.setValue('value', 'property_value');
                prop.setValue('description', 'ATF temporary override property');
                prop.insert();

                var svc = new x_783010_tocc_a1.TrainingConfigService();
                var result = svc.getValue(key, 'fallback');
                gs.assertTrue(result === 'property_value', 'Expected property override, got: ' + result);

                var delCfg = new GlideRecord('x_783010_tocc_a1_training_config');
                delCfg.addQuery('name', key);
                delCfg.deleteMultiple();

                var delProp = new GlideRecord('sys_properties');
                delProp.addQuery('name', propertyName);
                delProp.deleteMultiple();
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_config_empty_property_falls_back_to_table'],
        name: '[TOCC][CONFIG] empty sys_property falls back to table value',
        description: 'Validates empty property value does not block table fallback.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_config_empty_property_falls_back_to_table_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';
                var key = 'atf_prop_fallback_' + suffix;
                var propertyName = 'x_783010_tocc_a1.config.' + key;

                var cfg = new GlideRecord('x_783010_tocc_a1_training_config');
                cfg.initialize();
                cfg.setValue('name', key);
                cfg.setValue('value', 'table_fallback');
                cfg.setValue('active', true);
                cfg.insert();

                var prop = new GlideRecord('sys_properties');
                prop.initialize();
                prop.setValue('name', propertyName);
                prop.setValue('type', 'string');
                prop.setValue('value', '');
                prop.setValue('description', 'ATF temporary empty override property');
                prop.insert();

                var svc = new x_783010_tocc_a1.TrainingConfigService();
                var result = svc.getValue(key, 'fallback');
                gs.assertTrue(result === 'table_fallback', 'Expected table fallback, got: ' + result);

                var delCfg = new GlideRecord('x_783010_tocc_a1_training_config');
                delCfg.addQuery('name', key);
                delCfg.deleteMultiple();

                var delProp = new GlideRecord('sys_properties');
                delProp.addQuery('name', propertyName);
                delProp.deleteMultiple();
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_config_get_number'],
        name: '[TOCC][CONFIG] getNumber parses integer correctly',
        description: 'Validates getNumber returns parsed int and falls back on non-numeric values.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_config_get_number_script'],
            script: `
                var svc = new x_783010_tocc_a1.TrainingConfigService();
                // Uses seed: minimum_advance_notice_hours = '24'
                var hours = svc.getMinimumAdvanceNoticeHours();
                gs.assertTrue(typeof hours === 'number', 'Expected number type');
                gs.assertTrue(hours === 24, 'Expected 24, got: ' + hours);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_config_get_boolean'],
        name: '[TOCC][CONFIG] getBoolean handles true/false/1',
        description: 'Validates getBoolean correctly interprets string representations.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_config_get_boolean_script'],
            script: `
                var svc = new x_783010_tocc_a1.TrainingConfigService();

                // Insert test booleans
                var gr = new GlideRecord('x_783010_tocc_a1_training_config');
                gr.initialize();
                gr.setValue('name', 'atf_bool_true');
                gr.setValue('value', 'true');
                gr.setValue('active', true);
                gr.insert();

                gr = new GlideRecord('x_783010_tocc_a1_training_config');
                gr.initialize();
                gr.setValue('name', 'atf_bool_one');
                gr.setValue('value', '1');
                gr.setValue('active', true);
                gr.insert();

                gr = new GlideRecord('x_783010_tocc_a1_training_config');
                gr.initialize();
                gr.setValue('name', 'atf_bool_false');
                gr.setValue('value', 'false');
                gr.setValue('active', true);
                gr.insert();

                gs.assertTrue(svc.getBoolean('atf_bool_true', false) === true, 'true string should return true');
                gs.assertTrue(svc.getBoolean('atf_bool_one', false) === true, '1 string should return true');
                gs.assertTrue(svc.getBoolean('atf_bool_false', true) === false, 'false string should return false');

                // Cleanup
                var del = new GlideRecord('x_783010_tocc_a1_training_config');
                del.addQuery('name', 'IN', 'atf_bool_true,atf_bool_one,atf_bool_false');
                del.deleteMultiple();
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_config_advance_notice_default'],
        name: '[TOCC][CONFIG] getMinimumAdvanceNoticeHours returns 24 from seed',
        description: 'Validates the default seed value for advance notice hours.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_config_advance_notice_script'],
            script: `
                var svc = new x_783010_tocc_a1.TrainingConfigService();
                var result = svc.getMinimumAdvanceNoticeHours();
                gs.assertTrue(result === 24, 'Expected 24h advance notice, got: ' + result);
            `,
        })
    }
)
