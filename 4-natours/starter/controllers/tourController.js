const fs = require('fs');

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

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
	const id = req.params.id * 1;
	const tour = tours.find(el => el.id === id);
	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Tour Not Found',
			requestedAt: req.requestTime,
		});
	}
	
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
	fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
		res.status(201).json({
			status: 'success',
			requestedAt: req.requestTime,
			data: {
				tour: newTour
			}
		});
	});
};

exports.updateTour = (req, res) => {
	const id = req.params.id * 1;
	
	if (id > tours.length) {
		return res.status(404).json({
			status: 'fail',
			requestedAt: req.requestTime,
			message: 'Tour Not Found'
		});
	}
	
	res.status(200).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: {
			tour: '<Tour Updated...>'
		}
	});
};

exports.deleteTour = (req, res) => {
	const id = req.params.id * 1;
	const tour = tours.find(el => el.id === id);
	
	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Tour Not Found',
			requestedAt: req.requestTime,
		});
	}
	
	res.status(204).json({
		status: 'success',
		requestedAt: req.requestTime,
		data: null
	});
};
