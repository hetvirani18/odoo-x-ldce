/**
 * @typedef {Object} CityResult
 * @property {string} name
 * @property {string} country
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {'low'|'medium'|'high'|null} cost_index
 * @property {number} [popularity]
 * @property {number} [id]
 */

/**
 * A city provider must implement:
 *   search(query: string): Promise<CityResult[]>
 */
module.exports = {};
