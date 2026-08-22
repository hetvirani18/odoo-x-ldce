const TABLE_NAME = 'stops';

/**
 * @typedef {Object} Stop
 * @property {number} id
 * @property {number} trip_id
 * @property {number} city_id
 * @property {string} start_date
 * @property {string} end_date
 * @property {number} order_index
 */

/**
 * @typedef {Object} StopView
 * @property {number} id
 * @property {number} trip_id
 * @property {number} city_id
 * @property {string} start_date
 * @property {string} end_date
 * @property {number} order_index
 * @property {import('./city.model').CityView} [city]
 * @property {import('./tripActivity.model').TripActivityView[]} [activities]
 */

/**
 * @param {Stop} row
 * @returns {StopView}
 */
function toStopView(row) {
    return {
        id: row.id,
        trip_id: row.trip_id,
        city_id: row.city_id,
        start_date: row.start_date,
        end_date: row.end_date,
        order_index: row.order_index,
    };
}

module.exports = { TABLE_NAME, toStopView };
