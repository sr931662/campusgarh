const videoTestimonialService = require('../services/VideoTestimonialService');
const ResponseHandler = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

const getAll = async (req, res, next) => {
  try {
    const items = await videoTestimonialService.getActive();
    ResponseHandler.success(res, items);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const item = await videoTestimonialService.create({ ...req.body, createdBy: req.user._id });
    ResponseHandler.created(res, item);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const item = await videoTestimonialService.updateById(req.params.id, req.body);
    if (!item) return next(new AppError('Not found', 404));
    ResponseHandler.success(res, item);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await videoTestimonialService.deleteOne({ _id: req.params.id }, false);
    ResponseHandler.success(res, null, 'Deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
