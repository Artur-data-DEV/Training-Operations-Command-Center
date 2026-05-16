(function() {
    data.sessions = [];
    data.count = 0;
    data.error = '';
    data.links = {
        home: '?id=tocc_home',
        my_enrollments: '?id=tocc_my_enrollments',
        my_reservations: '?id=tocc_my_reservations',
    };

    try {
        var service = new x_783010_tocc_a1.PortalApiService();
        var response = JSON.parse(service.getAvailableSessions() || '{}');

        if (!response.success) {
            data.error = response.message || 'Unable to load available sessions.';
            return;
        }

        var sessions = response.sessions || [];
        var maxItems = parseInt(options.max_items, 10);

        if (!isNaN(maxItems) && maxItems > 0 && sessions.length > maxItems) {
            sessions = sessions.slice(0, maxItems);
        }

        data.sessions = sessions;
        data.count = sessions.length;

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
    } catch (error) {
        data.error = 'Unable to load available sessions.';
        gs.warn('[TOCC][SP][SessionBrowser] ' + error.message);
    }
})();
