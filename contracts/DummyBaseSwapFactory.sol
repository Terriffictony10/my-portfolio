// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract DummyBaseSwapFactory {
    // Stores the address of the last pool created.
    address public lastPool;

    /**
     * @notice Creates a dummy pool for the given token pair and fee.
     * @param tokenA The first token address.
     * @param tokenB The second token address.
     * @param fee The fee tier for the pool.
     * @return pool The address of the newly created dummy pool.
     */
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool) {
        // For testing purposes, we deploy a new DummyPool.
        pool = address(new DummyPool(tokenA, tokenB, fee));
        lastPool = pool;
    }
}

contract DummyPool {
    // Public variables to store the dummy pool parameters.
    address public tokenA;
    address public tokenB;
    uint24 public fee;

    constructor(address _tokenA, address _tokenB, uint24 _fee) {
        tokenA = _tokenA;
        tokenB = _tokenB;
        fee = _fee;
    }
}
