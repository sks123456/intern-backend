const User = require("./userModel");
const Contact = require("./contactModel");
const Listing = require("./listingModel");
const Wallet = require("./userwalletModel");
const Coin = require("./coinsModel");

// Define associations

// User model
User.hasMany(Contact, { foreignKey: "user_id" });
Contact.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Wallet, { foreignKey: "user_id" }); // Wallet belongs to User
Wallet.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Listing, { foreignKey: "wallet_id", as: "listings" }); // Alias 'listings' for User model

// Wallet model
Wallet.hasMany(Listing, { foreignKey: "wallet_id" });
Listing.belongsTo(Wallet, { foreignKey: "wallet_id" });

// Coin model
Coin.hasMany(Listing, { foreignKey: "payBy" });
Listing.belongsTo(Coin, { foreignKey: "payBy" });

// Listing model
Listing.belongsTo(User, { foreignKey: "wallet_id", as: "user" }); // Alias 'user' for Listing model

// Define associations
Wallet.belongsTo(Coin, { foreignKey: "coin_id" });
Coin.hasMany(Wallet, { foreignKey: "coin_id" });
module.exports = {
  User,
  Contact,
  Listing,
  Wallet,
  Coin,
};
