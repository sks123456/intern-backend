const express = require("express");
const {
  getWallets,
  deposit,
  purchase,
  createWallet,
  withdraw,
  deleteWallet,
  getAvailableCoins,
} = require("../controllers/ewalletController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();
router.use(validateToken);

router.get("/", getWallets);
router.post("/create-wallet", createWallet);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/purchase", purchase);
router.post("/delete", deleteWallet);
router.get("/availableCoins", getAvailableCoins);

module.exports = router;
