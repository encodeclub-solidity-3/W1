import { Contract } from "ethers";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";
import { setupSigner } from "./utils/walletSetup";

/*
This script allows the user to cast a vote to a ballot by passing contract address
and proposal number as input. The voter is defined by the address of the wallet
used in the environment.

Arguments:
- Ballot address (where the Ballot smart contract is deployed)
- Proposal to be voted on (by index number)
*/
async function main() {
    // Initialize wallet and signer
    const [wallet, signer] = await setupSigner();

    // Store script arguments as local variables
    if (process.argv.length < 3) throw new Error("Ballot address missing");
    const ballotAddress = process.argv[2];
    if (process.argv.length < 4) throw new Error("Proposal number missing");
    const proposal = process.argv[3];
    const voter = wallet.address;
    console.log(
      `Attaching ballot contract interface to address ${ballotAddress}`
    );
    const ballotContract: Ballot = new Contract(
      ballotAddress,
      ballotJson.abi,
      signer
    ) as Ballot;

    // Cast vote using ballotContract
    console.log(`Casting vote for proposal #${parseInt(proposal)} for account ${voter}`);
    const voteTx = await ballotContract.vote(proposal);
    console.log("Awaiting confirmations");
    await voteTx.wait();
    console.log(`Transaction completed. Hash: ${voteTx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
