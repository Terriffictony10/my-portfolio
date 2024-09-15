// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Restaurant.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Decentratality is ERC20, Ownable{

    // Mapping to store restaurant contracts with their IDs
    mapping(uint256 => Restaurant) public restaurants;

    // Variable to track the next restaurant ID
    uint256 public nextRestaurantId;
    
    event RestaurantCreated(
        address restaurant, 
        uint256 id
    );
    event fundsAdded(
        address restaurant, 
        uint256 id,
        uint256 timestamp
    );

    modifier onlyInvestor () {
        require(
            balanceOf(msg.sender) > 0,
            'must be token holder'
        );
        _;
    }
    
    // Constructor to initialize the token with a name, symbol, and total supply
    constructor(
        
    )ERC20("Decentratality", "DHPT") Ownable(msg.sender){
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    receive() external payable {
        
    }

    
    function createRestaurant(
        string memory _name,
        uint256 _startingCash
    ) public payable onlyInvestor returns(uint256){
       // Create the new Restaurant contract
    require(msg.value >= _startingCash);
    Restaurant restaurant = new Restaurant(_name);

    // Increment the nextRestaurantId for the newly created restaurant
    nextRestaurantId++;

    // Map the newly created restaurant contract to the nextRestaurantId
    restaurants[nextRestaurantId] = restaurant;

    // Emit an event with the address and the ID of the new restaurant
    emit RestaurantCreated(address(restaurant), nextRestaurantId);

    _addFunds(_startingCash, restaurant);

    emit fundsAdded(address(restaurant), nextRestaurantId, block.timestamp);

    // Return the newly created restaurant contract
    return nextRestaurantId;
    }
    function _addFunds(
        uint256 _amount, 
        Restaurant _restaurant
    ) internal {    
         (bool sent, ) = address(_restaurant).call{value: _amount}("");
         require(sent, "failed to send"); 
    }
}