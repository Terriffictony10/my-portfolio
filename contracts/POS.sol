// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";
contract POS is Ownable{
    
    
    struct menuItem {
        uint256 cost;
        string name;
    }
    struct Ticket {
        string name;
        menuItem[] orders;
        address server;
        uint256 id;
        bool paid;
    }
    event menuItemAdded(
        string name,
        uint256 indexOfId,
        uint256 timestamp
    );
    event newTicketAdded(
        string name,
        address server,
        uint256 indexOfId,
        uint256 timestamp
    );
    
    bool public service; 

    string public name;
    uint256 public nextMenuItemId;
    uint256[] public menuItemIds;
    mapping(uint256 => menuItem) public menu;


    uint256 public nextTicketId;
    uint256[] public TicketIds;
    mapping(uint256 => Ticket) public tickets;

    constructor(
        string memory _name, 
        address _owner
    ) Ownable(_owner){
        name = _name;
    }
    
    receive() external payable {
        
    }
    function getTicket(uint256 _id) public view returns(Ticket memory){
        return tickets[_id];
    }
    function getMenuItemIds() public view returns(uint256[] memory){
        return menuItemIds;
    }
    function addMenuItem(uint256 _cost, string memory _name) public {
        nextMenuItemId++;
        menu[nextMenuItemId] = menuItem(_cost, _name);
        menuItemIds.push(nextMenuItemId);
        emit menuItemAdded(_name, menuItemIds.length - 1, block.timestamp);
    }
    function removeMenuItem (uint256 _id, uint256 _index) public {
        require(bytes(menu[_id].name).length != 0, "Menu item does not exist");
        delete menu[_id];
        delete menuItemIds[_index];
    }
    function createTicket(address _server, string memory _name) public {
    nextTicketId++;
    // Create the ticket first with default values
    Ticket storage newTicket = tickets[nextTicketId];
    newTicket.name = _name;
    newTicket.server = _server;
    newTicket.id = nextTicketId;
    newTicket.paid = false;

    TicketIds.push(nextTicketId);
    emit newTicketAdded(_name, _server, TicketIds.length - 1, block.timestamp);
    }
    function payTicket(uint256 ticketId, address _customer) payable public {
        uint256 _balance = 0;
        Ticket storage ticket = tickets[ticketId]; 
        for (uint256 i = 0; i < ticket.orders.length; i++){
            _balance += ticket.orders[i].cost;
        }
        require(_customer.balance >= _balance, "Insufficient balance in customer account");
        
        require(msg.value >= _balance, "insufficient balance input");
        ticket.paid = true;
    }
   function addTicketOrders(uint256 ticketId, menuItem[] memory _orders) public {
    require(_orders.length > 0, "please input some actual orders");
    bool isTicket = false;

    // Loop to find the ticket by ID
    for (uint256 i = 0; i < TicketIds.length; i++) {
        if (TicketIds[i] == ticketId) {
            // Access the ticket in storage (assuming `tickets` is a mapping or array of Ticket structs)
            Ticket storage ticket = tickets[ticketId]; 
            isTicket = true;

            // Add the orders to the ticket
            for (uint256 j = 0; j < _orders.length; j++) {
                ticket.orders.push(_orders[j]);
            }
            break;
        }
    }

    require(isTicket, "Ticket does not exist");
}

}