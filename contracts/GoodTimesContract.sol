// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GoodTimesContract {

	enum Type { Chill, Explore, Rave, Beach, WinterStuff}

	struct GoodTime {
	  uint id;
	  string name;
	  uint durationInDays;
	  uint budget;
	  //State state;
	  address[] attendees; //payable staviv prvo
	  mapping (address => uint) fundsPledged;
	  uint confirmations;
	  }

	address private owner;
	uint internal goodTimesCounter;
	  
	// mapping (address => string) userNames;

	GoodTime[] goodTimesRegistry;

  constructor() public {
	  goodTimesCounter = 0;
	  GoodTime storage initial =  goodTimesRegistry[0];
	  initial.id = 0;
	  initial.name = "";
	  initial.budget = 0;
  

  }


  function pledgeFunds(uint id) public payable returns (uint){
	  require(id < goodTimesRegistry.length, "Event does not exist");

	  goodTimesRegistry[id].budget += msg.value;
	//   bool doesExist = bytes(goodTimesRegistry[id].name).length != 0;
  }

    function createGoodTimes(string memory name) public payable{

  }

  function sendFundsToBookingContract(uint id, address destination) public{

  }

  function confirmWithdrawal(uint goodTimesId) public {

  }
}
