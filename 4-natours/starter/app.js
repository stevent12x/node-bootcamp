const express = require('express');
const fs = require('fs');

// app.get('/', (req, res) => {
// 	res.status(200).json({ message: 'Hello from the server!', app: 'Natours' });
// });
//
// app.post('/', (req, res) => {
// 	res.status(200).send('You can post to this endpoint...');
// });

const app = express();
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));

// GET All Tours
app.get('/api/v1/tours', (req, res) => {
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours: tours
		}
	});
});

// GET One Tour
app.get('/api/v1/tours/:id', (req, res) => {
	const id = req.params.id * 1;
	const tour = tours.find(el => el.id === id);

	// if (id > tours.length) {
	// 	return res.status(404).json({
	// 		status: 'fail',
	// 		message: 'Tour Not Found'
	// 	});
	// }

	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Tour Not Found'
		});
	}

	res.status(200).json({
		status: 'success',
		data: {
			tour
		}
	});
});

// ADD New Tour
app.post('/api/v1/tours', (req, res) => {
	// console.log(req.body);
	const newId = tours[tours.length - 1].id + 1;
	const newTour = Object.assign({ id: newId }, req.body);

	tours.push(newTour);
	fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour
			}
		});
	});
});

// PATCH Tour
app.patch('/api/v1/tours/:id', (req, res) => {
	const id = req.params.id * 1;

	if (id > tours.length) {
		return res.status(404).json({
			status: 'fail',
			message: 'Tour Not Found'
		});
	}

	res.status(200).json({
		status: 'success',
		data: {
			tour: '<Tour Updated...>'
		}
	});
});

// DELETE Tour
app.delete('/api/v1/tours/:id', (req, res) => {
	const id = req.params.id * 1;
	const tour = tours.find(el => el.id === id);

	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Tour Not Found'
		});
	}

	res.status(204).json({
		status: 'success',
		data: null
	});
});

const port = 3000;
app.listen(port, () => {
	console.log(`App running on port: ${port}...`);
});
