// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface LetsGoInterface {
	enum ActivityType { 
		Chill, 
		Explore, 
		Rave, 
		Beach, 
		WinterSpirit
	}

	function receiveFundsFromGtc(uint256) external payable;

	function Validate() external pure returns (uint8);

	function getBalance(uint) external view returns (uint);

	function generateGoodTimeProposal() external ;
}

contract LetsGo is LetsGoInterface, Ownable {
	
	mapping(uint => uint) public gtcFunds;

	function receiveFundsFromGtc(uint256 gtcId) public payable {
		gtcFunds[gtcId] = msg.value;
	}
	function getBalance(uint gtcId) public view returns (uint) {
        return gtcFunds[gtcId];
    }

	function Validate() external pure returns (uint8) {
        return 42;
    }

	function generateGoodTimeProposal() public {
		revert("Not implemented yet, please be patient and wait for the new version :)");
	}
}




