const localPhotoProvider = require('./photoProvider/localPhotoProvider');

/**
 * Service to handle user photo uploads and deletions
 */
const photoService = {
    /**
     * Upload user photo
     * @param {Buffer|string} data
     * @param {string} mimeType
     * @param {string} [filename]
     */
    async uploadPhoto(data, mimeType, filename) {
        return localPhotoProvider.upload(data, mimeType, filename);
    },

    /**
     * Delete user photo
     * @param {string} photoUrl
     */
    async deletePhoto(photoUrl) {
        return localPhotoProvider.delete(photoUrl);
    },
};

module.exports = photoService;
