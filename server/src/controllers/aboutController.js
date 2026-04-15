const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const AboutContent = require('../models/AboutContent');

exports.getAbout = catchAsync(async (req, res) => {
  let doc = await AboutContent.findOne();
  if (!doc) doc = await AboutContent.create({});
  ResponseHandler.success(res, doc, 'About content fetched');
});

exports.updateAbout = catchAsync(async (req, res) => {
  let doc = await AboutContent.findOne();
  if (!doc) {
    doc = await AboutContent.create(req.body);
  } else {
    Object.assign(doc, req.body);
    await doc.save();
  }
  ResponseHandler.success(res, doc, 'About content updated');
});
