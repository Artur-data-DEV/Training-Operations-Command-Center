# Virtual Agent Topic Backend Runbook

## Objective

Provide a stable backend contract for VA topics through:

- `x_783010_tocc_a1.VirtualAgentTopicService`
- Existing `PortalApiService` methods (wrapped by VA adapter)

This avoids duplicated script logic in topic nodes.

## Methods Exposed

- `getMainMenu()`
- `findAvailableSessions(courseId, locationId, fromDate, limit)`
- `getMyEnrollments(status)`
- `confirmAttendance(enrollmentId)`
- `cancelEnrollment(enrollmentId)`
- `getTrainingPolicies()`
- `getBackofficeEscalation()`

Each method also has `*AsJson` for direct Script Action usage.

## Script Action Example (Policies Topic)

```javascript
var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
var payload = svc.getTrainingPolicies();

if (!payload.success) {
    vaVars.response_text = 'I could not load policy information right now. Please try again later.';
} else {
    vaVars.response_text =
        'Reservations: ' + payload.policies.minimum_advance_notice_hours + 'h in advance. ' +
        'Late cancellation window: ' + payload.policies.late_cancellation_window_hours + 'h. ' +
        'Waitlist mode: ' + payload.policies.waitlist_mode + '.';
    vaVars.kb_link = payload.links.kb;
}
```

## Validation Checklist

- [ ] Script Include `VirtualAgentTopicService` is active in scope `x_783010_tocc_a1`
- [ ] `TEST-041` and `TEST-042` pass
- [ ] Topic Script Actions call only adapter methods (no duplicated GlideRecord logic)
- [ ] Policies topic shows current values from `TrainingConfigService`
- [ ] Escalation topic returns valid email/support page

