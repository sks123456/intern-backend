const User = require("./userModel");
const Contact = require("./contactModel");

// Define associations
User.hasMany(Contact, { foreignKey: "userId" });
Contact.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  Contact,
};
