const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

// Memory storage — keeps file in buffer (req.file.buffer) for streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images, videos, and PDFs are allowed.', 400), false);
  }
};

const uploadMemory = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = uploadMemory;
