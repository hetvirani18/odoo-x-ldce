/**
 * @typedef {Object} PhotoUploadResult
 * @property {string} url - Accessible URL or path to the stored photo
 * @property {string} [key] - Identifier for deletion
 */

/**
 * A photo provider must implement:
 *   upload(fileBuffer: Buffer, mimeType: string, filename?: string): Promise<PhotoUploadResult>
 *   delete(photoUrl: string): Promise<void>
 */

module.exports = {};
