// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Restaurant.sol";

contract RestaurantDeployer {
    function deployRestaurant(string memory _name, address _owner, address _posDeployer) external returns (address) {
        Restaurant restaurant = new Restaurant(_name, _owner, IPOSDeployer(_posDeployer));
        return address(restaurant);
    }
}
