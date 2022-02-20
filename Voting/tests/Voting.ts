import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Voting } from '../target/types/voting';
import * as assert from "assert";

describe('Voting', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Voting as Program<Voting>;

  it('Can add a proposal', async () => {
    // Add your test here.
    const proposal = anchor.web3.Keypair.generate();
    const chairman = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(chairman.publicKey, 1000000000);
    await program.provider.connection.confirmTransaction(signature);

    const tx = await program.rpc.addProposal('Chillar Party',{
      accounts: {
        proposal: proposal.publicKey,
        user: chairman.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [chairman,proposal],
    });
    console.log("Your transaction signature", tx);

    // Fetch the data from the chain and log 

    const proposalAccount = await program.account.proposal.fetch(proposal.publicKey);
  	// console.log(proposalAccount);

    assert.equal(proposalAccount.name, 'Chillar Party');
    assert.equal(proposalAccount.votecount, 0);

  });

  it('Can add a voter', async () => {
    // Add your test here.
    const voter = anchor.web3.Keypair.generate();
    const chairman = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(chairman.publicKey, 1000000000);
    await program.provider.connection.confirmTransaction(signature);

    const tx = await program.rpc.addVoter(voter.publicKey,{
      accounts: {
        voter: voter.publicKey,
        user: chairman.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [chairman,voter],
    });
    console.log("Your transaction signature", tx);

    // Fetch the data from the chain and log 

    const voterAccount = await program.account.voter.fetch(voter.publicKey);
  	//console.log(voterAccount);

    assert.equal(voterAccount.weight, 1);
    assert.equal(voterAccount.voted, false);
    assert.equal(voterAccount.authority.toBase58(), voter.publicKey.toBase58());
    assert.equal(voterAccount.proposalvoted, "Null");

  });

  it('Voter can vote', async () => {
    // Add your test here.
    const voter = anchor.web3.Keypair.generate();
    const proposal = anchor.web3.Keypair.generate();
    const chairman = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(chairman.publicKey, 1000000000);
    await program.provider.connection.confirmTransaction(signature);

    const tx_proposal = await program.rpc.addProposal('Chillar Party',{
      accounts: {
        proposal: proposal.publicKey,
        user: chairman.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [chairman,proposal],
    });
    console.log("Add proposal transaction signature", tx_proposal);

    const tx_voter = await program.rpc.addVoter(voter.publicKey,{
      accounts: {
        voter: voter.publicKey,
        user: chairman.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [chairman,voter],
    });
    console.log("Add voter transaction signature", tx_voter);

    const tx_vote = await program.rpc.vote('Chillar Party',{
      accounts: {
        proposal: proposal.publicKey,
        voter: voter.publicKey,
        authority: voter.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [voter],
    });
    console.log("Add vote transaction signature", tx_vote);

    // Fetch the data from the chain and log 

    const voterAccount = await program.account.voter.fetch(voter.publicKey);
    const proposalAccount = await program.account.proposal.fetch(proposal.publicKey);

  	// console.log(voterAccount);
    // console.log(proposalAccount);

    assert.equal(voterAccount.weight, 0);
    assert.equal(voterAccount.voted, true);
    assert.equal(voterAccount.proposalvoted, 'Chillar Party');
    assert.equal(proposalAccount.votecount, 1);

  });

});
