import { BusinessRule } from '@servicenow/sdk/core'

BusinessRule({
    $id: Now.ID['x_783010_tocc_a1_br_validate_room_resource_ci_reference'],
    table: 'x_783010_tocc_a1_room_resource',
    name: 'Validate Room Resource CI Reference',
    when: 'before',
    action: ['insert', 'update'],
    active: true,
    order: 100,
    script: `(function executeRule(current, previous) {
    var svc = new CmdbResourceService();
    var error = svc.applyBeforeSave(current);
    if (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
    }
})(current, previous);`,
})
