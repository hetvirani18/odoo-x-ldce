const geoDbProvider = require('./cityProvider/geoDbCityProvider');
const seedProvider = require('./cityProvider/seedCityProvider');
const CityRepository = require('../repositories/city.repository');

/**
 * @param {string} query
 */
async function searchCities(query) {
    if (!query || query.trim().length === 0) {
        return CityRepository.getAll();
    }

    const trimmed = query.trim();
    const seededCities = await CityRepository.searchByName(trimmed);
    const results = [...seededCities];

    // 1. Try Live GeoDB Provider if available
    try {
        const liveResults = await geoDbProvider.search(trimmed);
        for (const live of liveResults) {
            const alreadyExists = results.find(
                (r) => r.name.toLowerCase() === live.name.toLowerCase()
            );
            if (!alreadyExists) {
                // Persist city into database so it receives a real database ID
                const savedCity = await CityRepository.findOrCreate({
                    name: live.name,
                    country: live.country,
                    lat: live.lat,
                    lng: live.lng,
                    cost_index: 'medium',
                    popularity: live.popularity || 50,
                });
                results.push(savedCity);
            }
        }
    } catch (error) {
        // GeoDB provider unavailable/offline
    }

    return results;
}

module.exports = { searchCities };
