const Media = require('../models/Media');
const BaseService = require('./baseService');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

class MediaService extends BaseService {
  constructor() {
    super(Media);
  }

  // Upload file to cloud storage (Cloudinary) and create media record
  async uploadFile(fileBuffer, options) {
    try {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `campusgarh/${options.parentModel}`,
            resource_type: options.type === 'video' ? 'video' : 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });

      // Create media record
      const media = await this.create({
        url: result.secure_url,
        type: options.type,
        publicId: result.public_id,
        alt: options.alt,
        size: result.bytes,
        mimeType: result.format,
        parent: {
          id: options.parentId,
          model: options.parentModel,
        },
        order: options.order || 0,
        createdBy: options.userId,
      });
      return media;
    } catch (error) {
      throw new AppError(`Failed to upload media: ${error.message}`, 500);
    }
  }

  // Delete media and from cloud storage
  async deleteMedia(id) {
    const media = await this.findById(id);
    if (!media) throw new AppError('Media not found', 404);
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId, { resource_type: media.type === 'video' ? 'video' : 'image' });
    await this.deleteById(id, false); // hard delete
    return { deleted: true };
  }

  // Get media for a parent entity
  async getMediaForParent(parentId, parentModel) {
    return this.findAll({ 'parent.id': parentId, 'parent.model': parentModel }, { limit: 100 }, { order: 1 });
  }
}

module.exports = new MediaService();