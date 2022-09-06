// Imports          /// Major Doubt about unique property not working discuss later
const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
// setting up config
dotenv.config({path: `${__dirname}/../config.env`})
// // reading dev data
const devData = JSON.parse(fs.readFileSync(`${__dirname}/../dev_data/tours.json`));
// console.log(devData[0]);
// // establishing DB connectijon
// mongoose.connect(process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     useCreateIndex: true, //make this true
//     autoIndex: true, //make this also true
// }),() => console.log('DB connected'));
// console.log(process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD));

// // Uploading DevData
// Tour.create(devData).then(() => {
//     console.log('everything worked fine')
//     process.exit();
// }).catch((err) => {
//     console.log('BC fuck ho gaya');
//     console.log(err);
//     process.exit();
// });
const DB = process.env.DB.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD
  );
  
  mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful!'));
  
  // IMPORT DATA INTO DB
  const importData = async () => {
    try {
      await Tour.create(devData);
      console.log('Data successfully loaded!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };
  
  // DELETE ALL DATA FROM DB
  const deleteData = async () => {
    try {
      await Tour.deleteMany();
      console.log('Data successfully deleted!');
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