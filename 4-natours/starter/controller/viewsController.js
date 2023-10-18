const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('Tour not found', 400));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = catchAsync(async function (req, res) {
  res.status(200).render('login', {
    title: 'Login Screen' // or whatever title you wish
  });
});

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signUp', {
    title: 'Sign Up'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'My Account'
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    { new: true, runValidators: true }
  );

  res.status(200).render('account', {
    title: 'My Account',
    user: updatedUser
  });
});
