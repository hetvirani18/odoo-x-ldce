const TABLE_NAME = 'users';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} password_hash
 * @property {string|null} photo_url
 * @property {string} language
 * @property {'user'|'admin'} role
 * @property {Date} created_at
 */

/**
 * @typedef {Object} UserView
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} photo_url
 * @property {string} language
 * @property {'user'|'admin'} role
 * @property {Date} created_at
 */

/**
 * @typedef {Object} CreateUserInput
 * @property {string} name
 * @property {string} email
 * @property {string} password_hash
 * @property {'user'|'admin'} [role]
 */

/**
 * Converts a raw database row to a safe client view (stripping password_hash)
 * @param {User} user
 * @returns {UserView}
 */
function toUserView(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        photo_url: user.photo_url || null,
        language: user.language || 'en',
        role: user.role || 'user',
        created_at: user.created_at,
    };
}

module.exports = { TABLE_NAME, toUserView };
