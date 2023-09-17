const User = require('../model/userModel');
const catchAsync = require('../util/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
   const users = await User.find();

   res.status(200).json({
      status: 'success',
      results: users.length,
      requestedAt: req.requestTime,
      data: {
         tours: users
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

exports.getUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route is not defined',
      requestedAt: req.requestTime
   });
};

exports.updateUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route is not defined',
      requestedAt: req.requestTime
   });
};

exports.deleteUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route is not defined',
      requestedAt: req.requestTime
   });
};
