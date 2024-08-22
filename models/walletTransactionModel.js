const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/testConnection");

class EwalletTransaction extends Model {}

EwalletTransaction.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
      comment: "User associated with this transaction.",
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "wallet", // Adjust if your table name is different
        key: "id",
      },
      comment: "Wallet associated with this transaction.",
    },
    type: {
      type: DataTypes.ENUM(
        "deposit",
        "reward",
        "withdrawal",
        "transfer",
        "conversion"
      ),
      allowNull: false,
      comment: "Type of the transaction.",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
      defaultValue: "pending",
      comment: "Current status of the transaction.",
    },
    amount: {
      type: DataTypes.DECIMAL(25, 8),
      allowNull: false,
      comment: "Amount of the transaction.",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description or note for the transaction.",
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Date and time of the transaction.",
    },
  },
  {
    sequelize,
    modelName: "ewalletTransaction",
    tableName: "ewallettransactions",
    timestamps: false,
  }
);

module.exports = EwalletTransaction;
