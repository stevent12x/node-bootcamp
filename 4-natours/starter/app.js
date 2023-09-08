const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./route/tourRoutes');
const userRouter = require('./route/userRoutes');

const app = express();

// MIDDLEWARE
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Custom middleware
app.use((req, res, next) => {
   req.requestTime = new Date().toISOString();
   next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
