const User = require('../model/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const factory = require('./handlerFactory');

const sanitizeRequest = (obj, fields) => {
   const sanitizedObject = {};
   Object.keys(obj).forEach(el => {
      if (fields.includes(el)) {
         sanitizedObject[el] = obj[el];
      }
   });

   return sanitizedObject;
};

// Not for updating passwords
exports.updateUser = factory.updateById(User);
exports.deleteUser = factory.deleteById(User);

exports.getAllUsers = catchAsync(async (req, res, next) => {
   const users = await User.find();

   res.status(200).json({
      status: 'success',
      results: users.length,
      requestedAt: req.requestTime,
      data: {
         users: users
      }
   });
});

exports.createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route is not defined',
      requestedAt: req.requestTime
   });
};

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
   // Create error if user tries to post password data
   if (req.body.password || req.body.passwordConfirm) {
      return next(
         new AppError(
            `Cannot complete this function. This route is not for password updates. Please use /updateMe`,
            400
         )
      );
   }
   // Filter out unwanted field names
   const sanitizedRequest = sanitizeRequest(req.body, ['name', 'email']);

   // Update the User document
   const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      sanitizedRequest,
      {
         new: true,
         runValidators: true
      }
   );

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         user: updatedUser
      }
   });
});

exports.getUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route is not defined',
      requestedAt: req.requestTime
   });
};

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
   await User.findByIdAndUpdate(req.user.id, { active: false });

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: null
   });
});
