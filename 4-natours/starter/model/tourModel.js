const mongoose = require('mongoose');

exports.Tour = mongoose.model(
   'Tour',
   new mongoose.Schema({
      name: {
         type: String,
         required: [true, 'Name is required'],
         unique: true,
         trim: true
      },
      duration: {
         type: Number,
         required: [true, 'Duration is required']
      },
      ratingsAverage: {
         type: Number,
         default: 4.5
      },
      ratingsQuantity: {
         type: Number,
         default: 0
      },
      price: {
         type: Number,
         required: [true, 'Price is required']
      },
      priceDiscount: Number,
      summary: {
         type: String,
         trim: true
      },
      maxGroupSize: {
         type: Number,
         required: [true, 'Max Group Size is required']
      },
      difficulty: {
         type: String,
         required: [true, 'Difficulty is required'],
         trim: true
      },
      description: {
         type: String,
         trim: true,
         required: [true, 'Description is required']
      },
      imageCover: {
         type: String,
         required: [true, 'Image is required']
      },
      images: [String],
      createdAt: {
         type: Date,
         default: Date.now()
      },
      startDates: [Date]
   })
);