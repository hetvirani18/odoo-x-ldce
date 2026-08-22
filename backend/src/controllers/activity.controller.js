const activityService = require('../services/activity.service');
const ActivityRepository = require('../repositories/activity.repository');
const { toActivityView } = require('../models/activity.model');

/**
 * @param {number} cityId
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function getActivitiesByCity(cityId, filters = {}) {
    const activities = await activityService.getActivitiesForCity(cityId, filters);
    return activities.map((a) => toActivityView(a));
}

/**
 * @param {number} id
 */
async function getActivityById(id) {
    const activity = await ActivityRepository.findById(id);
    return toActivityView(activity);
}

module.exports = { getActivitiesByCity, getActivityById };
