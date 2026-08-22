const TABLE_NAME = 'trip_activities';

/**
 * @typedef {Object} TripActivity
 * @property {number} id
 * @property {number} stop_id
 * @property {number} activity_id
 * @property {string} scheduled_date
 * @property {string|null} scheduled_time
 */

/**
 * @typedef {Object} TripActivityView
 * @property {number} id
 * @property {number} stop_id
 * @property {number} activity_id
 * @property {string} scheduled_date
 * @property {string|null} scheduled_time
 * @property {import('./activity.model').ActivityView} [activity]
 */

/**
 * @param {TripActivity} row
 * @returns {TripActivityView}
 */
function toTripActivityView(row) {
    return {
        id: row.id,
        stop_id: row.stop_id,
        activity_id: row.activity_id,
        scheduled_date: row.scheduled_date,
        scheduled_time: row.scheduled_time || null,
    };
}

module.exports = { TABLE_NAME, toTripActivityView };
