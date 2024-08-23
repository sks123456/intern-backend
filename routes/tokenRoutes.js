const express = require("express");
const {
  fetchProgramAccounts,
  fetchTokenAccounts,
} = require("../controllers/tokenController");

const router = express.Router();

// Routes
router.get("/token-accounts/:ownerPublicKey", fetchTokenAccounts);
router.get("/program-accounts/:programId", fetchProgramAccounts);
module.exports = router;
