(function() {
    data.reservations = [];
    data.count = 0;
    data.error = '';
    data.message = '';
    data.links = {
        home: '?id=tocc_home',
        reservations: '?id=tocc_my_reservations',
        classic_queue: '/now/nav/ui/classic/params/target/x_783010_tocc_a1_room_reservation_list.do?sysparm_query=status%3Dsubmitted',
    };

    function loadQueue() {
        var service = new x_783010_tocc_a1.PortalApiService();
        var response = JSON.parse(service.getBackofficeReservationQueue() || '{}');

        if (!response.success) {
            data.error = response.message || 'Unable to load the backoffice queue.';
            return;
        }

        data.reservations = response.reservations || [];
        data.count = data.reservations.length;
    }

    try {
        if (input && input.action) {
            var actionService = new x_783010_tocc_a1.PortalApiService();
            var result;

            if (input.action === 'approve') {
                result = JSON.parse(actionService.approveReservation(String(input.sys_id || '')) || '{}');
            } else if (input.action === 'reject') {
                result = JSON.parse(actionService.rejectReservation(String(input.sys_id || ''), String(input.reason || '')) || '{}');
            }

            if (result && result.success) {
                data.message = result.message || 'Reservation updated.';
            } else if (result) {
                data.error = result.message || 'Unable to update reservation.';
            }
        }

        loadQueue();
    } catch (error) {
        data.error = 'Unable to load the backoffice queue.';
        gs.warn('[TOCC][SP][BackofficeQueue] ' + error.message);
    }
})();
