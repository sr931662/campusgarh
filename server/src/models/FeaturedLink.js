const mongoose = require('mongoose');

const featuredLinkSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    url:         { type: String, required: true, trim: true },
    openInNewTab:{ type: Boolean, default: false },
    order:       { type: Number, default: 0 },
    active:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeaturedLink', featuredLinkSchema);
