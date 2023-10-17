const AppError = require('../util/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const message = `Duplicate field value: "${err.keyValue.name}"`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendDevError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  console.error('ERROR', err);

  return res.status(err.statusCode).render('error', {
    title: 'Oops!',
    msg: err.message
  });
};

const sendProdError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        msg: err.message
      });
    }
    // Programming or other unknown error: don't leak error details
    console.error('ERROR', err);

    return res.status(500).json({
      status: 'error',
      msg: 'Something went wrong'
    });
  }
  // Rendered Website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Oops!',
      msg: err.message
    });
  }

  console.error('ERROR', err);

  return res.status(err.statusCode).render('error', {
    title: 'Oops!',
    msg: 'Please try again later'
  });
};

const handleJWTError = () => new AppError('Invalid token', 401);

const handleJWTExpired = () => new AppError('Token expired', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendProdError(error, req, res);
  }
};
