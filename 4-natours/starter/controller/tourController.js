const Tour = require('./../model/tourModel');
const APIFeatures = require('../util/apiFeatures');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const factory = require('./handlerFactory');

exports.createTour = factory.createOne(Tour);
exports.updateTourById = factory.updateById(Tour);
exports.deleteTourById = factory.deleteById(Tour);
exports.getTourById = factory.getById(Tour, { path: 'reviews' });
exports.getAllTours = factory.getAll(Tour);

// route alias for '/cheapest-top-five'
exports.aliasTopTours = async (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage price';
   req.query.fields = '-guides name summary price ratingsAverage difficulty';
   next();
};

exports.getTourStats = catchAsync(async (req, res) => {
   const stats = await Tour.aggregate([
      {
         $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
         $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
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

// '/tours-within/:distance/center/:latlng/unit/:unit',
exports.getToursWithin = catchAsync(async (req, res, next) => {
   const { distance, latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');

   const radMiles = 3963.2;
   const radKilos = 6378.1;
   const radius = unit === 'mi' ? distance / radMiles : distance / radKilos;

   if (!lat || !lng) {
      return next(new AppError('Please provide latitude and longitude', 400));
   }

   const tours = await Tour.find({
      startLocation: {
         $geoWithin: {
            $centerSphere: [[lng, lat], radius]
         }
      }
   });

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
         data: tours
      }
   });
});

exports.getDistances = catchAsync(async (req, res, next) => {
   const { latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');
   const multiplier = unit === 'mi' ? 0.00062137 : 0.001;

   if (!lat || !lng) {
      return next(new AppError('Please provide latitude and longitude', 400));
   }

   const distances = await Tour.aggregate([
      {
         $geoNear: {
            near: {
               type: 'Point',
               coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier
         }
      },
      {
         $project: {
            distance: 1,
            name: 1
         }
      }
   ]);

   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         data: distances
      }
   });
});
