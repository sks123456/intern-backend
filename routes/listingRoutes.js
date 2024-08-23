const express = require("express");
const formidable = require("formidable");
const {
  getListings,
  createListing,
  purchaseItem,
} = require("../controllers/listingController");
const validateToken = require("../middlewares/validateTokenHandler");
const { parseFormData } = require("../middlewares/parseFormData");

const router = express.Router();

// Routes
router.get("/", getListings);

// Apply validateToken middlewares to protect the createListing route
router.post("/", validateToken, parseFormData, createListing);
router.post("/purchase", validateToken, purchaseItem);

module.exports = router;
