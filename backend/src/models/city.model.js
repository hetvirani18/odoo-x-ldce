const TABLE_NAME = 'cities';

/**
 * @typedef {Object} City
 * @property {number} id
 * @property {string} name
 * @property {string} country
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {'low'|'medium'|'high'} cost_index
 * @property {number} popularity
 */

/**
 * @typedef {Object} CityView
 * @property {number} id
 * @property {string} name
 * @property {string} country
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {'low'|'medium'|'high'} cost_index
 * @property {number} popularity
 */

/**
 * @param {City} row
 * @returns {CityView}
 */
function toCityView(row) {
    return {
        id: row.id,
        name: row.name,
        country: row.country,
        lat: row.lat !== null && row.lat !== undefined ? Number(row.lat) : null,
        lng: row.lng !== null && row.lng !== undefined ? Number(row.lng) : null,
        cost_index: row.cost_index,
        popularity: row.popularity ?? 0,
    };
}

module.exports = { TABLE_NAME, toCityView };
