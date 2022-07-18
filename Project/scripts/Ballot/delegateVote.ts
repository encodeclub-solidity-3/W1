import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

/*
Script:
- Delegate my vote by passing a user address as input and using the wallet in environment
Arguments:
- user address that you want to give your voting power to
*/
async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("goerli");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

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

  const voterInfo = await ballotContract.voters(voterAddress);
  const toInfo = await ballotContract.voters(toAddress);
  console.log(`Delegating ${voterAddress}'s vote to ${toAddress} account.`);
  console.log(
    `VoterInfo - Weight: ${voterInfo.weight}, Voted: ${voterInfo.voted}, Delegate: ${voterInfo.delegate}, Vote: ${voterInfo.vote}`
  );
  console.log(
    `ToInfo - Weight: ${toInfo.weight}, Voted: ${toInfo.voted}, Delegate: ${toInfo.delegate}, Vote: ${toInfo.vote}`
  );
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
