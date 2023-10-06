const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Custom middleware
// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router
   .route('/cheapest-top-five')
   .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
   .route('/')
   .get(authController.protect, tourController.getAllTours)
   .post(tourController.createTour);
router
   .route('/:id')
   .get(tourController.getTourById)
   .patch(tourController.updateTourById)
   .delete(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.deleteTourById
   );

module.exports = router;
