import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: TrainingKpiService
// TEST-039 to TEST-040
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_kpi_collect_daily_snapshot'],
        name: '[TOCC][KPI] daily snapshot collector materializes 16 KPI rows',
        description: 'Validates that TrainingKpiService collects and stores the full KPI set for the current day.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_kpi_collect_daily_snapshot_script'],
            script: `
                var svc = new x_783010_tocc_a1.TrainingKpiService();
                var result = svc.collectDailySnapshot(30);

                gs.assertTrue(result && result.success === true, 'KPI collector should succeed.');
                gs.assertTrue(result.kpis && result.kpis.length === 16, 'Expected 16 KPIs, got: ' + (result.kpis ? result.kpis.length : 0));
                gs.assertTrue(
                    (result.snapshots_inserted + result.snapshots_updated) === 16,
                    'Expected 16 persisted snapshots, got: ' + (result.snapshots_inserted + result.snapshots_updated)
                );

                var today = new GlideDateTime(gs.beginningOfToday()).getValue();
                var gr = new GlideRecord('x_783010_tocc_a1_kpi_snapshot');
                gr.addQuery('snapshot_date', today);
                gr.query();

                var count = 0;
                while (gr.next()) {
                    count++;
                    gs.assertTrue(!gs.nil(gr.getValue('kpi_key')), 'kpi_key is required.');
                    gs.assertTrue(!gs.nil(gr.getValue('kpi_value')), 'kpi_value is required.');
                }

                gs.assertTrue(count === 16, 'Expected 16 KPI rows for today, got: ' + count);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_kpi_collect_is_idempotent'],
        name: '[TOCC][KPI] daily snapshot collector is idempotent per day',
        description: 'Validates that rerunning collection on the same day updates existing rows instead of creating duplicates.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_kpi_collect_is_idempotent_script'],
            script: `
                var svc = new x_783010_tocc_a1.TrainingKpiService();
                var first = svc.collectDailySnapshot(30);
                var second = svc.collectDailySnapshot(30);

                gs.assertTrue(first.success === true, 'First run should succeed.');
                gs.assertTrue(second.success === true, 'Second run should succeed.');
                gs.assertTrue(second.snapshots_inserted === 0, 'Second run must not insert duplicates.');
                gs.assertTrue(second.snapshots_updated === 16, 'Second run should update 16 snapshots.');

                var today = new GlideDateTime(gs.beginningOfToday()).getValue();
                var gr = new GlideRecord('x_783010_tocc_a1_kpi_snapshot');
                gr.addQuery('snapshot_date', today);
                gr.query();

                var count = 0;
                var keys = {};
                while (gr.next()) {
                    count++;
                    keys[gr.getValue('kpi_key')] = true;
                }

                gs.assertTrue(count === 16, 'Expected exactly 16 rows after rerun, got: ' + count);
                gs.assertTrue(Object.keys(keys).length === 16, 'Expected 16 distinct KPI keys.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_kpi_latest_snapshot_contract'],
        name: '[TOCC][KPI] latest snapshot contract returns 16 KPI payload rows',
        description: 'Validates getLatestSnapshot contract for workspace/portal consumers.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_kpi_latest_snapshot_contract_script'],
            script: `
                var svc = new x_783010_tocc_a1.TrainingKpiService();
                var collect = svc.collectDailySnapshot(30);
                gs.assertTrue(collect.success === true, 'collectDailySnapshot should succeed before latest snapshot contract check.');

                var latest = svc.getLatestSnapshot();
                gs.assertTrue(latest.success === true, 'Expected getLatestSnapshot success.');
                gs.assertTrue(!gs.nil(latest.snapshot_date), 'Latest snapshot date should be present.');
                gs.assertTrue(latest.count === 16, 'Expected 16 KPI rows in latest snapshot payload.');
                gs.assertTrue(latest.kpis && latest.kpis.length === 16, 'Expected kpis array with 16 rows.');
                gs.assertTrue(latest.by_key !== undefined, 'Expected by_key object in latest snapshot payload.');
                gs.assertTrue(latest.by_key.training_session_fill_rate !== undefined, 'Missing training_session_fill_rate in by_key.');
                gs.assertTrue(latest.by_key.no_show_rate !== undefined, 'Missing no_show_rate in by_key.');
                gs.assertTrue(latest.by_key.attendance_confirmation_rate !== undefined, 'Missing attendance_confirmation_rate in by_key.');
            `,
        })
    }
)
