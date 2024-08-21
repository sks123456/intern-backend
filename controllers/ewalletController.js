const {
  Wallet,
  User,
  Coin,
  EwalletTransaction,
  Listing,
} = require("../models/index");

const createWallet = async (req, res) => {
  const { coin_id } = req.body; // e.g., 'BTC', 'ETH', 'XRP'
  const user_id = req.user.id; // Assuming user ID is extracted from token

  if (!coin_id) {
    return res.status(400).json({ message: "Coin type is required" });
  }

  try {
    // Check if wallet already exists for the user and coin
    const existingWallet = await Wallet.findOne({
      where: { user_id, coin_id },
    });
    if (existingWallet) {
      return res
        .status(400)
        .json({ message: "Wallet for this coin already exists" });
    }

    // Create new wallet
    const newWallet = await Wallet.create({
      user_id,
      coin_id,
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
    // Fetch wallets with associated coins
    const wallets = await Wallet.findAll({
      where: { user_id },
      include: [
        {
          model: Coin,
          attributes: ["id", "name", "symbol"], // Adjust attributes if needed
        },
      ],
    });

    // Return the wallets with coin details
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wallets", error });
  }
};
const getTransactionHistory = async (req, res) => {
  const { walletId } = req.body;
  if (!walletId) {
    return res.status(400).json({ error: "wallet_id is required" });
  }

  try {
    // Fetch transaction history with associated coins, listings, and user details
    const transactions = await EwalletTransaction.findAll({
      where: { walletId },
      include: [
        {
          model: Coin,
          attributes: ["id", "name", "symbol"], // Adjust attributes for Coin if needed
        },
        {
          model: Listing,
          attributes: ["id", "title", "price"], // Adjust attributes for Listing if needed
          required: false, // This ensures that the Listing data is included only if listingId is not null
        },
        {
          model: User,
          attributes: ["username"], // Adjust attributes for User if needed
        },
      ],
    });

    // Return the transactions with associated details
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res
      .status(500)
      .json({ message: "Error fetching transaction history", error });
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
    wallet.balance = (currentBalance + depositAmount).toFixed(8);

    await wallet.save();

    // Record the deposit transaction
    await EwalletTransaction.create({
      userId,
      walletId,
      coinId: wallet.coin_id, // Assuming wallet has a coin_id field
      type: "deposit",
      status: "completed",
      amount: depositAmount,
      description: `Deposit of ${depositAmount} to wallet ${walletId}`,
    });

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

    // Record the withdrawal transaction
    await EwalletTransaction.create({
      userId,
      walletId,
      coinId: wallet.coin_id, // Assuming wallet has a coin_id field
      type: "withdrawal",
      status: "completed",
      amount: withdrawalAmount,
      description: `Withdrawal of ${withdrawalAmount} from wallet ${walletId}`,
    });

    res.json({ message: "Withdrawal successful", balance: wallet.balance });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ message: "Error processing withdrawal", error });
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

const getAvailableCoins = async (req, res) => {
  try {
    const coins = await Coin.findAll();
    res.json(coins);
  } catch (error) {
    console.error("Error fetching available coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getWallets,
  deposit,
  createWallet,
  withdraw,
  deleteWallet,
  getAvailableCoins,
  getTransactionHistory,
};
