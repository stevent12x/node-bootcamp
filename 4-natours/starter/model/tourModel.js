const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
      maxLength: [40, 'Name must be less or equal to 40 characters'],
      minLength: [10, 'Name must be more or equal to 10 characters'],
      validate: {
        validator: function (val) {
          return validator.isAlpha(val, 'en-US', { ignore: ' -' });
        },
        message: 'Name must be alphanumeric'
      }
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration is required']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be 1.0 or greater'],
      max: [5, 'Rating must be 5.0 or below'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // .this keyword does not work on update functions
          return val < this.price;
        },
        message: 'Discount - {VALUE} - cannot be greater than price'
      }
    },
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
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be: easy, medium, or difficult'
      }
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Description is required']
    },
    imageCover: {
      type: String
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return Math.round((this.duration / 7) * 10) / 10;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// Document Middleware/hook - runs before save() and create() - NOT on insertMany()
// also called 'pre-save hook'
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();

  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});
//
// // Aggregation hooks
// // Exclude secret tours from aggregation calcs
// // tourSchema.pre('aggregate', function (next) {
// //    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// //    next();
// // });
//
// tourSchema.post(/^find/, function (docs, next) {
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
