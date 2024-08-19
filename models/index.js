const User = require("./userModel");
const Contact = require("./contactModel");
const Listing = require("./listingModel");
const Wallet = require("./userwalletModel");
const Coin = require("./coinsModel");

// Define associations
User.hasMany(Contact, { foreignKey: "user_id" });
Contact.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Contact, { foreignKey: "user_id" });
Wallet.hasMany(Listing, { foreignKey: "wallet_id" });
Listing.belongsTo(Wallet, { foreignKey: "wallet_id" });
Listing.hasMany(Coin, { foreignKey: "payBy" });
Coin.belongsTo(Listing, { foreignKey: "payBy" });

module.exports = {
  User,
  Contact,
  Listing,
  Wallet,
};
