const User = require("./User");
const Contact = require("./Contact");

// Define associations
User.hasMany(Contact, { foreignKey: "userId" });
Contact.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  Contact,
};
