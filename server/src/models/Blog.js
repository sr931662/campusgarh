const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
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
    content: {
      type: String,
      required: true,
    },
    excerpt: String,
    featuredImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    featuredImageUrl: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' }],
    tags: [String],
    readingTime: Number,
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      schemaMarkup: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    // For related content
    relatedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
    // Content classification
    featured: { type: Boolean, default: false },
    contentType: {
      type: String,
      enum: ['Guide', 'News', 'Ranking', 'College Review', 'Exam Update', 'Career Advice', 'Scholarship', 'Comparison'],
      default: 'Guide',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },

    // Series support
    series: {
      name: String,
      partNumber: Number,
      totalParts: Number,
    },

    // Related entities
    relatedColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    relatedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],

    // Editorial
    tableOfContents: [
      {
        id: String,
        title: String,
        level: Number,
      },
    ],
    lastReviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shareCount: { type: Number, default: 0 },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    importBatch: String,
  },
  { timestamps: true }
);

blogSchema.pre('save', async function () {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

blogSchema.index({ featured: 1, publishedAt: -1 });
blogSchema.index({ contentType: 1 });
blogSchema.index({ 'series.name': 1, 'series.partNumber': 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Blog', blogSchema);