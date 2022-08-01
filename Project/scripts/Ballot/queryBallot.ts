import { Contract, ethers } from "ethers";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";
import { setupSigner } from "./utils/walletSetup";

const PROPOSALS_STR = "proposals";
const RESULTS_STR = "results";

/*
This function allows users to query information about the ballot contract. Users can
choose to view a list of proposals or the result of the vote using this script.

Arguments:
- Either "proposals" or "results" depending on which console output the user wants
- Number of proposals: this needs to be provided as input due to Solidity constraints
- Ballot address indicating which ballot contract to display information about
*/
async function main() {
  // Initialize signer
  const [, signer] = await setupSigner();
  
  if (process.argv.length < 3) throw new Error(
    "Output string missing: please add either proposals or results as your first argument."
  );
  const outputStr = process.argv[2];
  if (process.argv.length < 4) throw new Error("Number of proposals to parse missing");
  const numProposals = parseInt(process.argv[3]);
  if (process.argv.length < 5) throw new Error("Ballot address missing");
  const ballotAddress = process.argv[4];
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;

  // If the user wants to see "proposals", simply output a list of proposal names
  if (outputStr === PROPOSALS_STR) {
    // Ballot question
    console.log("Ballot: What's your favorite cryptocurrency out of the following:")

    for (let i = 0; i < numProposals; i++) {
        const proposal = await ballotContract.proposals(i);
        const proposalString = ethers.utils.parseBytes32String(proposal.name);
        console.log(`${i}: ${proposalString}`);
    }

    console.log(`End of proposals`);
  // If the user wants to see "results", output the number of votes cast for each
  // proposal and the current winner of the vote.
  } else if (outputStr === RESULTS_STR) {
    // Ballot question
    console.log("Results for the ballot asking: What's your favorite cryptocurrency out of the following:")
  
    for (let i = 0; i < numProposals; i++) {
      const proposal = await ballotContract.proposals(i);
      const proposalString = ethers.utils.parseBytes32String(proposal.name);
      console.log(`${i}: ${proposalString} received ${proposal.voteCount} votes`);
    }
  
    const winningProposal = await ballotContract.winningProposal();
    const winnerName = await ballotContract.winnerName();
    const winnerNameStr = ethers.utils.parseBytes32String(winnerName);
    console.log(`The winning proposal was proposal #${winningProposal}: ${winnerNameStr}`);
  } else {
      throw new Error(
        "Output string missing: please add either proposals or results as your first argument."
      );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
