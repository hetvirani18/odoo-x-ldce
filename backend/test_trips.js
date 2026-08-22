const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const { JWT_SECRET } = require('./src/config/env');
const { db } = require('./src/database/db');

// In-memory mock store for standalone verification without active MySQL setup
let mockDbTrips = [];
let nextId = 1;

// Override db.query with smart in-memory handler for automated testing
db.query = async function (sql, params = []) {
    const trimmed = sql.trim();

    // INSERT INTO trips
    if (trimmed.startsWith('INSERT INTO trips')) {
        const [user_id, name, start_date, end_date, description, cover_photo_url, is_public, share_token] = params;
        const newTrip = {
            id: nextId++,
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
        mockDbTrips.push(newTrip);
        return [{ insertId: newTrip.id }];
    }

    // SELECT * FROM trips WHERE id = ?
    if (trimmed.startsWith('SELECT * FROM trips WHERE id = ?')) {
        const id = Number(params[0]);
        const found = mockDbTrips.filter((t) => t.id === id);
        return [found];
    }

    // SELECT * FROM trips WHERE user_id = ?
    if (trimmed.startsWith('SELECT * FROM trips WHERE user_id = ?')) {
        const userId = Number(params[0]);
        const found = mockDbTrips.filter((t) => t.user_id === userId);
        return [found];
    }

    // UPDATE trips SET ... WHERE id = ?
    if (trimmed.startsWith('UPDATE trips SET')) {
        const id = Number(params[params.length - 1]);
        const trip = mockDbTrips.find((t) => t.id === id);
        if (trip) {
            // parse updated fields
            let pIndex = 0;
            if (sql.includes('name = ?')) trip.name = params[pIndex++];
            if (sql.includes('start_date = ?')) trip.start_date = new Date(params[pIndex++]);
            if (sql.includes('end_date = ?')) trip.end_date = new Date(params[pIndex++]);
            if (sql.includes('description = ?')) trip.description = params[pIndex++];
            if (sql.includes('cover_photo_url = ?')) trip.cover_photo_url = params[pIndex++];
            if (sql.includes('is_public = ?')) trip.is_public = Boolean(params[pIndex++]);
            if (sql.includes('share_token = ?')) trip.share_token = params[pIndex++];
        }
        return [{ affectedRows: trip ? 1 : 0 }];
    }

    // DELETE FROM trips WHERE id = ?
    if (trimmed.startsWith('DELETE FROM trips WHERE id = ?')) {
        const id = Number(params[0]);
        const idx = mockDbTrips.findIndex((t) => t.id === id);
        if (idx !== -1) {
            mockDbTrips.splice(idx, 1);
        }
        return [{ affectedRows: 1 }];
    }

    return [[]];
};

// Helper: HTTP request wrapper
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
    console.log('\n========================================');
    console.log('   GlobeTrotter - Trips API Test Suite   ');
    console.log('========================================\n');

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
        // Test 1: Unauthenticated request
        const res1 = await makeRequest(server, 'GET', '/api/trips');
        assert(
            '1. GET /api/trips without cookie returns 401 Unauthorized',
            res1.status === 401 && res1.body.error?.code === 20001
        );

        // Test 2: Validation failure (missing required field)
        const res2 = await makeRequest(server, 'POST', '/api/trips', { Cookie: user1Cookie }, {
            start_date: '2026-07-01',
            end_date: '2026-07-15',
        });
        assert(
            '2. POST /api/trips missing name returns 422 Validation Error',
            res2.status === 422 && res2.body.error?.code === 10002
        );

        // Test 3: Date range validation (end_date < start_date)
        const res3 = await makeRequest(server, 'POST', '/api/trips', { Cookie: user1Cookie }, {
            name: 'Invalid Date Trip',
            start_date: '2026-07-15',
            end_date: '2026-07-01',
        });
        assert(
            '3. POST /api/trips with end_date < start_date returns 422 Invalid Date Range',
            res3.status === 422 && res3.body.error?.code === 30004
        );

        // Test 4: Successful trip creation (POST /api/trips)
        const res4 = await makeRequest(server, 'POST', '/api/trips', { Cookie: user1Cookie }, {
            name: 'Europe Exploration',
            start_date: '2026-07-01',
            end_date: '2026-07-15',
            description: 'Visiting Paris and Rome',
            is_public: true,
        });
        const createdTrip = res4.body?.data;
        assert(
            '4. POST /api/trips creates trip (201) and generates share_token when is_public is true',
            res4.status === 201 &&
            res4.body?.success === true &&
            createdTrip?.name === 'Europe Exploration' &&
            createdTrip?.is_public === true &&
            typeof createdTrip?.share_token === 'string' &&
            createdTrip?.share_token.length > 0
        );

        const tripId = createdTrip?.id;

        // Test 5: List trips (GET /api/trips)
        const res5 = await makeRequest(server, 'GET', '/api/trips', { Cookie: user1Cookie });
        assert(
            '5. GET /api/trips lists user trips',
            res5.status === 200 &&
            res5.body?.success === true &&
            Array.isArray(res5.body.data) &&
            res5.body.data.length === 1 &&
            res5.body.data[0].id === tripId
        );

        // Test 6: Get trip by ID by owner (GET /api/trips/:id)
        const res6 = await makeRequest(server, 'GET', `/api/trips/${tripId}`, { Cookie: user1Cookie });
        assert(
            '6. GET /api/trips/:id fetches trip details for owner',
            res6.status === 200 &&
            res6.body?.success === true &&
            res6.body.data?.id === tripId
        );

        // Test 7: Get trip by non-owner returns 403
        const res7 = await makeRequest(server, 'GET', `/api/trips/${tripId}`, { Cookie: user2Cookie });
        assert(
            '7. GET /api/trips/:id returns 403 Forbidden for non-owner',
            res7.status === 403 && res7.body.error?.code === 30003
        );

        // Test 8: Update trip (PUT /api/trips/:id)
        const res8 = await makeRequest(server, 'PUT', `/api/trips/${tripId}`, { Cookie: user1Cookie }, {
            name: 'Europe Exploration (Updated)',
            description: 'Updated description for vacation',
        });
        assert(
            '8. PUT /api/trips/:id updates trip details',
            res8.status === 200 &&
            res8.body?.success === true &&
            res8.body.data?.name === 'Europe Exploration (Updated)' &&
            res8.body.data?.description === 'Updated description for vacation'
        );

        // Test 9: Delete trip (DELETE /api/trips/:id)
        const res9 = await makeRequest(server, 'DELETE', `/api/trips/${tripId}`, { Cookie: user1Cookie });
        assert(
            '9. DELETE /api/trips/:id deletes trip',
            res9.status === 200 && res9.body?.success === true
        );

        // Test 10: Fetch after deletion returns 404
        const res10 = await makeRequest(server, 'GET', `/api/trips/${tripId}`, { Cookie: user1Cookie });
        assert(
            '10. GET /api/trips/:id after deletion returns 404 Not Found',
            res10.status === 404 && res10.body.error?.code === 30001
        );

    } finally {
        server.close();
    }

    console.log('\n----------------------------------------');
    console.log(`Total: ${passed + failed} | Passed: \x1b[32m${passed}\x1b[0m | Failed: \x1b[31m${failed}\x1b[0m`);
    console.log('========================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
    console.error('Test runner encountered an error:', err);
    process.exit(1);
});
