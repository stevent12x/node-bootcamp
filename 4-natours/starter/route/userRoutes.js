const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get(
   '/me',
   authController.protect,
   userController.getCurrentUser,
   userController.getUserById
);

router.post('/requestPasswordReset', authController.requestPasswordReset);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
   '/updateCurrentPassword',
   authController.protect,
   authController.updatePassword
);

router.patch(
   '/updateMe',
   authController.protect,
   userController.updateCurrentUser
);
router.delete(
   '/deleteMe',
   authController.protect,
   userController.deleteCurrentUser
);

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
