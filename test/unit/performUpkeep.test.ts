import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { networkConfig } from "../../utils.data";
import increaseTime from "./utilsForTest";
import { defaultFixture } from "./fixture";

describe("PerformUpkeep", function () {
	const interval = networkConfig[31337].interval;
	const entranceFee = networkConfig[31337].entranceFee;

	it("Should be executed only if checkUpkeep return true", async function () {
		const { raffle } = await loadFixture(defaultFixture);

		await raffle.enterRaffle({ value: entranceFee });
		await increaseTime(+interval + 1);

		await expect(raffle.performUpkeep([])).not.be.reverted;
	});

	it("Should be executed only if checkUpkeep return true", async function () {
		const { raffle } = await loadFixture(defaultFixture);

		/* Zeroes because no one player in participant */
		const balance: number = 0;
		const players: number = 0;

		/* Open status */
		const status: number = 0;

		await expect(raffle.performUpkeep([]))
			.to.be.revertedWithCustomError(raffle, "Raffle__UpkeepNotNeeded")
			.withArgs(balance, players, status);
	});

	it("Should be change raffle state", async function () {
		const { raffle } = await loadFixture(defaultFixture);

		await raffle.enterRaffle({ value: entranceFee });
		await increaseTime(+interval + 1);
		await raffle.performUpkeep([]);

		// 1 === RaffleState.CALCULATING
		expect(await raffle.getRaffleState()).to.eq(1);
	});

	it("Should emmit event from Chainlink coordinator", async function () {
		const { raffle } = await loadFixture(defaultFixture);

		await raffle.enterRaffle({ value: entranceFee });
		await increaseTime(+interval + 1);

		const transactionResponse = await raffle.performUpkeep([]);
		const transactionsReceipt = await transactionResponse.wait(1);

		const requstId = transactionsReceipt.logs[0].topics[2];

		expect(requstId).to.eq(ethers.BigNumber.from(1));
	});
});
