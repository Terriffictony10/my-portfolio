// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Restaurant.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Decentratality is ERC20, Ownable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    

    modifier onlyInvestor () {
        require(
            balanceOf(msg.sender) > 0,
            'must be token holder'
        );
        _;
    }
    
    constructor(
        
    )ERC20("Decentratality", "DHPT") Ownable(msg.sender){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); 
        _grantRole(MINTER_ROLE, msg.sender);        
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    receive() external payable {
        
    }
    function mint(uint256 _amount, address _to) public onlyRole(MINTER_ROLE) nonReentrant {
        require(_to != address(0), "Invalid address: cannot mint to zero address");
        _mint(_to, _amount);
    }
}