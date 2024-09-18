// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Restaurant.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Decentratality is ERC20, Ownable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
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
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Admin role
        _grantRole(MINTER_ROLE, msg.sender);        // Initial minter role
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    receive() external payable {
        
    }
    function mint(uint256 _amount, address _to) public onlyRole(MINTER_ROLE) nonReentrant {
        require(_to != address(0), "Invalid address: cannot mint to zero address");
        _mint(_to, _amount);
    }
}