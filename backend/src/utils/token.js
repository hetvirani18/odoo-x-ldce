const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * Parses duration string (e.g. '7d', '24h', '60m', '3600s') to milliseconds
 * @param {string|number} expiresIn
 * @returns {number}
 */
function parseExpiresInToMs(expiresIn) {
    if (typeof expiresIn === 'number') {
        return expiresIn * 1000;
    }
    const match = /^(\d+)([dhms])?$/i.exec(String(expiresIn).trim());
    if (!match) {
        return 7 * 24 * 60 * 60 * 1000; // default 7 days fallback
    }

    const value = parseInt(match[1], 10);
    const unit = (match[2] || 's').toLowerCase();

    switch (unit) {
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'm':
            return value * 60 * 1000;
        case 's':
        default:
            return value * 1000;
    }
}

/**
 * Sign an access token for user and compute matching cookie maxAge
 * @param {{ id: number, email: string, role: string }} user
 * @returns {{ token: string, maxAgeMs: number }}
 */
function signAccessToken(user) {
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    const maxAgeMs = parseExpiresInToMs(JWT_EXPIRES_IN);

    return { token, maxAgeMs };
}

module.exports = {
    signAccessToken,
    parseExpiresInToMs,
};
