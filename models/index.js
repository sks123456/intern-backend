const User = require("./userModel");
const Contact = require("./contactModel");
const Listing = require("./listingModel");
const Wallet = require("./userwalletModel");
const Coin = require("./coinsModel");
const EwalletTransaction = require("./walletTransactionModel"); // Import the transaction model

// User model associations
User.hasMany(Contact, { foreignKey: "user_id" });
Contact.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Wallet, { foreignKey: "user_id" });
Wallet.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(EwalletTransaction, { foreignKey: "userId" }); // Alias 'listings' for User model
EwalletTransaction.belongsTo(User, { foreignKey: "userId" }); // Transaction belongs to a Wallet

// Wallet model associations
Wallet.hasMany(Listing, { foreignKey: "wallet_id" });
Listing.belongsTo(Wallet, { foreignKey: "wallet_id" });

Wallet.hasMany(EwalletTransaction, { foreignKey: "walletId" }); // Wallet can have many transactions
EwalletTransaction.belongsTo(Wallet, { foreignKey: "walletId" }); // Transaction belongs to a Wallet

// Coin model associations
Coin.hasMany(Wallet, { foreignKey: "coin_id" });
Wallet.belongsTo(Coin, { foreignKey: "coin_id" });

Coin.hasMany(Listing, { foreignKey: "payBy" });
Listing.belongsTo(Coin, { foreignKey: "payBy" });

Coin.hasMany(EwalletTransaction, { foreignKey: "coinId" }); // Coin can be associated with many transactions
EwalletTransaction.belongsTo(Coin, { foreignKey: "coinId" }); // Transaction belongs to a Coin

// Listing model associations
Listing.belongsTo(User, { foreignKey: "wallet_id", as: "user" }); // Alias 'user' for Listing model

Listing.hasMany(EwalletTransaction, { foreignKey: "listingId" }); // If transactions can be associated with listings
EwalletTransaction.belongsTo(Listing, { foreignKey: "listingId" }); // Transaction belongs to a Listing

module.exports = {
  User,
  Contact,
  Listing,
  Wallet,
  Coin,
  EwalletTransaction, // Export the transaction model
};
