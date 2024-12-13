// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MenuTicketBase.sol";

contract POS is Ownable, MenuTicketBase {
    string public name;
    address public restaurant;

    constructor(
        string memory _name,
        address _owner,
        address _restaurant
    ) Ownable(_owner) {
        name = _name;
        restaurant = _restaurant;
    }

    receive() external payable {}

    modifier onlyRestaurant() {
        require(restaurant == _msgSender(), "Ownable: caller is not the Restaurant");
        _;
    }

    function getTicket(uint256 _id) public view returns (Ticket memory) {
        return tickets[_id];
    }

    function getMenuItemIds() public view returns (uint256[] memory) {
        return menuItemIds;
    }

    function payTicket(uint256 ticketId, address _customer) payable public {
        uint256 _balance = 0;
        Ticket storage ticket = tickets[ticketId];
        for (uint256 i = 0; i < ticket.orders.length; i++) {
            _balance += ticket.orders[i].cost;
        }
        require(_customer.balance >= _balance, "Insufficient balance in customer account");
        require(msg.value >= _balance, "Insufficient balance input");
        ticket.paid = true;
    }

    function payRestaurant() public onlyRestaurant {
        (bool sent, ) = restaurant.call{value: address(this).balance}("");
        require(sent);
    }
    function payEmployees() public onlyRestaurant {
        (bool sent, ) = restaurant.call{value: address(this).balance}("");
        require(sent);
    }
    function getName() public view onlyOwner returns (string memory){
        return name;
    }
}
