// config/dbConnection.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();

// Create a new instance of Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql", // Specify the SQL dialect
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Database connected successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1); // Exit the process on failure
  }
};

testConnection();

module.exports = sequelize; // Make sure this exports the sequelize instance
