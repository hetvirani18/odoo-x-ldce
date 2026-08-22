const { db } = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/activity.model');

async function findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw ERRORS.ACTIVITY_NOT_FOUND;
    }
    return rows[0];
}

async function findByCityId(cityId, filters = {}) {
    let sql = `SELECT * FROM ${TABLE_NAME} WHERE city_id = ?`;
    const params = [cityId];

    if (filters.category) {
        sql += ` AND category = ?`;
        params.push(filters.category);
    }
    if (filters.maxCost != null) {
        sql += ` AND cost <= ?`;
        params.push(filters.maxCost);
    }

    sql += ` ORDER BY cost ASC`;
    const [rows] = await db.query(sql, params);
    return rows;
}

module.exports = { findById, findByCityId };
