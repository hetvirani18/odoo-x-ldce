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

/**
 * @param {Trip} row
 * @returns {TripView}
 */
function toTripView(row) {
    return {
        id: row.id,
        name: row.name,
        start_date: row.start_date instanceof Date ? row.start_date.toISOString().split('T')[0] : row.start_date,
        end_date: row.end_date instanceof Date ? row.end_date.toISOString().split('T')[0] : row.end_date,
        description: row.description ?? null,
        cover_photo_url: row.cover_photo_url ?? null,
        is_public: Boolean(row.is_public),
        share_token: row.share_token ?? null,
        created_at: row.created_at,
    };
}

module.exports = { TABLE_NAME, toTripView };
