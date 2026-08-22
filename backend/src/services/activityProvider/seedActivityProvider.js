const ActivityRepository = require('../../repositories/activity.repository');

/**
 * @param {string} cityName
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function search(cityName, filters = {}) {
    return ActivityRepository.searchByCityName(cityName, filters);
}

/**
 * @param {number} cityId
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function findByCityId(cityId, filters = {}) {
    return ActivityRepository.findByCityId(cityId, filters);
}

module.exports = { search, findByCityId };
