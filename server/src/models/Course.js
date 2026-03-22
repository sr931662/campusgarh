const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ['UG', 'PG', 'Diploma', 'Doctorate', 'Certificate'],
    },
    discipline: {
      type: String, // e.g. Engineering, Medical, Management, Arts, Science, Law, Commerce
    },
    duration: {
      type: String, // e.g. "4 Years", "2 Years", "6 Months"
    },
    eligibility: String,
    entranceExamRequirements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
    description: String,
    // Advanced fields
    specializations: [String],
    mode: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Online', 'Distance'],
    },
    feeRange: {
      min: Number,
      max: Number,
    },
    // Career outcomes
    careerProspects: {
      averageStartingSalary: Number,
      topSectors: [String],      // e.g. ['IT', 'Finance', 'Consulting']
      growthRate: String,        // e.g. "25% YoY"
      description: String,
    },
    jobRoles: [String],          // e.g. ['Software Engineer', 'Data Analyst']
    skills: [String],            // e.g. ['Python', 'Machine Learning', 'Communication']

    // Structured syllabus (semester/year-wise)
    syllabus: [
      {
        semester: Number,
        units: [
          {
            unitNumber: Number,
            title: String,
            topics: [String],
          },
        ],
      },
    ],

    // Admission type
    admissionType: {
      type: String,
      enum: ['Entrance-Based', 'Merit-Based', 'Direct Admission', 'Interview-Based'],
    },

    // Lateral entry info
    lateralEntry: {
      available: { type: Boolean, default: false },
      eligibility: String,
      intoYear: Number,
    },

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    // Metadata
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    importBatch: String,
  },
  { timestamps: true }
);

courseSchema.pre('save', async function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

courseSchema.index({ discipline: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Course', courseSchema);