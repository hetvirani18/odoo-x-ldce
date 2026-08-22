const TripRepository = require('../repositories/trip.repository');
const budgetService = require('../services/budget.service');
const { ERRORS } = require('../utils/AppError');

/**
 * @param {number} tripId
 * @param {number} requestingUserId
 */
async function getTripBudget(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }
    return budgetService.getTripBudget(tripId);
}

/**
 * @param {number} tripId
 * @param {number} requestingUserId
 */
async function getTripExpenses(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }
    return budgetService.getTripExpenses(tripId);
}

module.exports = { getTripBudget, getTripExpenses };
