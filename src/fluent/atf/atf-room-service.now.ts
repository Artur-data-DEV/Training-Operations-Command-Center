import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: RoomService — Availability & Validation
// TEST-008 to TEST-012
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_room_no_conflict_non_overlapping'],
        name: '[TOCC][ROOM] No conflict for non-overlapping reservations',
        description: 'Two reservations in the same room at different times should not conflict.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        const roomRnd = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_room_no_conflict_rnd'],
            length: 6,
        })

        const room = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_no_conflict_room'],
            table: 'x_783010_tocc_a1_room',
            fieldValues: {
                room_name: roomRnd.random_string,
                room_code: roomRnd.random_string,
                capacity: 20,
                room_type: 'classroom',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        const course = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_no_conflict_course'],
            table: 'x_783010_tocc_a1_course',
            fieldValues: {
                course_id: roomRnd.random_string,
                course_name: roomRnd.random_string,
                description: 'ATF room conflict fixture course',
                duration_hours: 2,
                delivery_category: 'in_person',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })
        // First reservation: 09:00–11:00
        atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_no_conflict_res1'],
            table: 'x_783010_tocc_a1_room_reservation',
            fieldValues: { tocc_course: course.record_id, tocc_room: room.record_id, tocc_instructor: '6816f79cc0a8016401c5a33be04be441', start_datetime: '2035-06-01 09:00:00', end_datetime: '2035-06-01 11:00:00', status: 'approved', expected_participants: 10, short_description: 'ATF res1' },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        // Second reservation: 11:00–13:00 — should not conflict
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_room_no_conflict_check'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var svc = new x_783010_tocc_a1.RoomService();
                var result = svc.hasConflict('${room.record_id}', '2035-06-01 11:00:00', '2035-06-01 13:00:00', null);
                assertFalse(result, 'Expected no conflict for non-overlapping slot. Got: ' + result);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_room_conflict_overlapping'],
        name: '[TOCC][ROOM] Conflict detected for overlapping reservations',
        description: 'Two reservations in the same room with overlapping times must produce a conflict.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        const roomRnd = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_room_conflict_rnd'],
            length: 6,
        })

        const room = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_conflict_room'],
            table: 'x_783010_tocc_a1_room',
            fieldValues: {
                room_name: roomRnd.random_string,
                room_code: roomRnd.random_string,
                capacity: 20,
                room_type: 'classroom',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        const course = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_conflict_course'],
            table: 'x_783010_tocc_a1_course',
            fieldValues: {
                course_id: roomRnd.random_string,
                course_name: roomRnd.random_string,
                description: 'ATF room conflict fixture course',
                duration_hours: 2,
                delivery_category: 'in_person',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_conflict_res1'],
            table: 'x_783010_tocc_a1_room_reservation',
            fieldValues: { tocc_course: course.record_id, tocc_room: room.record_id, tocc_instructor: '6816f79cc0a8016401c5a33be04be441', start_datetime: '2035-07-01 09:00:00', end_datetime: '2035-07-01 11:00:00', status: 'approved', expected_participants: 10, short_description: 'ATF conflict base' },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_room_conflict_check'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var svc = new x_783010_tocc_a1.RoomService();
                // 10:00–12:00 overlaps with 09:00–11:00
                var result = svc.hasConflict('${room.record_id}', '2035-07-01 10:00:00', '2035-07-01 12:00:00', null);
                assertTrue(result === true, 'Expected conflict for overlapping slot. Got: ' + result);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_room_conflict_ignores_cancelled'],
        name: '[TOCC][ROOM] Conflict check ignores cancelled reservations',
        description: 'A cancelled reservation in the same slot should not trigger a conflict.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        const roomRnd = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_room_ignore_cancelled_rnd'],
            length: 6,
        })

        const room = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_ignore_cancelled_room'],
            table: 'x_783010_tocc_a1_room',
            fieldValues: {
                room_name: roomRnd.random_string,
                room_code: roomRnd.random_string,
                capacity: 20,
                room_type: 'classroom',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        const course = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_ignore_cancelled_course'],
            table: 'x_783010_tocc_a1_course',
            fieldValues: {
                course_id: roomRnd.random_string,
                course_name: roomRnd.random_string,
                description: 'ATF room conflict fixture course',
                duration_hours: 2,
                delivery_category: 'in_person',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_ignore_cancelled_res'],
            table: 'x_783010_tocc_a1_room_reservation',
            fieldValues: { tocc_course: course.record_id, tocc_room: room.record_id, tocc_instructor: '6816f79cc0a8016401c5a33be04be441', start_datetime: '2035-08-01 09:00:00', end_datetime: '2035-08-01 11:00:00', status: 'cancelled', expected_participants: 10, short_description: 'ATF cancelled res' },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_room_ignore_cancelled_check'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var svc = new x_783010_tocc_a1.RoomService();
                var result = svc.hasConflict('${room.record_id}', '2035-08-01 09:00:00', '2035-08-01 11:00:00', null);
                assertFalse(result, 'Cancelled reservation should not cause a conflict. Got: ' + result);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_room_advance_notice_blocks'],
        name: '[TOCC][ROOM] Advance notice validation blocks short-notice request',
        description: 'Reservations submitted within the minimum advance window must be rejected.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_room_advance_notice_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var svc = new x_783010_tocc_a1.RoomService();
                // Start 1 hour from now — well within the 24h minimum advance notice
                var start = new GlideDateTime();
                start.addSeconds(3600);

                var result = svc.validateAdvanceNotice(start.getValue());
                assertTrue(result !== '', 'Expected advance notice error message. Got empty string.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_room_capacity_validation'],
        name: '[TOCC][ROOM] Capacity validation blocks over-capacity request',
        description: 'Reservations with participants exceeding room capacity must be blocked.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        const roomRnd = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_room_capacity_rnd'],
            length: 6,
        })

        const room = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_room_capacity_room'],
            table: 'x_783010_tocc_a1_room',
            fieldValues: {
                room_name: roomRnd.random_string,
                room_code: roomRnd.random_string,
                capacity: 10,
                room_type: 'classroom',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_room_capacity_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var svc = new x_783010_tocc_a1.RoomService();
                // 25 participants for a room with capacity 10
                var result = svc.validateCapacity('${room.record_id}', 25);
                assertTrue(result !== '', 'Expected capacity error message. Got empty string.');
            `,
        })
    }
)
