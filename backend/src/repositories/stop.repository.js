const { db } = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/stop.model');

async function findById(id) {
    const [rows] = await db.query(
        `SELECT stops.*, 
                cities.name as city_name, 
                cities.country as city_country, 
                cities.lat as city_lat, 
                cities.lng as city_lng, 
                cities.cost_index as city_cost_index 
         FROM ${TABLE_NAME}
         LEFT JOIN cities ON stops.city_id = cities.id 
         WHERE stops.id = ?`,
        [id]
    );

    if (rows.length === 0) {
        throw ERRORS.STOP_NOT_FOUND;
    }

    return rows[0];
}

async function findByTripId(tripId) {
    const [rows] = await db.query(
        `SELECT stops.*, 
                cities.name as city_name, 
                cities.country as city_country, 
                cities.lat as city_lat, 
                cities.lng as city_lng, 
                cities.cost_index as city_cost_index 
         FROM ${TABLE_NAME}
         LEFT JOIN cities ON stops.city_id = cities.id 
         WHERE stops.trip_id = ? 
         ORDER BY stops.order_index ASC, stops.start_date ASC`,
        [tripId]
    );

    return rows;
}

async function getMaxOrderIndex(tripId) {
    const [rows] = await db.query(
        `SELECT COALESCE(MAX(order_index), -1) AS max_order FROM ${TABLE_NAME} WHERE trip_id = ?`,
        [tripId]
    );
    return Number(rows[0]?.max_order ?? -1);
}

/** @param {import('../models/stop.model').CreateStopInput} input */
async function create(input) {
    let insertId;

    if (input.orderIndex !== undefined && input.orderIndex !== null) {
        const [result] = await db.query(
            `INSERT INTO ${TABLE_NAME} (trip_id, city_id, start_date, end_date, order_index)
             VALUES (?, ?, ?, ?, ?)`,
            [
                input.tripId,
                input.cityId,
                input.startDate,
                input.endDate,
                input.orderIndex,
            ]
        );
        insertId = result.insertId;
    } else {
        const [result] = await db.query(
            `INSERT INTO ${TABLE_NAME} (trip_id, city_id, start_date, end_date, order_index)
             SELECT ?, ?, ?, ?, COALESCE(MAX(order_index) + 1, 0)
             FROM ${TABLE_NAME}
             WHERE trip_id = ?`,
            [
                input.tripId,
                input.cityId,
                input.startDate,
                input.endDate,
                input.tripId,
            ]
        );
        insertId = result.insertId;
    }

    return findById(insertId);
}

/**
 * @param {number} id
 * @param {import('../models/stop.model').UpdateStopInput} input
 */
async function update(id, input) {
    const fields = [];
    const values = [];

    if (input.startDate !== undefined) {
        fields.push('start_date = ?');
        values.push(input.startDate);
    }
    if (input.endDate !== undefined) {
        fields.push('end_date = ?');
        values.push(input.endDate);
    }
    if (input.orderIndex !== undefined) {
        fields.push('order_index = ?');
        values.push(input.orderIndex);
    }
    if (input.cityId !== undefined) {
        fields.push('city_id = ?');
        values.push(input.cityId);
    }

    if (fields.length === 0) {
        return findById(id);
    }

    values.push(id);
    await db.query(`UPDATE ${TABLE_NAME} SET ${fields.join(', ')} WHERE id = ?`, values);
    return findById(id);
}

async function updateOrderIndex(id, orderIndex) {
    await db.query(`UPDATE ${TABLE_NAME} SET order_index = ? WHERE id = ?`, [orderIndex, id]);
}

async function deleteById(id) {
    await db.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
}

module.exports = {
    findById,
    findByTripId,
    getMaxOrderIndex,
    create,
    update,
    updateOrderIndex,
    deleteById,
};
