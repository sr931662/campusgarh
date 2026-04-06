const mongoose = require('mongoose');

const collegeCourseSchema = new mongoose.Schema(
  {
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    fees: { type: Number, required: true },
    duration: String,
    seatIntake: Number,
    eligibility: String,
    entranceExamRequirement: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
    cutoff: Number,
    isActive: { type: Boolean, default: true },
    specializationsOffered: [String],
    scholarshipAvailable: Boolean,
    examCutoffs: [{
      exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
      year: Number,
      category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'], default: 'General' },
      openingRank: Number,
      closingRank: Number,
      cutoffScore: Number,
      round: String
    }],
    coursePlacementStats: {
      averagePackage: Number,
      highestPackage: Number,
      placementPercentage: Number,
      year: Number
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    importBatch: String
  },
  { timestamps: true }
);

collegeCourseSchema.index({ college: 1, course: 1 }, { unique: true });
collegeCourseSchema.index({ isActive: 1 });

module.exports = mongoose.model('CollegeCourse', collegeCourseSchema);