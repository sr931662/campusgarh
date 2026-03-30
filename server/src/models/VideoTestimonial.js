const mongoose = require('mongoose');

const videoTestimonialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    thumbnailUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    views: { type: String, default: '0' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VideoTestimonial', videoTestimonialSchema);
