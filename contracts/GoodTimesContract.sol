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
	  address[] attendees; // ova podobro mapping da e?
	  mapping (address => uint) fundsPledged;
	  uint confirmations;
	  }

	address private owner;
	uint internal goodTimesCounter;
	  
	// mapping (address => string) userNames;

	GoodTime[] goodTimesRegistry;
	mapping(address => uint[]) usersRegistry;

  modifier gtcExists(uint _id) { 
    require(_id < goodTimesRegistry.length, "GTC does not exist"); 
    _;
  }

  constructor() public {
	  goodTimesCounter = 0;
	  GoodTime storage initial =  goodTimesRegistry[0];
	  initial.id = 0;
	  initial.name = "";
	  initial.budget = 0;

	  owner = msg.sender;
	  goodTimesCounter++;
  }


  function pledgeFunds(uint id) public payable 
  	gtcExists(id)	
  {
	  GoodTime storage target = goodTimesRegistry[id];
	  target.budget += msg.value;
	  target.attendees.push(msg.sender);
	  target.fundsPledged[msg.sender] += msg.value;
	//   uint[] storage usersGTCs = usersRegistry[msg.sender];
	//   usersGTCs.push(id);
	  usersRegistry[msg.sender].push(id);
	//   bool doesExist = bytes(goodTimesRegistry[id].name).length != 0;
  }

    function createGoodTimes(string memory name, uint duration) public payable
		returns (uint _id)
	{

	  GoodTime storage newGoodTime =  goodTimesRegistry[goodTimesCounter];
	  newGoodTime.id = goodTimesCounter;
	  newGoodTime.name = name;
	  newGoodTime.budget = 0 + msg.value;
	  newGoodTime.attendees.push();
	  newGoodTime.fundsPledged[msg.sender] += msg.value;
	  newGoodTime.durationInDays = duration;

	  _id = goodTimesCounter;
	  goodTimesCounter++;
  }

  function sendFundsToBookingContract(uint id, address destination) public{

  }

  function confirmWithdrawal(uint goodTimesId) public {

  }
  
  function getUsersGTCs() public view returns (uint[] memory) {
	  return usersRegistry[msg.sender];
  }
}
