const Review = require('../model/reviewModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const APIFeatures = require('../util/apiFeatures');

exports.getAllReviews = catchAsync(async (req, res, next) => {
   const reviews = await Review.find();

   res.status(200).json({
      status: 'success',
      results: reviews.length,
      requestedAt: req.requestTime,
      data: {
         reviews: reviews
      }
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

exports.createReview = catchAsync(async (req, res, next) => {
   const review = await Review.create(req.body);

   res.status(201).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         review: review
      }
   });
});
