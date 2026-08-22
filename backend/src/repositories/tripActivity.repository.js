const db = require('../database/db');
const { TABLE_NAME } = require('../models/tripActivity.model');

/**
 * @param {number} stopId
 */
async function findByStopId(stopId) {
    const [rows] = await db.query(
        `SELECT ta.*, 
                a.name AS activity_name, 
                a.category AS activity_category, 
                a.cost AS activity_cost, 
                a.duration_hours AS activity_duration_hours,
                a.description AS activity_description,
                a.image_url AS activity_image_url
         FROM ${TABLE_NAME} ta
         JOIN activities a ON ta.activity_id = a.id
         WHERE ta.stop_id = ?
         ORDER BY ta.scheduled_date ASC, ta.scheduled_time ASC`,
        [stopId]
    );
    return rows;
}

/**
 * @param {number} tripId
 */
async function findByTripId(tripId) {
    const [rows] = await db.query(
        `SELECT ta.*, 
                s.trip_id,
                s.city_id,
                a.name AS activity_name, 
                a.category AS activity_category, 
                a.cost AS activity_cost, 
                a.duration_hours AS activity_duration_hours,
                a.description AS activity_description,
                a.image_url AS activity_image_url
         FROM ${TABLE_NAME} ta
         JOIN stops s ON ta.stop_id = s.id
         JOIN activities a ON ta.activity_id = a.id
         WHERE s.trip_id = ?
         ORDER BY ta.scheduled_date ASC, ta.scheduled_time ASC`,
        [tripId]
    );
    return rows;
}

module.exports = { findByStopId, findByTripId };
