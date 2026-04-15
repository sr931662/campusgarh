const mongoose = require('mongoose');
const aboutContentSchema = new mongoose.Schema({
  heroTitle:    { type: String, default: "India's Most Trusted Student Platform" },
  heroSubtitle: { type: String, default: '' },
  stats: [{
    value: String,
    label: String,
    _id: false,
  }],
  missionText:  { type: String, default: '' },
  whoWeAreText: { type: String, default: '' },
  values: [{
    title: String,
    desc:  String,
    icon:  String,
    _id:   false,
  }],
    team: [{
    name:     String,
    role:     String,
    desc:     String,
    imgUrl:   String,
    initials: String,
    linkedin: String,
    twitter:  String,
    instagram:String,
  }],
  whatWeDo: [{
    icon:  { type: String, default: '' },
    title: { type: String, default: '' },
    desc:  { type: String, default: '' },
    _id:   false,
  }],

  faqs: [{
    q: String,
    a: String,
    _id: false,
  }],
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Only one document ever (singleton)
module.exports = mongoose.model('AboutContent', aboutContentSchema);
