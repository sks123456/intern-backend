const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Register a user
//@route Post /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Input validation
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  // Finding similar users
  const userAvailable = await User.findOne({ where: { email } });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered");
  }

  // Hash Password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);

  // Create user obj
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  console.log(`User created${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data not valid");
  }
});

//@desc Login user
//@route Post /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      res.status(400);
      throw new Error("All fields are mandatory");
  }

  // Mock user data
  const mockUser = {
      id: 1,
      name: "abcd",
      username: 'abcd1234',
      email: 'aa@qq.com',
      password: await bcrypt.hash('11111', 10), // Still hash the password for future reference
      role: 'admin',
      level: 3,
  };

  // Bypass password comparison and allow login
  if (email === mockUser.email) {
      const accessToken = jwt.sign(
          {
              user: {
                  username: mockUser.username,
                  email: mockUser.email,
                  id: mockUser.id,
                  role: 'member'
              },
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
              expiresIn: "15m",
          }
      );
      console.log("accessToken", accessToken);
      res.status(200).json({ accessToken });
  } else {
      res.status(401);
      throw new Error("Email not valid");
  }

});


//@desc Current user info
//@route Get /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  const mockUser = {
    id: 1,
    name: "abcd",
    username: "abcd1234",
    email: "aa@qq.com",
    password: await bcrypt.hash('11111', 10), // Hashing the password for consistency
    role: "admin",
    level: 3,
  };

  // Add headers to disable caching
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  // Log mock user data
  console.log("Returning mock user:", mockUser);

  // Return the mock user data instead of querying the database
  return res.json(mockUser);
});


module.exports = { registerUser, loginUser, currentUser };
