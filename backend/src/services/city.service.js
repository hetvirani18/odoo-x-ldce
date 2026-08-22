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

    // 2. Fallback: If city not found, dynamically create it in the database with a real ID
    if (results.length === 0 && trimmed.length >= 2) {
        const formattedName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        const newCity = await CityRepository.findOrCreate({
            name: formattedName,
            country: 'Global',
            lat: null,
            lng: null,
            cost_index: 'medium',
            popularity: 60,
        });
        results.push(newCity);
    }

    return results;
}

module.exports = { searchCities };
