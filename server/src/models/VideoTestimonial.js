import mongoose from 'mongoose';

const videoTestimonialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    thumbnailUrl: { type: String, required: true },
    videoUrl: { type: String, required: true }, // YouTube embed URL or direct
    views: { type: String, default: '0' },      // display string e.g. "9K"
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('VideoTestimonial', videoTestimonialSchema);
