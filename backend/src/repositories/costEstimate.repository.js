const db = require('../database/db');
const { TABLE_NAME } = require('../models/costEstimate.model');

/**
 * @param {number} tripId
 */
async function findByTripId(tripId) {
    const [rows] = await db.query(
        `SELECT * FROM ${TABLE_NAME} WHERE trip_id = ?`,
        [tripId]
    );
    if (rows.length === 0) {
        return null;
    }
    return rows[0];
}

/**
 * @param {{
 *   tripId: number,
 *   transportCost: number,
 *   accommodationCost: number,
 *   activityCost: number,
 *   mealCost: number
 * }} input
 */
async function upsert(input) {
    await db.query(
        `INSERT INTO ${TABLE_NAME} (trip_id, transport_cost, accommodation_cost, activity_cost, meal_cost)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             transport_cost = VALUES(transport_cost),
             accommodation_cost = VALUES(accommodation_cost),
             activity_cost = VALUES(activity_cost),
             meal_cost = VALUES(meal_cost)`,
        [
            input.tripId,
            input.transportCost,
            input.accommodationCost,
            input.activityCost,
            input.mealCost,
        ]
    );
    return findByTripId(input.tripId);
}

/**
 * Returns mapping of cost_index => { per_night_rate, per_day_meal_rate }
 */
async function getCostRates() {
    const [rows] = await db.query(`SELECT * FROM cost_rates`);
    const rateMap = {};
    for (const row of rows) {
        rateMap[row.cost_index] = {
            perNightRate: Number(row.per_night_rate),
            perDayMealRate: Number(row.per_day_meal_rate),
        };
    }
    return rateMap;
}

module.exports = { findByTripId, upsert, getCostRates };
