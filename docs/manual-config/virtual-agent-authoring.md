# Virtual Agent Authoring (Manual Layer)

This document covers the remaining manual authoring steps in VA Designer/NLU.

## Prerequisites

- Scoped app deployed: `x_783010_tocc_a1`
- Script Include available: `x_783010_tocc_a1.VirtualAgentTopicService`
- Validation baseline: `TEST-041`, `TEST-042`, and portal policy tests passing

## Topic Set

Create/update the following six topics:

1. Find training sessions
2. View my enrollments
3. Confirm my attendance
4. Cancel an enrollment
5. Training policies
6. Talk to Backoffice

## Authoring Pattern

- Keep node logic thin.
- Call adapter methods only:
  - `getMainMenuAsJson()`
  - `findAvailableSessionsAsJson(...)`
  - `getMyEnrollmentsAsJson(...)`
  - `getActionableEnrollmentsAsJson(action, limit)`
  - `confirmAttendanceAsJson(...)`
  - `cancelEnrollmentAsJson(...)`
  - `getTrainingPoliciesAsJson()`
  - `getBackofficeEscalationAsJson()`
- Do not duplicate GlideRecord logic inside topic scripts.
- For confirm/cancel prompts, capture either enrollment `number` (preferred for user readability) or `sys_id`.

## NLU Notes

- Train intents with Portuguese and English utterances.
- Include variants for date/time and cancellation phrases.
- Re-publish model after intent updates.

## Validation

- Student can navigate all six topics end-to-end.
- Policy topic reflects current `TrainingConfigService` values.
- Escalation topic returns current support email and support page URL.
