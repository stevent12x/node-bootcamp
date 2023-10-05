const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../model/tourModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
   .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
   })
   .then(() => console.log('DB connection successful'));

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
   try {
      await Tour.create(tours);
      console.log('Successfully imported!');
   } catch (err) {
      console.log(err);
   }
   process.exit();
};

// Delete all data from collection
const deleteData = async () => {
   try {
      await Tour.deleteMany();
      console.log('Successfully deleted!');
   } catch (err) {
      console.log(err);
   }
   process.exit();
};

if (process.argv[2] === '--import') {
   importData();
} else if (process.argv[2] === '--delete') {
   deleteData();
}
