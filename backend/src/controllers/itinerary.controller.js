const TripRepository = require('../repositories/trip.repository');
const StopRepository = require('../repositories/stop.repository');
const CityRepository = require('../repositories/city.repository');
const { toStopView } = require('../models/stop.model');
const { ERRORS } = require('../utils/AppError');

function formatYMD(dateVal) {
    if (dateVal instanceof Date) {
        return dateVal.toISOString().split('T')[0];
    }
    return String(dateVal);
}

async function addStop(tripId, requestingUserId, body) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    await CityRepository.findById(body.city_id);

    if (new Date(body.end_date) < new Date(body.start_date)) {
        throw ERRORS.INVALID_DATE_RANGE;
    }

    const tripStart = formatYMD(trip.start_date);
    const tripEnd = formatYMD(trip.end_date);

    if (body.start_date < tripStart || body.end_date > tripEnd) {
        throw ERRORS.INVALID_DATE_RANGE;
    }

    const maxOrder = await StopRepository.getMaxOrderIndex(tripId);
    const orderIndex = body.order_index ?? (maxOrder + 1);

    const stop = await StopRepository.create({
        tripId,
        cityId: body.city_id,
        startDate: body.start_date,
        endDate: body.end_date,
        orderIndex,
    });

    return toStopView(stop);
}

async function listStops(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    const stops = await StopRepository.findByTripId(tripId);
    return stops.map(toStopView);
}

async function updateStop(stopId, requestingUserId, body) {
    const stop = await StopRepository.findById(stopId);
    const trip = await TripRepository.findById(stop.trip_id);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    if (body.city_id !== undefined) {
        await CityRepository.findById(body.city_id);
    }

    const currentStart = formatYMD(stop.start_date);
    const currentEnd = formatYMD(stop.end_date);
    const startDate = body.start_date ?? currentStart;
    const endDate = body.end_date ?? currentEnd;

    if (new Date(endDate) < new Date(startDate)) {
        throw ERRORS.INVALID_DATE_RANGE;
    }

    const tripStart = formatYMD(trip.start_date);
    const tripEnd = formatYMD(trip.end_date);

    if (startDate < tripStart || endDate > tripEnd) {
        throw ERRORS.INVALID_DATE_RANGE;
    }

    const updated = await StopRepository.update(stopId, {
        startDate: body.start_date,
        endDate: body.end_date,
        orderIndex: body.order_index,
        cityId: body.city_id,
    });

    return toStopView(updated);
}

async function deleteStop(stopId, requestingUserId) {
    const stop = await StopRepository.findById(stopId);
    const trip = await TripRepository.findById(stop.trip_id);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    await StopRepository.deleteById(stopId);
}

async function reorderStops(tripId, requestingUserId, body) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }

    const currentStops = await StopRepository.findByTripId(tripId);
    const currentStopIds = new Set(currentStops.map((s) => s.id));

    // Validate that all provided IDs belong to this trip
    for (const stopId of body.stop_ids) {
        if (!currentStopIds.has(stopId)) {
            throw ERRORS.STOP_NOT_FOUND;
        }
    }

    for (let i = 0; i < body.stop_ids.length; i++) {
        await StopRepository.updateOrderIndex(body.stop_ids[i], i);
    }

    const updatedStops = await StopRepository.findByTripId(tripId);
    return updatedStops.map(toStopView);
}

module.exports = {
    addStop,
    listStops,
    updateStop,
    deleteStop,
    reorderStops,
};
