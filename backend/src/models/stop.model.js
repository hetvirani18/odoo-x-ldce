const TABLE_NAME = 'stops';

/**
 * @typedef {Object} Stop
 * @property {number} id
 * @property {number} trip_id
 * @property {number} city_id
 * @property {string|Date} start_date
 * @property {string|Date} end_date
 * @property {number} order_index
 * @property {string} [city_name]
 * @property {string} [city_country]
 * @property {number} [city_lat]
 * @property {number} [city_lng]
 * @property {string} [city_cost_index]
 */

/**
 * @typedef {Object} StopView
 * @property {number} id
 * @property {number} trip_id
 * @property {number} city_id
 * @property {string} start_date
 * @property {string} end_date
 * @property {number} order_index
 * @property {Object} [city]
 */

/**
 * @typedef {Object} CreateStopInput
 * @property {number} tripId
 * @property {number} cityId
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} [orderIndex]
 */

/**
 * @typedef {Object} UpdateStopInput
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {number} [orderIndex]
 * @property {number} [cityId]
 */

function formatLocalDate(val) {
    if (!val) return val;
    if (typeof val === 'string') return val.split('T')[0].split(' ')[0];
    if (val instanceof Date) {
        const year = val.getFullYear();
        const month = String(val.getMonth() + 1).padStart(2, '0');
        const day = String(val.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return String(val);
}

/**
 * @param {Stop} row
 * @returns {StopView}
 */
function toStopView(row) {
    const view = {
        id: row.id,
        trip_id: row.trip_id,
        city_id: row.city_id,
        start_date: formatLocalDate(row.start_date),
        end_date: formatLocalDate(row.end_date),
        order_index: row.order_index,
    };

    if (row.city_name) {
        view.city = {
            id: row.city_id,
            name: row.city_name,
            country: row.city_country,
            lat: row.city_lat != null ? Number(row.city_lat) : null,
            lng: row.city_lng != null ? Number(row.city_lng) : null,
            cost_index: row.city_cost_index,
        };
    }

    return view;
}

module.exports = { TABLE_NAME, toStopView, formatLocalDate };
