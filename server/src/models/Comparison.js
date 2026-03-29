const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['college', 'course', 'exam'], required: true, default: 'college' },
    colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
    courses:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'  }],
    exams:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam'    }],
    snapshot: {
      fees:       [Number],
      placements: [Number],
      rankings:   [Number],
    },
    name:     String,
    isPublic: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
  },
  { timestamps: true }
);

comparisonSchema.index({ type: 1 });
comparisonSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Comparison', comparisonSchema);
