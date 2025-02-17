// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract DummyWETH {
    string public name = "Dummy Wrapped Ether";
    string public symbol = "WETH";
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /// @notice Deposits ETH and credits the sender with the equivalent amount of WETH.
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
    }

    /// @notice Approves a spender to use a specified amount of WETH on behalf of the sender.
    /// @param spender The address authorized to spend.
    /// @param amount The amount of WETH to approve.
    /// @return success True if the approval succeeds.
    function approve(address spender, uint256 amount) public returns (bool success) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    /// @notice Optionally, a withdraw function to convert WETH back to ETH.
    /// @param amount The amount of WETH to withdraw.
    function withdraw(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    /// @notice Fallback function to accept ETH directly.
    receive() external payable {
        deposit();
    }
}
