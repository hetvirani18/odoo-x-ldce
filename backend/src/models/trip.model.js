const TABLE_NAME = 'trips';

/**
 * @typedef {Object} Trip
 * @property {number} id
 * @property {number} user_id
 * @property {string} name
 * @property {string|Date} start_date
 * @property {string|Date} end_date
 * @property {string|null} description
 * @property {string|null} cover_photo_url
 * @property {boolean|number} is_public
 * @property {string|null} share_token
 * @property {Date} created_at
 */

/**
 * @typedef {Object} TripView
 * @property {number} id
 * @property {string} name
 * @property {string} start_date
 * @property {string} end_date
 * @property {string|null} description
 * @property {string|null} cover_photo_url
 * @property {boolean} is_public
 * @property {string|null} share_token
 * @property {Date|string} created_at
 */

/**
 * @typedef {Object} CreateTripInput
 * @property {number} userId
 * @property {string} name
 * @property {string} startDate
 * @property {string} endDate
 * @property {string|null} [description]
 * @property {string|null} [coverPhotoUrl]
 * @property {boolean} [isPublic]
 * @property {string|null} [shareToken]
 */

/**
 * @typedef {Object} UpdateTripInput
 * @property {string} [name]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string|null} [description]
 * @property {string|null} [coverPhotoUrl]
 * @property {boolean} [isPublic]
 * @property {string|null} [shareToken]
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
 * @param {Trip} row
 * @returns {TripView}
 */
function toTripView(row) {
    return {
        id: row.id,
        name: row.name,
        start_date: formatLocalDate(row.start_date),
        end_date: formatLocalDate(row.end_date),
        description: row.description ?? null,
        cover_photo_url: row.cover_photo_url ?? null,
        is_public: Boolean(row.is_public),
        share_token: row.share_token ?? null,
        created_at: row.created_at,
    };
}

module.exports = { TABLE_NAME, toTripView, formatLocalDate };
