# Training Operations Command Center

Baseline for scoped app `x_783010_tocc_a1` on ServiceNow instance:

- Instance: `https://dev372264.service-now.com`
- Release: `Australia Patch 1 (build 2026-03-31)`
- Method: SDK-assisted delivery with `now-sdk` CLI and manual runbooks for unsupported artifacts.

## Quick Start

1. Ensure `now-sdk` CLI is installed and available in PATH.
2. Configure auth alias:
   - `now-sdk auth --add dev372264.service-now.com --type basic --alias dev`
3. Validate project:
   - `npm run build`
4. Deploy:
   - `now-sdk install --auth dev`

## Current Status

- Sprint 0 documentation imported.
- Project structure scaffolded.
- Scope `x_783010_tocc_a1` is registered on the target instance (see runbook).

## Runbooks

- Scope/bootstrap: `docs/manual-config/instance-bootstrap.md`
- SDK fallback/manual steps: `docs/manual-config/sdk-gaps-runbook.md`
