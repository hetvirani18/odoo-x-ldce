const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

/**
 * Ensures uploads directory exists
 */
async function ensureUploadsDir() {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (err) {
        // Ignore if already exists
    }
}

/**
 * Local disk photo provider
 */
const localPhotoProvider = {
    /**
     * Upload photo to local disk
     * @param {Buffer|string} data - Buffer or base64 data
     * @param {string} mimeType
     * @param {string} [filename]
     * @returns {Promise<import('./photoProvider.interface').PhotoUploadResult>}
     */
    async upload(data, mimeType = 'image/jpeg', filename) {
        await ensureUploadsDir();

        const ext = mimeType.split('/')[1] || 'jpg';
        const uniqueName = filename || `${crypto.randomUUID()}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, uniqueName);

        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');
        await fs.writeFile(filePath, buffer);

        return {
            url: `/uploads/${uniqueName}`,
            key: uniqueName,
        };
    },

    /**
     * Delete photo from local disk
     * @param {string} photoUrl
     */
    async delete(photoUrl) {
        if (!photoUrl) return;
        const filename = path.basename(photoUrl);
        const filePath = path.join(UPLOADS_DIR, filename);
        try {
            await fs.unlink(filePath);
        } catch (err) {
            // Non-critical if already missing
        }
    },
};

module.exports = localPhotoProvider;
