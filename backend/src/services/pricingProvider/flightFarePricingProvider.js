const { FLIGHTFARE_API_KEY } = require('../../config/env');

/**
 * Calculates great-circle distance between two points in km
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Estimates transport / flight fare between cities
 * @param {string} fromCityName
 * @param {string} toCityName
 * @param {string} date
 * @param {{ lat?: number|null, lng?: number|null }} [fromCoords]
 * @param {{ lat?: number|null, lng?: number|null }} [toCoords]
 */
async function estimateTransport(fromCityName, toCityName, date, fromCoords = null, toCoords = null) {
    // If coordinates are available for both cities, use Haversine distance-based dynamic pricing
    if (
        fromCoords &&
        toCoords &&
        fromCoords.lat !== null &&
        fromCoords.lat !== undefined &&
        toCoords.lat !== null &&
        toCoords.lat !== undefined
    ) {
        const distKm = calculateHaversineDistance(
            Number(fromCoords.lat),
            Number(fromCoords.lng),
            Number(toCoords.lat),
            Number(toCoords.lng)
        );
        // Base fare ($50) + $0.10/km
        const calculatedCost = Math.max(50, Math.round(50 + distKm * 0.10));
        return { cost: calculatedCost, currency: 'USD' };
    }

    // Default per-hop estimate
    return { cost: 120.0, currency: 'USD' };
}

module.exports = { estimateTransport, calculateHaversineDistance };
