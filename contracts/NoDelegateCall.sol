// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

/// @title Prevents delegatecall to a contract
/// @notice Base contract that provides a modifier for preventing delegatecall to methods in a child contract
abstract contract NoDelegateCall {
    /// @dev The original address of this contract
    address private immutable original;

    constructor() {
        // Immutables are computed in the init code of the contract, then inlined into the deployed bytecode.
        // This variable won't change at runtime.
        original = address(this);
    }

    /// @dev Private method used by the modifier to check that the contract is not being delegate-called.
    function checkNotDelegateCall() private view {
        require(address(this) == original, "Delegatecall is not allowed");
    }

    /// @notice Prevents delegatecall into the modified method.
    modifier noDelegateCall() {
        checkNotDelegateCall();
        _;
    }
}
