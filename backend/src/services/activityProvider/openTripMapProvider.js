const axios = require('axios');
const { ERRORS } = require('../../utils/AppError');
const { OPENTRIPMAP_API_KEY } = require('../../config/env');

/**
 * @param {string} cityName
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function search(cityName, filters = {}) {
    if (!OPENTRIPMAP_API_KEY) {
        throw ERRORS.ACTIVITY_PROVIDER_UNAVAILABLE;
    }

    try {
        // 1. Get coordinates for city
        const geoRes = await axios.get(
            `https://api.opentripmap.com/0.1/en/places/geoname`,
            {
                params: { name: cityName, apikey: OPENTRIPMAP_API_KEY },
                timeout: 5000,
            }
        );

        if (!geoRes.data || !geoRes.data.lat || !geoRes.data.lon) {
            return [];
        }

        const { lat, lon } = geoRes.data;

        // 2. Search places by radius (5km)
        const kinds = filters.category || 'interesting_places,cultural,historic';
        const placesRes = await axios.get(
            `https://api.opentripmap.com/0.1/en/places/radius`,
            {
                params: {
                    radius: 5000,
                    lon,
                    lat,
                    kinds,
                    format: 'json',
                    limit: 10,
                    apikey: OPENTRIPMAP_API_KEY,
                },
                timeout: 5000,
            }
        );

        const results = (placesRes.data || []).map((place) => ({
            name: place.name || 'Local Attraction',
            category: filters.category || 'sightseeing',
            cost: 0,
            duration_hours: 2.0,
            description: place.wikipedia_extracts?.text || `Popular attraction in ${cityName}`,
            image_url: place.preview?.source || null,
        }));

        if (filters.maxCost !== undefined && filters.maxCost !== null) {
            return results.filter((r) => r.cost <= Number(filters.maxCost));
        }

        return results;
    } catch (error) {
        throw ERRORS.ACTIVITY_PROVIDER_UNAVAILABLE;
    }
}

module.exports = { search };
