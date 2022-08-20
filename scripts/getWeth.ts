import { ethers, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";

const AMOUNT = ethers.utils.parseEther("0.02");

export const getWeth = async () => {
    const accounts = await ethers.getSigners();
    const iWeth = await ethers.getContractAt(
        "IWeth",
        networkConfig[network.name].wethToken!,
        accounts[0]
    );
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(accounts[0].address);
    console.log(`Got ${ethers.utils.formatEther(wethBalance)} WETH`);
};
