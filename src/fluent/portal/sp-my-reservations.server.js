(function() {
    data.reservations = [];
    data.count = 0;
    data.error = '';

    try {
        var service = new x_783010_tocc_a1.PortalApiService();
        var response = JSON.parse(service.getMyReservations() || '{}');

        if (!response.success) {
            data.error = response.message || 'Unable to load your reservations.';
            return;
        }

        data.reservations = response.reservations || [];
        data.count = data.reservations.length;
    } catch (error) {
        data.error = 'Unable to load your reservations.';
        gs.warn('[TOCC][SP][MyReservations] ' + error.message);
    }
})();

