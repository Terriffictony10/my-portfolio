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
    uint256 public cost = 30000000000000000;

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
    ) Ownable(msg.sender)
    {
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

    // ===================== New Functions =====================

    /**
     * @dev Pays out `_value` wei of this contract's native currency to `_recipient`.
     *      Only callable by the contract's owner.
     * @param _recipient The address to receive the funds
     * @param _value The amount in wei to send
     */
    function payOut(address payable _recipient, uint256 _value)
        external
        onlyOwner
    {
        require(
            address(this).balance >= _value,
            "Insufficient contract balance"
        );
        (bool success, ) = _recipient.call{value: _value}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Returns the address of the contract's owner (redundant if you want
     *      to just call the inherited `owner()` from Ownable).
     */
    function getFactoryOwner() external view returns (address) {
        return owner();
    }

    // ===================== Existing Functions =====================

    function balanceOf(address _address)
        public
        view
        onlyOwner
        returns (uint256)
    {
        return token.balanceOf(_address);
    }

    function transfer(address _to, uint256 _value)
        public
        onlyOwner
        returns (bool)
    {
        return token.transfer(_to, _value);
    }
}
