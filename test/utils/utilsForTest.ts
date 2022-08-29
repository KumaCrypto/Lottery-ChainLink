import { ethers } from "hardhat";
async function increaseTime(time: number) {
	if (typeof time !== "number") throw new Error("Time must be a number");

	await ethers.provider.send("evm_increaseTime", [time]);
	await ethers.provider.send("evm_mine", []);
}

export default increaseTime;
