const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'counsellor', 'moderator', 'institution_rep', 'partner'],
      default: 'student',
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Phone must be 10 digits'],
    },
    profilePicture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
    },

    // Student Specific (enhanced)
    academicBackground: {
      qualification: String,
      institution: String,
      yearOfPassing: Number,
      percentage: Number,
      board: String,
      stream: String,
      graduationYear: Number,
      postGraduationYear: Number,
    },
    preferredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    preferredCities: [String],
    preferredStates: [String],
    budgetRange: {
      min: Number,
      max: Number,
    },
    entranceExamsAttempted: [
      {
        exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
        score: Number,
        percentile: Number,
        year: Number,
      },
    ],
    savedColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
    savedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    savedComparisons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comparison' }],
    // Interests
    interests: [String], // e.g., 'engineering', 'medical', 'management'

    // Counsellor Specific
    assignedLeads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AdmissionEnquiry' }],
    expertise: [String], // e.g., 'engineering counselling', 'study abroad'
    availability: {
      days: [String],
      timeSlots: [String],
    },

    // Audit & Metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date, // soft delete
    importBatch: String, // for bulk import tracking

    // OAuth
    googleId: { type: String, unique: true, sparse: true },
    oauthProvider: { type: String, enum: ['google', 'local'], default: 'local' },

    // Auth
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ deletedAt: 1 });
userSchema.index({ importBatch: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return this.name;
});

// Pre-save hooks
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', userSchema);