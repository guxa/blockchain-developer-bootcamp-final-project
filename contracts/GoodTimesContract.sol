// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; //>=0.5.16 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
	   
contract GoodTimesContract is Ownable {

	enum Type { Chill, Explore, Rave, Beach, WinterStuff}

	struct GoodTime {
	  uint id;
	  string name;
	  uint durationInDays;
	  uint budget;
	  //State state;
	  mapping (address => bool)  attendees; // ako e mapping ne mojme da gi vratime site vrednosti, dali ke imat potreba da e arraY?
	  mapping (address => uint) fundsPledged;
	  uint confirmations;
	  }

	// address private owner;
	uint internal goodTimesCounter;
	  
	// mapping (address => string) userNames;
	mapping (uint => GoodTime) public goodTimesRegistry;
	// GoodTime[] goodTimesRegistry;
	mapping(address => uint[]) usersRegistry;

  modifier gtcExists(uint _id) { 
    // require(_id < goodTimesRegistry.length, "GTC does not exist"); 
    require(goodTimesRegistry[_id].budget != 0, "GTC does not exist");
	_;
  }

  constructor() public Ownable() {
	  goodTimesCounter = 0;
	//    GoodTime memory initial = GoodTime();
	  GoodTime storage initial = goodTimesRegistry[0];
	  initial.id = 0;
	  initial.name = "";
	  initial.budget = 0;
		// goodTimesRegistry.push();
	  goodTimesCounter++;
  }


  function pledgeFunds(uint id) public payable 
  	gtcExists(id)
  {
	  GoodTime storage target = goodTimesRegistry[id];
	  target.budget += msg.value;
	  target.attendees[msg.sender] = true; //.push(msg.sender);
	  target.fundsPledged[msg.sender] += msg.value;
	//   uint[] storage usersGTCs = usersRegistry[msg.sender];
	//   usersGTCs.push(id);
	  usersRegistry[msg.sender].push(id);
	//   bool doesExist = bytes(goodTimesRegistry[id].name).length != 0;
  }

    function createGoodTimes(string memory name, uint duration) public payable
		returns (uint _id)
	{
//dodaj modifier da proveris dali prakat kes
	  GoodTime storage newGoodTime =  goodTimesRegistry[goodTimesCounter];
	  newGoodTime.id = goodTimesCounter;
	  newGoodTime.name = name;
	  newGoodTime.budget = 0 + msg.value;
	  newGoodTime.attendees[msg.sender] = true;
	  newGoodTime.fundsPledged[msg.sender] += msg.value;
	  newGoodTime.durationInDays = duration;

	  _id = goodTimesCounter;
	  goodTimesCounter++;
  }
  function checkFundsPledgedByUser(uint _goodTimeId) public view returns (uint result)
  {
	  result = goodTimesRegistry[_goodTimeId].fundsPledged[msg.sender];
  }

function checkIfUserIsEnrolled(uint _goodTimeId) public view returns (bool)
  {
	  return goodTimesRegistry[_goodTimeId].attendees[msg.sender];
  }

  function sendFundsToBookingContract(uint id, address destination) public{

  }

  function confirmWithdrawal(uint goodTimesId) public {

  }
  
  function getUsersGTCs() public view returns (uint[] memory) {
	  return usersRegistry[msg.sender];
  }
}
