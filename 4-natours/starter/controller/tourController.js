const Tour = require('./../model/tourModel');
const APIFeatures = require('../util/apiFeatures');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

// route alias for '/cheapest-top-five'
exports.aliasTopTours = async (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage price';
   req.query.fields = 'name summary price ratingsAverage difficulty';
   next();
};

exports.getAllTours = catchAsync(async (req, res) => {
   // Execute query
   const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
   const tours = await features.query;

   // Send response
   res.status(200).json({
      status: 'success',
      results: tours.length,
      requestedAt: req.requestTime,
      data: {
         tours: tours
      }
   });
});

exports.getTourById = catchAsync(async (req, res, next) => {
   const tour = await Tour.findById(req.params.id).populate('reviews');

   if (!tour) {
      return next(new AppError(`No tour found with ID: ${req.params.id}`, 404));
   }

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         tour: tour
      }
   });
});

exports.createTour = catchAsync(async (req, res) => {
   const tour = await Tour.create(req.body);

   res.status(201).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         tour: tour
      }
   });
});

exports.updateTourById = catchAsync(async (req, res, next) => {
   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
   });

   if (!tour) {
      return next(new AppError(`No tour found with ID: ${req.params.id}`, 404));
   }

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         tour: tour
      }
   });
});

exports.deleteTourById = catchAsync(async (req, res, next) => {
   const tour = await Tour.findByIdAndDelete(req.params.id);

   if (!tour) {
      return next(new AppError(`No tour found with ID: ${req.params.id}`, 404));
   }

   res.status(204).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: null
   });
});

exports.getTourStats = catchAsync(async (req, res) => {
   const stats = await Tour.aggregate([
      {
         $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
         $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: { $sum: '$ratingsQuantity' } },
            avgRating: { $avg: { $avg: '$ratingsAverage' } },
            avgPrice: { $avg: { $avg: '$price' } },
            minPrice: { $min: { $min: '$price' } },
            maxPrice: { $max: { $max: '$price' } }
         }
      },
      {
         $sort: { avgPrice: 1 }
      }
   ]);

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         stats: stats
      }
   });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
   const year = req.params.year * 1;
   const plan = await Tour.aggregate([
      {
         $unwind: '$startDates'
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`)
            }
         }
      },
      {
         $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' }
         }
      },
      {
         $addFields: { month: '$_id' }
      },
      {
         $project: { _id: 0 }
      },
      {
         $sort: { numTourStarts: -1, month: 1 }
      }
   ]);

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         plan
      }
   });
});
