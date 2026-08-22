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
 * @param {{ name: string, email: string, password_hash: string, role?: string }} data
 */
async function create({ name, email, password_hash, role = 'user' }) {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, password_hash, role]
    );
    return findById(result.insertId);
}

/**
 * Update user profile
 * @param {number} id
 * @param {{ name?: string, photo_url?: string|null, language?: string }} updates
 */
async function update(id, { name, photo_url, language }) {
    await db.query(
        'UPDATE users SET name = COALESCE(?, name), photo_url = COALESCE(?, photo_url), language = COALESCE(?, language) WHERE id = ?',
        [name, photo_url, language, id]
    );
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
