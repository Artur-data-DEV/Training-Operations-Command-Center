# Workspace Home + Source Control Hotfix (Immediate)

Instance: `dev372264.service-now.com`
Scope: `x_783010_tocc_a1`

## 1) Workspace `/home` abre "Dashboard not found"

### Root cause
The workspace scaffold creates `route_type=home` using `Dashboards Default`. If no dashboard sysId is bound in the route context, `/home` shows "Dashboard not found".

### Immediate workaround URL
Use:

`/x/783010/tocc-backoffice-ops/home?sysId=0e91812dc4884f8cb00e6fe9fce50337`

If this opens, the issue is route binding, not ACL.

### Permanent hotfix (Background Script)

Run this in **Scripts - Background**:

```javascript
(function() {
  var scopeId = 'c550db709e9c4118920deb53e10aba07';
  var appName = 'TOCC Backoffice Operations Workspace';

  var appCfg = new GlideRecord('sys_ux_app_config');
  appCfg.addQuery('name', appName);
  appCfg.addQuery('sys_scope', scopeId);
  appCfg.setLimit(1);
  appCfg.query();

  if (!appCfg.next()) {
    gs.error('[TOCC] Workspace app config not found: ' + appName);
    return;
  }

  var appCfgId = appCfg.getUniqueValue();

  var listRoute = new GlideRecord('sys_ux_app_route');
  listRoute.addQuery('app_config', appCfgId);
  listRoute.addQuery('route_type', 'list');
  listRoute.setLimit(1);
  listRoute.query();

  if (!listRoute.next()) {
    gs.error('[TOCC] list route not found.');
    return;
  }

  var homeRoute = new GlideRecord('sys_ux_app_route');
  homeRoute.addQuery('app_config', appCfgId);
  homeRoute.addQuery('route_type', 'home');
  homeRoute.setLimit(1);
  homeRoute.query();

  if (!homeRoute.next()) {
    gs.error('[TOCC] home route not found.');
    return;
  }

  homeRoute.setValue('screen_type', listRoute.getValue('screen_type'));
  homeRoute.setValue('fields', listRoute.getValue('fields'));
  homeRoute.setValue('optional_parameters', listRoute.getValue('optional_parameters'));
  homeRoute.setValue('name', 'Backoffice Home (List)');
  homeRoute.update();

  gs.info('[TOCC] Workspace home route patched to list screen_type: ' + homeRoute.getUniqueValue());
})();
```

Then hard refresh and test:
- `/x/783010/tocc-backoffice-ops/home`
- `/x/783010/tocc-backoffice-ops/list`

## 2) AES still showing "Link to source control"

### Why this happens
No successful repository binding was persisted for this app. Common causes:
- no `source_control`/`admin` role,
- PAT/credential rejected,
- stale `sys_repo_config` record from prior failed attempt.

### Fast check
1. Open `sys_repo_config.list`.
2. Filter by app/scope (`x_783010_tocc_a1`) and inspect existing configs.
3. If you see stale/failed config for this app, remove it.
4. Retry AES `Source control -> Link to source control` with:
   - Repo: `https://github.com/Artur-data-DEV/Training-Operations-Command-Center`
   - Branch: `release/v1-platform-closure`

### Expected success signal
After success, `Source control` menu no longer shows only "Link to source control"; it should show commit/pull style actions.

## 3) Git timeline files in AES

Those timeline changes are instance-side metadata history. They only become Git history after source-control link + commit (or SDK export/deploy loop).

Use this order:
1. Link source control in AES.
2. Pull once.
3. Resolve conflicts (prefer repo for SDK-managed artifacts).
4. Commit instance deltas you want to keep.
