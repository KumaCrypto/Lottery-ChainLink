import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

import { networkConfig } from "../../utils.data";
import fixture from "./fixture";

import type { Block } from "@ethersproject/abstract-provider/src.ts/index";

describe("Raffle", function () {
	describe("Fixture check", function () {
		it("Fixture return correct signers", async function () {
			const { signers } = await loadFixture(fixture);
			expect(signers[0].address).is.string;
		});

		it("Raffle deployed and has functionality", async function () {
			const { raffle } = await loadFixture(fixture);
			const NUM_WORDS: number = 1;
			expect(await raffle.getNumWords()).to.eq(NUM_WORDS);
		});

		it("vrfCoordinator deployed and has functionality", async function () {
			const { vrfCoordinator } = await loadFixture(fixture);
			const MAX_CONSUMERS: number = 100;
			expect(await vrfCoordinator.MAX_CONSUMERS()).to.eq(MAX_CONSUMERS);
		});
	});

	describe("All variables innitialazed correctly", function () {
		it("EntranceFee is correct", async function () {
			const { raffle, chainId } = await loadFixture(fixture);

			expect(await raffle.getEntrancyFee()).to.eq(
				networkConfig[chainId].entranceFee
			);
		});

		it("Recent winner is empty", async function () {
			const { raffle } = await loadFixture(fixture);

			expect(await raffle.getRecentWinner()).to.eq(
				ethers.constants.AddressZero
			);
		});

		it("Raffle state is open", async function () {
			const { raffle } = await loadFixture(fixture);

			expect(await raffle.getRaffleState()).to.eq(0);
		});

		it("Last raffle time is equal to deploy time", async function () {
			const { raffle } = await loadFixture(fixture);

			const blockNumber: number = await raffle.provider.getBlockNumber();
			const block: Block = await ethers.provider.getBlock(blockNumber);
			const blockTime: number = block.timestamp;

			expect(await raffle.getLastRaffleTime()).to.eq(blockTime);
		});

		it("Number of random words to eqal to 1", async function () {
			const { raffle } = await loadFixture(fixture);

			const NUM_WORDS: number = 1;
			expect(await raffle.getNumWords()).to.eq(NUM_WORDS);
		});

		it("Number of players equal to zero", async function () {
			const { raffle } = await loadFixture(fixture);

			expect(await raffle.getNumberOfPlayers()).to.eq(
				ethers.constants.Zero
			);
		});

		it("Request confirmations equal to 3", async function () {
			const { raffle, chainId } = await loadFixture(fixture);
			expect(await raffle.getRequestConfitmations()).to.eq(3);
		});

		it("Interval is equal to desired value", async function () {
			const { raffle, chainId } = await loadFixture(fixture);
			expect(await raffle.getInterval()).to.eq(
				networkConfig[chainId].interval
			);
		});
	});
});
