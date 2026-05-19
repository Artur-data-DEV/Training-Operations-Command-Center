import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_training_kpi_service'],
    name: 'TrainingKpiService',
    apiName: 'x_783010_tocc_a1.TrainingKpiService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var TrainingKpiService = Class.create();
TrainingKpiService.prototype = {
    initialize: function() {
        this.kpiTable = 'x_783010_tocc_a1_kpi_snapshot';
        this.reservationTable = 'x_783010_tocc_a1_room_reservation';
        this.roomTable = 'x_783010_tocc_a1_room';
        this.sessionTable = 'x_783010_tocc_a1_training_session';
        this.enrollmentTable = 'x_783010_tocc_a1_student_enrollment';
        this.attendanceTable = 'x_783010_tocc_a1_attendance';
        this.feedbackTable = 'x_783010_tocc_a1_training_feedback';
        this.reservationResourceTable = 'x_783010_tocc_a1_reservation_resource';
    },

    collectDailySnapshot: function(daysBack) {
        var summary = {
            success: true,
            message: '',
            days_back: parseInt(daysBack, 10) || 30,
            snapshot_date: '',
            total_kpis_expected: 16,
            snapshots_inserted: 0,
            snapshots_updated: 0,
            kpis: [],
        };

        try {
            var range = this._buildRange(summary.days_back);
            var snapshotDate = this._todayStartValue();
            summary.snapshot_date = snapshotDate;

            var metrics = this._calculateMetrics(range);
            for (var i = 0; i < metrics.length; i++) {
                var metric = metrics[i];
                var upsert = this._upsertKpiSnapshot(metric, range, snapshotDate);
                if (upsert.action === 'inserted') {
                    summary.snapshots_inserted = summary.snapshots_inserted + 1;
                } else {
                    summary.snapshots_updated = summary.snapshots_updated + 1;
                }
                summary.kpis.push({
                    key: metric.key,
                    value: metric.value,
                    unit: metric.unit,
                    action: upsert.action,
                });
            }

            if (metrics.length !== summary.total_kpis_expected) {
                summary.success = false;
                summary.message = 'KPI list size mismatch. Expected ' + summary.total_kpis_expected + ', got ' + metrics.length;
            } else {
                summary.message = 'KPI snapshot collection completed successfully.';
            }
        } catch (ex) {
            summary.success = false;
            summary.message = 'KPI snapshot collection failed: ' + this._toErrorMessage(ex);
            gs.error('[TOCC][TrainingKpiService] ' + summary.message);
        }

        return summary;
    },

    collectDailySnapshotAsJson: function(daysBack) {
        return JSON.stringify(this.collectDailySnapshot(daysBack));
    },

    getLatestSnapshot: function() {
        try {
            var latestDate = this._getLatestSnapshotDate();
            if (!latestDate) {
                return {
                    success: true,
                    snapshot_date: '',
                    count: 0,
                    kpis: [],
                    by_key: {},
                    message: 'No KPI snapshot rows found.',
                };
            }

            var rows = [];
            var byKey = {};

            var gr = new GlideRecord(this.kpiTable);
            gr.addQuery('active', true);
            gr.addQuery('snapshot_date', latestDate);
            gr.orderBy('kpi_category');
            gr.orderBy('kpi_label');
            gr.query();

            while (gr.next()) {
                var row = {
                    key: gr.getValue('kpi_key'),
                    label: gr.getValue('kpi_label'),
                    category: gr.getValue('kpi_category'),
                    value: this._asNumber(gr.getValue('kpi_value')),
                    unit: gr.getValue('kpi_unit'),
                    period_start: gr.getValue('period_start'),
                    period_end: gr.getValue('period_end'),
                    source_table: gr.getValue('source_table'),
                    details: gr.getValue('details'),
                };
                rows.push(row);
                byKey[row.key] = row;
            }

            return {
                success: true,
                snapshot_date: latestDate,
                count: rows.length,
                kpis: rows,
                by_key: byKey,
            };
        } catch (ex) {
            return {
                success: false,
                message: 'Failed to load latest KPI snapshot: ' + this._toErrorMessage(ex),
                snapshot_date: '',
                count: 0,
                kpis: [],
                by_key: {},
            };
        }
    },

    getLatestSnapshotAsJson: function() {
        return JSON.stringify(this.getLatestSnapshot());
    },

    _buildRange: function(daysBack) {
        var end = new GlideDateTime();
        var start = new GlideDateTime(end.getValue());
        start.addDaysUTC(-1 * daysBack);

        return {
            startValue: start.getValue(),
            endValue: end.getValue(),
            startNumeric: start.getNumericValue(),
            endNumeric: end.getNumericValue(),
            daysBack: daysBack,
        };
    },

    _getLatestSnapshotDate: function() {
        var agg = new GlideAggregate(this.kpiTable);
        agg.addQuery('active', true);
        agg.addAggregate('MAX', 'snapshot_date');
        agg.query();
        if (!agg.next()) {
            return '';
        }
        return agg.getAggregate('MAX', 'snapshot_date') || '';
    },

    _calculateMetrics: function(range) {
        var metrics = [];

        // KPI-01: Room Conflict Rate (%)
        var reservationsTotal = this._countByDate(this.reservationTable, 'sys_created_on', range.startValue, range.endValue, null);
        var reservationsRejected = this._countByDate(this.reservationTable, 'sys_created_on', range.startValue, range.endValue, function(gr) {
            gr.addQuery('status', 'rejected');
        });
        metrics.push(this._metricPercent('room_conflict_rate', 'Room Conflict Rate', 'executive', reservationsRejected, reservationsTotal, this.reservationTable));

        // KPI-02: Room Occupancy Rate (%)
        var activeRooms = this._countSimple(this.roomTable, function(gr) {
            gr.addQuery('status', 'active');
        });
        var totalAvailableHours = activeRooms * (range.daysBack * 24);
        var occupiedHours = this._sumSessionHours(range);
        metrics.push(this._metricPercent(
            'room_occupancy_rate',
            'Room Occupancy Rate',
            'executive',
            occupiedHours,
            totalAvailableHours,
            this.sessionTable
        ));

        // KPI-03: Training Session Fill Rate (%)
        metrics.push(this._sessionFillRateMetric(range));

        // KPI-04: No-Show Rate (%)
        var attendanceTotal = this._countByDate(this.attendanceTable, 'sys_created_on', range.startValue, range.endValue, null);
        var attendanceNoShow = this._countByDate(this.attendanceTable, 'sys_created_on', range.startValue, range.endValue, function(gr) {
            gr.addQuery('attendance_status', 'no_show');
        });
        metrics.push(this._metricPercent('no_show_rate', 'No-Show Rate', 'executive', attendanceNoShow, attendanceTotal, this.attendanceTable));

        // KPI-05: Attendance Confirmation Rate (%)
        var approvedEnrollments = this._countByDate(this.enrollmentTable, 'sys_created_on', range.startValue, range.endValue, function(gr) {
            gr.addQuery('status', 'approved');
        });
        var confirmedEnrollments = this._countByDate(this.enrollmentTable, 'sys_created_on', range.startValue, range.endValue, function(gr) {
            gr.addQuery('status', 'approved');
            gr.addQuery('confirmed', true);
        });
        metrics.push(this._metricPercent(
            'attendance_confirmation_rate',
            'Attendance Confirmation Rate',
            'enrollment',
            confirmedEnrollments,
            approvedEnrollments,
            this.enrollmentTable
        ));

        // KPI-06: Average Reservation Approval Time (hours)
        metrics.push(this._avgApprovalHoursMetric(
            'avg_reservation_approval_time_hours',
            'Average Reservation Approval Time',
            this.reservationTable,
            range
        ));

        // KPI-07: Average Enrollment Approval Time (hours)
        metrics.push(this._avgApprovalHoursMetric(
            'avg_enrollment_approval_time_hours',
            'Average Enrollment Approval Time',
            this.enrollmentTable,
            range
        ));

        // KPI-08: Enrollment Cancellation Rate (%)
        var cancelledEnrollments = this._countByDate(this.enrollmentTable, 'sys_created_on', range.startValue, range.endValue, function(gr) {
            gr.addQuery('status', 'cancelled');
        });
        var approvedOrCancelledEnrollments = this._countByDate(
            this.enrollmentTable,
            'sys_created_on',
            range.startValue,
            range.endValue,
            function(gr) {
                gr.addQuery('status', 'IN', 'approved,cancelled');
            }
        );
        metrics.push(this._metricPercent(
            'enrollment_cancellation_rate',
            'Enrollment Cancellation Rate',
            'enrollment',
            cancelledEnrollments,
            approvedOrCancelledEnrollments,
            this.enrollmentTable
        ));

        // KPI-09: Blocked Late Cancellations (count)
        var blockedLateCancellations = this._countJournalContains(
            this.enrollmentTable,
            '[BLOCKED] Late cancellation',
            range.startValue,
            range.endValue
        );
        metrics.push(this._metricCount(
            'blocked_late_cancellations',
            'Blocked Late Cancellations',
            'enrollment',
            blockedLateCancellations,
            'sys_journal_field'
        ));

        // KPI-10: Waitlist Conversion Rate (%)
        var promotedFromWaitlist = this._countJournalContains(
            this.enrollmentTable,
            'Promoted from waitlist',
            range.startValue,
            range.endValue
        );
        var currentWaitlisted = this._countByDate(this.enrollmentTable, 'sys_created_on', range.startValue, range.endValue, function(gr) {
            gr.addQuery('status', 'waitlisted');
        });
        var everWaitlisted = promotedFromWaitlist + currentWaitlisted;
        metrics.push(this._metricPercent(
            'waitlist_conversion_rate',
            'Waitlist Conversion Rate',
            'enrollment',
            promotedFromWaitlist,
            everWaitlisted,
            this.enrollmentTable
        ));

        // KPI-11: Sessions by Status (count)
        var sessionsByStatus = this._countByDate(this.sessionTable, 'sys_created_on', range.startValue, range.endValue, null);
        metrics.push(this._metricCount('sessions_by_status_count', 'Sessions by Status', 'operations', sessionsByStatus, this.sessionTable));

        // KPI-12: Reservations by Status (count)
        var reservationsByStatus = this._countByDate(this.reservationTable, 'sys_created_on', range.startValue, range.endValue, null);
        metrics.push(this._metricCount(
            'reservations_by_status_count',
            'Reservations by Status',
            'operations',
            reservationsByStatus,
            this.reservationTable
        ));

        // KPI-13: Most Used Rooms (top room count)
        var mostUsedRooms = this._topGroupCount(
            this.sessionTable,
            'room',
            range.startValue,
            range.endValue,
            function(gr) { gr.addQuery('status', 'completed'); }
        );
        metrics.push(this._metricCount('most_used_rooms_top_count', 'Most Used Rooms (Top Count)', 'operations', mostUsedRooms, this.sessionTable));

        // KPI-14: Most Requested Resources (top resource count)
        var mostRequestedResources = this._topGroupCount(
            this.reservationResourceTable,
            'resource_name',
            range.startValue,
            range.endValue,
            null
        );
        metrics.push(this._metricCount(
            'most_requested_resources_top_count',
            'Most Requested Resources (Top Count)',
            'operations',
            mostRequestedResources,
            this.reservationResourceTable
        ));

        // KPI-15: Knowledge Article Views (count)
        var kbViews = this._countKbViews(range.startValue, range.endValue);
        metrics.push(this._metricCount('knowledge_article_views', 'Knowledge Article Views', 'self_service', kbViews, 'kb_view'));

        // KPI-16: Feedback Average Rating (1-5)
        var avgFeedbackRating = this._avgFieldByDate(this.feedbackTable, 'rating', 'sys_created_on', range.startValue, range.endValue, null);
        metrics.push(this._metricRating('feedback_average_rating', 'Feedback Average Rating', 'self_service', avgFeedbackRating, this.feedbackTable));

        return metrics;
    },

    _sessionFillRateMetric: function(range) {
        var session = new GlideRecord(this.sessionTable);
        this._addDateRange(session, 'end_datetime', range.startValue, range.endValue);
        session.addQuery('status', 'completed');
        session.query();

        var sumPercent = 0;
        var count = 0;
        while (session.next()) {
            var totalSeats = parseInt(session.getValue('total_seats'), 10) || 0;
            if (totalSeats <= 0) {
                continue;
            }
            var availableSeats = parseInt(session.getValue('available_seats'), 10) || 0;
            var occupiedSeats = totalSeats - availableSeats;
            if (occupiedSeats < 0) {
                occupiedSeats = 0;
            }
            sumPercent = sumPercent + (occupiedSeats / totalSeats) * 100;
            count = count + 1;
        }

        var avgFill = count > 0 ? sumPercent / count : 0;
        return this._metricPercent('training_session_fill_rate', 'Training Session Fill Rate', 'executive', avgFill, 100, this.sessionTable, true);
    },

    _avgApprovalHoursMetric: function(key, label, tableName, range) {
        var gr = new GlideRecord(tableName);
        this._addDateRange(gr, 'sys_created_on', range.startValue, range.endValue);
        gr.addQuery('status', 'approved');
        gr.query();

        var totalHours = 0;
        var count = 0;
        while (gr.next()) {
            var created = gr.getValue('sys_created_on');
            var updated = gr.getValue('sys_updated_on');
            if (!created || !updated) {
                continue;
            }
            var createdGdt = new GlideDateTime(created);
            var updatedGdt = new GlideDateTime(updated);
            var diffMs = updatedGdt.getNumericValue() - createdGdt.getNumericValue();
            if (diffMs < 0) {
                continue;
            }
            totalHours = totalHours + (diffMs / 3600000);
            count = count + 1;
        }

        var avgHours = count > 0 ? totalHours / count : 0;
        return this._metricHours(key, label, 'executive', avgHours, tableName);
    },

    _sumSessionHours: function(range) {
        var session = new GlideRecord(this.sessionTable);
        session.addQuery('status', 'IN', 'completed,in_progress');
        session.addQuery('start_datetime', '<=', range.endValue);
        session.addQuery('end_datetime', '>=', range.startValue);
        session.query();

        var totalMs = 0;
        while (session.next()) {
            var rawStart = session.getValue('start_datetime');
            var rawEnd = session.getValue('end_datetime');
            if (!rawStart || !rawEnd) {
                continue;
            }

            var startMs = new GlideDateTime(rawStart).getNumericValue();
            var endMs = new GlideDateTime(rawEnd).getNumericValue();
            var overlapStart = Math.max(startMs, range.startNumeric);
            var overlapEnd = Math.min(endMs, range.endNumeric);
            if (overlapEnd > overlapStart) {
                totalMs = totalMs + (overlapEnd - overlapStart);
            }
        }

        return totalMs / 3600000;
    },

    _countKbViews: function(startValue, endValue) {
        try {
            var gr = new GlideRecord('kb_view');
            this._addDateRange(gr, 'sys_created_on', startValue, endValue);
            if (gr.isValidField('kb_knowledge_base')) {
                gr.addNotNullQuery('kb_knowledge_base');
            }
            gr.query();

            var count = 0;
            while (gr.next()) {
                count = count + 1;
            }
            return count;
        } catch (e) {
            gs.warn('[TOCC][TrainingKpiService] _countKbViews failed (likely missing cross-scope privilege): ' + this._toErrorMessage(e));
            return 0;
        }
    },

    _countJournalContains: function(tableName, text, startValue, endValue) {
        try {
            var gr = new GlideRecord('sys_journal_field');
            gr.addQuery('name', tableName);
            gr.addQuery('element', 'work_notes');
            this._addDateRange(gr, 'sys_created_on', startValue, endValue);
            gr.addQuery('value', 'CONTAINS', text);
            gr.query();

            var count = 0;
            while (gr.next()) {
                count = count + 1;
            }
            return count;
        } catch (e) {
            gs.warn('[TOCC][TrainingKpiService] _countJournalContains failed (likely missing cross-scope privilege): ' + this._toErrorMessage(e));
            return 0;
        }
    },

    _countSimple: function(tableName, queryFn) {
        var agg = new GlideAggregate(tableName);
        if (queryFn) {
            queryFn(agg);
        }
        agg.addAggregate('COUNT');
        agg.query();
        if (!agg.next()) {
            return 0;
        }
        return parseInt(agg.getAggregate('COUNT'), 10) || 0;
    },

    _countByDate: function(tableName, dateField, startValue, endValue, queryFn) {
        var agg = new GlideAggregate(tableName);
        this._addDateRange(agg, dateField, startValue, endValue);
        if (queryFn) {
            queryFn(agg);
        }
        agg.addAggregate('COUNT');
        agg.query();
        if (!agg.next()) {
            return 0;
        }
        return parseInt(agg.getAggregate('COUNT'), 10) || 0;
    },

    _avgFieldByDate: function(tableName, fieldName, dateField, startValue, endValue, queryFn) {
        var agg = new GlideAggregate(tableName);
        this._addDateRange(agg, dateField, startValue, endValue);
        if (queryFn) {
            queryFn(agg);
        }
        agg.addAggregate('AVG', fieldName);
        agg.query();
        if (!agg.next()) {
            return 0;
        }
        return parseFloat(agg.getAggregate('AVG', fieldName)) || 0;
    },

    _topGroupCount: function(tableName, groupField, startValue, endValue, queryFn) {
        var agg = new GlideAggregate(tableName);
        if (queryFn) {
            queryFn(agg);
        }
        if (agg.isValidField('sys_created_on')) {
            this._addDateRange(agg, 'sys_created_on', startValue, endValue);
        }
        agg.addAggregate('COUNT');
        agg.groupBy(groupField);
        agg.query();

        var top = 0;
        while (agg.next()) {
            var c = parseInt(agg.getAggregate('COUNT'), 10) || 0;
            if (c > top) {
                top = c;
            }
        }
        return top;
    },

    _addDateRange: function(gr, fieldName, startValue, endValue) {
        if (!fieldName || !gr.isValidField(fieldName)) {
            return;
        }
        gr.addQuery(fieldName, '>=', startValue);
        gr.addQuery(fieldName, '<=', endValue);
    },

    _metricPercent: function(key, label, category, numerator, denominator, sourceTable, alreadyPercentValue) {
        var value = 0;
        if (alreadyPercentValue) {
            value = numerator || 0;
        } else if (denominator > 0) {
            value = (numerator / denominator) * 100;
        }

        return {
            key: key,
            label: label,
            category: category,
            unit: 'percent',
            value: this._round(value, 2),
            sourceTable: sourceTable,
            details: 'numerator=' + this._round(numerator, 2) + '; denominator=' + this._round(denominator, 2),
        };
    },

    _metricCount: function(key, label, category, count, sourceTable) {
        return {
            key: key,
            label: label,
            category: category,
            unit: 'count',
            value: this._round(count, 0),
            sourceTable: sourceTable,
            details: 'count=' + this._round(count, 0),
        };
    },

    _metricHours: function(key, label, category, hours, sourceTable) {
        return {
            key: key,
            label: label,
            category: category,
            unit: 'hours',
            value: this._round(hours, 2),
            sourceTable: sourceTable,
            details: 'avg_hours=' + this._round(hours, 2),
        };
    },

    _metricRating: function(key, label, category, rating, sourceTable) {
        return {
            key: key,
            label: label,
            category: category,
            unit: 'rating',
            value: this._round(rating, 2),
            sourceTable: sourceTable,
            details: 'avg_rating=' + this._round(rating, 2),
        };
    },

    _upsertKpiSnapshot: function(metric, range, snapshotDate) {
        var gr = new GlideRecord(this.kpiTable);
        gr.addQuery('kpi_key', metric.key);
        gr.addQuery('snapshot_date', snapshotDate);
        gr.setLimit(1);
        gr.query();

        var action = 'updated';
        if (!gr.next()) {
            gr.initialize();
            gr.setValue('kpi_key', metric.key);
            gr.setValue('snapshot_date', snapshotDate);
            action = 'inserted';
        }

        gr.setValue('kpi_label', metric.label);
        gr.setValue('kpi_category', metric.category);
        gr.setValue('kpi_value', String(metric.value));
        gr.setValue('kpi_unit', metric.unit);
        gr.setValue('period_start', range.startValue);
        gr.setValue('period_end', range.endValue);
        gr.setValue('source_table', metric.sourceTable);
        gr.setValue('details', metric.details);
        gr.setValue('active', true);

        if (action === 'inserted') {
            gr.insert();
        } else {
            gr.update();
        }

        return { action: action, sys_id: gr.getUniqueValue() };
    },

    _round: function(value, decimals) {
        var num = parseFloat(value);
        if (isNaN(num)) {
            num = 0;
        }
        var precision = Math.pow(10, decimals);
        return Math.round(num * precision) / precision;
    },

    _asNumber: function(value) {
        var num = parseFloat(value);
        if (isNaN(num)) {
            return 0;
        }
        return num;
    },

    _todayStartValue: function() {
        var start = new GlideDateTime(gs.beginningOfToday());
        return start.getValue();
    },

    _toErrorMessage: function(error) {
        if (!error) {
            return 'Unknown error';
        }
        if (error.message) {
            return String(error.message);
        }
        return String(error);
    },

    type: 'TrainingKpiService'
};`,
})
