const mongoose = require('mongoose');

const accreditationBodySchema = new mongoose.Schema({
  abbr:    { type: String, required: true },
  full:    { type: String, required: true },
  logoUrl: { type: String, default: '' },
  order:   { type: Number, default: 0 },
  active:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('AccreditationBody', accreditationBodySchema);
