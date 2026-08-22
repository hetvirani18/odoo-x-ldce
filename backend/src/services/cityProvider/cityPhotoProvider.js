const axios = require('axios');
const { OPENTRIPMAP_API_KEY } = require('../../config/env');
const { toRawCommonsUrl } = require('../../utils/wikimedia');

/**
 * Finds a representative photo for a city via OpenTripMap.
 * The `places/radius` list endpoint (used for activity search) never includes
 * image data — only the per-place `places/xid/{xid}` detail endpoint does, so
 * this fetches a short list of well-rated landmarks and checks their detail
 * records in turn until one has a usable preview image.
 * @param {string} cityName
 * @param {number|null} [lat]
 * @param {number|null} [lng]
 * @returns {Promise<string|null>}
 */
async function fetchCityImage(cityName, lat = null, lng = null) {
    if (!OPENTRIPMAP_API_KEY) return null;

    try {
        let coords = { lat, lon: lng };
        if (coords.lat == null || coords.lon == null) {
            const geoRes = await axios.get('https://api.opentripmap.com/0.1/en/places/geoname', {
                params: { name: cityName, apikey: OPENTRIPMAP_API_KEY },
                timeout: 5000,
            });
            if (geoRes.data?.lat == null || geoRes.data?.lon == null) return null;
            coords = { lat: geoRes.data.lat, lon: geoRes.data.lon };
        }

        const radiusRes = await axios.get('https://api.opentripmap.com/0.1/en/places/radius', {
            params: {
                radius: 10000,
                lon: coords.lon,
                lat: coords.lat,
                kinds: 'interesting_places,cultural,historic',
                rate: 2,
                format: 'json',
                limit: 5,
                apikey: OPENTRIPMAP_API_KEY,
            },
            timeout: 5000,
        });

        for (const place of radiusRes.data || []) {
            try {
                const detailRes = await axios.get(
                    `https://api.opentripmap.com/0.1/en/places/xid/${place.xid}`,
                    { params: { apikey: OPENTRIPMAP_API_KEY }, timeout: 5000 }
                );
                if (detailRes.data?.preview?.source) {
                    return toRawCommonsUrl(detailRes.data.preview.source);
                }
            } catch {
                // This place has no detail record or no image — try the next one
            }
        }

        return null;
    } catch {
        return null;
    }
}

module.exports = { fetchCityImage };
