# Encode Club Solidity Bootcamp
### Week 1 Project - July 2022 Cohort
Team Members: 
- Daiana Bilbao (hello_dayana#4030)
- Kevin Le (water1925#7425)
- Christina Polyukh (cpolyukh#5660)

## Overview
We are deploying a ballot smart contract with proposals to vote on, and writing scripts to interact with the smart contract in the following ways:
* Deploy the ballot smart contract
* Query proposals
* Give voting rights to a wallet
* Cast a vote to the ballot
* Delegate vote to another user

### Ballot 
What is your favorite cryptocurrency?

### Proposals
0. Bitcoin
1. Ethereum
2. Avalanche
3. Solana
4. Algorand
5. Oasis
6. Cardano
7. Dogecoin
8. Polkadot
9. Polygon
10. Chainlink
11. Shiba Inu

<br></br>
## 1. Deploying the ballot smart contract
### ```deployment.ts``` at ```/Project/scripts/Ballot/deployment.ts```
The ballot has been deployed on the Goerli test network.

Contract Address ```0x16d0b05942f2d3b861dcd4544f7773b489410d0f``` [Link](https://goerli.etherscan.io/address/0x16d0b05942f2d3b861dcd4544f7773b489410d0f)

Transaction hash ```0x2d2770a4c9b95b514ddce446e8e9a84fe62ce3c1cf6578a5ec256216d275bc12``` [Link](https://goerli.etherscan.io/tx/0x2d2770a4c9b95b514ddce446e8e9a84fe62ce3c1cf6578a5ec256216d275bc12)

<br></br>
## 2. Querying ballot proposals
### ```queryProposals.ts``` at ```/Project/scripts/Ballot/queryProposals.ts```
Call the ballot contract and iterate through the proposals array. Print each proposal converted from bytes32 to string.
```  
console.log("Ballot: What's your favorite cryptocurrency out of the following:")
  for (let i = 0; i < 12; i++) {
    const proposal = await ballotContract.proposals(i);
    const proposalString = ethers.utils.parseBytes32String(proposal.name);
    console.log(`${i}: ${proposalString}`);
  }

  console.log(`End of proposals`);
  ```
 ### Console Output
  ```
  yarn ts-node ./scripts/Ballot/queryProposals.ts 0x16d0b05942f2d3b861dcd4544f7773b489410d0f
  
  Ballot: What's your favorite cryptocurrency out of the following:
0: Bitcoin
1: Ethereum
2: Avalanche
3: Solana
4: Algorand
5: Oasis
6: Cardano
7: Dogecoin
8: Polkadot
9: Polygon
10: Chainlink
11: Shiba Inu
End of proposals
```

<br></br>
## 3. Giving voting rights to a wallet
### ```giveVotingRights.ts``` at ```/Project/scripts/Ballot/giveVotingRights.ts```
Only the chairperson (creator of the Ballot smart contract) can give voting rights to other users.
``` 
const chairpersonAddress = await ballotContract.chairperson();
if (chairpersonAddress !== signer.address)
  throw new Error("Caller is not the chairperson for this contract");
console.log(`Giving right to vote to ${voterAddress}`);
const tx = await ballotContract.giveRightToVote(voterAddress);
console.log("Awaiting confirmations");
await tx.wait();
console.log(`Transaction completed. Hash: ${tx.hash}`);
```

### Console Output
```
yarn ts-node ./scripts/Ballot/giveVotingRights.ts 0x16d0b05942f2d3b861dcd4544f7773b489410d0f 0x2d923D4846b958b19662c1b3d2c686b4b8B2AaDF

Attaching ballot contract interface to address 0x16d0b05942f2d3b861dcd4544f7773b489410d0f
Giving right to vote to 0x2d923D4846b958b19662c1b3d2c686b4b8B2AaDF
Awaiting confirmations
Transaction completed. Hash: 0xaaf076f67624c6247fbf800efd759e8d5e68991337a3ae6e6379b2716492b5c8
```

<br></br>
## 4. Casting a vote to the ballot contract

### ```castVote.ts``` at ```/Project/scripts/Ballot/castVote.ts```
Wallet addresses with voting rights can cast votes to the ballot, to vote for one of the proposals.
```
let proposalNum = parseInt(proposal);
console.log(`Casting vote for proposal #${proposalNum} for account ${voter}`);
const voteTx = await ballotContract.vote(proposal);
console.log("Awaiting confirmations");
await voteTx.wait();
console.log(`Transaction completed. Hash: ${voteTx.hash}`);
```
### Console Output
```
Using address 0xf5e2e431864DCd48A5b00713CEf9ab919c539213
Wallet balance 0.05
Attaching ballot contract interface to address 0x16d0b05942f2d3b861dcd4544f7773b489410d0f
Casting vote for proposal #11 for account 0xf5e2e431864DCd48A5b00713CEf9ab919c539213
Awaiting confirmations
Transaction completed. Hash: 0x47d1b4813158d2388be2307163bda01efa14fd06c545d8c6fe5ba979b21a2601
```

<br></br>
## 5. Querying the voting results
### ```queryResults.ts``` at ```/Project/scripts/Ballot/queryResults.ts```
Call the ballot contract and iterate through the proposals array. Print each proposal and vote count.
```
console.log("Results for the ballot asking: What's your favorite cryptocurrency out of the following:")

for (let i = 0; i < 12; i++) {
  const proposal = await ballotContract.proposals(i);
  const proposalString = ethers.utils.parseBytes32String(proposal.name);
  console.log(`${i}: ${proposalString} received ${proposal.voteCount} votes`);
}

console.log(`End of proposals`);
```

### Console Output

```
Attaching ballot contract interface to address 0x16d0b05942F2D3b861DCd4544f7773b489410d0f
Results for the ballot asking: What's your favorite cryptocurrency out of the following:
0: Bitcoin received 0 votes
1: Ethereum received 0 votes
2: Avalanche received 0 votes
3: Solana received 0 votes
4: Algorand received 0 votes
5: Oasis received 1 votes
6: Cardano received 0 votes
7: Dogecoin received 0 votes
8: Polkadot received 0 votes
9: Polygon received 0 votes
10: Chainlink received 0 votes
11: Shiba Inu received 3 votes
```

<br></br>
# From original repository
# Lesson 4 - Tests and Scripts
## Writing unit tests for Ballot.sol
* More on Ether.js functions and utilities
* Bytes32 and Strings conversion
* Helper functions inside test scripts
* Unit tests structure and nested tests
### Code reference for tests
<pre><code>import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

describe("Ballot", function () {
  let ballotContract: Ballot;

  this.beforeEach(async function () {
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {});
    it("sets the deployer address as chairperson", async function () {});
    it("sets the voting weight for the chairperson as 1", async function () {});
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {});
    it("can not give right to vote for someone that has voted", async function () {});
    it("can not give right to vote for someone that has already voting rights", async function () {});
  });

  describe("when the voter interact with the vote function in the contract", function () {});

  describe("when the voter interact with the delegate function in the contract", function () {});

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {});

  describe("when the an attacker interact with the vote function in the contract", function () {});

  describe("when the an attacker interact with the delegate function in the contract", function () {});

  describe("when someone interact with the winningProposal function before any votes are cast", function () {});

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {});

  describe("when someone interact with the winnerName function before any votes are cast", function () {});

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {});

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {});
});</code></pre>
## Using scripts to automate operations
* Running a script with yarn and node, ts-node and/or hardhat
* Ballot deployment  script
* Passing arguments
* Passing variables to the deployment script
* Environment files
* Providers
* Connecting to a testnet with a RPC Provider
* Running scripts on chain
* Script for giving voting rights to a given address
* Dealing with transactions in scripts
### References
https://www.typescripttutorial.net/typescript-tutorial/typescript-hello-world/

https://nodejs.org/docs/latest/api/process.html#processargv

https://docs.ethers.io/v5/api/providers/

https://docs.ethers.io/v5/api/contract/contract-factory/

<pre><code>import { ethers } from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  // TODO
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});</code></pre>
### Running scripts
```
yarn run hardhat .\scripts\Ballot\deployment.ts
```
### Running scripts with arguments
```
yarn run ts-node --files .\scripts\Ballot\deployment.ts "arg1" "arg2" "arg3
```
# Homework
* Create Github Issues with your questions about this lesson
* Read the references
* Finish covering other operations with scripts

# Weekend Project
* Form groups of 3 to 5 students
* Structure scripts to
  * Deploy
  * Query proposals
  * Give vote right passing an address as input
  * Cast a vote to a ballot passing contract address and proposal as input and using the wallet in environment
  * Delegate my vote passing  user address as input and using the wallet in environment
  * Query voting result and print to console
* Publish the project in Github
* Run the scripts with a set of proposals, cast and delegate votes and inspect results
* Write a report detailing the addresses, transaction hashes, description of the operation script being executed and console output from script execution for each step (Deployment, giving voting rights, casting/delegating and querying results).
* (Extra) Use TDD methodology
