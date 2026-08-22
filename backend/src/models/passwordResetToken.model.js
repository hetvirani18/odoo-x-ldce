const TABLE_NAME = 'password_reset_tokens';

/**
 * @typedef {Object} PasswordResetToken
 * @property {number} id
 * @property {number} user_id
 * @property {string} token_hash
 * @property {Date} expires_at
 * @property {boolean} used
 * @property {Date} created_at
 */

/**
 * @typedef {Object} CreatePasswordResetTokenInput
 * @property {number} user_id
 * @property {string} token_hash
 * @property {Date} expires_at
 */

module.exports = { TABLE_NAME };
