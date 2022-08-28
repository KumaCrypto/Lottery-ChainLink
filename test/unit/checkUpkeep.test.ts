import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

import { networkConfig } from "../../utils.data";
import increaseTime from "./utilsForTest";
import { defaultFixture } from "./fixture";

describe("CheckUpkeep", function () {
	const interval = networkConfig[31337].interval;
	const entranceFee = networkConfig[31337].entranceFee;

	it("Should return false if balance and player list is empty", async function () {
		const { raffle } = await loadFixture(defaultFixture);
		await increaseTime(parseInt(interval));

		const isUpkeepNeeded = (await raffle.checkUpkeep([]))[0];
		expect(isUpkeepNeeded).to.false;
	});

	it("Shoulds return false if raffle status is not open", async function () {
		const { raffle } = await loadFixture(defaultFixture);

		await raffle.enterRaffle({ value: entranceFee });
		await increaseTime(+interval + 1);

		await raffle.performUpkeep([]);

		const isUpkeepNeeded = (await raffle.checkUpkeep([]))[0];
		expect(isUpkeepNeeded).to.false;
	});

	it("Returns false if enougth time is not passed", async function () {
		const { raffle } = await loadFixture(defaultFixture);

		await raffle.enterRaffle({ value: entranceFee });
		const isUpkeepNeeded = (await raffle.checkUpkeep([]))[0];

		expect(isUpkeepNeeded).to.false;
	});

	it("Returns true if all condition are met", async function () {
		const { raffle } = await loadFixture(defaultFixture);

		await raffle.enterRaffle({ value: entranceFee });
		await increaseTime(+interval + 1);
		const isUpkeepNeeded = (await raffle.checkUpkeep([]))[0];

		expect(isUpkeepNeeded).to.true;
	});
});
