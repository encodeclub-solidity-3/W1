import { ethers, Signer, Wallet } from "ethers";
import "dotenv/config";

const EXPOSED_KEY =
"8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const NETWORK = "goerli";

/*
This function is shared accross scripts to initialize a wallet and signer
used to create the Ballot contract and perform checks on environment variables.

Returns the signer to be used to create the Ballot contract.
*/
export async function setupSigner(): Promise<[Wallet, Wallet]> {
    const wallet =
      process.env.MNEMONIC && process.env.MNEMONIC.length > 0
        ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
        : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
    console.log(`Using address ${wallet.address}`);
    const provider = ethers.providers.getDefaultProvider(NETWORK);
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance < 0.01) {
      throw new Error("Not enough ether");
    }

    return [wallet, signer];
}