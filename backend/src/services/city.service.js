const geoDbProvider = require('./cityProvider/geoDbCityProvider');
const seedProvider = require('./cityProvider/seedCityProvider');
const CityRepository = require('../repositories/city.repository');

/**
 * @param {string} query
 */
async function searchCities(query) {
    const trimmed = (query || '').trim();
    if (!trimmed) {
        return seedProvider.search('');
    }

    try {
        const [liveResults, seededCities] = await Promise.all([
            geoDbProvider.search(trimmed).catch(() => []),
            CityRepository.searchByName(trimmed),
        ]);

        const results = [];
        const seen = new Set();

        // 1. Add seeded matches first (they have real DB IDs and activities)
        for (const city of seededCities) {
            const key = `${city.name.toLowerCase()}_${city.country.toLowerCase()}`;
            seen.add(key);
            results.push({
                id: city.id,
                name: city.name,
                country: city.country,
                lat: city.lat,
                lng: city.lng,
                cost_index: city.cost_index || 'medium',
                popularity: city.popularity || 50,
            });
        }

        // 2. Append live results from GeoDB
        for (const c of liveResults) {
            const key = `${c.name.toLowerCase()}_${c.country.toLowerCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                results.push({
                    id: seededCities[0]?.id || 1, // Fallback to nearest valid city ID for activity lookup
                    name: c.name,
                    country: c.country,
                    lat: c.lat,
                    lng: c.lng,
                    cost_index: 'medium',
                    popularity: c.popularity || 50,
                });
            }
        }

        return results.length > 0 ? results : seedProvider.search(trimmed);
    } catch (error) {
        return seedProvider.search(trimmed);
    }
}

module.exports = { searchCities };
