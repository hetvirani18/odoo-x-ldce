const geoDbProvider = require('./cityProvider/geoDbCityProvider');
const seedProvider = require('./cityProvider/seedCityProvider');
const cityPhotoProvider = require('./cityProvider/cityPhotoProvider');
const CityRepository = require('../repositories/city.repository');

// How many cities per request get a live photo lookup when missing one — caps
// external API calls per request; once fetched, a city's image_url is cached
// in the DB so this only ever runs again for cities that still have none.
const IMAGE_BACKFILL_LIMIT = 12;

/**
 * Fills in image_url for cities that don't have one yet, mutating and
 * persisting each city that gets a hit. Runs sequentially — each city does
 * up to several OpenTripMap calls, and firing those in parallel across many
 * cities at once trips the provider's rate limit. This only runs against
 * cities missing an image, and the result is cached in the DB, so the cost
 * is paid once per city rather than on every request.
 * Best-effort — a city that fails or has no photo available is left with
 * image_url: null.
 * @param {Array} cities
 */
async function backfillImages(cities) {
    const missing = cities.filter((c) => !c.image_url).slice(0, IMAGE_BACKFILL_LIMIT);
    for (const city of missing) {
        const imageUrl = await cityPhotoProvider.fetchCityImage(city.name, city.lat, city.lng);
        if (imageUrl) {
            city.image_url = imageUrl;
            await CityRepository.updateImageUrl(city.id, imageUrl);
        }
    }
    return cities;
}

/**
 * @param {string} query
 */
async function searchCities(query) {
    if (!query || query.trim().length === 0) {
        const cities = await CityRepository.getAll();
        return backfillImages(cities);
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

    return backfillImages(results);
}

module.exports = { searchCities };
