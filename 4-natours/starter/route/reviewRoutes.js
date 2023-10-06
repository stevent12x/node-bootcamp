const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

const router = express.Router({ mergeParams: true });

router
   .route('/')
   .get(reviewController.getAllReviews)
   .post(
      authController.protect,
      authController.restrictTo('user'),
      reviewController.setTourAndUser,
      reviewController.createReview
   );

router
   .route('/:id')
   .get(reviewController.getReviewById)
   .delete(reviewController.deleteReviewById)
   .patch(reviewController.updateReviewById);

module.exports = router;
