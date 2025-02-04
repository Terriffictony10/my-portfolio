// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Crowdsale
 * @notice This crowdsale contract uses a Merkle proof during purchase to (optionally) mark buyers for gas savings.
 *         It does not store per-buyer refund data on-chain; instead, each purchase emits a Buy event.
 *         After the sale ends, the owner is expected to obtain off-chain refund data (as a Merkle tree)
 *         and, if the funding goal is not met, automatically process refunds via a batch function.
 */
contract Crowdsale {
    address public owner;
    ERC20 public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    // Merkle root used for whitelist-checking during purchase.
    bytes32 public merkleRoot;

    // Crowdsale timing and funding variables.
    uint256 public saleStart;
    uint256 public saleEnd;       // Crowdsale end time.
    uint256 public fundingGoal;
    bool public finalized;
    bool public goalMet;          // True if funding goal met at finalization.

    // Instead of storing per-buyer mappings, we rely on off-chain aggregation.
    // Refunds are processed via a batch function that accepts arrays of refund records.
    mapping(address => bool) public refunded;

    event Buy(address indexed buyer, uint256 amount, uint256 value);
    event CrowdsaleScheduled(uint256 saleStart, uint256 saleEnd, uint256 fundingGoal);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event MerkleRootUpdated(bytes32 newMerkleRoot);
    event BatchRefund(address indexed buyer, uint256 contribution);

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
    
    /**
     * @notice Schedule the crowdsale.
     * @param _saleStart The start timestamp.
     * @param _saleEnd The end timestamp.
     * @param _fundingGoal The funding goal (in wei).
     */
    function scheduleCrowdsale(uint256 _saleStart, uint256 _saleEnd, uint256 _fundingGoal) public onlyOwner {
        require(_saleStart >= block.timestamp, "Start time must be in the future");
        require(_saleEnd > _saleStart, "End time must be greater than start time");
        require(_fundingGoal > 0, "Funding goal must be > 0");
        saleStart = _saleStart;
        saleEnd = _saleEnd;
        fundingGoal = _fundingGoal;
        emit CrowdsaleScheduled(_saleStart, _saleEnd, _fundingGoal);
    }

    /**
     * @notice Purchase tokens by sending ETH and a Merkle proof.
     * @param _amount Number of tokens to purchase (in token's smallest units).
     * @param _merkleProof An array of hashes which, if valid, prove the buyer is whitelisted (for gas saving).
     *
     * Regardless of the proof’s validity, the purchase goes through. All buyer data is logged via the Buy event.
     */
    function buyTokens(uint256 _amount, bytes32[] calldata _merkleProof)
        public
        payable
        onlyDuringSale
    {
        // Check Merkle proof for gas saving (does not restrict purchase).
        if (MerkleProof.verify(_merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender)))) {
            // Optionally, one might emit an event or mark the buyer off-chain.
        }
        require(msg.value == (_amount / 1e18) * price, "Incorrect ETH value");
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");
        tokensSold += _amount;
        require(token.transfer(msg.sender, _amount), "Token transfer failed");
        emit Buy(msg.sender, _amount, msg.value);
    }

    /// @notice Update the token price.
    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    /// @notice Update the whitelist Merkle root.
    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }
    
    /**
     * @notice Finalize the crowdsale.
     * @dev Only callable by the owner after saleEnd.
     *      If the funding goal is met, transfers all ETH to the owner.
     *      Otherwise, no ETH is transferred; refunds are handled via batchRefund.
     */
    function finalize() public onlyOwner {
        require(block.timestamp >= saleEnd, "Sale not ended");
        require(!finalized, "Already finalized");
        finalized = true;
        if (address(this).balance >= fundingGoal) {
            goalMet = true;
            uint256 ethRaised = address(this).balance;
            (bool sent, ) = owner.call{value: ethRaised}("");
            require(sent, "ETH transfer failed");
            emit Finalize(tokensSold, ethRaised);
        } else {
            goalMet = false;
            emit Finalize(tokensSold, 0);
        }
    }

    /**
     * @notice Batch process refunds for a list of buyers.
     * @param buyers_ Array of buyer addresses.
     * @param contributions_ Array of corresponding contributions (in wei) for each buyer.
     * @param tokensBought_ Array of tokens purchased for each buyer.
     * @param proofs Array of Merkle proofs for each buyer (each proof is an array of bytes32).
     * @dev Each refund record is verified against the final off-chain computed Merkle tree.
     *      The leaf is computed as keccak256(abi.encodePacked(buyer, contribution, tokensBought)).
     *      To avoid double refunds, a buyer can only be refunded once.
     */
    function batchRefund(
        address[] calldata buyers_,
        uint256[] calldata contributions_,
        uint256[] calldata tokensBought_,
        bytes32[][] calldata proofs
    ) public onlyOwner {
        require(finalized, "Sale not finalized");
        require(!goalMet, "Funding goal met, no refunds");
        require(buyers_.length == contributions_.length && buyers_.length == tokensBought_.length && buyers_.length == proofs.length, "Array length mismatch");
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
}
