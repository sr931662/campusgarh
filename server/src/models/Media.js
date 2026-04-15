const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document'], required: true },
    publicId: String, // cloudinary public id
    alt: String,
    size: Number, // bytes
    mimeType: String,
    // Reference to entity (polymorphic)
    parent: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
      model: { type: String, enum: ['College', 'Blog', 'User'] },
    },
    // Optional ordering
    order: { type: Number, default: 0 },
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    importBatch: String,
  },
  { timestamps: true }
);

mediaSchema.index({ parent: 1, order: 1 });
mediaSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Media', mediaSchema);