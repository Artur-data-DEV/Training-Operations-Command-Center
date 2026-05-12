import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: CmdbResourceService
// TEST-032 to TEST-033
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_cmdb_resource_invalid_ci_blocked'],
        name: '[TOCC][CMDB] room resource insert blocked for invalid CI reference',
        description: 'Room resource save must be blocked when ci_reference points to a non-existent CI.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_cmdb_resource_invalid_ci_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-CMDB-Room-' + suffix);
                room.setValue('room_code', 'ATF-CMDB-' + suffix);
                room.setValue('capacity', 15);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();
                gs.assertTrue(!gs.nil(roomId), 'Room fixture was not created.');

                var resource = new GlideRecord('x_783010_tocc_a1_room_resource');
                resource.initialize();
                resource.setValue('room', roomId);
                resource.setValue('resource_name', 'ATF Invalid CI Resource');
                resource.setValue('resource_type', 'other');
                resource.setValue('ci_reference', '00000000000000000000000000000000');
                resource.setValue('active', true);
                var resourceId = resource.insert();

                gs.assertTrue(gs.nil(resourceId), 'Insert should be blocked for invalid CI reference.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_cmdb_resource_enrichment_from_ci'],
        name: '[TOCC][CMDB] room resource auto-enriches from valid CI',
        description: 'Room resource should inherit name/type hints from a valid ci_reference when values are blank.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_cmdb_resource_enrichment_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-CMDB-Room-ENR-' + suffix);
                room.setValue('room_code', 'ATF-CMDB-ENR-' + suffix);
                room.setValue('capacity', 20);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();
                gs.assertTrue(!gs.nil(roomId), 'Room fixture was not created.');

                var ci = new GlideRecord('cmdb_ci_computer');
                ci.initialize();
                ci.setValue('name', 'ATF CMDB Computer ' + suffix);
                var ciId = ci.insert();
                gs.assertTrue(!gs.nil(ciId), 'CMDB CI fixture was not created.');

                var resource = new GlideRecord('x_783010_tocc_a1_room_resource');
                resource.initialize();
                resource.setValue('room', roomId);
                resource.setValue('ci_reference', ciId);
                resource.setValue('active', true);
                var resourceId = resource.insert();
                gs.assertTrue(!gs.nil(resourceId), 'Resource should be inserted with valid CI.');

                var check = new GlideRecord('x_783010_tocc_a1_room_resource');
                gs.assertTrue(check.get(resourceId), 'Inserted room resource record not found.');
                gs.assertTrue(!gs.nil(check.getValue('resource_name')), 'resource_name should be auto-populated.');
                gs.assertTrue(
                    check.getValue('resource_type') === 'computer',
                    'resource_type should be inferred as computer. Got: ' + check.getValue('resource_type')
                );
            `,
        })
    }
)
