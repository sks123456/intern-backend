const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/testConnection"); // Adjust to the correct path

const Listing = sequelize.define(
  "listing",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    mercQuantity: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    mercUnit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "coins",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    payBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "coins",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "wallets",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    wallet_id_out: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "wallets",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    sold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "listings",
    timestamps: true,
    updatedAt: "updatedAt",
    createdAt: "createdAt",
  }
);

module.exports = Listing;
