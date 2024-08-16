const Wallet = require("../models/userwalletModel");
const User = require("../models/userModel");

const createWallet = async (req, res) => {
  const { coin } = req.body; // e.g., 'BTC', 'ETH', 'XRP'
  const user_id = req.user.id; // Assuming user ID is extracted from token

  if (!coin) {
    return res.status(400).json({ message: "Coin type is required" });
  }

  try {
    // Check if wallet already exists for the user and coin
    const existingWallet = await Wallet.findOne({ where: { user_id, coin } });
    if (existingWallet) {
      return res
        .status(400)
        .json({ message: "Wallet for this coin already exists" });
    }

    // Create new wallet
    const newWallet = await Wallet.create({
      user_id,
      coin,
      balance: 0, // Initialize balance to 0
    });

    res.status(201).json({
      message: "Wallet created successfully",
      wallet: newWallet,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating wallet", error });
  }
};

const getWallets = async (req, res) => {
  const user_id = req.user.id;
  console.log(req.user.id);

  try {
    const wallets = await Wallet.findAll({ where: { user_id } });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wallets", error });
  }
};

const deposit = async (req, res) => {
  const { walletId, amount } = req.body;
  const userId = req.user.id;

  if (!walletId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  try {
    // Find the wallet by ID and ensure it belongs to the user
    const wallet = await Wallet.findOne({
      where: { id: walletId, user_id: userId },
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Ensure the amount is a number and convert it to a float
    const depositAmount = parseFloat(amount);

    // Validate conversion
    if (isNaN(depositAmount)) {
      return res.status(400).json({ message: "Invalid amount format" });
    }

    // Convert wallet balance to a number
    const currentBalance = parseFloat(wallet.balance);

    // Ensure balance update maintains precision
    wallet.balance = (currentBalance + depositAmount).toFixed(8); // Ensure precision

    await wallet.save();

    res.json({ message: "Deposit successful", balance: wallet.balance });
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({ message: "Error processing deposit", error });
  }
};

const withdraw = async (req, res) => {
  const { walletId, amount } = req.body;
  const userId = req.user.id;

  if (!walletId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal request" });
  }

  try {
    // Find the wallet by ID and ensure it belongs to the user
    const wallet = await Wallet.findOne({
      where: { id: walletId, user_id: userId },
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Ensure the amount is a number and convert it to a float
    const withdrawalAmount = parseFloat(amount);

    // Validate conversion
    if (isNaN(withdrawalAmount)) {
      return res.status(400).json({ message: "Invalid amount format" });
    }

    // Ensure wallet has sufficient balance
    if (wallet.balance < withdrawalAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct the amount from the wallet balance
    wallet.balance -= withdrawalAmount;
    await wallet.save();

    res.json({ message: "Withdrawal successful", balance: wallet.balance });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ message: "Error processing withdrawal", error });
  }
};

const purchase = async (req, res) => {
  const { coin, amount, listingId } = req.body;
  const user_id = req.user.id;

  if (!amount || amount <= 0 || !listingId) {
    return res.status(400).json({ message: "Invalid purchase request" });
  }

  try {
    // Find the user's wallet for the specified coin
    const wallet = await Wallet.findOne({ where: { user_id: user_id, coin } });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Ensure the wallet has sufficient balance
    const purchaseAmount = parseFloat(amount);
    if (wallet.balance < purchaseAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Find the listing by ID
    const listing = await Listing.findOne({ where: { id: listingId } });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Ensure the amount matches the listing price
    if (purchaseAmount < listing.price) {
      return res
        .status(400)
        .json({ message: "Amount is less than listing price" });
    }

    // Deduct the amount from the wallet
    wallet.balance -= purchaseAmount;
    await wallet.save();

    // Handle the listing purchase logic here
    // Example: mark the listing as sold or remove it from the marketplace
    // listing.sold = true;
    // await listing.save();

    res.json({ message: "Purchase successful", balance: wallet.balance });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: "Error processing purchase", error });
  }
};

/**
 * Delete a wallet by ID.
 */
const deleteWallet = async (req, res) => {
  const { walletId } = req.body;

  try {
    // Check if the wallet exists
    const wallet = await Wallet.findByPk(walletId);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Delete the wallet
    await wallet.destroy();
    return res.status(200).json({ message: "Wallet deleted successfully" });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getWallets,
  deposit,
  purchase,
  createWallet,
  withdraw,
  deleteWallet,
};
