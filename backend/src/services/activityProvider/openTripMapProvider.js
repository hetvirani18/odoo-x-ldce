const axios = require('axios');
const { ERRORS } = require('../../utils/AppError');
const { OPENTRIPMAP_API_KEY } = require('../../config/env');

// Maps our app's activity categories (see docs/database-design.md — activities.category)
// to OpenTripMap's own fixed `kinds` taxonomy, which uses different vocabulary.
const DEFAULT_KINDS = 'interesting_places,cultural,historic';
const CATEGORY_KIND_MAP = {
    sightseeing: 'interesting_places',
    food: 'foods',
    adventure: 'sport,amusements',
    culture: 'cultural,historic',
};

// Reverse lookup: OpenTripMap tags each place with its own `kinds` taxonomy
// (comma-separated), independent of which `kinds` filter the search used.
// Check more specific categories before the broad 'interesting_places' bucket.
const KIND_TAG_TO_CATEGORY = [
    ['foods', 'food'],
    ['sport', 'adventure'],
    ['amusements', 'adventure'],
    ['cultural', 'culture'],
    ['historic', 'culture'],
    ['interesting_places', 'sightseeing'],
];

function categoryFromKinds(kindsString, fallback) {
    const tags = (kindsString || '').split(',');
    for (const [tag, category] of KIND_TAG_TO_CATEGORY) {
        if (tags.includes(tag)) return category;
    }
    return fallback;
}

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

        if (!geoRes.data || geoRes.data.lat == null || geoRes.data.lon == null) {
            return [];
        }

        const { lat, lon } = geoRes.data;

        // 2. Search places by radius (5km)
        const kinds = (filters.category && CATEGORY_KIND_MAP[filters.category]) || DEFAULT_KINDS;
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

        // The radius list endpoint only returns xid/name/kinds/etc — no image or
        // description. Those live on the per-place detail endpoint, so fetch it
        // for each candidate (bounded by the `limit` above) to get real data.
        const results = await Promise.all(
            (placesRes.data || []).map(async (place) => {
                let preview = null;
                let extract = null;
                try {
                    const detailRes = await axios.get(
                        `https://api.opentripmap.com/0.1/en/places/xid/${place.xid}`,
                        { params: { apikey: OPENTRIPMAP_API_KEY }, timeout: 5000 }
                    );
                    preview = detailRes.data?.preview?.source || null;
                    extract = detailRes.data?.wikipedia_extracts?.text || null;
                } catch {
                    // This place has no detail record — fall back to the list data only
                }

                return {
                    name: place.name || 'Local Attraction',
                    category: categoryFromKinds(place.kinds, filters.category || 'sightseeing'),
                    cost: null, // OpenTripMap doesn't provide pricing; unknown, not free
                    duration_hours: null,
                    description: extract || `Popular attraction in ${cityName}`,
                    image_url: preview,
                };
            })
        );

        // maxCost filtering happens downstream in activity.service.js, once a
        // real/estimated cost has been assigned (this provider doesn't know price).
        return results;
    } catch (error) {
        throw ERRORS.ACTIVITY_PROVIDER_UNAVAILABLE;
    }
}

module.exports = { search };
