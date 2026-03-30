import BaseService from './baseService.js';
import VideoTestimonial from '../models/VideoTestimonial.js';

class VideoTestimonialService extends BaseService {
  constructor() {
    super(VideoTestimonial);
  }

  async getActive() {
    return VideoTestimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
  }
}

export default new VideoTestimonialService();
