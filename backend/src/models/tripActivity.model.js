const TABLE_NAME = 'trip_activities';

/**
 * @typedef {Object} TripActivity
 * @property {number} id
 * @property {number} stop_id
 * @property {number} activity_id
 * @property {string|Date} scheduled_date
 * @property {string|null} scheduled_time
 * @property {string} [activity_name]
 * @property {string} [activity_category]
 * @property {number} [activity_cost]
 * @property {number|null} [activity_duration_hours]
 * @property {string|null} [activity_description]
 * @property {string|null} [activity_image_url]
 * @property {number} [activity_city_id]
 */

/**
 * @typedef {Object} TripActivityView
 * @property {number} id
 * @property {number} stop_id
 * @property {number} activity_id
 * @property {string} scheduled_date
 * @property {string|null} scheduled_time
 * @property {Object} [activity]
 */

/**
 * @typedef {Object} CreateTripActivityInput
 * @property {number} stopId
 * @property {number} activityId
 * @property {string} scheduledDate
 * @property {string|null} [scheduledTime]
 */

/**
 * @typedef {Object} UpdateTripActivityInput
 * @property {string} [scheduledDate]
 * @property {string|null} [scheduledTime]
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
 * @param {TripActivity} row
 * @returns {TripActivityView}
 */
function toTripActivityView(row) {
    const view = {
        id: row.id,
        stop_id: row.stop_id,
        activity_id: row.activity_id,
        scheduled_date: formatLocalDate(row.scheduled_date),
        scheduled_time: row.scheduled_time ?? null,
    };

    if (row.activity_name) {
        view.activity = {
            id: row.activity_id,
            city_id: row.activity_city_id,
            name: row.activity_name,
            category: row.activity_category,
            cost: Number(row.activity_cost),
            duration_hours: row.activity_duration_hours != null ? Number(row.activity_duration_hours) : null,
            description: row.activity_description ?? null,
            image_url: row.activity_image_url ?? null,
        };
    }

    return view;
}

module.exports = { TABLE_NAME, toTripActivityView, formatLocalDate };
