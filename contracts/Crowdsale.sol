// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IWETH9} from "./IWETH9.sol";





contract Crowdsale {
    address public owner;
    ERC20 public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    
    bytes32 public merkleRoot;

   
    uint256 public saleStart;
    uint256 public saleEnd;       
    uint256 public fundingGoal;
    bool public finalized;
    bool public goalMet;          

    
    mapping(address => bool) public refunded;

    
    event Buy(address indexed buyer, uint256 amount, uint256 value);
    event CrowdsaleScheduled(uint256 saleStart, uint256 saleEnd, uint256 fundingGoal);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event MerkleRootUpdated(bytes32 newMerkleRoot);
    event BatchRefund(address indexed buyer, uint256 contribution);
    event PoolCreated(address pool);

    modifier onlyOwner() {
        require(msg.sender == owner, "caller must be owner");
        _;
    }
    modifier onlyDuringSale() {
        require(block.timestamp >= saleStart && block.timestamp < saleEnd, "Crowdsale is not active");
        _;
    }

    constructor(
        ERC20 _token,
        uint256 _price,
        uint256 _maxTokens,
        bytes32 _merkleRoot
    ) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        merkleRoot = _merkleRoot;
    }
    
    
     
    function scheduleCrowdsale(uint256 _saleStart, uint256 _saleEnd, uint256 _fundingGoal) public onlyOwner {
        require(_saleStart >= block.timestamp, "Start time must be in the future");
        require(_saleEnd > _saleStart, "End time must be greater than start time");
        require(_fundingGoal > 0, "Funding goal must be > 0");
        saleStart = _saleStart;
        saleEnd = _saleEnd;
        fundingGoal = _fundingGoal;
        emit CrowdsaleScheduled(_saleStart, _saleEnd, _fundingGoal);
    }

    
    function buyTokens(uint256 _amount, bytes32[] calldata _merkleProof)
        public
        payable
        onlyDuringSale
    {
        
        if (MerkleProof.verify(_merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender)))) {
            
        }
        
        require(msg.value == (_amount / 1e18) * price, "Incorrect ETH value");
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");
        tokensSold += _amount;
        require(token.transfer(msg.sender, _amount), "Token transfer failed");
        emit Buy(msg.sender, _amount, msg.value);
    }

    
    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    
    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }
    
    
    function finalize() public onlyOwner {
        require(block.timestamp >= saleEnd, "Sale not ended");
        require(!finalized, "Already finalized");
        finalized = true;
        uint256 currentBalance = address(this).balance;
        if (currentBalance >= fundingGoal) {
            goalMet = true;
            (bool sent, ) = owner.call{value: currentBalance}("");
            require(sent, "ETH transfer to owner failed");
            emit Finalize(tokensSold, currentBalance);
        } else {
            goalMet = false;
            emit Finalize(tokensSold, 0);
        }
    }

    
    function batchRefund(
        address[] calldata buyers_,
        uint256[] calldata contributions_,
        uint256[] calldata tokensBought_,
        bytes32[][] calldata proofs
    ) public onlyOwner {
        require(finalized, "Sale not finalized");
        require(!goalMet, "Funding goal met, no refunds");
        require(
            buyers_.length == contributions_.length &&
            buyers_.length == tokensBought_.length &&
            buyers_.length == proofs.length,
            "Array length mismatch"
        );
        for (uint256 i = 0; i < buyers_.length; i++) {
            address buyer = buyers_[i];
            if (!refunded[buyer]) {
                bytes32 leaf = keccak256(abi.encodePacked(buyer, contributions_[i], tokensBought_[i]));
                require(MerkleProof.verify(proofs[i], merkleRoot, leaf), "Invalid refund proof");
                refunded[buyer] = true;
                (bool sent, ) = buyer.call{value: contributions_[i]}("");
                require(sent, "Refund transfer failed");
                emit BatchRefund(buyer, contributions_[i]);
            }
        }
    }
    
    receive() external payable {}
}
