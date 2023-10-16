const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./route/tourRoutes');
const userRouter = require('./route/userRoutes');
const reviewRouter = require('./route/reviewRoutes');
const viewRouter = require('./route/viewRoutes');

const AppError = require('./util/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use((req, res, next) => {
  res.set('Content-Security-Policy', 'connect-src *');
  next();
});

// Set security HTTP headers
const scriptSrcUrls = [
  'https://mapbox.com/',
  'https://api.mapbox.com/',
  'https://js.stripe.com',
  'https://m.stripe.network',
  'https://*.cloudflare.com'
];
const styleSrcUrls = [
  'https://mapbox.com/',
  'https://api.mapbox.com/',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = [
  'https://mapbox.com',
  'https://api.mapbox.com/',
  'https://events.mapbox.com/',
  'https://tile.mapbox.com',
  'https://*.stripe.com',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/'
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", ...fontSrcUrls],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
      childSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      formAction: ["'self'"],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        'data:',
        'blob:',
        ...connectSrcUrls
      ],
      upgradeInsecureRequests: []
    }
  })
);

// HTTP request logging, development only
console.log(`App running in -- ${process.env.NODE_ENV} -- mode`);
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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent request parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Custom test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handle bad requests
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
