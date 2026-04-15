const mongoose = require('mongoose');
const counselorSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  role:     { type: String, required: true },
  exp:      { type: String, default: '' },
  desc:     { type: String, default: '' },
  imgUrl:   { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter:  { type: String, default: '' },
  instagram:{ type: String, default: '' },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Counselor', counselorSchema);
