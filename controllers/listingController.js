const db = require("../models");

//@desc get all Listings
//@route public /api/listings
//@access public
const getAllListings = async (req, res) => {
  try {
    const listings = await db.Listing.findAll();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//@desc create a listing
//@route public /api/listings
//@access public
const createListing = async (req, res) => {
  const { title, description, category, price } = req.body;

  // Handling file
  // const image = req.files.image ? req.files.image[0] : null;

  try {
    const newListing = await db.Listing.create({
      title,
      description,
      category,
      price,
      user_id: req.user.id,
      // Optionally handle image upload path
    });
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Other methods like updateListing, deleteListing can be added here...

module.exports = { getAllListings, createListing };
