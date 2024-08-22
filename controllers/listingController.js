const asyncHandler = require("express-async-handler");
const {
  Listing,
  Wallet,
  User,
  Coin,
  EwalletTransaction,
} = require("../models"); // Ensure correct imports
const { purchaseListing } = require("../services/listingService");

const sequelize = require("../config/testConnection"); // Adjust to the correct path

// @desc Get all listings with user data
// @route GET /api/listings
// @access public
const getListings = asyncHandler(async (req, res) => {
  try {
    const listings = await Listing.findAll({
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

//@desc create a listing
//@route public /api/listings
//@access public
const createListing = async (req, res) => {
  const { title, description, category, price, wallet_id, pay_by } = req.body;

  // Handling file
  // const image = req.files.image ? req.files.image[0] : null;

  try {
    const newListing = await Listing.create({
      title,
      description,
      category,
      price,
      wallet_id,
      payBy: pay_by,
      user_id: req.user.id,
      // Optionally handle image upload path
    });
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc Handle the purchase of a listing
// @route POST /api/marketplace/purchase
// @access Protected

const purchaseItem = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  const userId = req.user.id;
  const tx = await sequelize.transaction();

  try {
    console.log("entering services");

    const { success, listing, error } = await purchaseListing(
      listingId,
      userId,
      tx
    );

    if (success) {
      res.status(200).json({ message: "Purchase successful", listing });
    } else {
      res.status(400).json({ message: error });
    }
  } catch (error) {
    res.status(500).json({ message: "Purchase failed" });
  }
});
// Other methods like updateListing, deleteListing can be added here...

module.exports = { getListings, createListing, purchaseItem };
