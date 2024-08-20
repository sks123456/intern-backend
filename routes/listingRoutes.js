const express = require("express");
const formidable = require("formidable");
const {
  getListings,
  createListing,
  purchaseItem,
} = require("../controllers/listingController");
const validateToken = require("../middleware/validateTokenHandler");
const { parseFormData } = require("../middleware/parseFormData");

const router = express.Router();

// Routes
router.get("/", getListings);

// Apply validateToken middleware to protect the createListing route
router.post("/", validateToken, parseFormData, createListing);
router.post("/purchase", validateToken, purchaseItem);

module.exports = router;
