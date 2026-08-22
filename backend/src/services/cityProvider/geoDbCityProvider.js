const axios = require('axios');
const { ERRORS } = require('../../utils/AppError');
const { GEODB_API_KEY } = require('../../config/env');

/**
 * @param {string} query
 */
async function search(query) {
    if (!GEODB_API_KEY) {
        throw ERRORS.CITY_PROVIDER_UNAVAILABLE;
    }

    try {
        const { data } = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
            params: { namePrefix: query, limit: 10 },
            headers: {
                'X-RapidAPI-Key': GEODB_API_KEY,
                'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            },
            timeout: 5000,
        });

        return (data.data || []).map((c) => ({
            name: c.city,
            country: c.country,
            lat: c.latitude,
            lng: c.longitude,
            cost_index: null,
            popularity: 50,
        }));
    } catch (error) {
        throw ERRORS.CITY_PROVIDER_UNAVAILABLE;
    }
}

module.exports = { search };
