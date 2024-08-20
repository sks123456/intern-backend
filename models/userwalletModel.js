const { DataTypes } = require("sequelize");
const sequelize = require("../config/testConnection");
const User = require("./userModel");

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
        model: User,
        key: "id",
      },
    },
    coin: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., 'BTC', 'ETH', 'XRP'
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

Wallet.belongsTo(User, { foreignKey: "user_id" });

module.exports = Wallet;
