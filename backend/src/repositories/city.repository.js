const { db } = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/city.model');

async function findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw ERRORS.CITY_NOT_FOUND;
    }
    return rows[0];
}

async function searchByName(query) {
    const [rows] = await db.query(
        `SELECT * FROM ${TABLE_NAME} WHERE name LIKE ? ORDER BY popularity DESC LIMIT 20`,
        [`%${query}%`]
    );
    return rows;
}

module.exports = { findById, searchByName };
