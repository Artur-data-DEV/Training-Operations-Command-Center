(function() {
    data.links = {
        sessions: '?id=tocc_sessions',
        enrollments: '?id=tocc_my_enrollments',
        reservations: '?id=tocc_my_reservations',
        create_reservation: '?id=sc_cat_item&sys_id=c11dcd1c8a504596987690589d4b12b3',
        request_enrollment: '?id=sc_cat_item&sys_id=2ffecad2bac04aec8f76f48ddce4d406',
        help: '?id=tocc_help',
        sow_home: '/now/sow/home',
    };

    data.persona = {
        is_student:
            gs.hasRole('x_783010_tocc_a1.student') ||
            gs.hasRole('x_783010_tocc_a1.admin') ||
            gs.hasRole('admin'),
        is_instructor:
            gs.hasRole('x_783010_tocc_a1.instructor') ||
            gs.hasRole('x_783010_tocc_a1.admin') ||
            gs.hasRole('admin'),
    };

    data.operations = null;
    data.kpi_highlights = null;
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
            data.kpi_highlights = result.kpi_highlights || { snapshot_date: '', metrics: [] };
        } else {
            data.operations_error = result.message || 'Unable to load operational snapshot.';
        }
    } catch (ex) {
        data.operations_error = ex && ex.message ? ex.message : String(ex);
    }
})();
