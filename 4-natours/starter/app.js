const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const tourRouter = require('./route/tourRoutes');
const userRouter = require('./route/userRoutes');

const AppError = require('./util/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// GLOBAL MIDDLEWARE
// Set security HTTP headers
app.use(helmet());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
   limit: 100,
   windowMs: 60 * 60 * 1000,
   message: 'Request limit reached'
});
app.use('/api', limiter);

// Body parser - read data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Custom test middleware
app.use((req, res, next) => {
   req.requestTime = new Date().toISOString();
   next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle bad requests
app.all('*', (req, res, next) => {
   next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
