const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    Account,
    SystemProgram,
    sendAndConfirmTransaction,
} = require("@solana/web3.js");

const getWalletBalance = async (publicKey) => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const walletBalance = await connection.getBalance(
        new PublicKey(publicKey)
      );
      console.log(`=> For wallet address ${publicKey}`);
      console.log(`   Wallet balance: ${parseInt(walletBalance)/LAMPORTS_PER_SOL}SOL`);
      return parseInt(walletBalance)/LAMPORTS_PER_SOL
    } catch (err) {
      console.log(err);
    }
}

const transferSOL = async (from, to, amount) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(from.publicKey.toString()),
                toPubkey: new PublicKey(to.publicKey.toString()),
                lamports: amount * LAMPORTS_PER_SOL
            })
        )
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        )
        return signature;
    } catch (err) {
        console.log(err);
    }
}

const airDropSol = async (wallet,amount,connection) => {
    try {
      //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      console.log(`-- Airdropping 2 SOL --`)
      const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(wallet),
        amount* LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(fromAirDropSignature);
    } catch (err) {
      console.log(err);
    }
};

module.exports = {getWalletBalance,transferSOL,airDropSol}

