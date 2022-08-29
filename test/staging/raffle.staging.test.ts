import { DEV_CHAIN_ID } from "../../utils.data";
import { network, ethers } from "hardhat";
import { Raffle } from "../../typechain-types";
import { deployments } from "hardhat";

const currentChainId = network.config.chainId;
DEV_CHAIN_ID === currentChainId
	? describe.skip
	: describe("Raffle staging test", function () {
			let raffle: Raffle;

			before(async function () {
				raffle = (await deployments.get("Raffle")) as unknown as Raffle;
				console.log(raffle);
			});

			describe("FullfillRandomWords", function () {
				it("Correctly work with Chainlink Keeper and VRF, we get a random winner", async function () {
					const startingTimestamp = await raffle.getLastRaffleTime();
					const [deployer] = await ethers.getSigners();

					await new Promise<void>(async (resolve, reject) => {
						raffle.once("WinnerPicked", async () => {
							console.log("Winner fired!");

							try {
								const recentWinner =
									await raffle.getRecentWinner();
								const raffleState =
									await raffle.getRaffleState();
								const winnerBalanceAfter =
									await deployer.getBalance();
								const endingTimeStamp =
									await raffle.getLastRaffleTime();
							} catch (error: any) {
								reject(error);
							}
							resolve();
						});

						const winnerBalanceBefore = await deployer.getBalance();
						const entranceFee = await raffle.getEntrancyFee();
						await raffle.enterRaffle({ value: entranceFee });
					});
				});
			});
	  });
