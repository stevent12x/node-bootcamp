const fs = require('fs');

const tours = JSON.parse(
   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.checkID = (req, res, next, val) => {
   const tour = tours.find(el => el.id === val);

   if (!tour) {
      return res.status(404).json({
         status: 'fail',
         message: `Tour ${val} Not Found`,
         requestedAt: req.requestTime
      });
   }

   next();
};

exports.checkBody = (req, res, next) => {
   if (!req.body.name || !req.body.price) {
      return res.status(400).json({
         status: 'fail',
         message: 'Bad Request',
         requestedAt: req.requestTime
      });
   }

   next();
};

exports.getAllTours = (req, res) => {
   res.status(200).json({
      status: 'success',
      results: tours.length,
      requestedAt: req.requestTime,
      data: {
         tours: tours
      }
   });
};

exports.getTour = (req, res) => {
   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         tour
      }
   });
};

exports.createTour = (req, res) => {
   const newId = tours[tours.length - 1].id + 1;
   const newTour = Object.assign({ id: newId }, req.body);

   tours.push(newTour);
   fs.writeFile(
      `${__dirname}/../dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      err => {
         res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
               tour: newTour
            }
         });
      }
   );
};

exports.updateTour = (req, res) => {
   res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
         tour: '<Tour Updated...>'
      }
   });
};

exports.deleteTour = (req, res) => {
   res.status(204).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: null
   });
};
