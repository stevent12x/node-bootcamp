const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const SendEmail = require('../util/email');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Log user in, send JWT as cookie
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 200, res);
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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Unauthenticated', 401));
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
      new AppError('User recently changed password. Please log in again', 401)
    );
  }

  // Grant access to protected route and assign user to currentUser
  req.user = currentUser;
  next();
});

// Only for rendered pages, no error
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // Check if token is valid
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // Determine that there is a logged-in user
    // every template has access to 'locals'
    res.locals.user = currentUser;
    return next();
  }

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

exports.requestPasswordReset = catchAsync(async (req, res, next) => {
  // 1) Get User based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  // 2) Generate random token
  const token = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send token as email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${token}`;

  const message = `Forgot your password? Submit a PATCH req with your new password and passwordConfirm to: ${resetURL}\nIf you didn't request a password reset, please ignore this email.`;

  try {
    await SendEmail({
      email: user.email,
      subject: 'Your password reset token - only valid for 10 mins',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Reset password token send successfully'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(`${err.message}`, 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() }
  });

  // 2) Set new password if user and token not expired
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  // 4) Log in user, send JWT
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.verifyPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Password is incorrect', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});
