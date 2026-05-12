# Flow Scaffold Activation

This runbook covers activation and verification for the Fluent SDK flow scaffolds in:

- `src/fluent/flows/training-orchestration-flows.now.ts`

## What is deployed

The SDK now materializes these records in `sys_hub_flow`:

- `[TOCC][FLOW] Reservation Intake Signal`
- `[TOCC][FLOW] Session Cancelled Signal`
- `[TOCC][FLOW] Daily KPI Refresh Signal`
- `[TOCC][SF] Emit Reservation Intake Signal`
- `[TOCC][SF] Emit Session Cancelled Signal`

## Activation sequence

1. Open **Flow Designer** and search for `[TOCC][FLOW]`.
2. Review each flow trigger/condition.
3. Confirm required events exist in **System Policy > Events > Registry**:
   - `x_783010_tocc_a1.flow.reservation_intake_signal`
   - `x_783010_tocc_a1.flow.session_cancelled_signal`
4. Activate flows in this order:
   - `Reservation Intake Signal`
   - `Session Cancelled Signal`
   - `Daily KPI Refresh Signal`

## Post-activation checks

1. Submit a reservation with status `submitted`.
2. Cancel a training session.
3. Confirm signal entries in `syslog` and `sysevent`.
4. Run ATF:
   - `TEST-043`, `TEST-044`, `TEST-045`

## Notes

- These artifacts are scaffolds to keep orchestration in code and versioned in Git.
- Business logic remains in Script Includes and Business Rules; flow steps are orchestration/signal focused.
