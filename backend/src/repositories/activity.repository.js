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

/**
 * @param {string} cityName
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function searchByCityName(cityName, filters = {}) {
    let sql = `
        SELECT a.* FROM ${TABLE_NAME} a
        JOIN cities c ON a.city_id = c.id
        WHERE c.name LIKE ?
    `;
    const params = [`%${cityName}%`];

    if (filters.category) {
        sql += ` AND a.category = ?`;
        params.push(filters.category);
    }
    if (filters.maxCost != null) {
        sql += ` AND a.cost <= ?`;
        params.push(filters.maxCost);
    }

    sql += ` ORDER BY a.cost ASC`;
    const [rows] = await db.query(sql, params);
    return rows;
}

async function create(input) {
    const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (city_id, name, category, cost, duration_hours, description, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            input.cityId,
            input.name,
            input.category || 'sightseeing',
            input.cost ?? 25.0,
            input.durationHours ?? 2.0,
            input.description ?? null,
            input.imageUrl ?? null,
        ]
    );
    return findById(result.insertId);
}

module.exports = { findById, findByCityId, searchByCityName, create };
