import { Contract } from "ethers";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";
import { setupSigner } from "./utils/walletSetup";

/*
This script allows a user to delegate their vote by passing the delegatee user's
address as input. Calling this script increases the weight of the delegatee's vote
when their vote is cast. The wallet in the environment defines the delegator.

Arguments:
- Address of the ballot requiring vote delegation
- User address that you want to delegate your voting power to (delegatee address)
*/
async function main() {
  // Initialize wallet and signer
  const [wallet, signer] = await setupSigner();

  // Store script arguments as local variables
  if (process.argv.length < 3) throw new Error("Ballot address missing");
  const ballotAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("Delegate address missing");
  const toAddress = process.argv[3];
  const voterAddress = wallet.address;
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;

  // Log delegator and delegatee info to console
  const voterInfo = await ballotContract.voters(voterAddress);
  const toInfo = await ballotContract.voters(toAddress);
  console.log(`Delegating ${voterAddress}'s vote to ${toAddress} account.`);
  console.log(
    `VoterInfo - Weight: ${voterInfo.weight}, Voted: ${voterInfo.voted}, Delegate: ${voterInfo.delegate}, Vote: ${voterInfo.vote}`
  );
  console.log(
    `ToInfo - Weight: ${toInfo.weight}, Voted: ${toInfo.voted}, Delegate: ${toInfo.delegate}, Vote: ${toInfo.vote}`
  );
  // Delegate voting power to toAddress using ballotContract
  const delegateTx = await ballotContract.delegate(toAddress);
  delegateTx.wait();
  console.log("Awaiting confirmations");
  await delegateTx.wait();
  console.log(`Transaction completed. Hash: ${delegateTx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
