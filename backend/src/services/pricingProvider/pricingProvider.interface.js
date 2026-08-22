/**
 * @typedef {Object} TransportPriceEstimate
 * @property {number} cost
 * @property {string} currency
 */

/**
 * @typedef {Object} CostRateResult
 * @property {number} perNightRate
 * @property {number} perDayMealRate
 */

/**
 * A pricing provider must implement:
 *   estimateTransport(fromCity: string, toCity: string, date: string): Promise<TransportPriceEstimate>
 */
module.exports = {};
