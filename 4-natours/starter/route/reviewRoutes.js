const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
   .route('/')
   .get(reviewController.getAllReviews)
   .post(
      authController.restrictTo('user'),
      reviewController.setTourAndUser,
      reviewController.createReview
   );

router
   .route('/:id')
   .get(reviewController.getReviewById)
   .delete(
      authController.restrictTo('admin', 'user'),
      reviewController.deleteReviewById
   )
   .patch(
      authController.restrictTo('admin', 'user'),
      reviewController.updateReviewById
   );

module.exports = router;
