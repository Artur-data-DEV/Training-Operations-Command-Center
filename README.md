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
- V1 manual por historias: `docs/manual-config/v1-go-live-manual-por-historias.md`
- V1 manual de desenvolvimento/plataforma: `docs/manual-config/v1-manual-desenvolvimento-plataforma.md`
- AES source control linking (safe mode): `docs/manual-config/aes-source-control-linking.md`
- Workspace home + source control hotfix: `docs/manual-config/workspace-home-and-source-control-hotfix.md`
- Platform alignment (VA/PA/CMDB/Workspace): `docs/manual-config/platform-alignment-runbook.md`
- Platform homologation checklist (US-33..US-38): `docs/manual-config/platform-homologation-checklist.md`
- Platform background validation scripts: `docs/manual-config/platform-validation-scripts.md`
- Novas US de finalizacao: `docs/backlog/platform-finalization-user-stories.md`
