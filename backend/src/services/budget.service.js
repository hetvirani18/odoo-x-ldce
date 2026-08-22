const StopRepository = require('../repositories/stop.repository');
const TripActivityRepository = require('../repositories/tripActivity.repository');
const CostEstimateRepository = require('../repositories/costEstimate.repository');
const costIndexProvider = require('./pricingProvider/costIndexPricingProvider');
const flightFareProvider = require('./pricingProvider/flightFarePricingProvider');
const { toCostEstimateView } = require('../models/costEstimate.model');

const FLAT_HOP_TRANSPORT_ESTIMATE = 100.0;

/**
 * Calculates unified nights and days for a stop date range
 * @param {string} startDateStr
 * @param {string} endDateStr
 */
function calculateStopDuration(startDateStr, endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const nights = Math.max(1, diffDays);
    const days = nights + 1;
    return { nights, days };
}

/**
 * Computes full budget breakdown and itemized stop calculations
 * @param {number} tripId
 */
async function computeTripBudgetBreakdown(tripId) {
    const stops = await StopRepository.findByTripId(tripId);
    const allActivities = await TripActivityRepository.findByTripId(tripId);

    // Group activities by stop_id
    const activitiesByStop = new Map();
    for (const act of allActivities) {
        if (!activitiesByStop.has(act.stop_id)) {
            activitiesByStop.set(act.stop_id, []);
        }
        activitiesByStop.get(act.stop_id).push(act);
    }

    let transportCost = 0;
    let accommodationCost = 0;
    let mealCost = 0;
    let activityCost = 0;

    const itemizedStops = [];

    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const { nights, days } = calculateStopDuration(stop.start_date, stop.end_date);
        const rate = await costIndexProvider.rateFor(stop.city_cost_index || 'medium');

        const stopAccommodationCost = nights * rate.perNightRate;
        const stopMealCost = days * rate.perDayMealRate;

        // Transport: hop into this stop (or between stops)
        let stopTransportCost = 0;
        if (i > 0) {
            const prevStop = stops[i - 1];
            try {
                const estimate = await flightFareProvider.estimateTransport(
                    prevStop.city_name,
                    stop.city_name,
                    stop.start_date,
                    { lat: prevStop.city_lat, lng: prevStop.city_lng },
                    { lat: stop.city_lat, lng: stop.city_lng }
                );
                stopTransportCost = Number(estimate.cost);
            } catch (err) {
                stopTransportCost = FLAT_HOP_TRANSPORT_ESTIMATE;
            }
        } else {
            // First leg / entry transport estimate
            stopTransportCost = FLAT_HOP_TRANSPORT_ESTIMATE;
        }

        // Activities for this stop
        const stopActivities = activitiesByStop.get(stop.id) || [];
        const stopActivityCost = stopActivities.reduce(
            (sum, a) => sum + Number(a.activity_cost || 0),
            0
        );

        transportCost += stopTransportCost;
        accommodationCost += stopAccommodationCost;
        mealCost += stopMealCost;
        activityCost += stopActivityCost;

        itemizedStops.push({
            stop_id: stop.id,
            order_index: stop.order_index,
            city: {
                id: stop.city_id,
                name: stop.city_name,
                country: stop.city_country,
                cost_index: stop.city_cost_index,
            },
            start_date: stop.start_date,
            end_date: stop.end_date,
            nights,
            days,
            rates: {
                per_night_rate: rate.perNightRate,
                per_day_meal_rate: rate.perDayMealRate,
            },
            costs: {
                transport_cost: Number(stopTransportCost.toFixed(2)),
                accommodation_cost: Number(stopAccommodationCost.toFixed(2)),
                meal_cost: Number(stopMealCost.toFixed(2)),
                activity_cost: Number(stopActivityCost.toFixed(2)),
                total_stop_cost: Number(
                    (
                        stopTransportCost +
                        stopAccommodationCost +
                        stopMealCost +
                        stopActivityCost
                    ).toFixed(2)
                ),
            },
            activities: stopActivities.map((a) => ({
                id: a.id,
                activity_id: a.activity_id,
                name: a.activity_name,
                category: a.activity_category,
                cost: Number(a.activity_cost || 0),
                duration_hours: a.activity_duration_hours ? Number(a.activity_duration_hours) : null,
                scheduled_date: a.scheduled_date,
                scheduled_time: a.scheduled_time,
            })),
        });
    }

    const summary = {
        tripId,
        transportCost: Number(transportCost.toFixed(2)),
        accommodationCost: Number(accommodationCost.toFixed(2)),
        activityCost: Number(activityCost.toFixed(2)),
        mealCost: Number(mealCost.toFixed(2)),
        totalCost: Number(
            (transportCost + accommodationCost + activityCost + mealCost).toFixed(2)
        ),
    };

    // Upsert into cost_estimates table
    const savedEstimate = await CostEstimateRepository.upsert(summary);

    return {
        summary: toCostEstimateView(savedEstimate),
        stops: itemizedStops,
    };
}

/**
 * @param {number} tripId
 */
async function getTripBudget(tripId) {
    const { summary } = await computeTripBudgetBreakdown(tripId);
    return summary;
}

/**
 * @param {number} tripId
 */
async function getTripExpenses(tripId) {
    return computeTripBudgetBreakdown(tripId);
}

module.exports = {
    calculateStopDuration,
    computeTripBudgetBreakdown,
    getTripBudget,
    getTripExpenses,
};
