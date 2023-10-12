const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('Tour not found', 400));
  }

  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
    tour
  });
});
