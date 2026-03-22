const mongoose = require('mongoose');
const slugify = require('slugify');

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ['UG', 'PG', 'PhD', 'Diploma'],
    },
    overview: String,
    eligibility: String,
    examPattern: {
      sections: [String],
      totalMarks: Number,
      duration: String,
      markingScheme: String,
    },
    syllabus: String,
    importantDates: [
      {
        event: String,
        date: Date,
        link: String,
      },
    ],
    participatingColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
    // Additional
    registrationFee: Number,
    officialWebsite: String,
    registrationLink: String,
    // Conducting body & meta
    conductingBody: String,          // e.g. "NTA", "IIT Bombay", "CBSE"
    examLevel: {
      type: String,
      enum: ['National', 'State', 'University-Level', 'Institute-Level'],
    },
    examMode: {
      type: String,
      enum: ['Online (CBT)', 'Offline (OMR)', 'Online + Offline', 'Remote Proctored'],
    },
    examLanguages: [String],         // e.g. ['English', 'Hindi', 'Gujarati']
    frequency: {
      type: String,
      enum: ['Annual', 'Twice a Year', 'Multiple Times', 'As per notification'],
    },
    totalApplications: Number,       // approximate

    // Structured eligibility (parallel to existing eligibility: String)
    eligibilityDetails: {
      minAge: Number,
      maxAge: Number,
      qualifyingExam: String,
      minPercentageGeneral: Number,
      minPercentageOBC: Number,
      minPercentageSC_ST: Number,
      numberOfAttempts: Number,
      otherCriteria: [String],
    },

    // Section-level details (top-level, parallel to examPattern.sections)
    sectionDetails: [
      {
        name: String,
        totalQuestions: Number,
        maxMarks: Number,
        timeAllotted: String,
        questionType: String,
        negativeMarking: Number,
      },
    ],
    numberOfPapers: Number,

    // Registration details
    registrationSteps: [String],
    documentsRequired: [String],
    registrationFeeDetails: {
      general: Number,
      obc: Number,
      sc_st: Number,
      female: Number,
      pwd: Number,
    },

    // Result, admit card, counselling
    resultInfo: {
      expectedDate: Date,
      resultLink: String,
      scoreCardAvailability: String,
    },
    admitCardInfo: {
      expectedDate: Date,
      downloadLink: String,
      instructions: [String],
    },
    counsellingInfo: {
      conductingBody: String,
      mode: {
        type: String,
        enum: ['Online', 'Offline', 'Both'],
      },
      rounds: Number,
      websiteLink: String,
      overview: String,
    },

    // Previous year cutoffs
    examCutoffs: [
      {
        year: Number,
        category: {
          type: String,
          enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'],
        },
        cutoffScore: Number,
        cutoffRank: Number,
        paper: String,
      },
    ],

    // Exam centers
    examCenters: {
      totalCities: Number,
      states: [String],
      internationalCenters: [String],
    },

    // Preparation resources
    preparationTips: [
      {
        category: String,
        tip: String,
      },
    ],
    recommendedBooks: [
      {
        title: String,
        author: String,
        subject: String,
      },
    ],

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    // Audit
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    importBatch: String,
  },
  { timestamps: true }
);

examSchema.pre('save', async function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

examSchema.index({ conductingBody: 1 });
examSchema.index({ examLevel: 1 });
examSchema.index({ 'examCutoffs.year': -1 });
examSchema.index({ category: 1 });

module.exports = mongoose.model('Exam', examSchema);