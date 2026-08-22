const crypto = require('crypto');
const TripRepository = require('../repositories/trip.repository');
const { toTripView } = require('../models/trip.model');
const { ERRORS } = require('../utils/AppError');

async function createTrip(userId, body) {
    if (new Date(body.end_date) < new Date(body.start_date)) {
        throw ERRORS.INVALID_DATE_RANGE;
    }

    const shareToken = body.is_public ? crypto.randomBytes(16).toString('hex') : null;

    const trip = await TripRepository.create({
        userId,
        name: body.name,
        startDate: body.start_date,
        endDate: body.end_date,
        description: body.description,
        coverPhotoUrl: body.cover_photo_url,
        isPublic: Boolean(body.is_public),
        shareToken,
    });

    return toTripView(trip);
}

async function listTrips(userId) {
    const trips = await TripRepository.findByUserId(userId);
    return trips.map(toTripView);
}

async function getTrip(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }
    return toTripView(trip);
}

async function updateTrip(tripId, requestingUserId, body) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    const startDate = body.start_date ?? (trip.start_date instanceof Date ? trip.start_date.toISOString().split('T')[0] : trip.start_date);
    const endDate = body.end_date ?? (trip.end_date instanceof Date ? trip.end_date.toISOString().split('T')[0] : trip.end_date);

    if (new Date(endDate) < new Date(startDate)) {
        throw ERRORS.INVALID_DATE_RANGE;
    }

    let shareToken = undefined;
    if (body.is_public === true && !trip.share_token) {
        shareToken = crypto.randomBytes(16).toString('hex');
    } else if (body.is_public === false) {
        shareToken = null;
    }

    const updatedTrip = await TripRepository.update(tripId, {
        name: body.name,
        startDate: body.start_date,
        endDate: body.end_date,
        description: body.description,
        coverPhotoUrl: body.cover_photo_url,
        isPublic: body.is_public,
        shareToken,
    });

    return toTripView(updatedTrip);
}

async function deleteTrip(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }
    await TripRepository.deleteById(tripId);
}

module.exports = {
    createTrip,
    listTrips,
    getTrip,
    updateTrip,
    deleteTrip,
};
