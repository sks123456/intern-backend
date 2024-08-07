// to implement connection towards mongodb
const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    // connecting with the connection string that is being init in .env
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Database connected: ",connect.connection.host,connect.connection.name)
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;