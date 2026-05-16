(function() {
    data.reservations = [];
    data.count = 0;
    data.error = '';
    data.summary = {
        submitted: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
    };
    data.links = {
        home: '?id=tocc_home',
        sessions: '?id=tocc_sessions',
        create_reservation: '?id=tocc_home',
    };

    function resolveProducerLink(name, fallback) {
        var item = new GlideRecordSecure('sc_cat_item_producer');
        item.addQuery('name', name);
        item.addQuery('active', true);
        item.orderByDesc('sys_updated_on');
        item.setLimit(1);
        item.query();

        if (item.next()) {
            return '?id=sc_cat_item&sys_id=' + item.getUniqueValue();
        }

        return fallback;
    }

    data.links.create_reservation = resolveProducerLink('Create Room Reservation', data.links.home);

    try {
        var service = new x_783010_tocc_a1.PortalApiService();
        var response = JSON.parse(service.getMyReservations() || '{}');

        if (!response.success) {
            data.error = response.message || 'Unable to load your reservations.';
            return;
        }

        data.reservations = response.reservations || [];
        data.count = data.reservations.length;

        for (var i = 0; i < data.reservations.length; i++) {
            var status = String(data.reservations[i].status || '').toLowerCase();
            if (data.summary[status] !== undefined) {
                data.summary[status] = data.summary[status] + 1;
            }
        }
    } catch (error) {
        data.error = 'Unable to load your reservations.';
        gs.warn('[TOCC][SP][MyReservations] ' + error.message);
    }
})();
