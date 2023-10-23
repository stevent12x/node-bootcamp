const express = require('express');
const bookingsController = require('../controller/bookingsController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingsController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingsController.getAllBookings)
  .post(bookingsController.createBooking);

router
  .route('/:id')
  .get(bookingsController.getById)
  .patch(bookingsController.updateById)
  .delete(bookingsController.deleteById);

module.exports = router;
