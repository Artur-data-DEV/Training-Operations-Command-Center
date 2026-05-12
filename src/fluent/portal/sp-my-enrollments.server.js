(function() {
    data.enrollments = [];
    data.count = 0;
    data.error = '';

    try {
        var service = new x_783010_tocc_a1.PortalApiService();
        var response = JSON.parse(service.getMyEnrollments() || '{}');

        if (!response.success) {
            data.error = response.message || 'Unable to load your enrollments.';
            return;
        }

        data.enrollments = response.enrollments || [];
        data.count = data.enrollments.length;
    } catch (error) {
        data.error = 'Unable to load your enrollments.';
        gs.warn('[TOCC][SP][MyEnrollments] ' + error.message);
    }
})();

