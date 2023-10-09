const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const APIFeatures = require('../util/apiFeatures');

exports.deleteById = Model =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
         return next(
            new AppError(`No document found with ID: ${req.params.id}`, 404)
         );
      }

      res.status(204).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: null
      });
   });

exports.createOne = Model =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.create(req.body);

      res.status(201).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: {
            data: doc
         }
      });
   });

exports.updateById = Model =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true
      });

      if (!doc) {
         return next(
            new AppError(`No document found with ID: ${req.params.id}`, 404)
         );
      }

      res.status(200).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: {
            data: doc
         }
      });
   });

exports.getById = (Model, populate) =>
   catchAsync(async (req, res, next) => {
      let query = Model.findById(req.params.id);

      if (populate) query = query.populate(populate);

      const doc = await query;

      if (!doc) {
         return next(
            new AppError(`No document found with ID: ${req.params.id}`, 404)
         );
      }

      res.status(200).json({
         status: 'success',
         requestedAt: req.requestTime,
         data: {
            data: doc
         }
      });
   });

exports.getAll = Model =>
   catchAsync(async (req, res, next) => {
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };

      const features = new APIFeatures(Model.find(filter), req.query)
         .filter()
         .sort()
         .limitFields()
         .paginate();
      // const doc = await features.query.explain;
      const doc = await features.query;

      // Send response
      res.status(200).json({
         status: 'success',
         results: doc.length,
         requestedAt: req.requestTime,
         data: {
            data: doc
         }
      });
   });
