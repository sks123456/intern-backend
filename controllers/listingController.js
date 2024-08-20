const asyncHandler = require("express-async-handler");
const { Listing, Wallet, User, Coin } = require("../models"); // Ensure correct imports

// @desc Get all listings with user data
// @route GET /api/listings
// @access public
const getListings = asyncHandler(async (req, res) => {
  try {
    const listings = await Listing.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "category",
        "price",
        "wallet_id",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Wallet,
          attributes: ["user_id"], // No attributes from Wallet
          include: [
            {
              model: User,
              as: "user", // Use the alias 'user'
              attributes: ["username"],
            },
          ],
        },
        {
          model: Coin,
          attributes: ["symbol"],
        },
      ],
    });

    // Format the listings to include the username and coin symbol directly
    const formattedListings = listings.map((listing) => {
      // Ensure to check if associated data exists
      const wallet = listing.Wallet || {};
      const user = wallet.user || {};
      const coin = listing.Coin || {};

      return {
        ...listing.toJSON(),
        username: user.username,
        symbol: coin.symbol,
      };
    });

    res.json(formattedListings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

module.exports = {
  getListings,
};

module.exports = {
  getListings,
};

//@desc create a listing
//@route public /api/listings
//@access public
const createListing = async (req, res) => {
  const { title, description, category, price, wallet_id } = req.body;

  // Handling file
  // const image = req.files.image ? req.files.image[0] : null;

  try {
    const newListing = await db.Listing.create({
      title,
      description,
      category,
      price,
      wallet_id,
      user_id: req.user.id,
      // Optionally handle image upload path
    });
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Other methods like updateListing, deleteListing can be added here...

module.exports = { getListings, createListing };
