const express = require("express");
const {
  getWallets,
  deposit,
  createWallet,
  withdraw,
  deleteWallet,
  getAvailableCoins,
  getTransactionHistory,
} = require("../controllers/ewalletController");
const validateToken = require("../middlewares/validateTokenHandler");

const router = express.Router();
router.use(validateToken);

router.get("/", getWallets);
router.post("/create-wallet", createWallet);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/delete", deleteWallet);
router.get("/availableCoins", getAvailableCoins);
router.post("/transactionHistory", getTransactionHistory);

module.exports = router;
