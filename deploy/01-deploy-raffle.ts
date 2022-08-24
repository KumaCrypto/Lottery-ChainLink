import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { Raffle } from "../typechain-types";
import {
	CONFIRMATION_AMOUNT,
	CONFIRMATION_AMOUNT_IN_DEV_NETWORK,
	DEV_CHAIN_ID,
} from "../utils.data";

const deployRaffle: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;

	const { deployer, player } = await getNamedAccounts();

	const currentChainId: number = network.config.chainId!;
	const isDevChain: boolean = currentChainId === DEV_CHAIN_ID;

	const raffle: Raffle = (await deploy("Raffle", {
		from: deployer,
		args: [],
		waitConfirmations: isDevChain
			? CONFIRMATION_AMOUNT_IN_DEV_NETWORK
			: CONFIRMATION_AMOUNT,
		log: true,
	})) as unknown as Raffle;
};
