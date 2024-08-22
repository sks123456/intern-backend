const { DataTypes } = require("sequelize");
const sequelize = require("../config/testConnection");
const User = require("./userModel");
const Coin = require("./coinsModel");

const Wallet = sequelize.define(
  "wallet",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
    },
    coin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(18, 8), // Higher precision for cryptocurrencies
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "wallets",
    timestamps: true,
  }
);

module.exports = Wallet;
