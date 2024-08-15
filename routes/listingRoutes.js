const express = require("express");
const {
  getAllListings,
  createListing,
} = require("../controllers/listingController");

const router = express.Router();

router.get("/", getAllListings);
router.post("/", createListing);

// Other routes for update, delete can be added here...

module.exports = router;
