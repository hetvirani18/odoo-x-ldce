const TABLE_NAME = 'cost_estimates';

/**
 * @typedef {Object} CostEstimate
 * @property {number} id
 * @property {number} trip_id
 * @property {number} transport_cost
 * @property {number} accommodation_cost
 * @property {number} activity_cost
 * @property {number} meal_cost
 * @property {number} total_cost
 * @property {Date|string} updated_at
 */

/**
 * @typedef {Object} CostEstimateView
 * @property {number} trip_id
 * @property {number} transport_cost
 * @property {number} accommodation_cost
 * @property {number} activity_cost
 * @property {number} meal_cost
 * @property {number} total_cost
 * @property {Date|string} updated_at
 */

/**
 * @param {CostEstimate} row
 * @returns {CostEstimateView}
 */
function toCostEstimateView(row) {
    return {
        trip_id: row.trip_id,
        transport_cost: Number(row.transport_cost || 0),
        accommodation_cost: Number(row.accommodation_cost || 0),
        activity_cost: Number(row.activity_cost || 0),
        meal_cost: Number(row.meal_cost || 0),
        total_cost: Number(row.total_cost || 0),
        updated_at: row.updated_at,
    };
}

module.exports = { TABLE_NAME, toCostEstimateView };
