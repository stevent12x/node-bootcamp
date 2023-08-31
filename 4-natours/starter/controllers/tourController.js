const model = require('./../model/tourModel');

exports.getAllTours = async (req, res) => {
   try {
      tours = await model.Tour.find();

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

exports.getTour = async (req, res) => {
   try {
      const tour = await model.Tour.findById(req.params.id);

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
      const tour = await model.Tour.create(req.body);

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
      const tour = await model.Tour.findByIdAndUpdate(req.params.id, req.body, {
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
      await model.Tour.findByIdAndDelete(req.params.id);

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
