const userRepo = require('../repositories/user.repository');
const { toUserView } = require('../models/user.model');

/**
 * Fetch current user profile
 * @param {number} userId
 */
async function getMe(userId) {
    const user = await userRepo.findById(userId);
    return toUserView(user);
}

/**
 * Update current user profile
 * @param {number} userId
 * @param {{ name?: string, photo_url?: string|null, language?: string }} updates
 */
async function updateMe(userId, updates) {
    const updated = await userRepo.update(userId, updates);
    return toUserView(updated);
}

/**
 * Delete current user account and clear auth cookie
 * @param {import('express').Response} res
 * @param {number} userId
 */
async function deleteMe(res, userId) {
    await userRepo.deleteUser(userId);
    res.clearCookie('access_token');
}

module.exports = {
    getMe,
    updateMe,
    deleteMe,
};
