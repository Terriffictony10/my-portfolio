//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Crowdsale {
	address public owner;
	ERC20 public token;
	uint256 public price;
	uint256 public maxTokens;
	uint256 public tokensSold;
	// uint256 public start = "";
	// uint256 public end = "";
	// uint256 public goal = "";
	
	event Buy(uint256 amount, address buyer);
	event Finalize(uint256 tokensSold, uint256 ethRaised);


	constructor(
		ERC20 _token,
		uint256 _price,
		uint256 _maxTokens
		) {
		owner = msg.sender;
		token = _token;
		price = _price;
		maxTokens = _maxTokens;
	}
	modifier onlyOwner() {
		require(msg.sender == owner, 'caller must be owner');
		_;
	}
	receive() external payable {
		uint256 amount = msg.value / price;
		buyTokens(amount * 1e18);
	}

	function buyTokens(uint256 _amount) public payable {
		require(msg.value == (_amount / 1e18) * price);
		require(token.balanceOf(address(this)) >= _amount);
		require(token.transfer(msg.sender, _amount ));

		tokensSold += _amount;

		emit Buy(_amount, msg.sender);
	}
	function setPrice(uint256 _price) public onlyOwner{
		price = _price;
	}
	function finalize() public onlyOwner{
		require(token.transfer(owner, token.balanceOf(address(this))));
		uint256 value = address(this).balance;
		(bool sent, ) = owner.call{ value: value } ("");

		require(sent);
		emit Finalize(tokensSold, value);

	}

} 