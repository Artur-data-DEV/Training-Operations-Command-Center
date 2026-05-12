# KPI Snapshot Collector Runbook

## Objective

Automate daily KPI data collection in code for US-29 without relying only on manual Performance Analytics setup.

Artifacts delivered:

- Table: `x_783010_tocc_a1_kpi_snapshot`
- Service: `x_783010_tocc_a1.TrainingKpiService`
- Scheduled Job: `[TOCC] Collect KPI Snapshots`
- ATF: KPI collector coverage (`TEST-039` and `TEST-040`)

## Execute Manually (On Demand)

Navigate to **System Definition -> Scripts - Background** and run:

```javascript
var result = new x_783010_tocc_a1.TrainingKpiService().collectDailySnapshot(30);
gs.info('[TOCC][KPI] ' + JSON.stringify(result));
```

## Expected Result

- `result.success = true`
- `result.kpis.length = 16`
- `result.snapshots_inserted + result.snapshots_updated = 16`

For same-day reruns:

- `snapshots_inserted = 0`
- `snapshots_updated = 16`

## Validation Checklist

- [ ] Table `x_783010_tocc_a1_kpi_snapshot` exists and is active
- [ ] Exactly 16 rows exist for `snapshot_date = beginningOfToday()`
- [ ] `kpi_key` values are unique for the day
- [ ] Scheduled job `[TOCC] Collect KPI Snapshots` is active
- [ ] ATF tests `TEST-039` and `TEST-040` pass in the target instance

## Notes

- Collector writes normalized KPI values for trendability and audit.
- Widget-level PA formulas can still be refined, but baseline daily KPI persistence is now automated in app scope.

