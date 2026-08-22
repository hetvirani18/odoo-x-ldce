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

async function findOrCreate(cityData) {
    const [existing] = await db.query(
        `SELECT * FROM ${TABLE_NAME} WHERE LOWER(name) = LOWER(?) LIMIT 1`,
        [cityData.name]
    );

    if (existing.length > 0) {
        return existing[0];
    }

    const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (name, country, lat, lng, cost_index, popularity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            cityData.name,
            cityData.country || 'Global',
            cityData.lat ?? null,
            cityData.lng ?? null,
            cityData.cost_index || 'medium',
            cityData.popularity || 50,
        ]
    );

    return findById(result.insertId);
}

async function updateImageUrl(id, imageUrl) {
    await db.query(`UPDATE ${TABLE_NAME} SET image_url = ? WHERE id = ?`, [imageUrl, id]);
}

module.exports = { findById, searchByName, getAll, findOrCreate, updateImageUrl };
