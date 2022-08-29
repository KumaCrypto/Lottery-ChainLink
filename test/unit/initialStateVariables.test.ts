import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

import { networkConfig } from "../../utils.data";
import { defaultFixture } from "../utils/fixture";

import { network } from "hardhat";
import { DEV_CHAIN_ID } from "../../utils.data";

!(DEV_CHAIN_ID === network.config.chainId)
	? describe.skip
	: describe("Raffle", function () {
			describe("defaultFixture check", function () {
				it("defaultFixture return correct signers", async function () {
					const { signers } = await loadFixture(defaultFixture);
					expect(signers[0].address).is.string;
				});

				it("Raffle deployed and has functionality", async function () {
					const { raffle } = await loadFixture(defaultFixture);
					const NUM_WORDS: number = 1;
					expect(await raffle.getNumWords()).to.eq(NUM_WORDS);
				});

				it("vrfCoordinator deployed and has functionality", async function () {
					const { vrfCoordinator } = await loadFixture(
						defaultFixture
					);
					const MAX_CONSUMERS: number = 100;
					expect(await vrfCoordinator.MAX_CONSUMERS()).to.eq(
						MAX_CONSUMERS
					);
				});
			});

			describe("All variables innitialazed correctly", function () {
				it("EntranceFee is correct", async function () {
					const { raffle, chainId } = await loadFixture(
						defaultFixture
					);

					expect(await raffle.getEntrancyFee()).to.eq(
						networkConfig[chainId].entranceFee
					);
				});

				it("Recent winner is empty", async function () {
					const { raffle } = await loadFixture(defaultFixture);

					expect(await raffle.getRecentWinner()).to.eq(
						ethers.constants.AddressZero
					);
				});

				it("Raffle state is open", async function () {
					const { raffle } = await loadFixture(defaultFixture);

					expect(await raffle.getRaffleState()).to.eq(0);
				});

				it("Last raffle time initialized", async function () {
					const { raffle } = await loadFixture(defaultFixture);

					expect(await raffle.getLastRaffleTime()).to.gt(
						ethers.constants.Zero
					);
				});

				it("Number of random words to eqal to 1", async function () {
					const { raffle } = await loadFixture(defaultFixture);

					const NUM_WORDS: number = 1;
					expect(await raffle.getNumWords()).to.eq(NUM_WORDS);
				});

				it("Number of players equal to zero", async function () {
					const { raffle } = await loadFixture(defaultFixture);

					expect(await raffle.getNumberOfPlayers()).to.eq(
						ethers.constants.Zero
					);
				});

				it("Request confirmations equal to 3", async function () {
					const { raffle, chainId } = await loadFixture(
						defaultFixture
					);
					expect(await raffle.getRequestConfitmations()).to.eq(3);
				});

				it("Interval is equal to desired value", async function () {
					const { raffle, chainId } = await loadFixture(
						defaultFixture
					);
					expect(await raffle.getInterval()).to.eq(
						networkConfig[chainId].interval
					);
				});
			});
	  });
