// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

error Raffle__NotEnoughETHEntered();

contract Raffle {
	/* State variables */
	uint256 private immutable i_entranceFee;
	address payable[] private s_players;

	constructor(uint256 entranceFee) {
		i_entranceFee = entranceFee;
	}

	function enterRaffle() external payable {
		if (msg.value < i_entranceFee) revert Raffle__NotEnoughETHEntered();
		s_players.push(payable(msg.sender));
	}

	// function getRandomWinner() {}

	/* Getter functions */
	function getEntrancyFee() external view returns (uint256) {
		return i_entranceFee;
	}

	function getPlayer(uint256 index) external view returns (address) {
		return s_players[index];
	}
}
