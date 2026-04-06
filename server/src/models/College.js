const mongoose = require('mongoose');
const slugify = require('slugify');

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    shortName: String,
    logoUrl: String,
    coverImageUrl: String,
    galleryImages: [{ type: String }],   // ← add this line
    description: String,
    establishmentYear: Number,
    collegeType: {
      type: String,
      enum: [
        'Engineering & Technology', 'Medical & Health Sciences', 'Management & Business',
        'Law', 'Arts & Science', 'Architecture & Planning', 'Pharmacy', 'Agriculture',
        'Education & Teaching', 'Design & Fine Arts', 'Commerce & Finance', 'Technical',
        'Multi-Disciplinary',
      ],
    },
    fundingType: {
      type: String,
      enum: [
        // Original values
        'Government', 'Private', 'Semi-Government', 'Public-Private Partnership',
        'Deemed University', 'Private University', 'Central University', 'State University',
        'Autonomous', 'Minority Institution',
        // Extended to match real-world Excel data
        'Autonomous College', 'National Institute', 'National Law University',
        'Institute of National Importance', 'Deemed to be University',
        'Open University', 'Agricultural University',
      ],
    },
    affiliation: String,
    accreditation: {
      naacGrade: { type: String, enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'] },
      nbaStatus: Boolean,
      nirfRank: Number,
      otherAccreditations: [String],
    },
    contact: {
      phone: String,
      email: String,
      website: String,
      address: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      pincode: String,
      latitude: Number,
      longitude: Number,
    },
    rankings: [{
      year: Number,
      category: String,
      rank: Number,
      source: String,
    }],
    placementStats: {
      averagePackage: Number,
      highestPackage: Number,
      medianPackage: Number,
      placementPercentage: Number,
      year: Number,
      topRecruiters: [String],
      sectorWise: Map,
    },
    fees: {
      tuitionFee: Number,
      hostelFee: Number,
      otherFees: Number,
      total: Number,
    },
    scholarships: [{
      name: String,
      amount: Number,
      eligibility: String,
      deadline: Date,
    }],
    approvedBy: [String],
    campusInfo: {
      totalArea: String,
      campusType: {
        type: String,
        enum: [
          // Original values
          'Urban', 'Semi-Urban', 'Rural', 'Suburban',
          // Extended to match real-world Excel data
          'Residential', 'Non-Residential', 'Semi-Residential',
        ],
      },
      totalStudents: Number,
      totalFaculty: Number,
      studentFacultyRatio: String,
      departments: Number,
      recognitions: [String],
    },
    hostel: {
      available: Boolean,
      boysCapacity: Number,
      girlsCapacity: Number,
      annualFee: Number,
      messCharges: Number,
      facilities: [String],
      distanceFromCampus: String,
    },
    infrastructure: {
      totalBuildings: Number,
      classroomCount: Number,
      laboratoryCount: Number,
      libraryBooks: Number,
      computerCount: Number,
      sportsGrounds: [String],
      auditoriumCapacity: Number,
      cafeteriaCount: Number,
      hasOwnHospital: Boolean,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
    },
    admissionProcess: {
      mode: {
        type: String,
        enum: ['Merit-Based', 'Entrance-Based', 'Both'],
      },
      steps: [{
        stepNumber: Number,
        title: String,
        description: String,
      }],
      applicationStartDate: Date,
      applicationEndDate: Date,
      applicationFee: Number,
      applicationLink: String,
      documentsRequired: [String],
      // Store the raw exam/entrance name from Excel (free text, no enum)
      entranceExamName: String,
    },
    cutoffs: [{
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
      year: Number,
      category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'], default: 'General' },
      openingRank: Number,
      closingRank: Number,
      cutoffScore: Number,
      round: String,
    }],
    yearWisePlacements: [{
      year: Number,
      averagePackage: Number,
      highestPackage: Number,
      medianPackage: Number,
      placementPercentage: Number,
      totalStudents: Number,
      placedStudents: Number,
      topRecruiters: [String],
    }],
    facilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }],
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    brochure: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      canonicalUrl: String,
      schemaMarkup: mongoose.Schema.Types.Mixed,
    },
    isVerified: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    importBatch: String,
    version: { type: Number, default: 1 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

collegeSchema.pre('save', async function () {
  if (!this.slug) this.slug = slugify(this.name, { lower: true, strict: true });
});

collegeSchema.index({ 'contact.city': 1, 'contact.state': 1 });
collegeSchema.index({ 'contact.state': 1 });
collegeSchema.index({ 'accreditation.nirfRank': 1 });
collegeSchema.index({ collegeType: 1 });
collegeSchema.index({ isVerified: 1 });
collegeSchema.index({ featured: 1, deletedAt: 1 });
collegeSchema.index({ views: -1 });
collegeSchema.index({ isOnline: 1 });
collegeSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('College', collegeSchema);