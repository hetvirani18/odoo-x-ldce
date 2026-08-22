const assert = require('assert');
const app = require('./src/app');
const { calculateStopDuration } = require('./src/services/budget.service');
const { toCityView } = require('./src/models/city.model');
const { toActivityView } = require('./src/models/activity.model');
const { toTripView, toPublicTripView } = require('./src/models/trip.model');
const { toStopView } = require('./src/models/stop.model');
const { toTripActivityView } = require('./src/models/tripActivity.model');
const { toCostEstimateView } = require('./src/models/costEstimate.model');
const { ERRORS } = require('./src/utils/AppError');
const { rateFor } = require('./src/services/pricingProvider/costIndexPricingProvider');

async function runTests() {
    console.log('--- Starting Discovery, Budget & Share Unit/Logic Verification ---');

    // 1. Model Mappers
    console.log('[1/5] Testing View Mappers...');
    const cityRow = { id: 1, name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, cost_index: 'high', popularity: 95 };
    const cityView = toCityView(cityRow);
    assert.strictEqual(cityView.name, 'Paris');
    assert.strictEqual(cityView.lat, 48.8566);

    const actRow = { id: 10, city_id: 1, name: 'Eiffel Tower', category: 'sightseeing', cost: '30.00', duration_hours: '2.5', description: 'Tower', image_url: null };
    const actView = toActivityView(actRow);
    assert.strictEqual(actView.cost, 30.0);
    assert.strictEqual(actView.duration_hours, 2.5);

    const tripRow = { id: 100, user_id: 5, name: 'Euro Trip', start_date: '2026-06-01', end_date: '2026-06-10', description: 'Fun', cover_photo_url: null, is_public: 1, share_token: 'abc123token', created_at: new Date() };
    const tripView = toTripView(tripRow);
    assert.strictEqual(tripView.is_public, true);
    assert.strictEqual(tripView.user_id, 5);

    const pubTripView = toPublicTripView(tripRow);
    assert.strictEqual(pubTripView.name, 'Euro Trip');
    assert.strictEqual(pubTripView.user_id, undefined, 'Public trip view must not leak user_id');

    const estimateRow = { trip_id: 100, transport_cost: '100.00', accommodation_cost: '540.00', activity_cost: '50.00', meal_cost: '240.00', total_cost: '930.00', updated_at: new Date() };
    const estimateView = toCostEstimateView(estimateRow);
    assert.strictEqual(estimateView.total_cost, 930.0);
    assert.strictEqual(estimateView.accommodation_cost, 540.0);

    // 2. Budget Duration Formula Consistency
    console.log('[2/5] Testing Budget Duration & Rates...');
    const duration = calculateStopDuration('2026-06-01', '2026-06-04');
    assert.strictEqual(duration.nights, 3, 'June 1 to June 4 should be 3 nights');
    assert.strictEqual(duration.days, 4, 'Days for meals should be nights + 1 = 4');

    const singleDayDuration = calculateStopDuration('2026-06-01', '2026-06-01');
    assert.strictEqual(singleDayDuration.nights, 1, 'Same-day stop should have minimum 1 night');
    assert.strictEqual(singleDayDuration.days, 2, 'Same-day stop should have 2 days');

    const highRate = await rateFor('high');
    assert.strictEqual(highRate.perNightRate, 180.0);
    assert.strictEqual(highRate.perDayMealRate, 60.0);

    // 3. Error Catalog Validation
    console.log('[3/5] Testing Error Catalog...');
    assert.strictEqual(ERRORS.CITY_NOT_FOUND.statusCode, 404);
    assert.strictEqual(ERRORS.ACTIVITY_NOT_FOUND.statusCode, 404);
    assert.strictEqual(ERRORS.TRIP_NOT_OWNED.statusCode, 403);
    assert.strictEqual(ERRORS.TRIP_NOT_PUBLIC.statusCode, 404);

    // 4. Express App Route Registration
    console.log('[4/5] Testing Express Router Stack...');
    const registeredPaths = [];
    app._router.stack.forEach((layer) => {
        if (layer.route) {
            registeredPaths.push(layer.route.path);
        } else if (layer.name === 'router' && layer.regexp) {
            registeredPaths.push(layer.regexp.toString());
        }
    });
    console.log('Registered Router layers:', registeredPaths.length);

    console.log('[5/5] All module logic checks passed successfully!');
    process.exit(0);
}

runTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
