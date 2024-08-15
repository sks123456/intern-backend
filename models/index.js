const User = require("./userModel");
const Contact = require("./contactModel");
const Listing = require("./listingModel");

// Define associations
User.hasMany(Contact, { foreignKey: "user_id" });
Contact.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Contact, { foreignKey: "user_id" });
Listing.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  User,
  Contact,
  Listing,
};
