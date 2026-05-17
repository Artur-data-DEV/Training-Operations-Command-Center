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

- Core implementation (Sprints 1–5) delivered and versioned.
- Release branch active: `release/v1-platform-closure`.
- Manual closure in progress for: VA topic publication, KB publish, and PA indicator wiring.
- Workspace and dashboard scaffolds deployed; home-route/dashboard binding runbook available.
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

## Foundation Baselines

- Persona experience architecture: `docs/foundation/persona-experience-architecture.md`
- Role and ACL control matrix: `docs/foundation/role-acl-control-matrix.md`
- Increment acceptance criteria: `docs/foundation/increment-acceptance-criteria.md`
- Platform execution backlog: `docs/foundation/platform-execution-backlog.md`
- Homologation baseline status: `docs/foundation/homologation-baseline-status.md`
- Homologation run log (2026-05-17): `docs/foundation/homologation-run-2026-05-17.md`
- Homologation checklist snapshot (2026-05-17): `docs/foundation/homologation-checklist-2026-05-17.md`

## Build and Generated Metadata Notes

- `now-sdk build` may update `src/fluent/generated/keys.ts`.
- Treat `keys.ts` diffs as generated metadata and always classify intent in release scope:
  - intended metadata evolution, or
  - regeneration noise.
