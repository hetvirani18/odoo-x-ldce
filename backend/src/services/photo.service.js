const localPhotoProvider = require('./photoProvider/localPhotoProvider');

/**
 * Service to handle user photo uploads and deletions
 */
const photoService = {
    /**
     * Upload user photo securely
     * @param {Buffer|string} data
     * @param {string} [mimeType]
     */
    async uploadPhoto(data, mimeType) {
        return localPhotoProvider.upload(data, mimeType);
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
