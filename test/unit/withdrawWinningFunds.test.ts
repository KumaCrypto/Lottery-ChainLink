import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

import { fixturewithEnteranceAndIncreasedTime } from "../utils/fixture";
import { networkConfig } from "../../utils.data";

import { getNamedAccounts, network } from "hardhat";
import { DEV_CHAIN_ID } from "../../utils.data";
import {
	TransactionReceipt,
	TransactionResponse,
} from "@ethersproject/abstract-provider";
import increaseTime from "../utils/utilsForTest";

!(DEV_CHAIN_ID === network.config.chainId)
	? describe.skip
	: describe("FullfillRandomWords", function () {
			const entranceFee = networkConfig[31337].entranceFee;
			const interval = +networkConfig[31337].interval;

			it("If user does not has amount to withdraw transactions should be reverted", async function () {
				const { raffle } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);

				await expect(
					raffle.withdrawWinningFunds()
				).to.be.revertedWithCustomError(
					raffle,
					"Raffle__YouDoesNotHaveFundsToWithdraw"
				);
			});

			it("When someone winning his amount should be writed in totalsupply", async function () {
				const { vrfCoordinator, raffle } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);
				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				expect(await raffle.getTotalFundsToWithdraw()).to.eq(
					entranceFee
				);
			});

			it("When someone winning his amount twice should be writed in totalsupply", async function () {
				const { vrfCoordinator, raffle } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);
				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				await raffle.enterRaffle({ value: entranceFee });

				await increaseTime(interval + 1);
				await raffle.performUpkeep([]);

				await vrfCoordinator.fulfillRandomWords(
					+requestId + 1,
					raffle.address
				);

				expect(await raffle.getTotalFundsToWithdraw()).to.eq(
					entranceFee.mul(2)
				);
			});

			it("After double winning and withdrawl should be writed in totalsupply", async function () {
				const { vrfCoordinator, raffle } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);
				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				await raffle.enterRaffle({ value: entranceFee });

				await increaseTime(interval + 1);
				await raffle.performUpkeep([]);

				await vrfCoordinator.fulfillRandomWords(
					+requestId + 1,
					raffle.address
				);

				await raffle.withdrawWinningFunds();
				expect(await raffle.getTotalFundsToWithdraw()).to.eq(0);
			});

			it("When one user already has winning funds and another winning and try to withdraw he should receive only own part ", async function () {
				const { vrfCoordinator, raffle, signers } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);
				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				await raffle
					.connect(signers[1])
					.enterRaffle({ value: entranceFee });

				await increaseTime(interval + 1);
				await raffle.performUpkeep([]);

				await vrfCoordinator.fulfillRandomWords(
					+requestId + 1,
					raffle.address
				);

				await raffle.connect(signers[1]).withdrawWinningFunds();
				expect(await raffle.getWinningFunds(signers[0].address)).to.eq(
					entranceFee
				);
			});

			it("Total supply should be decrised when one user withdraw hos funds", async function () {
				const { vrfCoordinator, raffle, signers } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);
				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				await raffle
					.connect(signers[1])
					.enterRaffle({ value: entranceFee });

				await increaseTime(interval + 1);
				await raffle.performUpkeep([]);

				await vrfCoordinator.fulfillRandomWords(
					+requestId + 1,
					raffle.address
				);

				await raffle.connect(signers[1]).withdrawWinningFunds();
				expect(await raffle.getTotalFundsToWithdraw()).to.eq(
					entranceFee
				);
			});

			it("When someone winning, funds should be writed to withdrawAmount ", async function () {
				const { vrfCoordinator, raffle, signers } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);
				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				expect(await raffle.getWinningFunds(signers[0].address)).to.eq(
					entranceFee
				);
			});

			it("After withdrawn user amount to withdraw should be deleted", async function () {
				const { vrfCoordinator, raffle, signers } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);

				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				await raffle.withdrawWinningFunds();

				expect(await raffle.getWinningFunds(signers[0].address)).to.eq(
					0
				);
			});

			it("Funds should be transfered correctly", async function () {
				const { vrfCoordinator, raffle, signers } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);

				const performUpkeepResponse: TransactionResponse =
					await raffle.performUpkeep([]);
				const performUpkeepReceipt: TransactionReceipt =
					await performUpkeepResponse.wait(1);

				const requestId = performUpkeepReceipt.logs[0].topics[2];

				await vrfCoordinator.fulfillRandomWords(
					requestId,
					raffle.address
				);

				await expect(
					raffle.withdrawWinningFunds()
				).to.changeEtherBalance(signers[0], entranceFee);
			});
	  });
