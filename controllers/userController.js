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

  // Input validation
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  // Finding user with the param email
  const user = await User.findOne({ where: { email } });
  console.log(user);

  // Compare pass with hashed pass
  if (user && (await bcrypt.compare(password, user.password))) {
    // Create access token using jwt
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      // Token secret key in .env
      process.env.ACCESS_TOKEN_SECRET,
      {
        // Token validation duration
        expiresIn: "30m",
      }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Email or Password is not valid");
  }
});

//@desc Current user info
//@route Get /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
