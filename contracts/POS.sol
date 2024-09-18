// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";
contract POS is Ownable{
    
    
    struct menuItem {
        uint256 cost;
        string name;
    }

    string public name;
    uint256 public nextMenuItemId;
    uint256[] public menuItemIds;
    mapping(uint256 => menuItem) public menu;
    constructor(
        string memory _name, 
        address _owner
    ) Ownable(_owner){
        name = _name;
    }
    
    receive() external payable {
        
    }
    function getMenuItemIds() public view returns(uint256[] memory){
        return menuItemIds;
    }
    function addMenuItem(uint256 _cost, string memory _name) public {
        nextMenuItemId++;
        menu[nextMenuItemId] = menuItem(_cost, _name);
        menuItemIds.push(nextMenuItemId);
    }
    function removeMenuItem (uint256 _id) public {
        require(bytes(menu[_id].name).length != 0, "Menu item does not exist");
        delete menu[_id];
    }
}