# CMDB Bootstrap Runbook

## Objective

Provision and keep synchronized a minimal CMDB sample baseline for TOCC rooms:

- 3 CIs per room:
  - Projector (`cmdb_ci_hardware`)
  - AV System (`cmdb_ci_hardware`)
  - Room Computer (`cmdb_ci_computer`)
- Link each CI to `x_783010_tocc_a1_room_resource.ci_reference`

## Prerequisites

1. Latest package deployed from this repository.
2. Runner has write access to `cmdb_ci*` and TOCC tables (`admin` is sufficient).
3. Execute in scope `x_783010_tocc_a1`.

## Execute Bootstrap For A Specific Room

Navigate to **System Definition -> Scripts - Background** and run:

```javascript
var roomSysId = '<ROOM_SYS_ID>';
var result = new x_783010_tocc_a1.CmdbBootstrapService().bootstrapSampleAssetsForRoom(roomSysId);
gs.info('[TOCC][CMDB] ' + JSON.stringify(result));
```

## Execute Bootstrap For First Active Room

```javascript
var result = new x_783010_tocc_a1.CmdbBootstrapService().bootstrapSampleAssetsForRoom('');
gs.info('[TOCC][CMDB] ' + JSON.stringify(result));
```

## Expected Result

`result.success` must be `true` and:

- `result.ci_created + result.ci_existing` equals `3`
- `result.resource_created + result.resource_updated` equals `3`
- `result.resources_total` equals `3`

First run should show `created` counters > 0.
Subsequent runs should create no duplicates (`ci_created = 0`, `resource_created = 0`).

## Validation Checklist

- [ ] Room has exactly 3 `x_783010_tocc_a1_room_resource` rows linked to CIs
- [ ] Each resource has non-empty `ci_reference`
- [ ] CI names follow pattern `[TOCC] <Label> - <Room Name>`
- [ ] Re-running bootstrap does not increase resource row count

