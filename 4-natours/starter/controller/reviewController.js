const Review = require('../model/reviewModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const factory = require('./handlerFactory');

exports.createReview = factory.createOne(Review);
exports.deleteReviewById = factory.deleteById(Review);
exports.updateReviewById = factory.updateById(Review);

exports.getAllReviews = catchAsync(async (req, res, next) => {
   let filter = {};
   if (req.params.tourId) filter = { tour: req.params.tourId };

   const reviews = await Review.find(filter);

   res.status(200).json({
      status: 'success',
      results: reviews.length,
      requestedAt: req.requestTime,
      data: reviews
   });
});

exports.getReviewById = catchAsync(async (req, res, next) => {
   const review = await Review.findById(req.params.id);

   if (!review)
      return next(
         new AppError(`No review found with ID: ${req.params.id}`, 404)
      );

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         review: review
      }
   });
});

exports.setTourAndUser = (req, res, next) => {
   if (!req.body.tour) req.body.tour = req.params.tourId;
   if (!req.body.user) req.body.user = req.user.id;

   next();
};
