// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract MenuTicketBase {
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

    uint256 public nextMenuItemId;
    uint256[] public menuItemIds;
    mapping(uint256 => menuItem) public menu;

    uint256 public nextTicketId;
    uint256[] public TicketIds;
    mapping(uint256 => Ticket) public tickets;

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

    
    function addMenuItem(uint256 _cost, string memory _name) public {
        nextMenuItemId++;
        menu[nextMenuItemId] = menuItem(_cost, _name);
        menuItemIds.push(nextMenuItemId);
        emit menuItemAdded(_name, menuItemIds.length - 1, block.timestamp);
    }

    function removeMenuItem(uint256 _id, uint256 _index) public {
        require(bytes(menu[_id].name).length != 0, "Menu item does not exist");
        delete menu[_id];
        delete menuItemIds[_index];
    }

  
    function createTicket(address _server, string memory _name) public {
        nextTicketId++;
        Ticket storage newTicket = tickets[nextTicketId];
        newTicket.name = _name;
        newTicket.server = _server;
        newTicket.id = nextTicketId;
        newTicket.paid = false;

        TicketIds.push(nextTicketId);
        emit newTicketAdded(_name, _server, TicketIds.length - 1, block.timestamp);
    }

    function addTicketOrders(uint256 ticketId, menuItem[] memory _orders) public {
        require(_orders.length > 0, "Please input some actual orders");
        bool isTicket = false;

        for (uint256 i = 0; i < TicketIds.length; i++) {
            if (TicketIds[i] == ticketId) {
                Ticket storage ticket = tickets[ticketId];
                isTicket = true;

                for (uint256 j = 0; j < _orders.length; j++) {
                    ticket.orders.push(_orders[j]);
                }
                break;
            }
        }

        require(isTicket, "Ticket does not exist");
    }
}
