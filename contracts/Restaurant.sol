// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Restaurant is Ownable{
	string public name;
	constructor(
		string memory _name
	) Ownable(msg.sender){
		name = _name;
	}
	
	receive() external payable {
		
	}

	function payOwner(uint256 _amount) public {
		// Require that the contract has enough Ether to perform the transaction
        require(address(this).balance >= _amount, "Insufficient contract balance to perform the transaction");
        
		(bool sent, ) = owner().call{value: _amount}("");
		require(sent);
	}
}