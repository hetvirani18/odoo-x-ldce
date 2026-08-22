const { db } = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/trip.model');

async function findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw ERRORS.TRIP_NOT_FOUND;
    }
    return rows[0];
}

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

/** @param {import('../models/trip.model').CreateTripInput} input */
async function create(input) {
    const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (user_id, name, start_date, end_date, description, cover_photo_url, is_public, share_token)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            input.userId,
            input.name,
            input.startDate,
            input.endDate,
            input.description ?? null,
            input.coverPhotoUrl ?? null,
            input.isPublic ? 1 : 0,
            input.shareToken ?? null,
        ]
    );
    return findById(result.insertId);
}

/**
 * @param {number} id
 * @param {import('../models/trip.model').UpdateTripInput} input
 */
async function update(id, input) {
    const fields = [];
    const values = [];

    if (input.name !== undefined) {
        fields.push('name = ?');
        values.push(input.name);
    }
    if (input.startDate !== undefined) {
        fields.push('start_date = ?');
        values.push(input.startDate);
    }
    if (input.endDate !== undefined) {
        fields.push('end_date = ?');
        values.push(input.endDate);
    }
    if (input.description !== undefined) {
        fields.push('description = ?');
        values.push(input.description);
    }
    if (input.coverPhotoUrl !== undefined) {
        fields.push('cover_photo_url = ?');
        values.push(input.coverPhotoUrl);
    }
    if (input.isPublic !== undefined) {
        fields.push('is_public = ?');
        values.push(input.isPublic ? 1 : 0);
    }
    if (input.shareToken !== undefined) {
        fields.push('share_token = ?');
        values.push(input.shareToken);
    }

    if (fields.length === 0) {
        return findById(id);
    }

    values.push(id);
    await db.query(`UPDATE ${TABLE_NAME} SET ${fields.join(', ')} WHERE id = ?`, values);
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
