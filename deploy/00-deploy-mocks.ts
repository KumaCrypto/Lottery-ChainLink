import { BigNumber } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import {
	DEV_CHAIN_ID,
	CONFIRMATION_AMOUNT_IN_DEV_NETWORK,
} from "../utils.data";

const BASE_FEE: BigNumber = ethers.utils.parseEther("0.25"); // Request cost.
const GAS_PRICE_LINK: BigNumber = ethers.utils.parseUnits("1", "9"); // Link per gas.

const chainlinkMocks: DeployFunction = async (
	hre: HardhatRuntimeEnvironment
) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	const chainId: number = network.config.chainId!;

	if (chainId === DEV_CHAIN_ID) {
		log("Developing chain detected! Deploying mocks...");

		await deploy("VRFCoordinatorV2Mock", {
			from: deployer,
			args: [BASE_FEE, GAS_PRICE_LINK],
			log: true,
			waitConfirmations: CONFIRMATION_AMOUNT_IN_DEV_NETWORK,
		});

		log("Mocks deployed!");
		log("------------------------------");
	}
};

chainlinkMocks.tags = ["mock", "all"];
export default chainlinkMocks;
