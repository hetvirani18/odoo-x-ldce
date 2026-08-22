const db = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/stop.model');

/**
 * @param {number} id
 */
async function findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw ERRORS.STOP_NOT_FOUND;
    }
    return rows[0];
}

/**
 * @param {number} tripId
 */
async function findByTripId(tripId) {
    const [rows] = await db.query(
        `SELECT s.*, 
                c.name AS city_name, 
                c.country AS city_country, 
                c.lat AS city_lat, 
                c.lng AS city_lng, 
                c.cost_index AS city_cost_index,
                c.popularity AS city_popularity
         FROM ${TABLE_NAME} s
         JOIN cities c ON s.city_id = c.id
         WHERE s.trip_id = ?
         ORDER BY s.order_index ASC, s.start_date ASC`,
        [tripId]
    );
    return rows;
}

module.exports = { findById, findByTripId };
