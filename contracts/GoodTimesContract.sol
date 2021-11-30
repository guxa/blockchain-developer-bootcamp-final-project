// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LetsGo.sol";

/// @title GoodTimes Contract
/// @notice Contract manages the creation of GoodTimes and interaction with them
/// @author Jane G Nov 2021
contract GoodTimesContract is Ownable {
    
	struct GoodTime {
        uint256 id;
        string name;
        uint256 durationInDays;
        uint256 budget;
        /// @dev confirmations in wei, needed to transfer the GoodTime to LetsGo
        uint256 confirmations;
        bool closed;
		uint256 createdAt;
    }

    uint256 internal goodTimesCounter;

    address internal _letsGoAddress = address(0);
    LetsGoInterface internal oracle;

	/// @notice registry of created GoodTime objects
    mapping(uint256 => GoodTime) public goodTimesRegistry;

	/// @notice registry of funds pledged by Each user for each GoodTime object
	mapping(uint256 => mapping(address => uint256)) internal fundsPledgedByUser;

	/// @notice registry of confirmations by user for each GoodTime
	/// @dev the uint256 value of the scond mapping represents the funds pledged by the user who has called confirm withdrawal
	mapping(uint256 => mapping(address => uint256)) internal confirmationsByUser;
    
	/// @notice registry of GoodTimes that a user is particiapting in
    mapping(address => uint256[]) goodTimesByUser;
	
    /// @notice Confirmation threshold as percentage of budget. Can be from 0 - 100.
    uint8 public withdrawThreshold;

    modifier gtcExists(uint256 _id) {
        require(_id <= goodTimesCounter, "GTC does not exist");
        _;
    }

	/// @dev Checks if the sender of message is participating in the goodTime
	/// @param _id an id of existing GoodTime 
    modifier onlyParticipants(uint256 _id) {
        require(
            fundsPledgedByUser[_id][msg.sender] != 0,
            "You are not participating in the specified good times!"
        );
        _;
    }

	/// @param _id an id of existing GoodTime 
    modifier gtcIsOpened(uint256 _id) {
        require(
            goodTimesRegistry[_id].closed == false,
            "This GTC has been closed, funds've been transfered!"
        );
        _;
    }

	/// @notice Throws exception if msg.sender has previously confirmed withdrawal for the GoodTime with the specified id
	/// @param _id an id of existing GoodTime
	modifier rejectIfUserConfirmedWithdrawal(uint256 _id) {
        require(confirmationsByUser[_id][msg.sender] == 0, "You have already Confirmed withdrawal !");
        _;
    }

	event GtcCreated(uint256 indexed gtcId, address indexed creator);
    event FailedWithdrawal(address caller, string message, uint256 required);
    event WithdrawalSuccess(uint256 gtcId, address caller);
    event LetsGoChanged(address newAddress);
    event ConfirmationAdded(address indexed caller, uint256 indexed gtcId);
	event RevokeConfirmation(address caller, uint256 indexed gtcId);

    
	/******************************************************************
       Functions
    ******************************************************************/

	/// @dev GoodTimes constructor, sets withdrawThresold.
	/// @param threshold represents withdrawal thershold i.e. how much confirmations will be needed to send funds to LetsGo contract
    constructor(uint8 threshold) Ownable() {
        require(threshold > 0 && threshold < 100, "Threshold must be between 0 and 100");
		withdrawThreshold = threshold;
		goodTimesCounter = 0;
        GoodTime storage initial = goodTimesRegistry[0];
        initial.id = 0;
        initial.name = "";
        initial.budget = 0;
		initial.closed = true;
    }

	/// @notice Attributes funds to the GoodTime and adds the user as a participant
	/// @param id The id of the GoodTime
    function pledgeFunds(uint256 id) public payable 
	gtcExists(id) 
	gtcIsOpened(id) 
	rejectIfUserConfirmedWithdrawal(id)
	{
		require(msg.value != 0, "You have to send some ETH to create a GoodTime :)");
        GoodTime storage target = goodTimesRegistry[id];
        target.budget += msg.value;
        fundsPledgedByUser[id][msg.sender] += msg.value;

        goodTimesByUser[msg.sender].push(id);
    }

	/// @notice Creates a new GoodTime with inital budget of the value send in the transaciton
	/// @param name The title of the GoodTime
	/// @param duration Duration in days
	/// @return _id returns the id of the created GoodTime
    function createGoodTimes(string memory name, uint256 duration)
        public
        payable
        returns (uint256 _id)
    {
        require(msg.value != 0, "You have to send some ETH to create a GoodTime :)");
		goodTimesCounter++;
		// _id = goodTimesCounter;
        GoodTime storage newGoodTime = goodTimesRegistry[goodTimesCounter];
        newGoodTime.id = _id = goodTimesCounter;
        newGoodTime.name = name;
        newGoodTime.budget = 0 + msg.value;
        newGoodTime.durationInDays = duration;
		newGoodTime.createdAt = block.timestamp;
		
		fundsPledgedByUser[newGoodTime.id][msg.sender] += msg.value;
        goodTimesByUser[msg.sender].push(newGoodTime.id);
        
		emit GtcCreated(_id, msg.sender);
    }

	/// @notice Gets the value of funds the user has pledged to a specific GoodTime
	/// @param _id The id of the GoodTime
	/// @return result value pledged by the user in wei
    function checkFundsPledgedByUser(uint256 _id) public view returns (uint256 result)
    {
        result = fundsPledgedByUser[_id][msg.sender];
    }

	/// @notice Checks if user has pledged any funds to the specified GoodTime
	/// @param _id The id of the GoodTime
	/// @return true if the user is participant of the GoodTime else false
    function checkIfUserIsEnrolled(uint256 _id) public view returns (bool) {
        return fundsPledgedByUser[_id][msg.sender] != 0;
    }
	
	/// @notice sends the budget of the specified GoodTime to the LetsGo contract. GoodTime needs to have enough confirmations for this to pass
	/// @param id The id of the GoodTime
    function sendFundsToBookingContract(uint256 id)
        public
		gtcExists(id)
        onlyParticipants(id)
		gtcIsOpened(id)
    {
        GoodTime storage gtc = goodTimesRegistry[id];
		gtc.closed = true;
        if (gtc.confirmations < (gtc.budget * withdrawThreshold) / 100) 
		{
            //string err = string(abi.encodePacked("Not enough confirmations to send transaction! Required", b))
            string
                memory errorMessage = "Not enough confirmations to send transaction !";
            emit FailedWithdrawal(
                msg.sender,
                errorMessage,
                (gtc.budget * withdrawThreshold) / 100
            );
            revert(errorMessage);
        }
        // (bool success, ) = _letsGoAddress.call{value: gtc.budget}(abi.encodeWithSignature("receiveFundsFromGtc(uint256)", gtc.id));
        //   require(success, "Failed to send funds to LetsGo contract");
		LetsGo destination = LetsGo(_letsGoAddress);
        destination.receiveFundsFromGtc{value: gtc.budget}(id);        
        emit WithdrawalSuccess(id, msg.sender);
    }

	/// @notice Adds the caller's pledged funds to the confirmation param of the GoodTime.
	/// @param id The id of the GoodTime
    function confirmWithdrawal(uint256 id)
        public
        onlyParticipants(id)
		gtcIsOpened(id)
		rejectIfUserConfirmedWithdrawal(id)
    {
		GoodTime storage gtc = goodTimesRegistry[id];
		gtc.confirmations += fundsPledgedByUser[id][msg.sender];
		confirmationsByUser[id][msg.sender] += fundsPledgedByUser[id][msg.sender];
        emit ConfirmationAdded(msg.sender, id);
    }

	/// @notice Remove the caller's pledged funds from the confirmation param of the GoodTime.
	/// @param id The id of the GoodTime
	function revokeConfirmation(uint id) public onlyParticipants(id) gtcIsOpened(id)
	{
		require(confirmationsByUser[id][msg.sender] != 0, "You have not made a confirmation !");
		GoodTime storage gtc = goodTimesRegistry[id];
		gtc.confirmations -= fundsPledgedByUser[id][msg.sender];
		emit RevokeConfirmation(msg.sender, id);
	}

	/// @notice Gets the ids of all the GoodTimes where the caller is participating
	/// @return array of uints which reprsent ids of GoodTimes
    function getUsersGTCs() public view returns (uint256[] memory) {
        return goodTimesByUser[msg.sender];
    }

	/// @dev updates the address and the LetsGo contract kept in oracle variable
	/// @param destination address of the new LetsGo contract
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
