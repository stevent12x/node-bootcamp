const express = require('express');
const tourController = require('../controller/tourController');

const router = express.Router();

// Custom middleware
// router.param('id', tourController.checkID);

router
   .route('/cheapest-top-five')
   .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
   .route('/')
   .get(tourController.getAllTours)
   .post(tourController.createTour);
router
   .route('/:id')
   .get(tourController.getTourById)
   .patch(tourController.updateTourById)

   .delete(tourController.deleteTourById);

module.exports = router;