/* Types */
import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Raffle, VRFCoordinatorV2Mock } from "../typechain-types";
import type { BigNumber } from "ethers";

import * as data from "../utils.data";
import verify from "../utils/verify";
import { ethers } from "hardhat";

const VRF_SUB_FUND_AMOUNT: BigNumber = ethers.utils.parseEther("30");

const deployRaffle: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { getNamedAccounts, deployments, network } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	const currentChainId: number = network.config.chainId!;
	const isDevChain: boolean = currentChainId === data.DEV_CHAIN_ID;

	let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
		vrfCoordinatorAddress: string,
		subId: string;

	if (isDevChain) {
		vrfCoordinatorV2Mock = (await ethers.getContract(
			"VRFCoordinatorV2Mock"
		)) as unknown as VRFCoordinatorV2Mock;

		vrfCoordinatorAddress = vrfCoordinatorV2Mock.address;

		const transactionsResponse =
			await vrfCoordinatorV2Mock.createSubscription();
		const receipt = await transactionsResponse.wait(1);

		if (receipt.status === 0)
			throw new Error("Error while creating subscription!");
		subId = receipt.events![0].args!.subId.toString();

		vrfCoordinatorV2Mock.fundSubscription(subId, VRF_SUB_FUND_AMOUNT);
	} else {
		vrfCoordinatorAddress =
			data.networkConfig[currentChainId].vrfV2Coordinator!;
		subId = data.networkConfig[currentChainId].subId!;
	}

	// Args for VRF V2 coordinator
	const gasLane: string = data.networkConfig[currentChainId].gasLane;
	const callbackGasLimit: string =
		data.networkConfig[currentChainId].callbackGasLimit;
	const entranceFee: BigNumber =
		data.networkConfig[currentChainId].entranceFee;
	const interval: string = data.networkConfig[currentChainId].interval;

	const raffleArgs: Array<any> = [
		vrfCoordinatorAddress,
		subId,
		gasLane,
		callbackGasLimit,
		entranceFee,
		interval,
	];

	const raffle: Raffle = (await deploy("Raffle", {
		from: deployer,
		args: raffleArgs,
		waitConfirmations: isDevChain
			? data.CONFIRMATION_AMOUNT_IN_DEV_NETWORK
			: data.CONFIRMATION_AMOUNT,
		log: true,
	})) as unknown as Raffle;

	if (isDevChain) {
		await vrfCoordinatorV2Mock!.addConsumer(subId, raffle.address);
	}

	if (!isDevChain && process.env.ETHERSCAN_API_KEY) {
		log("Verifying...");
		await verify(raffle.address, raffleArgs);
	}

	log("-----------------------------------");
};

deployRaffle.tags = ["raffle", "all"];
export default deployRaffle;
