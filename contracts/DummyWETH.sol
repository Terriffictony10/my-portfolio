// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract DummyWETH {
    string public name = "Dummy Wrapped Ether";
    string public symbol = "WETH";
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
    }

    
    function approve(address spender, uint256 amount) public returns (bool success) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    
    function withdraw(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    
    receive() external payable {
        deposit();
    }
}
