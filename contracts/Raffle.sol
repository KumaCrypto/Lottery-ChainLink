// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__NotEnoughETHEntered();
error Raffle_transferFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(
	uint256 currentBalance,
	uint256 numPlayers,
	uint256 raffleState
);
error Raffle__YouDoesNotHaveFundsToWithdraw();

/**
 * @title  A sample raffle contract.
 * @author Vladimir Kumalagov.
 * @notice This contract is for creating an untamperable decentrilized smart contract.
 * @dev This implements Chainlink VRF v2 and Chainlink Keeper.
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
	/* Types */
	enum RaffleState {
		OPEN,
		CALCULATING
	}

	/* State variables */
	/* Chainlink variables */
	VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
	uint64 private immutable i_subId;
	uint32 private immutable i_callbackGasLimit;
	uint16 private constant REQUEST_CONFIRMATIONS = 3;
	uint32 private constant NUM_WORDS = 1;
	bytes32 private immutable i_gasLane;

	/* Lottery variables */
	uint256 private immutable i_entranceFee;
	uint256 private immutable i_interval;
	address private s_recentWinner;
	uint64 private s_lastTimeStamp;
	RaffleState private s_raffleState;
	uint256 private s_fundsToWithdraw;

	address payable[] private s_players;
	mapping(address => uint256) private s_userWithdrawAmount;

	/* Events */
	event RuffleEnter(address indexed player);
	event WinnerPicked(address indexed winner, uint256 amount);
	event WinningFundsWithdrawal(address indexed winner, uint256 amount);

	/* Functions */
	constructor(
		address vrfCoordinatorV2, // address of the Chainlink coordinator
		uint64 subId, // subscription id from Chainlink
		bytes32 gasLine, // how many wei we would like to spend per gas unit
		uint32 callbackGasLimit, // how many gas to fullfillRandomWord
		uint256 entranceFee,
		uint256 interval
	) VRFConsumerBaseV2(vrfCoordinatorV2) {
		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
		i_subId = subId;
		i_gasLane = gasLine;
		i_entranceFee = entranceFee;
		i_interval = interval;
		i_callbackGasLimit = callbackGasLimit;
		s_lastTimeStamp = uint64(block.timestamp);
	}

	function enterRaffle() external payable {
		if (s_raffleState != RaffleState.OPEN) revert Raffle__NotOpen();
		if (msg.value < i_entranceFee) revert Raffle__NotEnoughETHEntered();

		s_players.push(payable(msg.sender));

		emit RuffleEnter(msg.sender);
	}

	/**
	 * @dev This is the function that the Chainlink Keeper nodes call
	 * they look for `upkeepNeeded` to return true.
	 * the following should be true for this to return true:
	 * 1. The time interval has passed between raffle runs.
	 * 2. The lottery is open.
	 * 3. The contract has ETH.
	 * 4. Implicity, your subscription is funded with LINK.
	 */
	function checkUpkeep(
		bytes memory /*checkData*/
	)
		public
		view
		override
		returns (
			bool, /* upkeepNeeded */
			bytes memory /*performData*/
		)
	{
		bool isOpen = s_raffleState == RaffleState.OPEN;
		bool isIntervalPassed = (block.timestamp - s_lastTimeStamp) >
			i_interval;
		bool hasPlayer = (s_players.length > 0);
		bool hasBalance = address(this).balance > 0;
		bool upkeepNeeded = (isOpen &&
			isIntervalPassed &&
			hasPlayer &&
			hasBalance);

		return (upkeepNeeded, "0x0");
	}

	/**
	 * @dev Once `checkUpkeep` is returning `true`, this function is called
	 * and it kicks off a Chainlink VRF call to get a random winner.
	 */
	function performUpkeep(
		bytes calldata /*performData*/
	) external override {
		(bool isUpkeepNeeded, ) = checkUpkeep("");

		if (!isUpkeepNeeded)
			revert Raffle__UpkeepNotNeeded(
				address(this).balance - s_fundsToWithdraw,
				s_players.length,
				uint256(s_raffleState)
			);

		s_raffleState = RaffleState.CALCULATING;

		/* uint256 RequestId */
		i_vrfCoordinator.requestRandomWords(
			i_gasLane,
			i_subId,
			REQUEST_CONFIRMATIONS,
			i_callbackGasLimit,
			NUM_WORDS
		);
	}

	/**
	 * @dev This is the function that Chainlink VRF node
	 * calls to send the money to the random winner.
	 */
	function fulfillRandomWords(
		uint256, /*requestId*/
		uint256[] memory randomWords
	) internal override {
		/* Calculate a winner */
		uint256 indexOfWinner = randomWords[0] % s_players.length;
		address currentWinner = s_players[indexOfWinner];
		s_recentWinner = currentWinner;

		uint256 winnersPrize = address(this).balance - s_fundsToWithdraw;

		s_userWithdrawAmount[currentWinner] =
			s_userWithdrawAmount[currentWinner] +
			winnersPrize;

		s_fundsToWithdraw = s_fundsToWithdraw + winnersPrize;

		/* Reset state for new lottery */
		s_players = new address payable[](0);
		s_raffleState = RaffleState.OPEN;
		s_lastTimeStamp = uint64(block.timestamp);

		emit WinnerPicked(currentWinner, winnersPrize);
	}

	function withdrawWinningFunds() external {
		uint256 amount = s_userWithdrawAmount[msg.sender];
		if (amount == 0) revert Raffle__YouDoesNotHaveFundsToWithdraw();

		delete s_userWithdrawAmount[msg.sender];
		s_fundsToWithdraw = s_fundsToWithdraw - amount;

		(bool isSeccessed, ) = payable(msg.sender).call{value: amount}("");
		if (!isSeccessed) revert Raffle_transferFailed();

		emit WinningFundsWithdrawal(msg.sender, amount);
	}

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

	function getRaffleState() external view returns (RaffleState) {
		return s_raffleState;
	}

	function getLastRaffleTime() external view returns (uint64) {
		return s_lastTimeStamp;
	}

	function getNumWords() external pure returns (uint256) {
		return NUM_WORDS;
	}

	function getNumberOfPlayers() external view returns (uint256) {
		return s_players.length;
	}

	function getRequestConfitmations() external pure returns (uint256) {
		return REQUEST_CONFIRMATIONS;
	}

	function getInterval() external view returns (uint256) {
		return i_interval;
	}

	function getWinningFunds(address player) external view returns (uint256) {
		return s_userWithdrawAmount[player];
	}

	function getTotalFundsToWithdraw() external view returns (uint256) {
		return s_fundsToWithdraw;
	}
}
