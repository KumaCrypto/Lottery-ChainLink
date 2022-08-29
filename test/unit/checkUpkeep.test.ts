import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { network } from "hardhat";
import { expect } from "chai";

import { networkConfig } from "../../utils.data";
import increaseTime from "../utils/utilsForTest";
import { defaultFixture } from "../utils/fixture";
import { DEV_CHAIN_ID } from "../../utils.data";

!(DEV_CHAIN_ID === network.config.chainId)
	? describe.skip
	: describe("CheckUpkeep", function () {
			const interval = networkConfig[DEV_CHAIN_ID].interval;
			const entranceFee = networkConfig[DEV_CHAIN_ID].entranceFee;

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
