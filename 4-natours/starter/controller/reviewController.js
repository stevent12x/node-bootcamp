const Review = require('../model/reviewModel');
const factory = require('./handlerFactory');

exports.createReview = factory.createOne(Review);
exports.deleteReviewById = factory.deleteById(Review);
exports.updateReviewById = factory.updateById(Review);
exports.getReviewById = factory.getById(Review);
exports.getAllReviews = factory.getAll(Review);

exports.setTourAndUser = (req, res, next) => {
   if (!req.body.tour) req.body.tour = req.params.tourId;
   if (!req.body.user) req.body.user = req.user.id;

   next();
};
