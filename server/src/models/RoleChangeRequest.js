const mongoose = require('mongoose');

const roleChangeRequestSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentRole:   { type: String, required: true },
  requestedRole: { type: String, enum: ['student', 'counsellor', 'institution_rep'], required: true },
  reason:        { type: String, required: true, maxlength: 500 },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote:    String,
  reviewedAt:    Date,
}, { timestamps: true });

module.exports = mongoose.model('RoleChangeRequest', roleChangeRequestSchema);
