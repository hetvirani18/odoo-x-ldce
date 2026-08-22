/**
 * @typedef {Object} ActivityResult
 * @property {number} [id]
 * @property {number} [city_id]
 * @property {string} name
 * @property {string} category
 * @property {number} cost
 * @property {number|null} duration_hours
 * @property {string|null} description
 * @property {string|null} image_url
 */

/**
 * An activity provider must implement:
 *   search(cityName: string, filters?: { category?: string, maxCost?: number }): Promise<ActivityResult[]>
 */
module.exports = {};
