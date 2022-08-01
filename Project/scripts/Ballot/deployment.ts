import { ethers } from "ethers";
import { setupSigner } from "./utils/walletSetup";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";

// Converts an array of strings to an array of Bytes32
function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

/*
Deployment script - this script is used to deploy the Ballot contract with a set of
provided proposals that users will vote on.

Arguments:
- List of proposals: this script will create a proposal that can be voted on for every
string separated by spaces in the script input (multi-word strings should be contained
by quotation marks)
*/
async function main() {
  // Initialize signer
  const [, signer]= await setupSigner();

  // Parse proposals provided as script input
  console.log("Proposals: ");
  const proposals = process.argv.slice(2);
  if (proposals.length < 2) throw new Error("Not enough proposals provided");
  if (proposals.length > 100) throw new Error("Maximum of 100 proposals exceeded");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index}: ${element}`);
  });
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );
  // Deploy Ballot smart contract
  console.log("Deploying Ballot contract"); 
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );
  console.log("Awaiting confirmations");
  await ballotContract.deployed();
  console.log("Completed");
  console.log(`Contract deployed at ${ballotContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
