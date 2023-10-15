const express = require('express');
const viewsController = require('../controller/viewsController');

const router = express.Router();

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signUp', viewsController.getSignUpForm);

module.exports = router;
