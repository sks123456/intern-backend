const asyncHandler = require("express-async-handler");
const {
  Listing,
  Wallet,
  User,
  Coin,
  EwalletTransaction,
} = require("../models"); // Ensure correct imports
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

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    console.log(
      `Starting purchase process for user ID: ${userId}, listing ID: ${listingId}`
    );

    // Fetch the listing and check if it's available
    const listing = await Listing.findOne({
      where: { id: listingId, sold: false },
      include: [
        { model: Wallet, attributes: ["id", "user_id"] },
        { model: Coin, attributes: ["id", "symbol"] },
      ],
      transaction,
      lock: true,
    });

    if (!listing) {
      console.log("Listing not found or already sold");
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Listing not found or already sold" });
    }

    console.log(
      `Listing found: ${listing.title} (Price: ${listing.price} ${listing.payBy})`
    );

    // Fetch buyer's wallet for the relevant coin
    const buyerWallet = await Wallet.findOne({
      where: { user_id: userId, coin_id: listing.payBy },
      transaction,
      lock: true,
    });

    if (!buyerWallet) {
      console.log("Buyer wallet not found");
      await transaction.rollback();
      return res.status(404).json({ message: "Wallet not found" });
    }

    console.log(`Buyer wallet found. Current balance: ${buyerWallet.balance}`);

    // Check if the buyer has enough balance
    if (buyerWallet.balance < listing.price) {
      console.log("Insufficient balance for the purchase");
      await transaction.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct the price from the buyer's wallet
    buyerWallet.balance -= listing.price;
    await buyerWallet.save({ transaction });
    console.log(
      `Deducted ${listing.price} from buyer's wallet. New balance: ${buyerWallet.balance}`
    );

    // Create a transaction record for the buyer's wallet
    await EwalletTransaction.create(
      {
        userId: buyerWallet.user_id,
        walletId: buyerWallet.id,
        coinId: buyerWallet.coin_id,
        type: "transfer",
        status: "completed",
        amount: listing.price,
        description: `Purchase of listing ${listingId}`,
        date: new Date(),
        listingId: listing.id,
      },
      { transaction }
    );

    // Find the seller's wallet
    const sellerWallet = await Wallet.findOne({
      where: { id: listing.wallet_id },
      transaction,
      lock: true,
    });

    if (!sellerWallet) {
      console.log("Seller wallet not found");
      await transaction.rollback();
      return res.status(404).json({ message: "Seller's wallet not found" });
    }

    // Add the price to the seller's wallet
    sellerWallet.balance += listing.price;
    await sellerWallet.save({ transaction });
    console.log(
      `Added ${listing.price} to seller's wallet (ID: ${sellerWallet.id}). New balance: ${sellerWallet.balance}`
    );

    // Create a transaction record for the seller's wallet
    await EwalletTransaction.create(
      {
        userId: sellerWallet.user_id,
        walletId: sellerWallet.id,
        coinId: sellerWallet.coin_id,
        type: "deposit",
        amount: listing.price,
        description: `Sale of listing ${listingId}`,
        date: new Date(),
        listingId: listing.id,
        status: "completed",
      },
      { transaction }
    );

    // Transfer ownership
    listing.wallet_id = buyerWallet.id;
    listing.sold = true;
    await listing.save({ transaction });
    console.log(
      `Listing ownership transferred to buyer's wallet (ID: ${buyerWallet.id}) and marked as sold`
    );

    // Commit the transaction
    await transaction.commit();
    console.log("Transaction committed successfully");

    res.status(200).json({ message: "Purchase successful", listing });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error("Transaction failed and rolled back due to error:", error);
    res.status(500).json({ message: "Purchase failed" });
  }
});

// Other methods like updateListing, deleteListing can be added here...

module.exports = { getListings, createListing, purchaseItem };
