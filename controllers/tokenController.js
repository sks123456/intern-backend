const {
  getTokenAccountsByOwner,
  getTokenDetails,
  getProgramAccounts,
} = require("../config/solanaClient");

async function fetchProgramAccounts(req, res) {
  try {
    const { programId } = req.params;
    const programAccounts = await getProgramAccounts(programId);
    res.json(programAccounts);
  } catch (error) {
    console.error("Error in fetchProgramAccounts:", error);
    res.status(500).json({
      error: "Failed to fetch program accounts",
      details: error.message,
    });
  }
}

async function fetchTokenAccounts(req, res) {
  try {
    const { ownerPublicKey } = req.params; // Get ownerPublicKey from URL params
    const tokenAccounts = await getTokenAccountsByOwner(ownerPublicKey);

    // Fetch details for each token mint found in token accounts
    const tokenDetailsPromises = tokenAccounts.value.map(async (account) => {
      const tokenMintAddress = account.account.data.parsed.info.mint;
      const tokenDetails = await getTokenDetails(tokenMintAddress);
      return { ...account, tokenDetails };
    });

    const tokenAccountsWithDetails = await Promise.all(tokenDetailsPromises);

    res.json(tokenAccountsWithDetails);
  } catch (error) {
    console.error("Error in fetchTokenAccounts:", error);
    res.status(500).json({
      error: "Failed to fetch token accounts",
      details: error.message,
    });
  }
}

module.exports = {
  fetchTokenAccounts,
  fetchProgramAccounts,
};
