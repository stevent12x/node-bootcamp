const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/requestPasswordReset', authController.requestPasswordReset);
router.patch('/resetPassword/:token', authController.resetPassword);

// adds authController.protect to all subsequent routes in file
router.use(authController.protect);

router.patch('/updateCurrentPassword', authController.updatePassword);

router.get('/me', userController.getCurrentUser, userController.getUserById);

router.patch('/updateMe', userController.updateCurrentUser);
router.delete('/deleteMe', userController.deleteCurrentUser);

router.use(authController.restrictTo('admin'));

router
   .route('/')
   .get(userController.getAllUsers)
   .post(userController.createUser);
router
   .route('/:id')
   .get(userController.getUserById)
   .patch(userController.updateUser)
   .delete(userController.deleteUser);

module.exports = router;
