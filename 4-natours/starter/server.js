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

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`App running on port: ${port}...`);
});
