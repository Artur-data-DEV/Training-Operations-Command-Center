# Flow Orchestration Activation

This runbook covers activation and verification for the Fluent SDK orchestration flows in:

- `src/fluent/flows/training-orchestration-flows.now.ts`

## What is deployed

The SDK now materializes these records in `sys_hub_flow`:

- `[TOCC][FLOW] Reservation Intake`
- `[TOCC][FLOW] Session Cancelled`
- `[TOCC][FLOW] Daily KPI Refresh Observation`
- `[TOCC][FLOW] Attendance Confirmation Cadence`
- `[TOCC][FLOW] Session Reminder Cadence`
- `[TOCC][SF] Reservation Intake Processing`
- `[TOCC][SF] Session Cancelled Processing`

## Activation sequence

1. Open **Flow Designer** and search for `[TOCC][FLOW]`.
2. Review each flow trigger/condition.
3. Confirm required events exist in **System Policy > Events > Registry**:
   - `x_783010_tocc_a1.reservation.submitted`
   - `x_783010_tocc_a1.session.cancelled`
   - `x_783010_tocc_a1.session.confirmation_request`
   - `x_783010_tocc_a1.session.reminder`
4. Activate flows in this order:
   - `Reservation Intake`
   - `Session Cancelled`
   - `Daily KPI Refresh Observation`
   - `Attendance Confirmation Cadence`
   - `Session Reminder Cadence`

## Post-activation checks

1. Submit a reservation with status `submitted`.
2. Cancel a training session.
3. Confirm entries in `syslog` and `sysevent`.
4. Run ATF:
   - `TEST-047`, `TEST-048`, `TEST-049`

## Notes

- These artifacts are operational orchestration flows versioned in Git.
- Business rules still own data integrity; flows own routing and event dispatch.
