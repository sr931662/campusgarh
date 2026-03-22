const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      enum: ['College', 'Course', 'Exam', 'User', 'Blog', 'Review', 'AdmissionEnquiry'],
    },
    fileUrl: String, // stored file location
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed', 'partial'],
      default: 'processing',
    },
    totalRows: Number,
    processedRows: Number,
    succeededRows: Number,
    failedRows: Number,
    importErrors: [
      {
        row: Number,
        field: String,
        message: String,
      },
    ],
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImportLog', importLogSchema);