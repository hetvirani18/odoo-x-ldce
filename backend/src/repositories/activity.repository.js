const db = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/activity.model');

/**
 * @param {number} id
 */
async function findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw ERRORS.ACTIVITY_NOT_FOUND;
    }
    return rows[0];
}

/**
 * @param {number} cityId
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function findByCityId(cityId, filters = {}) {
    let sql = `SELECT * FROM ${TABLE_NAME} WHERE city_id = ?`;
    const params = [cityId];

    if (filters.category) {
        sql += ` AND category = ?`;
        params.push(filters.category);
    }
    if (filters.maxCost !== undefined && filters.maxCost !== null) {
        sql += ` AND cost <= ?`;
        params.push(Number(filters.maxCost));
    }

    sql += ` ORDER BY name ASC`;
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
    if (filters.maxCost !== undefined && filters.maxCost !== null) {
        sql += ` AND a.cost <= ?`;
        params.push(Number(filters.maxCost));
    }

    sql += ` ORDER BY a.name ASC`;
    const [rows] = await db.query(sql, params);
    return rows;
}

module.exports = { findById, findByCityId, searchByCityName };
