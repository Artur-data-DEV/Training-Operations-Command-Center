import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: CmdbBootstrapService
// TEST-037 to TEST-038
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_cmdb_bootstrap_creates_sample_assets'],
        name: '[TOCC][CMDB] bootstrap creates 3 sample assets and room resources',
        description: 'Bootstrap must create Projector, AV System, and Room Computer CIs and link them to room resources.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_cmdb_bootstrap_creates_sample_assets_script'],
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
                }                var suffix = new GlideDateTime().getNumericValue() + '';

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-CMDB-Bootstrap-Room-' + suffix);
                room.setValue('room_code', 'ATF-CMDB-BS-' + suffix);
                room.setValue('capacity', 12);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();
                assertTrue(!gs.nil(roomId), 'Room fixture was not created.');

                var service = new x_783010_tocc_a1.CmdbBootstrapService();
                var result = service.bootstrapSampleAssetsForRoom(roomId);

                assertTrue(result && result.success === true, 'Bootstrap should succeed.');
                assertTrue(result.room_sys_id === roomId, 'Bootstrap should target created room.');
                assertTrue(result.ci_created === 3, 'Expected ci_created=3, got: ' + result.ci_created);
                assertTrue(result.resource_created === 3, 'Expected resource_created=3, got: ' + result.resource_created);
                assertTrue(result.resources_total === 3, 'Expected resources_total=3, got: ' + result.resources_total);

                var resourceCount = 0;
                var gr = new GlideRecord('x_783010_tocc_a1_room_resource');
                gr.addQuery('room', roomId);
                gr.query();
                while (gr.next()) {
                    resourceCount++;
                    assertTrue(!gs.nil(gr.getValue('ci_reference')), 'Resource must keep ci_reference.');
                }

                assertTrue(resourceCount === 3, 'Expected 3 room_resource records, got: ' + resourceCount);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_cmdb_bootstrap_is_idempotent'],
        name: '[TOCC][CMDB] bootstrap is idempotent for same room',
        description: 'Running CMDB bootstrap twice for same room must not create duplicate CIs or room resources.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_cmdb_bootstrap_is_idempotent_script'],
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
                }                var suffix = new GlideDateTime().getNumericValue() + '';

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-CMDB-Bootstrap-Idem-' + suffix);
                room.setValue('room_code', 'ATF-CMDB-IDEM-' + suffix);
                room.setValue('capacity', 18);
                room.setValue('room_type', 'lab');
                room.setValue('status', 'active');
                var roomId = room.insert();
                assertTrue(!gs.nil(roomId), 'Room fixture was not created.');

                var service = new x_783010_tocc_a1.CmdbBootstrapService();
                var first = service.bootstrapSampleAssetsForRoom(roomId);
                var second = service.bootstrapSampleAssetsForRoom(roomId);

                assertTrue(first.success === true, 'First bootstrap run should succeed.');
                assertTrue(second.success === true, 'Second bootstrap run should succeed.');
                assertTrue(first.ci_created === 3, 'First run should create 3 CIs.');
                assertTrue(first.resource_created === 3, 'First run should create 3 resources.');
                assertTrue(second.ci_created === 0, 'Second run must not create new CIs.');
                assertTrue(second.resource_created === 0, 'Second run must not create new resources.');
                assertTrue(second.ci_existing >= 3, 'Second run should reuse existing CIs.');

                var resourceCount = 0;
                var resourceIds = {};
                var gr = new GlideRecord('x_783010_tocc_a1_room_resource');
                gr.addQuery('room', roomId);
                gr.query();
                while (gr.next()) {
                    resourceCount++;
                    resourceIds[gr.getUniqueValue()] = true;
                }

                assertTrue(resourceCount === 3, 'Expected exactly 3 room resources after two runs, got: ' + resourceCount);
                assertTrue(Object.keys(resourceIds).length === 3, 'Duplicate room resource rows detected.');
            `,
        })
    }
)

