// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./POS.sol";

contract POSDeployer {
    function deployPOS(
        string memory _name,
        address _owner,
        address _restaurant
    ) external returns (address) {
        POS pos = new POS(_name, _owner, _restaurant);
        return address (pos);
    }
}
