const crypto = require('crypto');
const TripRepository = require('../repositories/trip.repository');
const StopRepository = require('../repositories/stop.repository');
const TripActivityRepository = require('../repositories/tripActivity.repository');
const CostEstimateRepository = require('../repositories/costEstimate.repository');
const UserRepository = require('../repositories/user.repository');
const { toPublicTripView, formatLocalDate } = require('../models/trip.model');
const { toCostEstimateView } = require('../models/costEstimate.model');
const { ERRORS } = require('../utils/AppError');
const { FRONTEND_URL } = require('../config/env');

/**
 * @param {number} tripId
 * @param {number} requestingUserId
 */
async function shareTrip(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    const shareToken = trip.share_token || crypto.randomBytes(24).toString('hex');
    const updatedTrip = await TripRepository.updateShareStatus(tripId, true, shareToken);

    return {
        trip_id: updatedTrip.id,
        is_public: true,
        share_token: updatedTrip.share_token,
        share_url: `${FRONTEND_URL}/trips/shared/${updatedTrip.share_token}`,
    };
}

/**
 * @param {number} tripId
 * @param {number} requestingUserId
 */
async function unshareTrip(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    await TripRepository.updateShareStatus(tripId, false, null);

    return {
        trip_id: tripId,
        is_public: false,
        share_token: null,
    };
}

/**
 * @param {string} shareToken
 */
async function getPublicTrip(shareToken) {
    const trip = await TripRepository.findByShareToken(shareToken);
    const [stops, activities, costEstimate, owner] = await Promise.all([
        StopRepository.findByTripId(trip.id),
        TripActivityRepository.findByTripId(trip.id),
        CostEstimateRepository.findByTripId(trip.id),
        UserRepository.findById(trip.user_id),
    ]);

    // Group activities by stop
    const activitiesByStop = new Map();
    for (const act of activities) {
        if (!activitiesByStop.has(act.stop_id)) {
            activitiesByStop.set(act.stop_id, []);
        }
        activitiesByStop.get(act.stop_id).push({
            id: act.id,
            name: act.activity_name,
            category: act.activity_category,
            cost: Number(act.activity_cost || 0),
            duration_hours: act.activity_duration_hours ? Number(act.activity_duration_hours) : null,
            description: act.activity_description,
            image_url: act.activity_image_url,
            scheduled_date: act.scheduled_date,
            scheduled_time: act.scheduled_time,
        });
    }

    const structuredStops = stops.map((stop) => ({
        id: stop.id,
        order_index: stop.order_index,
        start_date: stop.start_date,
        end_date: stop.end_date,
        city: {
            id: stop.city_id,
            name: stop.city_name,
            country: stop.city_country,
            lat: stop.city_lat ? Number(stop.city_lat) : null,
            lng: stop.city_lng ? Number(stop.city_lng) : null,
            cost_index: stop.city_cost_index,
        },
        activities: activitiesByStop.get(stop.id) || [],
    }));

    return {
        trip: toPublicTripView(trip),
        owner: {
            name: owner.name,
            photo_url: owner.photo_url,
        },
        stops: structuredStops,
        cost_estimate: costEstimate ? toCostEstimateView(costEstimate) : null,
    };
}

async function listPublicTrips() {
    const trips = await TripRepository.listPublicTrips();
    return trips.map((t) => ({
        id: t.id,
        name: t.name,
        start_date: formatLocalDate(t.start_date),
        end_date: formatLocalDate(t.end_date),
        description: t.description,
        cover_photo_url: t.cover_photo_url,
        share_token: t.share_token,
        owner_name: t.owner_name,
        owner_photo: t.owner_photo,
    }));
}

module.exports = { shareTrip, unshareTrip, getPublicTrip, listPublicTrips };
