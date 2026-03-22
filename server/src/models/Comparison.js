const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    colleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true,
      },
    ],
    // Snapshot of data at time of creation (to avoid future changes affecting comparison)
    snapshot: {
      fees: [Number],
      coursesOffered: [[String]],
      placements: [Number],
      rankings: [Number],
      facilities: [[String]],
      ratings: [Number],
    },
    // Metadata
    name: String, // user can name the comparison
    isPublic: { type: Boolean, default: false },
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
  },
  { timestamps: true }
);

comparisonSchema.index({ colleges: 1 });
comparisonSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Comparison', comparisonSchema);