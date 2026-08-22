const { db } = require('../database/db');
const { ERRORS } = require('../utils/AppError');

/**
 * Find user by ID
 * @param {number} id
 */
async function findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!rows.length) {
        throw ERRORS.RESOURCE_NOT_FOUND;
    }
    return rows[0];
}

/**
 * Find user by email
 * @param {string} email
 */
async function findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length ? rows[0] : null;
}

/**
 * Create a new user row
 * @param {{ name: string, email: string, password_hash: string, photo_url?: string|null, role?: string }} data
 */
async function create({ name, email, password_hash, photo_url = null, role = 'user' }) {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, photo_url, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, password_hash, photo_url, role]
    );
    return findById(result.insertId);
}

/**
 * Update user profile
 * Allows explicitly setting photo_url to null to clear the photo.
 * @param {number} id
 * @param {{ name?: string, photo_url?: string|null, language?: string }} updates
 */
async function update(id, { name, photo_url, language }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
        fields.push('name = ?');
        values.push(name);
    }
    if (photo_url !== undefined) {
        fields.push('photo_url = ?');
        values.push(photo_url);
    }
    if (language !== undefined) {
        fields.push('language = ?');
        values.push(language);
    }

    if (fields.length > 0) {
        values.push(id);
        await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    return findById(id);
}

/**
 * Update user's password hash
 * @param {number} id
 * @param {string} password_hash
 */
async function updatePasswordHash(id, password_hash) {
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
}

/**
 * Update user's role (admin only)
 * @param {number} id
 * @param {'user'|'admin'} role
 */
async function updateRole(id, role) {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return findById(id);
}

/**
 * Delete a user by ID
 * @param {number} id
 */
async function deleteUser(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
}

/**
 * List users with pagination
 * @param {{ limit?: number, offset?: number }} options
 */
async function listUsers({ limit = 20, offset = 0 } = {}) {
    const [rows] = await db.query(
        'SELECT id, name, email, photo_url, language, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
    return rows;
}

module.exports = {
    findById,
    findByEmail,
    create,
    update,
    updatePasswordHash,
    updateRole,
    deleteUser,
    listUsers,
};
