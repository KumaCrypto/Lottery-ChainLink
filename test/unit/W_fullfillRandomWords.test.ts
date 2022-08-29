import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

import { fixturewithEnteranceAndIncreasedTime } from "../utils/fixture";
import { networkConfig } from "../../utils.data";

import { network } from "hardhat";
import { DEV_CHAIN_ID } from "../../utils.data";

!(DEV_CHAIN_ID === network.config.chainId)
	? describe.skip
	: describe("FullfillRandomWords", function () {
			const entranceFee = networkConfig[31337].entranceFee;

			it("Can be executed only if random word was requsted ", async function () {
				const { vrfCoordinator, raffle } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);

				await expect(
					vrfCoordinator.fulfillRandomWords(0, raffle.address)
				).to.be.revertedWith("nonexistent request");

				await expect(
					vrfCoordinator.fulfillRandomWords(1, raffle.address)
				).to.be.revertedWith("nonexistent request");
			});

			it("Should pick a winner", async function () {
				/* Fixture with one enterance in raffle and increased time*/
				const { raffle, signers, vrfCoordinator } = await loadFixture(
					fixturewithEnteranceAndIncreasedTime
				);

				/* Add participants to the raffle */
				for (let i = 1; i < 3; i++) {
					await raffle
						.connect(signers[i])
						.enterRaffle({ value: entranceFee });
				}

				const startTimeStamp = await raffle.getLastRaffleTime();

				await new Promise<void>(async (resolve, reject) => {
					/* Wait for emmited WinnerPicked event */
					/* Fired after fulfillRandomWords */
					raffle.once("WinnerPicked", async () => {
						try {
							const recentWinner = await raffle.getRecentWinner();
							const raffleState = await raffle.getRaffleState();
							const endingTimeStamp =
								await raffle.getLastRaffleTime();
							const numPlayer = await raffle.getNumberOfPlayers();

							expect(numPlayer).to.eq(0);
							expect(raffleState).to.eq(0);
							expect(endingTimeStamp).gt(startTimeStamp);

							/* In our test winner always signers[2] and we can expect this */
							expect(recentWinner).to.eq(signers[2].address);

							const winnerFunds = entranceFee.mul(3);
							const shouldBePayedToWinner =
								await raffle.getWinningFunds(recentWinner);

							expect(winnerFunds).to.eq(shouldBePayedToWinner);
						} catch (error: any) {
							reject(error);
						}

						resolve();
					});

					/* PerformUpkeep in which called requestRandomWords */
					const transaction = await raffle.performUpkeep([]);
					const transactionReceipt = await transaction.wait(1);

					/* 
                When we get receipt, we can take information contained in event,
                we want to get requestId for fullfillRandomWords
            */
					const requestId = transactionReceipt.logs[0].topics[2];

					/* Call fullfillRandomWords which will call our raffle contract and after this WinnerPicked will be fired */
					await vrfCoordinator.fulfillRandomWords(
						requestId,
						raffle.address
					);
				});
			});
	  });
