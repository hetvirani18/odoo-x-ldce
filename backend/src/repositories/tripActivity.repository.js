const { db } = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/tripActivity.model');

async function findById(id) {
    const [rows] = await db.query(
        `SELECT trip_activities.*, 
                activities.name AS activity_name, 
                activities.category AS activity_category, 
                activities.cost AS activity_cost, 
                activities.duration_hours AS activity_duration_hours, 
                activities.description AS activity_description, 
                activities.image_url AS activity_image_url, 
                activities.city_id AS activity_city_id 
         FROM ${TABLE_NAME}
         LEFT JOIN activities ON trip_activities.activity_id = activities.id 
         WHERE trip_activities.id = ?`,
        [id]
    );

    if (rows.length === 0) {
        throw ERRORS.ACTIVITY_NOT_FOUND;
    }

    return rows[0];
}

async function findByStopId(stopId) {
    const [rows] = await db.query(
        `SELECT trip_activities.*, 
                activities.name AS activity_name, 
                activities.category AS activity_category, 
                activities.cost AS activity_cost, 
                activities.duration_hours AS activity_duration_hours, 
                activities.description AS activity_description, 
                activities.image_url AS activity_image_url, 
                activities.city_id AS activity_city_id 
         FROM ${TABLE_NAME}
         LEFT JOIN activities ON trip_activities.activity_id = activities.id 
         WHERE trip_activities.stop_id = ? 
         ORDER BY trip_activities.scheduled_date ASC, trip_activities.scheduled_time ASC`,
        [stopId]
    );

    return rows;
}

async function findByStopAndActivity(stopId, activityId) {
    const [rows] = await db.query(
        `SELECT trip_activities.*, 
                activities.name AS activity_name, 
                activities.category AS activity_category, 
                activities.cost AS activity_cost, 
                activities.duration_hours AS activity_duration_hours, 
                activities.description AS activity_description, 
                activities.image_url AS activity_image_url, 
                activities.city_id AS activity_city_id 
         FROM ${TABLE_NAME}
         LEFT JOIN activities ON trip_activities.activity_id = activities.id 
         WHERE trip_activities.stop_id = ? AND trip_activities.activity_id = ?`,
        [stopId, activityId]
    );

    if (rows.length === 0) {
        throw ERRORS.ACTIVITY_NOT_FOUND;
    }

    return rows[0];
}

/** @param {import('../models/tripActivity.model').CreateTripActivityInput} input */
async function create(input) {
    const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (stop_id, activity_id, scheduled_date, scheduled_time)
         VALUES (?, ?, ?, ?)`,
        [
            input.stopId,
            input.activityId,
            input.scheduledDate,
            input.scheduledTime ?? null,
        ]
    );

    return findById(result.insertId);
}

/**
 * @param {number} id
 * @param {import('../models/tripActivity.model').UpdateTripActivityInput} input
 */
async function update(id, input) {
    const fields = [];
    const values = [];

    if (input.scheduledDate !== undefined) {
        fields.push('scheduled_date = ?');
        values.push(input.scheduledDate);
    }
    if (input.scheduledTime !== undefined) {
        fields.push('scheduled_time = ?');
        values.push(input.scheduledTime);
    }

    if (fields.length === 0) {
        return findById(id);
    }

    values.push(id);
    await db.query(`UPDATE ${TABLE_NAME} SET ${fields.join(', ')} WHERE id = ?`, values);
    return findById(id);
}

async function deleteByStopAndActivity(stopId, activityId) {
    await db.query(
        `DELETE FROM ${TABLE_NAME} WHERE stop_id = ? AND activity_id = ?`,
        [stopId, activityId]
    );
}

module.exports = {
    findById,
    findByStopId,
    findByStopAndActivity,
    create,
    update,
    deleteByStopAndActivity,
};
