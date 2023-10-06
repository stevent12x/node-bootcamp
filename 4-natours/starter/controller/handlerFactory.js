const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

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
