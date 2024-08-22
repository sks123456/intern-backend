const {
  sequelize,
  Listing,
  Wallet,
  Coin,
  EwalletTransaction,
} = require("../models");

const purchaseListing = async (listingId, userId, tx) => {
  try {
    console.log(
      `Initiating purchase process. Listing ID: ${listingId}, User ID: ${userId}`
    );

    // Fetch listing and ensure it's available
    const listing = await Listing.findOne({
      where: { id: listingId, sold: false },
      include: [
        { model: Wallet, attributes: ["id", "user_id"] },
        { model: Coin, attributes: ["id", "symbol"] },
      ],
      tx,
      lock: true,
    });

    if (!listing) {
      console.log("Listing not found or already sold");
      await tx.rollback();
      return { success: false, error: "Listing not found or already sold" };
    }

    console.log(
      `Listing found: ${listing.title}, Price: ${listing.price} ${listing.payBy}`
    );

    // Fetch buyer's wallet
    const buyerWallet = await Wallet.findOne({
      where: { user_id: userId, coin_id: listing.payBy },
      tx,
      lock: true,
    });

    if (!buyerWallet) {
      console.log("Buyer wallet not found");
      await tx.rollback();
      return { success: false, error: "Wallet not found" };
    }

    console.log(`Buyer wallet found. Current balance: ${buyerWallet.balance}`);

    // Check balance
    if (buyerWallet.balance < listing.price) {
      console.log("Insufficient balance for the purchase");
      await tx.rollback();
      return { success: false, error: "Insufficient balance" };
    }

    // Deduct from buyer's wallet and record tx
    buyerWallet.balance -= listing.price;
    await buyerWallet.save({ tx });

    console.log(
      `Deducted ${listing.price} from buyer's wallet. New balance: ${buyerWallet.balance}`
    );

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
      { tx }
    );

    console.log("Buyer tx recorded successfully");

    // Fetch and update seller's wallet
    const sellerWallet = await Wallet.findOne({
      where: { id: listing.wallet_id },
      tx,
      lock: true,
    });

    if (!sellerWallet) {
      console.log("Seller wallet not found");
      await tx.rollback();
      return { success: false, error: "Seller's wallet not found" };
    }

    sellerWallet.balance += listing.price;
    await sellerWallet.save({ tx });

    console.log(
      `Added ${listing.price} to seller's wallet. New balance: ${sellerWallet.balance}`
    );

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
      { tx }
    );

    console.log("Seller tx recorded successfully");

    // Update listing ownership and mark as sold
    listing.wallet_id = buyerWallet.id;
    listing.sold = true;
    await listing.save({ tx });

    console.log(`Listing ownership transferred to buyer and marked as sold`);

    // Commit tx
    await tx.commit();
    console.log("tx committed successfully");

    return { success: true, listing };
  } catch (error) {
    // Rollback in case of failure
    console.error("tx failed, rolling back. Error:", error);
    await tx.rollback();
    return { success: false, error: "tx failed" };
  }
};

module.exports = { purchaseListing };
