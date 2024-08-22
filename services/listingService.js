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
      transaction: tx, // Correct transaction option
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
      transaction: tx,
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
    await buyerWallet.save({ transaction: tx });

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
      { transaction: tx }
    );

    console.log("Buyer transaction recorded successfully");

    // Fetch and update seller's wallet for payment
    const sellerWallet = await Wallet.findOne({
      where: { id: listing.wallet_id },
      transaction: tx,
      lock: true,
    });

    if (!sellerWallet) {
      console.log("Seller wallet not found");
      await tx.rollback();
      return { success: false, error: "Seller's wallet not found" };
    }

    sellerWallet.balance += listing.price;
    await sellerWallet.save({ transaction: tx });

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
      { transaction: tx }
    );

    console.log("Seller transaction recorded successfully");

    // Handle the transfer of `mercQuantity` from seller to buyer
    const sellerOutWallet = await Wallet.findOne({
      where: { id: listing.wallet_id_out },
      transaction: tx,
      lock: true,
    });

    if (!sellerOutWallet || sellerOutWallet.balance < listing.mercQuantity) {
      console.log("Insufficient mercQuantity in seller's wallet");
      await tx.rollback();
      return {
        success: false,
        error: "Insufficient quantity for the transfer",
      };
    }

    sellerOutWallet.balance -= listing.mercQuantity;
    await sellerOutWallet.save({ transaction: tx });

    console.log(
      `Deducted ${listing.mercQuantity} from seller's outgoing wallet. New balance: ${sellerOutWallet.balance}`
    );

    await EwalletTransaction.create(
      {
        userId: sellerOutWallet.user_id,
        walletId: sellerOutWallet.id,
        coinId: sellerOutWallet.coin_id,
        type: "transfer",
        amount: listing.mercQuantity,
        description: `Transfered quantity for listing ${listingId}`,
        date: new Date(),
        listingId: listing.id,
        status: "completed",
      },
      { transaction: tx }
    );

    // Credit `mercQuantity` to buyer's wallet
    const buyerMercWallet = await Wallet.findOne({
      where: { user_id: userId, coin_id: listing.mercUnit },
      transaction: tx,
      lock: true,
    });

    if (!buyerMercWallet) {
      console.log("Creating new wallet for the buyer for mercUnit");
      // If buyer doesn't have a wallet for mercUnit, create one
      buyerMercWallet = await Wallet.create(
        {
          user_id: userId,
          coin_id: listing.mercUnit,
          balance: listing.mercQuantity,
        },
        { transaction: tx }
      );
    } else {
      buyerMercWallet.balance += listing.mercQuantity;
      await buyerMercWallet.save({ transaction: tx });
    }

    console.log(
      `Added ${listing.mercQuantity} to buyer's wallet. New balance: ${buyerMercWallet.balance}`
    );

    await EwalletTransaction.create(
      {
        userId: buyerMercWallet.user_id,
        walletId: buyerMercWallet.id,
        coinId: buyerMercWallet.coin_id,
        type: "deposit",
        amount: listing.mercQuantity,
        description: `Received quantity for listing ${listingId}`,
        date: new Date(),
        listingId: listing.id,
        status: "completed",
      },
      { transaction: tx }
    );

    console.log("Buyer received quantity transaction recorded successfully");

    // Update listing ownership and mark as sold
    listing.wallet_id = buyerWallet.id;
    listing.sold = true;
    await listing.save({ transaction: tx });

    console.log(`Listing ownership transferred to buyer and marked as sold`);

    // Commit the transaction
    await tx.commit();
    console.log("Transaction committed successfully");

    return { success: true, listing };
  } catch (error) {
    // Rollback in case of failure
    console.error("Transaction failed, rolling back. Error:", error);
    await tx.rollback();
    return { success: false, error: "Transaction failed" };
  }
};

module.exports = { purchaseListing };
