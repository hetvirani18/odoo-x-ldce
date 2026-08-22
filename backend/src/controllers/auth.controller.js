const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const { toUserView } = require('../models/user.model');
const { ERRORS } = require('../utils/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = require('../config/env');

const BCRYPT_ROUNDS = 12;

/**
 * Sets the httpOnly JWT cookie on response
 * @param {import('express').Response} res
 * @param {import('../models/user.model').User} user
 */
function setAuthCookie(res, user) {
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('access_token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

/**
 * Register a new user
 * @param {import('express').Response} res
 * @param {{ name: string, email: string, password: string }} input
 */
async function signup(res, { name, email, password }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
        throw ERRORS.EMAIL_ALREADY_EXISTS;
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepo.create({ name, email, password_hash });

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

module.exports = {
    signup,
    login,
    logout,
};
