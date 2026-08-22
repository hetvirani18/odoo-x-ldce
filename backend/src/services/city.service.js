const geoDbProvider = require('./cityProvider/geoDbCityProvider');
const seedProvider = require('./cityProvider/seedCityProvider');
const CityRepository = require('../repositories/city.repository');

/**
 * @param {string} query
 */
async function searchCities(query) {
    try {
        const liveResults = await geoDbProvider.search(query);
        const seededCities = await CityRepository.searchByName(query);
        const seedMap = new Map();
        for (const city of seededCities) {
            seedMap.set(`${city.name.toLowerCase()}_${city.country.toLowerCase()}`, city);
        }

        return liveResults.map((c) => {
            const key = `${c.name.toLowerCase()}_${c.country.toLowerCase()}`;
            const seed = seedMap.get(key);
            return {
                id: seed ? seed.id : undefined,
                name: c.name,
                country: c.country,
                lat: c.lat,
                lng: c.lng,
                cost_index: seed ? seed.cost_index : 'medium',
                popularity: seed ? seed.popularity : (c.popularity || 50),
            };
        });
    } catch (error) {
        // Fall back seamlessly to seeded database records
        return seedProvider.search(query);
    }
}

module.exports = { searchCities };
