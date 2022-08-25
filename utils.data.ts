import { BigNumber } from "ethers";
import { ethers } from "hardhat";

const CONFIRMATION_AMOUNT: number = 6;
const CONFIRMATION_AMOUNT_IN_DEV_NETWORK: number = 1;
const DEV_CHAIN_ID: number = 31337;

type networkConfigType = {
	[chainId: number]: networkConfigArgs;
};

type networkConfigArgs = {
	name: string;
	gasLane: string;
	interval: string;
	entranceFee: BigNumber;
	callbackGasLimit: string;
	vrfV2Coordinator?: string;
	subId?: string;
};

const networkConfig: networkConfigType = {
	5: {
		name: "goerli",
		gasLane:
			"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
		interval: "30",
		entranceFee: ethers.utils.parseEther("0.01"),
		callbackGasLimit: "500000",
		vrfV2Coordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
		subId: "0",
	},

	31337: {
		name: "hardhat",
		gasLane:
			"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
		interval: "30",
		entranceFee: ethers.utils.parseEther("0.01"),
		callbackGasLimit: "500000",
	},
};

export {
	DEV_CHAIN_ID,
	networkConfig,
	CONFIRMATION_AMOUNT,
	CONFIRMATION_AMOUNT_IN_DEV_NETWORK,
};
