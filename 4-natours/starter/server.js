const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const mongoose = require('mongoose');

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
   .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
   })
   .then(() => {
      console.log('DB connection successful');
   });

const tourSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Tour name is required'],
      unique: true
   },
   rating: {
      type: Number,
      default: 4.5
   },
   price: {
      type: Number,
      required: [true, 'Tour price is required']
   }
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
   name: 'The Park Camper',
   rating: 4.9,
   price: 997
});

testTour
   .save()
   .then(doc => {
      console.log(doc);
   })
   .catch(err => {
      console.log('ERROR', err);
   });

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`App running on port: ${port}...`);
});
