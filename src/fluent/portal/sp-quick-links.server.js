(function() {
    data.links = {
        sessions: '?id=tocc_sessions',
        enrollments: '?id=tocc_my_enrollments',
        reservations: '?id=tocc_my_reservations',
        help: '?id=tocc_help',
    };

    data.operations = null;
    data.operations_error = '';
    data.show_operations = false;

    var canViewOperations =
        gs.hasRole('admin') ||
        gs.hasRole('x_783010_tocc_a1.admin') ||
        gs.hasRole('x_783010_tocc_a1.backoffice') ||
        gs.hasRole('x_783010_tocc_a1.manager');

    if (!canViewOperations) {
        return;
    }

    data.show_operations = true;

    try {
        var svc = new x_783010_tocc_a1.PortalApiService();
        var result = JSON.parse(svc.getOperationsSnapshot());

        if (result.success && result.snapshot) {
            data.operations = result.snapshot;
        } else {
            data.operations_error = result.message || 'Unable to load operational snapshot.';
        }
    } catch (ex) {
        data.operations_error = ex && ex.message ? ex.message : String(ex);
    }
})();
