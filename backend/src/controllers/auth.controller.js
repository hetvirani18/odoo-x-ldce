const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepo = require('../repositories/user.repository');
const tokenRepo = require('../repositories/passwordResetToken.repository');
const { sendPasswordResetEmail } = require('../services/email.service');
const { toUserView } = require('../models/user.model');
const { ERRORS } = require('../utils/AppError');
const { signAccessToken } = require('../utils/token');
const { NODE_ENV, FRONTEND_URL } = require('../config/env');

const BCRYPT_ROUNDS = 12;

/**
 * Sets the httpOnly JWT cookie on response with synchronized maxAge
 * @param {import('express').Response} res
 * @param {import('../models/user.model').User} user
 */
function setAuthCookie(res, user) {
    const { token, maxAgeMs } = signAccessToken(user);

    res.cookie('access_token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAgeMs,
    });
}

/**
 * Register a new user
 * @param {import('express').Response} res
 * @param {{ name: string, email: string, password: string, photo_url?: string }} input
 */
async function signup(res, { name, email, password, photo_url }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
        throw ERRORS.EMAIL_ALREADY_EXISTS;
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepo.create({ name, email, password_hash, photo_url });

    setAuthCookie(res, user);
    return toUserView(user);
}

/**
 * Authenticate existing user
 * @param {import('express').Response} res
 * @param {{ email: string, password: string }} input
 */
async function login(res, { email, password }) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
        throw ERRORS.INVALID_CREDENTIALS;
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
        throw ERRORS.INVALID_CREDENTIALS;
    }

    setAuthCookie(res, user);
    return toUserView(user);
}

/**
 * Clear the authentication cookie
 * @param {import('express').Response} res
 */
function logout(res) {
    res.clearCookie('access_token');
}

/**
 * Initiate forgot password flow with constant-time resistance against enumeration attacks
 * @param {string} email
 */
async function forgotPassword(email) {
    const user = await userRepo.findByEmail(email);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires_at = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    if (user) {
        await tokenRepo.createResetToken({
            user_id: user.id,
            token_hash,
            expires_at,
        });

        const resetLink = `${FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
        try {
            await sendPasswordResetEmail(user.email, resetLink);
        } catch (err) {
            console.error('Password reset email dispatch failed:', err);
        }
    } else {
        // Equalize execution timing to prevent email enumeration timing attacks
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}

/**
 * Reset password using token
 * @param {{ token: string, new_password: string }} input
 */
async function resetPassword({ token, new_password }) {
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRow = await tokenRepo.findByTokenHash(token_hash);

    if (!resetRow || resetRow.used) {
        throw ERRORS.RESET_TOKEN_INVALID;
    }

    if (new Date() > new Date(resetRow.expires_at)) {
        throw ERRORS.RESET_TOKEN_EXPIRED;
    }

    const password_hash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
    await userRepo.updatePasswordHash(resetRow.user_id, password_hash);
    await tokenRepo.markAsUsed(resetRow.id);
}

module.exports = {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
};
