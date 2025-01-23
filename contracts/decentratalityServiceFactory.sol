// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IrestaurantDeployer {
    function deployRestaurant(
        string memory _name,
        address _owner,
        address _posDeployer
    ) external returns (address);
}

contract decentratalityServiceFactory is Ownable {
    ERC20 public token;
    IrestaurantDeployer public restaurantDeployer;
    address public posDeployer;
    uint256 public cost = 0;

    mapping(uint256 => address) public restaurants;
    uint256 public nextRestaurantId;

    event RestaurantCreated(
        address indexed restaurant,
        uint256 id,
        address owner
    );
    event FundsAdded(
        address indexed restaurant,
        uint256 id,
        uint256 timestamp
    );

    modifier onlyInvestor() {
        require(token.balanceOf(msg.sender) > 0, "must be token holder");
        _;
    }

    constructor(
        ERC20 _token,
        IrestaurantDeployer _restaurantDeployer,
        address _posDeployer
    ) Ownable(msg.sender) {
        token = _token;
        restaurantDeployer = _restaurantDeployer;
        posDeployer = _posDeployer;
    }

    receive() external payable {}

    function createRestaurant(
        string memory _name,
        uint256 _startingCash
    ) public payable returns (uint256, address) {
        require(msg.value >= _startingCash + cost, "Insufficient starting cash");

        // Deploy the new Restaurant contract via the deployer
        address restaurant =
            restaurantDeployer.deployRestaurant(_name, msg.sender, posDeployer);

        nextRestaurantId++;
        restaurants[nextRestaurantId] = restaurant;

        emit RestaurantCreated(restaurant, nextRestaurantId, msg.sender);

        _addFunds(_startingCash, payable(restaurant));

        emit FundsAdded(restaurant, nextRestaurantId, block.timestamp);

        return (nextRestaurantId, restaurant);
    }

    function _addFunds(
        uint256 _amount,
        address payable _restaurant
    ) internal {
        (bool sent, ) = _restaurant.call{value: _amount}("");
        require(sent, "failed to send");
    }

    /**
     * @dev Returns an array of all restaurant addresses.
     */
    function getAllRestaurants() public view returns (address[] memory) {
        address[] memory allRestaurants = new address[](nextRestaurantId);
        for (uint256 i = 1; i <= nextRestaurantId; i++) {
            allRestaurants[i - 1] = restaurants[i];
        }
        return allRestaurants;
    }
}
