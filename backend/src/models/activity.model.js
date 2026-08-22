const TABLE_NAME = 'activities';

/**
 * @typedef {Object} Activity
 * @property {number} id
 * @property {number} city_id
 * @property {string} name
 * @property {string} category
 * @property {number} cost
 * @property {number|null} duration_hours
 * @property {string|null} description
 * @property {string|null} image_url
 */

/**
 * @typedef {Object} ActivityView
 * @property {number} id
 * @property {number} city_id
 * @property {string} name
 * @property {string} category
 * @property {number} cost
 * @property {number|null} duration_hours
 * @property {string|null} description
 * @property {string|null} image_url
 */

/**
 * @param {Activity} row
 * @returns {ActivityView}
 */
function toActivityView(row) {
    return {
        id: row.id,
        city_id: row.city_id,
        name: row.name,
        category: row.category,
        cost: Number(row.cost),
        duration_hours: row.duration_hours != null ? Number(row.duration_hours) : null,
        description: row.description ?? null,
        image_url: row.image_url ?? null,
    };
}

module.exports = { TABLE_NAME, toActivityView };
