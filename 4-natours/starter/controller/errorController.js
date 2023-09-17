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

const sendDevError = (err, res) => {
   res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
   });
};

const sendProdError = (err, res) => {
   if (err.isOperational) {
      res.status(err.statusCode).json({
         status: err.status,
         message: err.message
      });
   } else {
      console.error('ERROR', err);

      res.status(500).json({
         status: 'error',
         message: 'Something went wrong'
      });
   }
};

const handleJWTError = () => new AppError('Invalid token', 401);

const handleJWTExpired = () => new AppError('Token expired', 401);

module.exports = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error';

   if (process.env.NODE_ENV === 'development') {
      sendDevError(err, res);
   } else if (process.env.NODE_ENV === 'production') {
      let error = Object.create(err);

      if (error.name === 'CastError') error = handleCastErrorDB(error);
      if (error.code === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === 'ValidationError')
         error = handleValidationErrorDB(error);
      if (error.name === 'JsonWebTokenError') error = handleJWTError();
      if (error.name === 'TokenExpiredError') error = handleJWTExpired();

      sendProdError(error, res);
   }
};
