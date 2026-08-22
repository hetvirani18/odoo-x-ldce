const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const { JWT_SECRET } = require('./src/config/env');
const { db } = require('./src/database/db');

// In-memory mock store
let mockCities = [
    { id: 1, name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, cost_index: 'high', popularity: 95 },
    { id: 2, name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, cost_index: 'medium', popularity: 90 },
    { id: 3, name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, cost_index: 'medium', popularity: 88 },
];

let mockTrips = [];
let mockStops = [];
let nextTripId = 1;
let nextStopId = 1;

// Override db.query with in-memory simulator for automated testing
db.query = async function (sql, params = []) {
    const trimmed = sql.trim();

    // CITIES
    if (trimmed.startsWith('SELECT * FROM cities WHERE id = ?')) {
        const id = Number(params[0]);
        const found = mockCities.filter((c) => c.id === id);
        return [found];
    }

    // TRIPS - INSERT
    if (trimmed.startsWith('INSERT INTO trips')) {
        const [user_id, name, start_date, end_date, description, cover_photo_url, is_public, share_token] = params;
        const newTrip = {
            id: nextTripId++,
            user_id,
            name,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
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

    // TRIPS - SELECT BY USER_ID
    if (trimmed.startsWith('SELECT * FROM trips WHERE user_id = ?')) {
        const userId = Number(params[0]);
        const found = mockTrips.filter((t) => t.user_id === userId);
        return [found];
    }

    // STOPS - MAX ORDER
    if (trimmed.includes('MAX(order_index)')) {
        const tripId = Number(params[0]);
        const tripStops = mockStops.filter((s) => s.trip_id === tripId);
        const max = tripStops.reduce((m, s) => Math.max(m, s.order_index), -1);
        return [[{ max_order: max }]];
    }

    // STOPS - INSERT
    if (trimmed.startsWith('INSERT INTO stops')) {
        const [trip_id, city_id, start_date, end_date, order_index] = params;
        const newStop = {
            id: nextStopId++,
            trip_id,
            city_id,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            order_index,
        };
        mockStops.push(newStop);
        return [{ insertId: newStop.id }];
    }

    // STOPS - SELECT BY ID (with joined city)
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

    // STOPS - SELECT BY TRIP_ID (with joined city)
    if (trimmed.startsWith('SELECT stops.*') && trimmed.includes('WHERE stops.trip_id = ?')) {
        const tripId = Number(params[0]);
        const matched = mockStops
            .filter((s) => s.trip_id === tripId)
            .sort((a, b) => a.order_index - b.order_index)
            .map((stop) => {
                const city = mockCities.find((c) => c.id === stop.city_id);
                return {
                    ...stop,
                    city_name: city?.name,
                    city_country: city?.country,
                    city_lat: city?.lat,
                    city_lng: city?.lng,
                    city_cost_index: city?.cost_index,
                };
            });
        return [matched];
    }

    // STOPS - UPDATE
    if (trimmed.startsWith('UPDATE stops SET order_index = ? WHERE id = ?')) {
        const [order_index, id] = params;
        const stop = mockStops.find((s) => s.id === Number(id));
        if (stop) stop.order_index = Number(order_index);
        return [{ affectedRows: stop ? 1 : 0 }];
    }

    if (trimmed.startsWith('UPDATE stops SET')) {
        const id = Number(params[params.length - 1]);
        const stop = mockStops.find((s) => s.id === id);
        if (stop) {
            let pIndex = 0;
            if (sql.includes('start_date = ?')) stop.start_date = new Date(params[pIndex++]);
            if (sql.includes('end_date = ?')) stop.end_date = new Date(params[pIndex++]);
            if (sql.includes('order_index = ?')) stop.order_index = Number(params[pIndex++]);
            if (sql.includes('city_id = ?')) stop.city_id = Number(params[pIndex++]);
        }
        return [{ affectedRows: stop ? 1 : 0 }];
    }

    // STOPS - DELETE
    if (trimmed.startsWith('DELETE FROM stops WHERE id = ?')) {
        const id = Number(params[0]);
        const idx = mockStops.findIndex((s) => s.id === id);
        if (idx !== -1) mockStops.splice(idx, 1);
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
    console.log('   GlobeTrotter - Itinerary Stops Test Suite  ');
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
        // Setup: Create a base trip for user 1 (July 1 - July 20, 2026)
        const createTripRes = await makeRequest(server, 'POST', '/api/trips', { Cookie: user1Cookie }, {
            name: 'Grand Tour of Europe',
            start_date: '2026-07-01',
            end_date: '2026-07-20',
            description: 'Summer holiday',
        });
        const tripId = createTripRes.body.data.id;

        // Test 1: Unauthenticated request to add stop
        const res1 = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, {}, {
            city_id: 1,
            start_date: '2026-07-01',
            end_date: '2026-07-05',
        });
        assert('1. POST /api/trips/:tripId/stops without cookie returns 401', res1.status === 401 && res1.body.error?.code === 20001);

        // Test 2: Add stop by non-owner user
        const res2 = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, { Cookie: user2Cookie }, {
            city_id: 1,
            start_date: '2026-07-01',
            end_date: '2026-07-05',
        });
        assert('2. POST /api/trips/:tripId/stops by non-owner returns 403 Forbidden', res2.status === 403 && res2.body.error?.code === 30003);

        // Test 3: Add stop with non-existent city
        const res3 = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie }, {
            city_id: 999,
            start_date: '2026-07-01',
            end_date: '2026-07-05',
        });
        assert('3. POST /api/trips/:tripId/stops with invalid city_id returns 404 City Not Found', res3.status === 404 && res3.body.error?.code === 40001);

        // Test 4: Add stop with dates outside trip bounds
        const res4 = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie }, {
            city_id: 1,
            start_date: '2026-06-25', // before trip start July 1
            end_date: '2026-07-05',
        });
        assert('4. POST /api/trips/:tripId/stops with dates outside trip bounds returns 422 Invalid Date Range', res4.status === 422 && res4.body.error?.code === 30004);

        // Test 5: Add Stop 1 (Paris)
        const res5 = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie }, {
            city_id: 1,
            start_date: '2026-07-01',
            end_date: '2026-07-06',
        });
        const stop1 = res5.body.data;
        assert(
            '5. POST /api/trips/:tripId/stops adds Stop 1 (Paris) with order_index 0',
            res5.status === 201 && stop1?.city?.name === 'Paris' && stop1?.order_index === 0
        );

        // Test 6: Add Stop 2 (Rome)
        const res6 = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie }, {
            city_id: 2,
            start_date: '2026-07-07',
            end_date: '2026-07-12',
        });
        const stop2 = res6.body.data;
        assert(
            '6. POST /api/trips/:tripId/stops adds Stop 2 (Rome) with auto-incremented order_index 1',
            res6.status === 201 && stop2?.city?.name === 'Rome' && stop2?.order_index === 1
        );

        // Test 7: Add Stop 3 (Barcelona)
        const res7 = await makeRequest(server, 'POST', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie }, {
            city_id: 3,
            start_date: '2026-07-13',
            end_date: '2026-07-18',
        });
        const stop3 = res7.body.data;
        assert(
            '7. POST /api/trips/:tripId/stops adds Stop 3 (Barcelona) with order_index 2',
            res7.status === 201 && stop3?.city?.name === 'Barcelona' && stop3?.order_index === 2
        );

        // Test 8: List stops
        const res8 = await makeRequest(server, 'GET', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie });
        assert(
            '8. GET /api/trips/:tripId/stops lists all 3 stops in order',
            res8.status === 200 && Array.isArray(res8.body.data) && res8.body.data.length === 3
        );

        // Test 9: Get Trip Details includes stops array
        const res9 = await makeRequest(server, 'GET', `/api/trips/${tripId}`, { Cookie: user1Cookie });
        assert(
            '9. GET /api/trips/:id includes stops list in trip view',
            res9.status === 200 && Array.isArray(res9.body.data?.stops) && res9.body.data.stops.length === 3
        );

        // Test 10: Update Stop dates (PUT /api/stops/:id)
        const res10 = await makeRequest(server, 'PUT', `/api/stops/${stop1.id}`, { Cookie: user1Cookie }, {
            start_date: '2026-07-02',
            end_date: '2026-07-06',
        });
        assert(
            '10. PUT /api/stops/:id updates stop dates',
            res10.status === 200 && res10.body.data?.start_date === '2026-07-02'
        );

        // Test 11: Reorder stops (PUT /api/trips/:tripId/stops/reorder) -> [Barcelona, Paris, Rome]
        const res11 = await makeRequest(server, 'PUT', `/api/trips/${tripId}/stops/reorder`, { Cookie: user1Cookie }, {
            stop_ids: [stop3.id, stop1.id, stop2.id],
        });
        const reordered = res11.body.data;
        assert(
            '11. PUT /api/trips/:tripId/stops/reorder updates order_index for all stops',
            res11.status === 200 &&
            reordered?.[0]?.id === stop3.id && reordered?.[0]?.order_index === 0 &&
            reordered?.[1]?.id === stop1.id && reordered?.[1]?.order_index === 1 &&
            reordered?.[2]?.id === stop2.id && reordered?.[2]?.order_index === 2
        );

        // Test 12: Delete stop (DELETE /api/stops/:id)
        const res12 = await makeRequest(server, 'DELETE', `/api/stops/${stop1.id}`, { Cookie: user1Cookie });
        assert('12. DELETE /api/stops/:id deletes stop successfully', res12.status === 200 && res12.body.success === true);

        // Test 13: List stops after delete shows 2 remaining
        const res13 = await makeRequest(server, 'GET', `/api/trips/${tripId}/stops`, { Cookie: user1Cookie });
        assert(
            '13. GET /api/trips/:tripId/stops returns 2 stops after deletion',
            res13.status === 200 && res13.body.data.length === 2
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
