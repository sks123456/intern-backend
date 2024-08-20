// src/models/coin.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/testConnection"); // Adjust to the correct path

const Coin = sequelize.define(
  "coin",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "coins",
  }
);

module.exports = Coin;
