import { Test } from '@servicenow/sdk/core'

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_smoke_room_crud'],
        name: '[TOCC][SMOKE] Room CRUD',
        description: 'Validates insert, update and delete on Room table.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        const random = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_room_crud_random'],
            length: 8,
        })

        const insertedRoom = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_room_crud_insert'],
            table: 'x_783010_tocc_a1_room',
            fieldValues: {
                room_name: random.random_string,
                room_code: random.random_string,
                capacity: 25,
                room_type: 'classroom',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        atf.server.recordValidation({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_room_crud_validate_insert'],
            table: 'x_783010_tocc_a1_room',
            recordId: insertedRoom.record_id,
            fieldValues: 'status=active^EQ',
            enforceSecurity: false,
            assert: 'record_validated',
        })

        atf.server.recordUpdate({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_room_crud_update'],
            table: 'x_783010_tocc_a1_room',
            recordId: insertedRoom.record_id,
            fieldValues: {
                status: 'maintenance',
            },
            enforceSecurity: false,
            assert: 'record_successfully_updated',
        })

        atf.server.recordValidation({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_room_crud_validate_update'],
            table: 'x_783010_tocc_a1_room',
            recordId: insertedRoom.record_id,
            fieldValues: 'status=maintenance^EQ',
            enforceSecurity: false,
            assert: 'record_validated',
        })

        atf.server.recordDelete({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_room_crud_delete'],
            table: 'x_783010_tocc_a1_room',
            recordId: insertedRoom.record_id,
            enforceSecurity: false,
            assert: 'record_successfully_deleted',
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_student_cannot_create_course'],
        name: '[TOCC][SMOKE] ACL Student Cannot Create Course',
        description: 'Validates that student persona cannot create course records.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        const random = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_student_random'],
            length: 8,
        })

        atf.server.createUser({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_student_create_user'],
            firstName: 'TOCC',
            lastName: 'Student',
            roles: ['x_783010_tocc_a1.student'],
            impersonate: true,
        })

        atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_student_insert_course'],
            table: 'x_783010_tocc_a1_course',
            fieldValues: {
                course_id: random.random_string,
                course_name: random.random_string,
                description: 'ATF ACL student course creation test',
                duration_hours: 2,
                delivery_category: 'vilt',
                status: 'active',
            },
            enforceSecurity: true,
            assert: 'record_not_inserted',
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_instructor_can_create_reservation'],
        name: '[TOCC][SMOKE] ACL Instructor Can Create Reservation',
        description: 'Validates that instructor persona can create room reservation records.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        const randomCourse = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_instructor_course_random'],
            length: 8,
        })

        const randomRoom = atf.email.generateRandomString({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_instructor_room_random'],
            length: 8,
        })

        const course = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_instructor_insert_course'],
            table: 'x_783010_tocc_a1_course',
            fieldValues: {
                course_id: randomCourse.random_string,
                course_name: randomCourse.random_string,
                description: 'ATF ACL instructor reservation test course',
                duration_hours: 4,
                delivery_category: 'vilt',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        const room = atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_instructor_insert_room'],
            table: 'x_783010_tocc_a1_room',
            fieldValues: {
                room_name: randomRoom.random_string,
                room_code: randomRoom.random_string,
                capacity: 30,
                room_type: 'classroom',
                status: 'active',
            },
            enforceSecurity: false,
            assert: 'record_successfully_inserted',
        })

        const instructorUser = atf.server.createUser({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_instructor_create_user'],
            firstName: 'TOCC',
            lastName: 'Instructor',
            roles: ['x_783010_tocc_a1.instructor'],
            impersonate: true,
        })

        atf.server.recordInsert({
            $id: Now.ID['x_783010_tocc_a1_atf_smoke_acl_instructor_insert_reservation'],
            table: 'x_783010_tocc_a1_room_reservation',
            fieldValues: {
                tocc_course: course.record_id,
                tocc_instructor: instructorUser.user,
                tocc_room: room.record_id,
                start_datetime: '2030-01-15 10:00:00',
                end_datetime: '2030-01-15 12:00:00',
                expected_participants: 20,
                status: 'submitted',
                short_description: 'ATF instructor reservation ACL test',
            },
            enforceSecurity: true,
            assert: 'record_successfully_inserted',
        })
    }
)
