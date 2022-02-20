use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("3FNz9W9QSeUWZydZZYR2hHWneLne4civTpecMJGoR84v");

#[program]
pub mod voting {
    use super::*;
    pub fn add_voter(ctx: Context<AddVoter>, authority: Pubkey ) -> ProgramResult {
        let voter: &mut Account<Voter> = &mut ctx.accounts.voter;
        voter.weight=1;
        voter.authority=authority;
        voter.voted=false;
        voter.proposalvoted="Null".to_owned();
        Ok(())
    }
    pub fn add_proposal(ctx: Context<AddProposal>, name: String ) -> ProgramResult {
        let proposal: &mut Account<Proposal> = &mut ctx.accounts.proposal;
        if name.chars().count() > 50 {
            return Err(ErrorCode::NameTooLong.into())
        }
        proposal.name=name;
        proposal.votecount=0;
        Ok(())
    }
    pub fn vote(ctx: Context<Vote>, name: String ) -> ProgramResult {
        let proposal: &mut Account<Proposal> = &mut ctx.accounts.proposal;
        let voter: &mut Account<Voter> = &mut ctx.accounts.voter;
        if name!=proposal.name{
            return Err(ErrorCode::NameMismatch.into())    
        }
        if voter.weight==0 || voter.voted==true{
            return Err(ErrorCode::NoRightToVote.into())  
        }
        voter.proposalvoted=name;
        voter.weight=voter.weight-1;
        voter.voted=true;
        proposal.votecount=proposal.votecount+1;
        Ok(())
    }


}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut, has_one = authority)]
    pub voter: Account<'info, Voter>,
    pub authority: Signer<'info>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct AddProposal<'info> {
    #[account(init, payer = user, space = Proposal::LEN)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct AddVoter<'info> {
    #[account(init, payer = user, space = Voter::LEN)]
    pub voter: Account<'info, Voter>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
}

// store chairperson

#[account]
pub struct Proposal {
    pub name: String,
    pub votecount: u32, 
}

#[account]
pub struct Voter {
    pub weight: u32, // 4 bytes
    pub voted: bool, 
    pub authority: Pubkey,
    pub proposalvoted: String,
}

const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.

const MAX_NAME_LENGTH: usize = 50 * 4; // Max  50 chars

const PUBLIC_KEY_LENGTH: usize = 32;

const DISCRIMINATOR_LENGTH: usize = 8;

impl Voter {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + 4 // weight
        + 1 // voted
        + PUBLIC_KEY_LENGTH // authority
        + STRING_LENGTH_PREFIX + MAX_NAME_LENGTH; // proposal voted
}

impl Proposal {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + STRING_LENGTH_PREFIX + MAX_NAME_LENGTH //name
        + 4; // voteCount
}


#[error]
pub enum ErrorCode {
    #[msg("The provided name should be 50 characters long maximum.")]
    NameTooLong,
    #[msg("The provided name should be the same as proposal name")]
    NameMismatch,
    #[msg("The person has already voted or delegated his vote")]
    NoRightToVote,
}