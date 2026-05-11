# DEPLOYMENT_GUIDE.md - Training Operations Command Center

## Deploy Sequence

1. Confirm scope exists and is selected in instance.
2. `now-sdk auth --add dev372264.service-now.com --type basic --alias dev`
3. `now-sdk build`
4. `now-sdk install --auth dev`
5. Run ATF from instance test suites
6. Export Update Set snapshot.

## Rollback

- Revert latest Update Set.
- Restore latest app XML backup.
