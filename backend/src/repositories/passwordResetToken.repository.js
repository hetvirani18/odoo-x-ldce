const { db } = require('../database/db');

/**
 * Save a new password reset token hash
 * @param {{ user_id: number, token_hash: string, expires_at: Date }} data
 */
async function createResetToken({ user_id, token_hash, expires_at }) {
    const [result] = await db.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user_id, token_hash, expires_at]
    );
    return result.insertId;
}

/**
 * Look up a reset token row by its SHA-256 hash
 * @param {string} token_hash
 */
async function findByTokenHash(token_hash) {
    const [rows] = await db.query(
        'SELECT * FROM password_reset_tokens WHERE token_hash = ? ORDER BY id DESC LIMIT 1',
        [token_hash]
    );
    return rows.length ? rows[0] : null;
}

/**
 * Mark a reset token as used (single-use enforcement)
 * @param {number} id
 */
async function markAsUsed(id) {
    await db.query('UPDATE password_reset_tokens SET used = true WHERE id = ?', [id]);
}

module.exports = {
    createResetToken,
    findByTokenHash,
    markAsUsed,
};
