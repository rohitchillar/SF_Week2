const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    Account,
    SystemProgram,
} = require("@solana/web3.js");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const { getReturnAmount, randomNumber } = require('./helper');
const {getWalletBalance,transferSOL,airDropSol}=require("./solana");

const userSecretKey=[
    157, 119, 241,  17, 200,  64, 119,  34, 242, 128,  37,
    160,  78,  13, 231,  87, 236,  33, 105, 130,  30, 161,
     18,  84,  58, 126,  38, 123,  79,   6,  27,  97, 176,
    246, 197,  71,  92,  85, 125, 224, 151, 165, 208,  67,
    220, 231,  99,  67, 135, 178, 112, 144, 255,  82,  41,
    142, 242, 148,  60, 204, 240, 154,  39,  54
]

const userWallet = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));

const treasuryKey=[
    117, 112,  50,   3,  55, 241,  68, 162,   1, 105, 127,
     91,  21, 254,  53,  78,  12, 149, 217,  39, 179,  66,
     61, 239,  75, 241, 168, 230,  73, 185,  84, 171,  95,
    199, 246, 164, 225,  88, 227,  92, 233,  61, 191,  16,
     21, 173, 251,  67, 153,  23, 254, 224, 212, 238,  56,
    152, 171, 236, 154,  97,  86, 187,  68,  83
]

const treasuryWallet = Keypair.fromSecretKey(Uint8Array.from(treasuryKey));

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
//console.log(connection);

const init = () => {
    console.log(
        chalk.yellow(
            figlet.textSync("Lets Play", {
                font: "Banner3",
            })
        )
    );
};

const Questions = () => {
    const questions = [
        {
            name: "SOL",
            type: "number",
            message: "Enter bet amount",
        },
        {
            type: "number",
            name: "RATIO",
            message: "Enter staking ratio?",
        
        },
        {
            type: "number",
            name: "RANDOM",
            message: "Guess a random number between 1 to 3",
            when: async (val) => {
                if (parseFloat(val.SOL) > 2.5) {
                    console.log(chalk.red`The max bidding amount is 2.5 SOL`)
                    return false;
                } else {
                    // console.log("In when")
                    console.log(`You need to pay ${val.SOL} to move forward`)
                    const userBalance = await getWalletBalance(userWallet.publicKey.toString())
                    if (userBalance < val.SOL) {
                        console.log(chalk.red`You don't have enough balance in your wallet`);
                        return false;
                    } else {
                        console.log(chalk.green`You will get ${getReturnAmount(val.SOL, parseFloat(val.RATIO))} if your guess is correct`)
                        return true;
                    }
                }
            },
        }
    ];
    return inquirer.prompt(questions);
};

const play = async () => {
    init();
    const generateRandomNumber = randomNumber(1, 3);
    const answers = await Questions();
    if (answers.RANDOM) {
        const paymentSignature = await transferSOL(userWallet, treasuryWallet, answers.SOL)
        console.log(`Payment signature`, chalk.green`${paymentSignature}`);

        if (answers.RANDOM === generateRandomNumber) {
            // AirDrop Winning Amount

            await airDropSol(treasuryWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)),connection);
            // guess is successfull

            const prizeSignature = await transferSOL(treasuryWallet, userWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)))

            console.log(chalk.green`Correct guess`);
            console.log(`Prize signature `, chalk.green`${prizeSignature}`);

        } else {
            // better luck next time

            console.log(chalk.yellowBright`Better luck next time`)
        }
    }
}

play()
