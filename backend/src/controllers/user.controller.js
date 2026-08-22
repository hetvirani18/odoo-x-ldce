const userRepo = require('../repositories/user.repository');
const { toUserView } = require('../models/user.model');
const photoService = require('../services/photo.service');
const { ERRORS } = require('../utils/AppError');

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
    if (updates.photo_url === null) {
        const current = await userRepo.findById(userId);
        if (current.photo_url) {
            await photoService.deletePhoto(current.photo_url);
        }
    }

    const updated = await userRepo.update(userId, updates);
    return toUserView(updated);
}

/**
 * Upload and set a new profile photo for the user
 * @param {number} userId
 * @param {Express.Multer.File} file
 */
async function uploadPhoto(userId, file) {
    if (!file) {
        throw ERRORS.FILE_REQUIRED;
    }

    const current = await userRepo.findById(userId);
    if (current.photo_url) {
        await photoService.deletePhoto(current.photo_url);
    }

    const { url } = await photoService.uploadPhoto(file.buffer, file.mimetype);
    const updated = await userRepo.update(userId, { photo_url: url });
    return toUserView(updated);
}

/**
 * Delete current user account and clear auth cookie
 * @param {import('express').Response} res
 * @param {number} userId
 */
async function deleteMe(res, userId) {
    const user = await userRepo.findById(userId);
    if (user && user.photo_url) {
        await photoService.deletePhoto(user.photo_url);
    }

    await userRepo.deleteUser(userId);
    res.clearCookie('access_token');
}

module.exports = {
    getMe,
    updateMe,
    uploadPhoto,
    deleteMe,
};
