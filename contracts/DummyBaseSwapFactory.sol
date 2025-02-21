// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract DummyBaseSwapFactory {
    
    address public lastPool;

    
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool) {
        
        pool = address(new DummyPool(tokenA, tokenB, fee));
        lastPool = pool;
    }
}

contract DummyPool {
    
    address public tokenA;
    address public tokenB;
    uint24 public fee;

    constructor(address _tokenA, address _tokenB, uint24 _fee) {
        tokenA = _tokenA;
        tokenB = _tokenB;
        fee = _fee;
    }
}
