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
    const searchTerm = `%${query}%`;
    const [rows] = await db.query(
        `SELECT * FROM ${TABLE_NAME}
         WHERE name LIKE ? OR country LIKE ?
         ORDER BY popularity DESC, name ASC
         LIMIT 20`,
        [searchTerm, searchTerm]
    );
    return rows;
}

async function getAll() {
    const [rows] = await db.query(
        `SELECT * FROM ${TABLE_NAME} ORDER BY popularity DESC, name ASC`
    );
    return rows;
}

module.exports = { findById, searchByName, getAll };
