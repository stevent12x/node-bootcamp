const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

const signToken = id => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
   });
};

exports.signup = catchAsync(async (req, res, next) => {
   const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
   });

   const token = signToken(newUser._id);

   res.status(201).json({
      status: 'success',
      token,
      data: {
         user: newUser
      }
   });
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // 1) Check if email and password exist
   if (!email || !password) {
      return next(new AppError('Missing email or password', 400));
   }

   // 2) Check if user exists && password is correct
   const user = await User.findOne({ email }).select('+password');

   if (!user || !(await user.verifyPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
   }

   // 3) Send token to client
   const token = signToken(user._id);
   res.status(200).json({
      status: 'success',
      token
   });
});

// User authentication middleware
exports.protect = catchAsync(async (req, res, next) => {
   // Check if token exists
   let token;
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
   ) {
      token = req.headers.authorization.split(' ')[1];
   }

   if (!token) {
      return next(new AppError('No bearer token found', 401));
   }

   // Check if token is valid
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

   // Check if user still exists
   const currentUser = await User.findById(decoded.id);
   if (!currentUser) {
      return next(
         new AppError('User associated with this token no longer exists', 401)
      );
   }

   // Check if user changed password after token was issued
   if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
         new AppError(
            'User recently changed password. Please log in again',
            401
         )
      );
   }

   // Grant access to protected route
   req.user = currentUser;
   next();
});

// Restrict access to certain routes based on user role
exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return next(
            new AppError(
               'User lacks necessary permission to perform this action',
               403
            )
         );
      }

      next();
   };
};
