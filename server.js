const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const sequelize = require("./config/testConnection"); // Import the sequelize instance
const { User, Contact } = require("./models"); // Import models
const {
  fetchTokenAccounts,
  fetchTokenDetails,
  fetchProgramAccounts,
} = require("./controllers/tokenController");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 5001;

// Define allowed origins
const allowedOrigins = ["http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      process.env.FRONTEND_URL === "*"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Define routes
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/eWallet", require("./routes/ewalletRoutes"));
app.use("/api/token", require("./routes/tokenRoutes"));

// Error handler middleware
app.use(errorHandler);

// Sync models with database
sequelize
  .sync({ force: false })
  .then(() => console.log("Models synced with the database"))
  .catch((err) => console.error("Error syncing models:", err));

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
