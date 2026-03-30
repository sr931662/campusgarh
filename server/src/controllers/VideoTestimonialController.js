import videoTestimonialService from '../services/VideoTestimonialService.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { AppError } from '../utils/AppError.js';

export const getAll = async (req, res, next) => {
  try {
    const items = await videoTestimonialService.getActive();
    ResponseHandler.success(res, items);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const item = await videoTestimonialService.create({ ...req.body, createdBy: req.user._id });
    ResponseHandler.created(res, item);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const item = await videoTestimonialService.updateById(req.params.id, req.body);
    if (!item) return next(new AppError('Not found', 404));
    ResponseHandler.success(res, item);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await videoTestimonialService.deleteOne({ _id: req.params.id }, false);
    ResponseHandler.success(res, null, 'Deleted');
  } catch (err) { next(err); }
};
