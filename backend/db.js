
const mongoose = require('mongoose');



const main=async()=> {
  await mongoose.connect('mongodb://127.0.0.1:27017/users');
  console.log(`server is connected to database`)
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main().catch(err => console.log(err));

module.exports = main