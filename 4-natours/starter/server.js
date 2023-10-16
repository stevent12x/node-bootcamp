const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Uncaught exceptions put the entire node process in an unclean state -
// we should crash the app and restart
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port: ${port}...`);
});

// Last resort error handling
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
