const express = require("express");
const formidable = require("formidable");
const {
  getAllListings,
  createListing,
} = require("../controllers/listingController");
const validateToken = require("../middleware/validateTokenHandler");
const { parseFormData } = require("../middleware/parseFormData");

const router = express.Router();

// Routes
router.get("/", getAllListings);

// Apply validateToken middleware to protect the createListing route
router.post("/", validateToken, parseFormData, createListing);

module.exports = router;
