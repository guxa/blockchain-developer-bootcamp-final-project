// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; //>=0.5.16 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LetsGo.sol";

contract GoodTimesContract is Ownable {
    
	struct GoodTime {
        uint256 id;
        string name;
        uint256 durationInDays;
        uint256 budget;
        //State state;
        //   mapping (address => bool)  attendees; // ako e mapping ne mojme da gi vratime site vrednosti, dali ke imat potreba da e arraY?
        
        uint256 confirmations;
        bool closed;
		uint256 createdAt;
    }

    uint256 internal goodTimesCounter;
    address internal _letsGoAddress = address(0);

    LetsGoInterface internal oracle; // = LetsGoInterface(_letsGoAddress);

    mapping(uint256 => GoodTime) public goodTimesRegistry; // GoodTime[] goodTimesRegistry;
	// id of GTC, then user address 
	mapping(uint256 => mapping(address => uint256)) internal fundsPledgedByUser;
    
    mapping(address => uint256[]) goodTimesByUser;
    /// Users that pledged Can be from 0 - 100. Confirmation threshold as percentage of budget
    uint8 public withdrawThreshold;

    modifier gtcExists(uint256 _id) {
        // require(_id < goodTimesRegistry.length, "GTC does not exist");
        require(goodTimesRegistry[_id].budget != 0, "GTC does not exist");
        _;
    }

    modifier onlyParticipants(uint256 _id) {
        require(
            fundsPledgedByUser[_id][msg.sender] != 0,
            "You are not participating in the specified good times!"
        );
        _;
    }

    modifier gtcIsOpened(uint256 _id) {
        require(
            goodTimesRegistry[_id].closed == false,
            "This GTC has been closed, funds've been transfered!"
        );
        _;
    }

    event FailedWithdrawal(address caller, string message, uint256 required);
    event WithdrawalSuccess(uint256 gtcId, address caller);
    event LetsGoChanged(address newAddress);
    event ConfirmationAdded(address indexed caller, uint256 indexed gtcId);
	event RevokeConfirmation(address caller, uint256 indexed gtcId);

    constructor(uint8 threshold) Ownable() {
        require(threshold > 0 && threshold < 100, "Threshold must be between 0 and 100");
		withdrawThreshold = threshold;
		goodTimesCounter = 0;
        //    GoodTime memory initial = GoodTime();
        GoodTime storage initial = goodTimesRegistry[0];
        initial.id = 0;
        initial.name = "";
        initial.budget = 0;
		initial.closed = true;
        // goodTimesRegistry.push();
        goodTimesCounter++;
    }

    function pledgeFunds(uint256 id) public payable gtcExists(id) {
        GoodTime storage target = goodTimesRegistry[id];
        target.budget += msg.value;
        fundsPledgedByUser[id][msg.sender] += msg.value;
        //   uint[] storage usersGTCs = goodTimesByUser[msg.sender];
        //   usersGTCs.push(id);
        goodTimesByUser[msg.sender].push(id);
        //   bool doesExist = bytes(goodTimesRegistry[id].name).length != 0;
    }

    function createGoodTimes(string memory name, uint256 duration)
        public
        payable
        returns (uint256 _id)
    {
        // TODO add modifier to check if ether is sent
        GoodTime storage newGoodTime = goodTimesRegistry[goodTimesCounter];
        newGoodTime.id = goodTimesCounter;
        newGoodTime.name = name;
        newGoodTime.budget = 0 + msg.value;
        newGoodTime.durationInDays = duration;
		newGoodTime.createdAt = block.timestamp;
		
		fundsPledgedByUser[newGoodTime.id][msg.sender] += msg.value;
        goodTimesByUser[msg.sender].push(newGoodTime.id);

        _id = goodTimesCounter;
        goodTimesCounter++;
    }

    function checkFundsPledgedByUser(uint256 _id)
        public
        view
        returns (uint256 result)
    {
        result = fundsPledgedByUser[_id][msg.sender];
    }

    function checkIfUserIsEnrolled(uint256 _id) public view returns (bool) {
        return fundsPledgedByUser[_id][msg.sender] != 0;
    }

    function sendFundsToBookingContract(uint256 id)
        public
        onlyParticipants(id)
		gtcIsOpened(id)
    {
        GoodTime storage gtc = goodTimesRegistry[id];
        if (gtc.confirmations < (gtc.budget * withdrawThreshold) / 100) 
		{
            //string err = string(abi.encodePacked("Not enough confirmations to send transaction! Required", b))
            string
                memory errorMessage = "Not enough confirmations to send transaction! Required";
            emit FailedWithdrawal(
                msg.sender,
                errorMessage,
                (gtc.budget * withdrawThreshold) / 100
            );
            revert(errorMessage);
        }
        gtc.closed = true;

        // (bool success, ) = _letsGoAddress.call{value: gtc.budget}(abi.encodeWithSignature("receiveFundsFromGtc(uint256)", gtc.id));
        LetsGo destination = LetsGo(_letsGoAddress);
        destination.receiveFundsFromGtc{value: gtc.budget}(id);
        //   require(success, "Failed to send funds to LetsGo contract");
        emit WithdrawalSuccess(id, msg.sender);
    }

    function confirmWithdrawal(uint256 id)
        public
        onlyParticipants(id)
		gtcIsOpened(id)
    {
		GoodTime storage gtc = goodTimesRegistry[id];
		gtc.confirmations += fundsPledgedByUser[id][msg.sender];
        emit ConfirmationAdded(msg.sender, id);
    }

	function revokeConfirmation(uint id) public onlyParticipants(id) gtcIsOpened(id)
	{
		GoodTime storage gtc = goodTimesRegistry[id];
		gtc.confirmations -= fundsPledgedByUser[id][msg.sender];
		emit RevokeConfirmation(msg.sender, id);
	}

    function getUsersGTCs() public view returns (uint256[] memory) {
        return goodTimesByUser[msg.sender];
    }

    function updateLetsGoAddress(address destination) public onlyOwner {
        _letsGoAddress = destination;
        oracle = LetsGoInterface(destination);
        require(
            oracle.Validate() == 42,
            "Invalid address, destination must be LetsGo contract"
        );
        emit LetsGoChanged(destination);
    }
}
