const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { JWT_SECRET } = require('../src/config/env');
const { db } = require('../src/database/db');

// In-memory mock store
let mockCities = [
    { id: 1, name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, cost_index: 'high', popularity: 95 },
    { id: 2, name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, cost_index: 'medium', popularity: 90 },
];

let mockActivities = [
    { id: 101, city_id: 1, name: 'Eiffel Tower Tour', category: 'sightseeing', cost: 35.0, duration_hours: 2.5, description: 'Iconic tower visit', image_url: null },
    { id: 102, city_id: 1, name: 'Louvre Museum Guided Tour', category: 'culture', cost: 45.0, duration_hours: 3.0, description: 'Art museum', image_url: null },
    { id: 201, city_id: 2, name: 'Colosseum & Roman Forum', category: 'sightseeing', cost: 30.0, duration_hours: 3.0, description: 'Ancient arena', image_url: null },
];

let mockTrips = [];
let mockStops = [];
let mockTripActivities = [];
let nextTripId = 1;
let nextStopId = 1;
let nextTripActivityId = 1;

// Override db.query with in-memory simulator for automated testing
db.query = async function (sql, params = []) {
    const trimmed = sql.trim();

    // CITIES
    if (trimmed.startsWith('SELECT * FROM cities WHERE id = ?')) {
        const id = Number(params[0]);
        const found = mockCities.filter((c) => c.id === id);
        return [found];
    }

    // ACTIVITIES
    if (trimmed.startsWith('SELECT * FROM activities WHERE id = ?')) {
        const id = Number(params[0]);
        const found = mockActivities.filter((a) => a.id === id);
        return [found];
    }

    // TRIPS - INSERT
    if (trimmed.startsWith('INSERT INTO trips')) {
        const [user_id, name, start_date, end_date, description, cover_photo_url, is_public, share_token] = params;
        const newTrip = {
            id: nextTripId++,
            user_id,
            name,
            start_date: String(start_date).split('T')[0],
            end_date: String(end_date).split('T')[0],
            description,
            cover_photo_url,
            is_public: Boolean(is_public),
            share_token,
            created_at: new Date(),
        };
        mockTrips.push(newTrip);
        return [{ insertId: newTrip.id }];
    }

    // TRIPS - SELECT BY ID
    if (trimmed.startsWith('SELECT * FROM trips WHERE id = ?')) {
        const id = Number(params[0]);
        const found = mockTrips.filter((t) => t.id === id);
        return [found];
    }

    // STOPS - INSERT
    if (trimmed.startsWith('INSERT INTO stops')) {
        const trip_id = params[0];
        const city_id = params[1];
        const start_date = String(params[2]).split('T')[0];
        const end_date = String(params[3]).split('T')[0];
        const order_index = 0;

        const newStop = {
            id: nextStopId++,
            trip_id,
            city_id,
            start_date,
            end_date,
            order_index,
        };
        mockStops.push(newStop);
        return [{ insertId: newStop.id }];
    }

    // STOPS - SELECT BY ID
    if (trimmed.startsWith('SELECT stops.*') && trimmed.includes('WHERE stops.id = ?')) {
        const id = Number(params[0]);
        const stop = mockStops.find((s) => s.id === id);
        if (!stop) return [[]];
        const city = mockCities.find((c) => c.id === stop.city_id);
        const joined = {
            ...stop,
            city_name: city?.name,
            city_country: city?.country,
            city_lat: city?.lat,
            city_lng: city?.lng,
            city_cost_index: city?.cost_index,
        };
        return [[joined]];
    }

    // TRIP_ACTIVITIES - INSERT
    if (trimmed.startsWith('INSERT INTO trip_activities')) {
        const [stop_id, activity_id, scheduled_date, scheduled_time] = params;
        const item = {
            id: nextTripActivityId++,
            stop_id,
            activity_id,
            scheduled_date: String(scheduled_date).split('T')[0],
            scheduled_time: scheduled_time ?? null,
        };
        mockTripActivities.push(item);
        return [{ insertId: item.id }];
    }

    // TRIP_ACTIVITIES - SELECT BY ID
    if (trimmed.startsWith('SELECT trip_activities.*') && trimmed.includes('WHERE trip_activities.id = ?')) {
        const id = Number(params[0]);
        const item = mockTripActivities.find((ta) => ta.id === id);
        if (!item) return [[]];
        const act = mockActivities.find((a) => a.id === item.activity_id);
        return [[{
            ...item,
            activity_name: act?.name,
            activity_category: act?.category,
            activity_cost: act?.cost,
            activity_duration_hours: act?.duration_hours,
            activity_description: act?.description,
            activity_image_url: act?.image_url,
            activity_city_id: act?.city_id,
        }]];
    }

    // TRIP_ACTIVITIES - SELECT BY STOP_ID
    if (trimmed.startsWith('SELECT trip_activities.*') && trimmed.includes('WHERE trip_activities.stop_id = ? AND trip_activities.activity_id = ?')) {
        const stopId = Number(params[0]);
        const activityId = Number(params[1]);
        const item = mockTripActivities.find((ta) => ta.stop_id === stopId && ta.activity_id === activityId);
        if (!item) return [[]];
        const act = mockActivities.find((a) => a.id === item.activity_id);
        return [[{
            ...item,
            activity_name: act?.name,
            activity_category: act?.category,
            activity_cost: act?.cost,
            activity_duration_hours: act?.duration_hours,
            activity_description: act?.description,
            activity_image_url: act?.image_url,
            activity_city_id: act?.city_id,
        }]];
    }

    if (trimmed.startsWith('SELECT trip_activities.*') && trimmed.includes('WHERE trip_activities.stop_id = ?')) {
        const stopId = Number(params[0]);
        const items = mockTripActivities
            .filter((ta) => ta.stop_id === stopId)
            .map((item) => {
                const act = mockActivities.find((a) => a.id === item.activity_id);
                return {
                    ...item,
                    activity_name: act?.name,
                    activity_category: act?.category,
                    activity_cost: act?.cost,
                    activity_duration_hours: act?.duration_hours,
                    activity_description: act?.description,
                    activity_image_url: act?.image_url,
                    activity_city_id: act?.city_id,
                };
            });
        return [items];
    }

    // TRIP_ACTIVITIES - UPDATE
    if (trimmed.startsWith('UPDATE trip_activities SET')) {
        const id = Number(params[params.length - 1]);
        const item = mockTripActivities.find((ta) => ta.id === id);
        if (item) {
            let pIndex = 0;
            if (sql.includes('scheduled_date = ?')) item.scheduled_date = String(params[pIndex++]).split('T')[0];
            if (sql.includes('scheduled_time = ?')) item.scheduled_time = params[pIndex++];
        }
        return [{ affectedRows: item ? 1 : 0 }];
    }

    // TRIP_ACTIVITIES - DELETE
    if (trimmed.startsWith('DELETE FROM trip_activities WHERE stop_id = ? AND activity_id = ?')) {
        const stopId = Number(params[0]);
        const activityId = Number(params[1]);
        const idx = mockTripActivities.findIndex((ta) => ta.stop_id === stopId && ta.activity_id === activityId);
        if (idx !== -1) mockTripActivities.splice(idx, 1);
        return [{ affectedRows: 1 }];
    }

    return [[]];
};

function makeRequest(server, method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const addr = server.address();
        const options = {
            hostname: '127.0.0.1',
            port: addr.port,
            path,
            method,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('\n=============================================');
    console.log('  GlobeTrotter - Stop Activities Test Suite  ');
    console.log('=============================================\n');

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));

    const user1Token = jwt.sign({ id: 1, email: 'user1@test.com', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    const user2Token = jwt.sign({ id: 2, email: 'user2@test.com', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

    const user1Cookie = `access_token=${user1Token}`;
    const user2Cookie = `access_token=${user2Token}`;

    let passed = 0;
    let failed = 0;

    function assert(name, condition, details = '') {
        if (condition) {
            console.log(` \x1b[32m✔ PASS\x1b[0m : ${name}`);
            passed++;
        } else {
            console.log(` \x1b[31m✖ FAIL\x1b[0m : ${name} ${details ? `(${details})` : ''}`);
            failed++;
        }
    }

    try {
        // Setup: Create trip (July 1 - July 20) & Stop in Paris (city_id: 1, July 1 - July 6)
        const createTripRes = await makeRequest(server, 'POST', '/api/trips', { Cookie: user1Cookie }, {
            name: 'France Vacation',
            start_date: '2026-07-01',
            end_date: '2026-07-20',
        });
        const tripId = createTripRes.body.data.id;

        const createStopRes = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie }, {
            city_id: 1, // Paris
            start_date: '2026-07-01',
            end_date: '2026-07-06',
        });
        const stopId = createStopRes.body.data.id;

        // Test 1: Assign activity without auth cookie -> 401
        const res1 = await makeRequest(server, 'POST', `/api/stops/${stopId}/activities`, {}, {
            activity_id: 101,
            scheduled_date: '2026-07-02',
        });
        assert('1. POST /api/stops/:stopId/activities without cookie returns 401', res1.status === 401 && res1.body.error?.code === 20001);

        // Test 2: Assign activity by non-owner user -> 403
        const res2 = await makeRequest(server, 'POST', `/api/stops/${stopId}/activities`, { Cookie: user2Cookie }, {
            activity_id: 101,
            scheduled_date: '2026-07-02',
        });
        assert('2. POST /api/stops/:stopId/activities by non-owner returns 403 Forbidden', res2.status === 403 && res2.body.error?.code === 30003);

        // Test 3: Assign non-existent activity -> 404
        const res3 = await makeRequest(server, 'POST', `/api/stops/${stopId}/activities`, { Cookie: user1Cookie }, {
            activity_id: 999,
            scheduled_date: '2026-07-02',
        });
        assert('3. POST /api/stops/:stopId/activities with invalid activity_id returns 404', res3.status === 404 && res3.body.error?.code === 40002);

        // Test 4: Assign activity from wrong city (Colosseum in Rome, city_id 2, assigned to Paris stop) -> 422
        const res4 = await makeRequest(server, 'POST', `/api/stops/${stopId}/activities`, { Cookie: user1Cookie }, {
            activity_id: 201, // Colosseum (Rome)
            scheduled_date: '2026-07-02',
        });
        assert('4. POST /api/stops/:stopId/activities with activity not in city returns 422', res4.status === 422 && res4.body.error?.code === 40003);

        // Test 5: Assign activity with date outside stop date bounds (July 15 outside July 1-6) -> 422
        const res5 = await makeRequest(server, 'POST', `/api/stops/${stopId}/activities`, { Cookie: user1Cookie }, {
            activity_id: 101,
            scheduled_date: '2026-07-15',
        });
        assert('5. POST /api/stops/:stopId/activities with scheduled_date outside stop bounds returns 422', res5.status === 422 && res5.body.error?.code === 30004);

        // Test 6: Successfully assign Activity 1 (Eiffel Tower, July 2 at 10:00) -> 201
        const res6 = await makeRequest(server, 'POST', `/api/stops/${stopId}/activities`, { Cookie: user1Cookie }, {
            activity_id: 101,
            scheduled_date: '2026-07-02',
            scheduled_time: '10:00',
        });
        const assigned1 = res6.body.data;
        assert(
            '6. POST /api/stops/:stopId/activities schedules Activity 1 (Eiffel Tower) with details',
            res6.status === 201 && assigned1?.activity?.name === 'Eiffel Tower Tour' && assigned1?.scheduled_time === '10:00' && assigned1?.scheduled_date === '2026-07-02'
        );

        // Test 7: Successfully assign Activity 2 (Louvre Museum, July 3 at 14:00) -> 201
        const res7 = await makeRequest(server, 'POST', `/api/stops/${stopId}/activities`, { Cookie: user1Cookie }, {
            activity_id: 102,
            scheduled_date: '2026-07-03',
            scheduled_time: '14:00',
        });
        assert(
            '7. POST /api/stops/:stopId/activities schedules Activity 2 (Louvre Museum)',
            res7.status === 201 && res7.body.data?.activity?.name === 'Louvre Museum Guided Tour'
        );

        // Test 8: List stop activities -> 200
        const res8 = await makeRequest(server, 'GET', `/api/stops/${stopId}/activities`, { Cookie: user1Cookie });
        assert(
            '8. GET /api/stops/:stopId/activities returns all 2 scheduled activities',
            res8.status === 200 && Array.isArray(res8.body.data) && res8.body.data.length === 2
        );

        // Test 9: Update scheduled time (PUT /api/stops/:stopId/activities/:activityId) -> 200
        const res9 = await makeRequest(server, 'PUT', `/api/stops/${stopId}/activities/101`, { Cookie: user1Cookie }, {
            scheduled_time: '11:30',
        });
        assert(
            '9. PUT /api/stops/:stopId/activities/:activityId updates scheduled time',
            res9.status === 200 && res9.body.data?.scheduled_time === '11:30'
        );

        // Test 10: Delete activity from stop (DELETE /api/stops/:stopId/activities/:activityId) -> 200
        const res10 = await makeRequest(server, 'DELETE', `/api/stops/${stopId}/activities/101`, { Cookie: user1Cookie });
        assert('10. DELETE /api/stops/:stopId/activities/:activityId removes activity from stop', res10.status === 200 && res10.body.success === true);

        // Test 11: List stop activities after deletion shows 1 remaining -> 200
        const res11 = await makeRequest(server, 'GET', `/api/stops/${stopId}/activities`, { Cookie: user1Cookie });
        assert(
            '11. GET /api/stops/:stopId/activities returns 1 activity after deletion',
            res11.status === 200 && res11.body.data.length === 1 && res11.body.data[0].activity_id === 102
        );

    } finally {
        server.close();
    }

    console.log('\n---------------------------------------------');
    console.log(`Total: ${passed + failed} | Passed: \x1b[32m${passed}\x1b[0m | Failed: \x1b[31m${failed}\x1b[0m`);
    console.log('=============================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
    console.error('Test runner error:', err);
    process.exit(1);
});
