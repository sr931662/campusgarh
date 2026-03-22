const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const mediaService = require('../services/mediaService');

class MediaController {
  // Upload single file
  uploadFile = catchAsync(async (req, res) => {
    if (!req.file) {
      return ResponseHandler.error(res, { message: 'No file uploaded' }, 400);
    }
    const { parentId, parentModel, type, alt } = req.body;
    const media = await mediaService.uploadFile(req.file.buffer, {
      parentId,
      parentModel,
      type,
      alt,
      userId: req.user.id,
    });
    ResponseHandler.success(res, media, 'File uploaded', 201);
  });

  // Upload multiple files
  uploadMultiple = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return ResponseHandler.error(res, { message: 'No files uploaded' }, 400);
    }
    const { parentId, parentModel, type, alt } = req.body;
    const uploadPromises = req.files.map((file, index) =>
      mediaService.uploadFile(file.buffer, {
        parentId,
        parentModel,
        type,
        alt: `${alt || ''} ${index + 1}`,
        userId: req.user.id,
        order: index,
      })
    );
    const mediaFiles = await Promise.all(uploadPromises);
    ResponseHandler.success(res, mediaFiles, 'Files uploaded', 201);
  });

  // Delete media
  deleteMedia = catchAsync(async (req, res) => {
    const result = await mediaService.deleteMedia(req.params.id);
    ResponseHandler.success(res, result, 'Media deleted');
  });

  // Get media for a parent entity
  getMediaForParent = catchAsync(async (req, res) => {
    const { parentId, parentModel } = req.params;
    const media = await mediaService.getMediaForParent(parentId, parentModel);
    ResponseHandler.success(res, media);
  });
}

module.exports = new MediaController();