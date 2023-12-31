const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const factory = require('./handlerFactory');

// Exclude unwanted fields from req
const sanitizeRequest = (obj, fields) => {
  const sanitizedObject = {};
  Object.keys(obj).forEach(el => {
    if (fields.includes(el)) {
      sanitizedObject[el] = obj[el];
    }
  });

  return sanitizedObject;
};

// Image uploads with multer package
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError(`${file.mimetype} is not a supported file type`, 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

// Resize images with sharp package
exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// Not for updating passwords
exports.updateUser = factory.updateById(User);
exports.deleteUser = factory.deleteById(User);
exports.getUserById = factory.getById(User);
exports.getAllUsers = factory.getAll(User);

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

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
  if (req.file) sanitizedRequest.photo = req.file.filename;

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

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please use /signup',
    requestedAt: req.requestTime
  });
};
