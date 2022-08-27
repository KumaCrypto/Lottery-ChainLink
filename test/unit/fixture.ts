import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers, network } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";

async function PreparingFixture() {
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

export default PreparingFixture;
