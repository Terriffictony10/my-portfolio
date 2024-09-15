// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name; // Name of the token
    string public symbol; // Symbol of the token
    uint256 public decimals = 18; // Number of decimals the token uses
    uint256 public totalSupply;
    address public deployer; // Total supply of the token

    mapping(address => uint256) public balanceOf; // Mapping to track balances of addresses
    mapping(address => mapping(address => uint256)) public allowance; // Mapping to track allowances
    

    // Event to emit on transfers
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    // Event to emit on approvals
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    
    // Constructor to initialize the token with a name, symbol, and total supply
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals); // Adjust total supply for decimals
        balanceOf[msg.sender] = totalSupply; // Assign all tokens to contract creator
        deployer = msg.sender;
    }

    // Function to transfer tokens
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // Ensure the sender has enough balance
        require(balanceOf[msg.sender] >= _value);

        // Call internal transfer function
        _transfer(msg.sender, _to, _value);

        return true;
    }

    // Internal function to handle transfers
    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        // Prevent transfer to 0x0 address
        require(_to != address(0));

        // Deduct from sender's balance
        balanceOf[_from] = balanceOf[_from] - _value;
        // Add to recipient's balance
        balanceOf[_to] = balanceOf[_to] + _value;

        // Emit transfer event
        emit Transfer(_from, _to, _value);
    }

    // Function to approve tokens for spending by another address
    function approve(address _spender, uint256 _value)
        public
        returns(bool success)
    {
        // Prevent approval for 0x0 address
        require(_spender != address(0));

        // Set allowance
        allowance[msg.sender][_spender] = _value;

        // Emit approval event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Function to transfer tokens from one address to another using allowance
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        returns (bool success)
    {
        // Ensure the sender has enough balance and allowance
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        // Deduct from allowance
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

        // Call internal transfer function
        _transfer(_from, _to, _value);

        return true;
    }

}