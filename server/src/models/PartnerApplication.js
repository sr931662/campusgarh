const mongoose = require('mongoose');

const partnerApplicationSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, lowercase: true },
  phone:       { type: String, required: true },
  city:        { type: String, required: true },
  type:        { type: String, enum: ['Teacher', 'Counselor', 'Institute'], required: true },
  experience:  { type: Number, default: 0 },   // years
  studentsPerMonth: { type: Number, default: 0 },
  message:     { type: String },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PartnerApplication', partnerApplicationSchema);
