const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, getMintInfo } = require("@solana/spl-token");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function getTokenAccountsByOwner(ownerPublicKey) {
  try {
    const publicKey = new PublicKey(ownerPublicKey);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    console.log("Token Accounts:", tokenAccounts);

    return tokenAccounts;
  } catch (error) {
    console.error("Error fetching token accounts:", error);
    throw error;
  }
}

async function getTokenDetails(tokenMintAddress) {
  try {
    const mintPublicKey = new PublicKey(tokenMintAddress);

    // Fetch mint info using the connection
    const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);

    if (mintInfo.value) {
      const data = mintInfo.value.data.parsed.info;
      return data;
    } else {
      throw new Error("Mint info not found");
    }
  } catch (error) {
    console.error("Error fetching token details:", error);
    throw error;
  }
}

module.exports = {
  getTokenAccountsByOwner,
  getTokenDetails,
};
