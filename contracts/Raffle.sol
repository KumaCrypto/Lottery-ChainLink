// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__NotEnoughETHEntered();
error Raffle_transferFailed();

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
	/* State variables */
	uint256 private immutable i_entranceFee;
	address payable[] private s_players;
	address private s_recentWinner;

	/* Chainlink variables */
	VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
	uint64 private immutable i_subId;
	uint32 private immutable i_callbackGasLimit;
	uint16 private constant REQUEST_CONFIRMATIONS = 3;
	uint32 private constant NUM_WORDS = 1;
	bytes32 private immutable i_gasLane;

	/* Events */
	event RuffleEnter(address indexed player);
	event RuffleWinnerRequested(uint256 requestId);
	event WinnerPicked(address indexed winner);

	constructor(
		uint256 entranceFee,
		address vrfCoordinatorV2, // address of the coordinator
		bytes32 gasLine, // how many wei we would like to spend
		uint64 subId, // subscription id from chainlink
		uint32 callbackGasLimit // how many gas to fullfillRandomWord
	) VRFConsumerBaseV2(vrfCoordinatorV2) {
		i_entranceFee = entranceFee;

		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
		i_gasLane = gasLine;
		i_subId = subId;
		i_callbackGasLimit = callbackGasLimit;
	}

	function enterRaffle() external payable {
		// TODO check is player a contract???
		if (msg.value < i_entranceFee) revert Raffle__NotEnoughETHEntered();
		s_players.push(payable(msg.sender));

		emit RuffleEnter(msg.sender);
	}

	function requestRuffleWinner() external {
		uint256 requestId = i_vrfCoordinator.requestRandomWords(
			i_gasLane,
			i_subId,
			REQUEST_CONFIRMATIONS,
			i_callbackGasLimit,
			NUM_WORDS
		);

		emit RuffleWinnerRequested(requestId);
	}

	function checkUpkeep(
		bytes calldata /*checkData*/
	) external override {}

	function fulfillRandomWords(
		uint256, /*requestId*/
		uint256[] memory randomWords
	) internal override {
		uint256 indexOfWinner = randomWords[0] % s_players.length;
		address payable currentWinner = s_players[indexOfWinner];
		s_recentWinner = currentWinner;

		(bool isSeccessed, ) = currentWinner.call{value: address(this).balance}(
			""
		);
		if (!isSeccessed) revert Raffle_transferFailed();
		emit WinnerPicked(currentWinner);
	}

	// function getRandomWinner() {}

	/* Getter functions */
	function getEntrancyFee() external view returns (uint256) {
		return i_entranceFee;
	}

	function getPlayer(uint256 index) external view returns (address) {
		return s_players[index];
	}

	function getRecentWinner() external view returns (address) {
		return s_recentWinner;
	}
}
