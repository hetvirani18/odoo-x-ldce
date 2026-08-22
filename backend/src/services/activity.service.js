const openTripMapProvider = require('./activityProvider/openTripMapProvider');
const seedProvider = require('./activityProvider/seedActivityProvider');
const CityRepository = require('../repositories/city.repository');

/**
 * @param {number} cityId
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function getActivitiesForCity(cityId, filters = {}) {
    const city = await CityRepository.findById(cityId);

    try {
        const liveResults = await openTripMapProvider.search(city.name, filters);
        const seededResults = await seedProvider.findByCityId(cityId, filters);

        // Combine seeded activities (with real IDs) + live results
        const combined = [...seededResults];
        for (const item of liveResults) {
            // Avoid exact name duplicate
            if (!combined.some((c) => c.name.toLowerCase() === item.name.toLowerCase())) {
                combined.push({
                    id: undefined,
                    city_id: cityId,
                    name: item.name,
                    category: item.category,
                    cost: item.cost,
                    duration_hours: item.duration_hours,
                    description: item.description,
                    image_url: item.image_url,
                });
            }
        }
        return combined;
    } catch (error) {
        return seedProvider.findByCityId(cityId, filters);
    }
}

module.exports = { getActivitiesForCity };
