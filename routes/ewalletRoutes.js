const express = require("express");
const {
  getWallets,
  deposit,
  purchase,
  createWallet,
  withdraw,
  deleteWallet,
} = require("../controllers/ewalletController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();
router.use(validateToken);

router.get("/", getWallets);
router.post("/", createWallet);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/purchase", purchase);
router.post("/delete", deleteWallet);

module.exports = router;
