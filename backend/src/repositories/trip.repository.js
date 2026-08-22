const db = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/trip.model');

/**
 * @param {number} id
 */
async function findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw ERRORS.TRIP_NOT_FOUND;
    }
    return rows[0];
}

/**
 * @param {number} userId
 */
async function findByUserId(userId) {
    const [rows] = await db.query(
        `SELECT * FROM ${TABLE_NAME} WHERE user_id = ? ORDER BY start_date DESC`,
        [userId]
    );
    return rows;
}

/**
 * @param {string} shareToken
 */
async function findByShareToken(shareToken) {
    const [rows] = await db.query(
        `SELECT * FROM ${TABLE_NAME} WHERE share_token = ? AND is_public = 1`,
        [shareToken]
    );
    if (rows.length === 0) {
        throw ERRORS.TRIP_NOT_PUBLIC;
    }
    return rows[0];
}

/**
 * @param {import('../models/trip.model').CreateTripInput} input
 */
async function create(input) {
    const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (user_id, name, start_date, end_date, description, cover_photo_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            input.userId,
            input.name,
            input.startDate,
            input.endDate,
            input.description ?? null,
            input.coverPhotoUrl ?? null,
        ]
    );
    return findById(result.insertId);
}

/**
 * @param {number} id
 * @param {import('../models/trip.model').UpdateTripInput} input
 */
async function update(id, input) {
    const updates = [];
    const params = [];

    if (input.name !== undefined) {
        updates.push('name = ?');
        params.push(input.name);
    }
    if (input.startDate !== undefined) {
        updates.push('start_date = ?');
        params.push(input.startDate);
    }
    if (input.endDate !== undefined) {
        updates.push('end_date = ?');
        params.push(input.endDate);
    }
    if (input.description !== undefined) {
        updates.push('description = ?');
        params.push(input.description);
    }
    if (input.coverPhotoUrl !== undefined) {
        updates.push('cover_photo_url = ?');
        params.push(input.coverPhotoUrl);
    }

    if (updates.length > 0) {
        params.push(id);
        await db.query(
            `UPDATE ${TABLE_NAME} SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
    }

    return findById(id);
}

/**
 * @param {number} id
 * @param {boolean} isPublic
 * @param {string|null} shareToken
 */
async function updateShareStatus(id, isPublic, shareToken) {
    await db.query(
        `UPDATE ${TABLE_NAME} SET is_public = ?, share_token = ? WHERE id = ?`,
        [isPublic ? 1 : 0, shareToken, id]
    );
    return findById(id);
}

/**
 * @param {number} id
 */
async function deleteById(id) {
    await db.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
}

module.exports = {
    findById,
    findByUserId,
    findByShareToken,
    create,
    update,
    updateShareStatus,
    deleteById,
};
