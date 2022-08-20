import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";
import { ILendingPool } from "../typechain";
import { AMOUNT, getWeth } from "./getWeth";

async function main() {
    // the protocol treats everything as an ERC20 token
    await getWeth();

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const lendingPool = await getLendingPool(deployer);
    console.log(`LendingPool address: ${lendingPool.address}`);

    // deposit
    const wethTokenAddress = networkConfig[network.name].wethToken!;
    const daiTokenAddress = networkConfig[network.name].daiToken!;
    // approve
    await approveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("Depositing...");
    const tx = await lendingPool.deposit(
        wethTokenAddress,
        AMOUNT,
        deployer.address,
        0
    );
    await tx.wait(1);
    console.log("Deposited");

    // Borrow time
    // how much we have borrowed, how much we have in collateral, how much we can borrow
    const { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer.address
    );
    const daiPrice = await getDaiPrice();
    const amountDaiToBorrow = availableBorrowsETH
        .mul(BigNumber.from(95))
        .div(BigNumber.from(100))
        .div(daiPrice);
    const amountDaiToBorrowWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    );
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer.address
    );
    await getBorrowUserData(lendingPool, deployer.address);

    // repay
    await repayDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    );
    await getBorrowUserData(lendingPool, deployer.address);
}

async function repayDai(
    daiAddress: string,
    lendingPool: ILendingPool,
    amountDaiToRepay: BigNumber,
    account: SignerWithAddress
) {
    await approveERC20(
        daiAddress,
        lendingPool.address,
        amountDaiToRepay,
        account
    );
    const repayTx = await lendingPool.repay(
        daiAddress,
        amountDaiToRepay,
        1,
        account.address
    );
    await repayTx.wait(1);
    console.log("You've repayed");
}

async function borrowDai(
    daiAddress: string,
    lendingPool: ILendingPool,
    amountDaiToBorrow: BigNumber,
    account: string
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrow,
        1,
        0,
        account
    );
    await borrowTx.wait(1);
    console.log(`You've borrowed!`);
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.name].daiEthPriceFeed!
    );
    const price = (await daiEthPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is ${price.toString()}`);
    return price;
}

async function getBorrowUserData(lendingPool: ILendingPool, address: string) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(address);
    console.log(
        `You have ${ethers.utils.formatEther(
            totalCollateralETH
        )} worth of ETH deposited`
    );
    console.log(
        `You have ${ethers.utils.formatEther(
            totalDebtETH
        )} worth of ETH borrowed`
    );
    console.log(
        `You can borrow ${ethers.utils.formatEther(
            availableBorrowsETH
        )} worth of ETH`
    );
    return { availableBorrowsETH, totalDebtETH };
}

async function getLendingPool(account: SignerWithAddress) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.name].lendingPoolAddressesProvider!,
        account
    );
    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    );
    return lendingPool;
}

async function approveERC20(
    contractAddress: string,
    spenderAddress: string,
    amountToSpend: BigNumber,
    account: SignerWithAddress
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        contractAddress,
        account
    );
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved");
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
