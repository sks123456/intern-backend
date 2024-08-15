const express = require("express");
const formidable = require("formidable");
const {
  getAllListings,
  createListing,
} = require("../controllers/listingController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

// Middleware to parse FormData
const parseFormData = (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }
    req.body = fields;
    console.log(req.body);

    next();
  });
};

// Routes
router.get("/", getAllListings);

// Apply validateToken middleware to protect the createListing route
router.post("/", validateToken, parseFormData, createListing);

module.exports = router;
