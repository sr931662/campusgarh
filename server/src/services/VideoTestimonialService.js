const BaseService = require('./baseService');
const VideoTestimonial = require('../models/VideoTestimonial');

class VideoTestimonialService extends BaseService {
  constructor() {
    super(VideoTestimonial);
  }

  async getActive() {
    return VideoTestimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
  }
}

module.exports = new VideoTestimonialService();
