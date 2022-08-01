import { Contract } from "ethers";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";
import { setupSigner } from "./utils/walletSetup";

/*
This script allows the chairperson to give voting rights to an address provided as input.
This allows the user to cast and delegate votes for the provided Ballot contract. The
wallet used in the environment to run this script must belong to the Ballot chairperson.

Arguments:
- Address of the ballot requiring voting rights to be given
- User address that you want to give voting rights to
*/
async function main() {
  // Initialize signer
  const [, signer] = await setupSigner();
  
  // Store script arguments as local variables
  if (process.argv.length < 3) throw new Error("Ballot address missing");
  const ballotAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("Voter address missing");
  const voterAddress = process.argv[3];
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  // Verify that the caller is the chairperson
  const chairpersonAddress = await ballotContract.chairperson();
  if (chairpersonAddress !== signer.address)
    throw new Error("Caller is not the chairperson for this contract");
  // Give voting rights by calling the Ballot contract
  console.log(`Giving right to vote to ${voterAddress}`);
  const tx = await ballotContract.giveRightToVote(voterAddress);
  console.log("Awaiting confirmations");
  await tx.wait();
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
