const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

// route alias for '/cheapest-top-five'
exports.aliasTopTours = async (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage price';
   req.query.fields = 'name summary price ratingsAverage difficulty';
   next();
};

exports.getAllTours = async (req, res) => {
   try {
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
   } catch (err) {
      res.status(404).json({
         status: 'fail',
         message: err
      });
   }
};

exports.getTourById = async (req, res) => {
   try {
      const tour = await Tour.findById(req.params.id);

      res.status(200).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: {
            tour: tour
         }
      });
   } catch (err) {
      res.status(404).json({
         status: 'fail',
         message: err
      });
   }
};

exports.createTour = async (req, res) => {
   try {
      const tour = await Tour.create(req.body);

      res.status(201).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: {
            tour: tour
         }
      });
   } catch (err) {
      res.status(404).json({
         status: 'error',
         message: err
      });
   }
};

exports.updateTourById = async (req, res) => {
   try {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true
      });

      res.status(200).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: {
            tour: tour
         }
      });
   } catch (err) {
      res.status(404).json({
         status: 'error',
         message: err
      });
   }
};

exports.deleteTourById = async (req, res) => {
   try {
      await Tour.findByIdAndDelete(req.params.id);

      res.status(204).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: null
      });
   } catch (err) {
      res.status(404).json({
         status: 'error',
         message: err
      });
   }
};
