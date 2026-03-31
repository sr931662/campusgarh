const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true, index: true },
    courseInterest: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    collegeInterest: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    preferredCity: String,
    message: String,
    fatherName:  String,
    motherName:  String,
    passedYear:  Number,
    passedFrom:  String,   // e.g. "10th", "12th", "Diploma", "ITI"
    address:     String,

    // Source tracking
    source: {
      type: String,
      enum: ['website', 'referral', 'social', 'ads', 'other'],
      default: 'website',
    },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // partner who submitted this lead
    sourceUrl: String, // where they came from
    // CRM fields
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // counsellor
    notes: [
      {
        text: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    callStatus: {
      type: String,
      enum: ['pending', 'connected', 'not_reachable', 'follow_up'],
      default: 'pending',
    },
    followUpDate: Date,
    conversionStatus: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'not_interested', 'converted', 'lost'],
      default: 'new',
    },
    convertedAt: Date,
    // Additional fields
    budget: Number,
    preferredExam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    importBatch: String,
  },
  { timestamps: true }
);

enquirySchema.index({ assignedTo: 1, followUpDate: 1 });
enquirySchema.index({ conversionStatus: 1 });
enquirySchema.index({ source: 1 });
enquirySchema.index({ deletedAt: 1 });
enquirySchema.index({ importedBy: 1 });

module.exports = mongoose.model('AdmissionEnquiry', enquirySchema);