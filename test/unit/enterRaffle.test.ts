import type { BigNumber } from "ethers";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

import { networkConfig } from "../../utils.data";
import increaseTime from "../utils/utilsForTest";
import { defaultFixture } from "../utils/fixture";

import { network } from "hardhat";
import { DEV_CHAIN_ID } from "../../utils.data";

!(DEV_CHAIN_ID === network.config.chainId)
	? describe.skip
	: describe("EnterRaffle", function () {
			const enteranceFee: BigNumber = networkConfig[31337].entranceFee;
			const interval: string = networkConfig[31337].interval;

			it("If sended amount to low transaction should be reverted", async function () {
				const { raffle } = await loadFixture(defaultFixture);
				await expect(
					raffle.enterRaffle()
				).to.be.revertedWithCustomError(
					raffle,
					"Raffle__NotEnoughETHEntered"
				);
			});

			it("If raffle status is closed should be reverted", async function () {
				const { raffle } = await loadFixture(defaultFixture);
				await raffle.enterRaffle({ value: enteranceFee });

				await increaseTime(+interval + 1);

				await raffle.performUpkeep([]);

				await expect(
					raffle.enterRaffle()
				).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen");
			});

			it("When player entered to raffle his address should be writen to players list ", async function () {
				const { raffle, signers } = await loadFixture(defaultFixture);
				await raffle.enterRaffle({ value: enteranceFee });
				expect(await raffle.getPlayer(0)).to.eq(signers[0].address);
			});

			it("Event should be emitted after succesfully enterance", async function () {
				const { raffle, signers } = await loadFixture(defaultFixture);
				await expect(raffle.enterRaffle({ value: enteranceFee }))
					.to.emit(raffle, "RuffleEnter")
					.withArgs(signers[0].address);
			});
	  });
