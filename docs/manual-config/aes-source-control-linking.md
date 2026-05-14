# AES Source Control Linking (Safe Mode)

## Why it is not linked yet

Current delivery flow has been `now-sdk build/install` from local Git. This deploys artifacts to the instance, but it does **not** auto-create the App Engine Studio source-control binding.

So both statements are true:
- Local project is versioned in Git.
- AES app is still showing `Link to source control`.

## Target

Link AES app `Training Operations Command Center` to the same Git repository **without creating drift** with the SDK-managed baseline.

Repository:
- `https://github.com/Artur-data-DEV/Training-Operations-Command-Center`

Recommended branch for first link:
- `release/v1-platform-closure`

## Source-of-truth rule

For this project, keep **Git repository as source-of-truth** and instance as deploy target.

If conflict appears during link/pull:
- prefer **remote/repository version** unless you intentionally changed that artifact only in the instance.

## Pre-flight checklist

1. Local branch has the baseline commits you want linked.
2. Baseline branch is pushed to remote.
3. You have a Git PAT/token with repository access.
4. User in ServiceNow has `admin` (or `source_control`) role.

## Step 1 - Push baseline branch

From local terminal:

```powershell
git switch release/v1-platform-closure
git push -u origin release/v1-platform-closure
```

## Step 2 - Link from App Engine Studio

In AES (`Training Operations Command Center` app):

1. Click `Source control` -> `Link to source control`.
2. Fill:
   - URL: `https://github.com/Artur-data-DEV/Training-Operations-Command-Center`
   - Branch: `release/v1-platform-closure`
   - Credentials: PAT/credential alias
3. Confirm link.

Notes:
- If UI asks path/folder, keep default app path used by the repo root (do not invent subfolder).
- If UI offers `Import from source control` for a new app, do not create a second app. Use link for the current scoped app.

## Step 3 - First synchronization after linking

1. Run `Pull`/`Apply remote changes` once.
2. Resolve any conflicts using this priority:
   - SDK-managed files/tables: keep **remote**.
   - Intentional instance-only change you want to keep: keep **local**, then commit immediately.
3. Validate no pending unresolved conflicts.

## Step 4 - Verify linkage is active

In AES Source control menu, options should now include actions like:
- Commit changes
- Pull/apply changes
- Branch actions

And `Link to source control` should no longer be the only primary action.

## Step 5 - Workspace Home dashboard binding (known gap)

Current workspace `home` route is `Dashboards Default`. If no dashboard sysId is bound, Home can show `Dashboard not found`.

Immediate validation URL:

`/x/783010/tocc-backoffice-ops/home?sysId=0e91812dc4884f8cb00e6fe9fce50337`

If this works, linkage is fine and the issue is only route/dashboard binding.

## Post-link operating model

- Structural changes: develop in local repo -> commit -> push -> deploy via `now-sdk`.
- Optional AES edits: allowed for UI tuning, but must be committed/pulled back to Git immediately to avoid drift.
- Never keep long-lived instance-only changes.
