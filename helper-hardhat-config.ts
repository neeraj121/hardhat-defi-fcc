export interface networkConfigItem {
    blockConfirmations?: number;
    wethToken?: string;
    ethUsdPriceFeed?: string;
    lendingPoolAddressesProvider?: string;
    daiEthPriceFeed?: string;
    daiToken?: string;
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    localhost: {
        blockConfirmations: 1,
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        lendingPoolAddressesProvider:
            "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
    hardhat: {
        blockConfirmations: 1,
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        lendingPoolAddressesProvider:
            "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
    rinkeby: {
        blockConfirmations: 6,
    },
    kovan: {
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
        wethToken: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
        lendingPoolAddressesProvider:
            "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
        daiEthPriceFeed: "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541",
        daiToken: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
    },
};

export const developmentChains = ["hardhat", "localhost"];
