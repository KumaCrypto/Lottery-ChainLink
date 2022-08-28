import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { BigNumber } from "ethers";

import { deployments, ethers, network } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";

import { networkConfig } from "../../utils.data";
import increaseTime from "./utilsForTest";

const interval: number = +networkConfig[31337].interval;
const enteranceFee: BigNumber = networkConfig[31337].entranceFee;

async function defaultFixture() {
	const chainId: number = network.config.chainId!;
	const signers: SignerWithAddress[] = await ethers.getSigners();

	await deployments.fixture("all");

	const raffle: Raffle = await ethers.getContract("Raffle");
	const vrfCoordinator: VRFCoordinatorV2Mock = await ethers.getContract(
		"VRFCoordinatorV2Mock"
	);

	return {
		signers,
		raffle,
		vrfCoordinator,
		chainId,
	};
}

async function fixturewithEnteranceAndIncreasedTime() {
	const chainId: number = network.config.chainId!;
	const signers: SignerWithAddress[] = await ethers.getSigners();

	await deployments.fixture("all");

	const raffle: Raffle = await ethers.getContract("Raffle");
	const vrfCoordinator: VRFCoordinatorV2Mock = await ethers.getContract(
		"VRFCoordinatorV2Mock"
	);

	await raffle.enterRaffle({ value: enteranceFee });
	await increaseTime(interval + 1);

	return {
		signers,
		raffle,
		vrfCoordinator,
		chainId,
	};
}

export { defaultFixture, fixturewithEnteranceAndIncreasedTime };
