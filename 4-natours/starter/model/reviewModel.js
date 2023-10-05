const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
   {
      review: {
         type: String,
         required: [true, 'Review is required'],
         trim: true
      },
      rating: {
         type: Number,
         min: 1,
         max: 5,
         required: [true, 'Rating is required']
      },
      createdAt: {
         type: Date,
         default: Date.now()
      },
      tour: [
         {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour'],
            trim: true
         }
      ],
      user: [
         {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
            trim: true
         }
      ]
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
   }
);
//
// reviewSchema.pre('save', function (req, next) {
//    console.log(req);
//    this.user = req.user;
//
//    next();
// });

reviewSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'user',
      select: 'name photo'
   });

   next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
