import { DEV_CHAIN_ID } from "../../utils.data";
import { network, ethers } from "hardhat";
import { Raffle } from "../../typechain-types";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

const currentChainId = network.config.chainId;
DEV_CHAIN_ID === currentChainId
	? describe.skip
	: describe("Raffle staging test", function () {
			let raffle: Raffle, user: SignerWithAddress, userAddress: string;

			before(async function () {
				raffle = (await ethers.getContract(
					"Raffle"
				)) as unknown as Raffle;
				[user] = await ethers.getSigners();
				userAddress = user.address;
			});

			describe("FullfillRandomWords", function () {
				it("Correctly work with Chainlink Keeper and VRF, we get a random winner", async function () {
					const startingTimestamp = await raffle.getLastRaffleTime();

					await new Promise<void>(async (resolve, reject) => {
						raffle.once("WinnerPicked", async () => {
							console.log("Winner fired!");

							try {
								const recentWinner =
									await raffle.getRecentWinner();
								const raffleState =
									await raffle.getRaffleState();
								const endingTimeStamp =
									await raffle.getLastRaffleTime();

								await expect(raffle.getPlayer(0)).to.be
									.reverted;

								expect(recentWinner).to.eq(userAddress);
								expect(raffleState).to.eq(0);

								const balanceBefore: BigNumber =
									await user.getBalance();

								const tx = await raffle.withdrawWinningFunds();
								await tx.wait(1);

								const balanceAfter: BigNumber =
									await user.getBalance();

								expect(
									balanceBefore.add(entranceFee)
								).to.closeTo(balanceAfter, 1e14);

								expect(endingTimeStamp).gt(startingTimestamp);
							} catch (error: any) {
								reject(error);
							}
							resolve();
						});

						const entranceFee = await raffle.getEntrancyFee();
						await raffle.enterRaffle({ value: entranceFee });
					});
				});
			});
	  });
