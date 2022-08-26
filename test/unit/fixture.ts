import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers } from "hardhat";
import { Raffle } from "../../typechain-types";

async function PreparingFixture() {
	const signers: SignerWithAddress[] = await ethers.getSigners();
	await deployments.fixture("all");
	const raffle: Raffle = await ethers.getContract("Raffle");
}
