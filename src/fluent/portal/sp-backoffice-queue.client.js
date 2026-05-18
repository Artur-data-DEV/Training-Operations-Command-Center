api.controller = function($scope, spUtil) {
    var c = this;
    c.submitting = {};

    c.issueText = function(reservation) {
        return ((reservation && reservation.data_quality_issues) || []).join(', ');
    };

    c.hasIssues = function(reservation) {
        return !!(reservation && reservation.data_quality_issues && reservation.data_quality_issues.length);
    };

    c.approve = function(reservation) {
        if (!reservation || !reservation.sys_id || c.submitting[reservation.sys_id]) {
            return;
        }

        c.submitting[reservation.sys_id] = true;
        c.server.get({
            action: 'approve',
            sys_id: reservation.sys_id,
        }).then(function(response) {
            c.submitting[reservation.sys_id] = false;
            c.data = response.data || c.data;
            if (c.data.error) {
                spUtil.addErrorMessage(c.data.error);
            } else {
                spUtil.addInfoMessage(c.data.message || 'Reservation approved.');
            }
        });
    };

    c.reject = function(reservation) {
        if (!reservation || !reservation.sys_id || c.submitting[reservation.sys_id]) {
            return;
        }

        var reason = window.prompt('Reject reason');
        if (reason === null) {
            return;
        }

        c.submitting[reservation.sys_id] = true;
        c.server.get({
            action: 'reject',
            sys_id: reservation.sys_id,
            reason: reason || '',
        }).then(function(response) {
            c.submitting[reservation.sys_id] = false;
            c.data = response.data || c.data;
            if (c.data.error) {
                spUtil.addErrorMessage(c.data.error);
            } else {
                spUtil.addInfoMessage(c.data.message || 'Reservation rejected.');
            }
        });
    };
};
