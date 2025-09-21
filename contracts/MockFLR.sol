// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockFLR
 * @dev Mock FLR token for testing revenue distribution
 */
contract MockFLR is ERC20, Ownable {
    constructor() ERC20("Mock Flare", "MFLR") {
        _mint(msg.sender, 1000000 * 10**18); // Mint 1M tokens for testing
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
