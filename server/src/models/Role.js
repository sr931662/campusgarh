const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['student', 'admin', 'counsellor', 'moderator', 'institution_rep'],
    },
    permissions: {
      type: Map,
      of: Boolean, // fine-grained permissions like 'canEditCollege': true
    },
    description: String,
    isSystem: { type: Boolean, default: false }, // prevent deletion of system roles
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
  },
  { timestamps: true }
);

roleSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);