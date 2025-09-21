// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RevenueSplitter
 * @dev Handles pro-rata revenue distribution to active claim holders
 */
contract RevenueSplitter is Ownable, ReentrancyGuard {
    
    using SafeERC20 for IERC20;
    
    struct Holder {
        address holder;
        uint256 basisPoints;
        bool isActive;
    }
    
    struct Distribution {
        uint256 projectId;
        uint256 totalAmount;
        uint256 totalBasisPoints;
        uint256 timestamp;
        uint256 activeHolders;
    }
    
    mapping(uint256 => Distribution[]) public projectDistributions;
    mapping(uint256 => mapping(address => uint256)) public userDistributions; // projectId => user => totalReceived
    
    event RevenueDistributed(
        uint256 indexed projectId,
        uint256 totalAmount,
        uint256 totalBasisPoints,
        uint256 activeHolders
    );
    
    event HolderPaid(
        uint256 indexed projectId,
        address indexed holder,
        uint256 amount,
        uint256 basisPoints
    );
    
    constructor() {}
    
    /**
     * @dev Split revenue pro-rata among active claim holders
     */
    function split(
        IERC20 asset,
        uint256 amount,
        Holder[] calldata activeHolders
    ) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(activeHolders.length > 0, "No active holders");
        
        // Calculate total basis points
        uint256 totalBasisPoints = 0;
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < activeHolders.length; i++) {
            if (activeHolders[i].isActive && activeHolders[i].basisPoints > 0) {
                totalBasisPoints += activeHolders[i].basisPoints;
                activeCount++;
            }
        }
        
        require(totalBasisPoints > 0, "No valid holders");
        require(totalBasisPoints <= 10000, "Invalid basis points total");
        
        // Transfer asset from caller to this contract
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        // Distribute to each active holder
        for (uint256 i = 0; i < activeHolders.length; i++) {
            if (activeHolders[i].isActive && activeHolders[i].basisPoints > 0) {
                uint256 share = (amount * activeHolders[i].basisPoints) / totalBasisPoints;
                
                if (share > 0) {
                    asset.safeTransfer(activeHolders[i].holder, share);
                    userDistributions[0][activeHolders[i].holder] += share; // Using 0 as default projectId
                    
                    emit HolderPaid(0, activeHolders[i].holder, share, activeHolders[i].basisPoints);
                }
            }
        }
        
        // Record distribution
        projectDistributions[0].push(Distribution({
            projectId: 0,
            totalAmount: amount,
            totalBasisPoints: totalBasisPoints,
            timestamp: block.timestamp,
            activeHolders: activeCount
        }));
        
        emit RevenueDistributed(0, amount, totalBasisPoints, activeCount);
    }
    
    /**
     * @dev Split revenue for a specific project
     */
    function splitForProject(
        uint256 projectId,
        IERC20 asset,
        uint256 amount,
        Holder[] calldata activeHolders
    ) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(activeHolders.length > 0, "No active holders");
        
        // Calculate total basis points
        uint256 totalBasisPoints = 0;
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < activeHolders.length; i++) {
            if (activeHolders[i].isActive && activeHolders[i].basisPoints > 0) {
                totalBasisPoints += activeHolders[i].basisPoints;
                activeCount++;
            }
        }
        
        require(totalBasisPoints > 0, "No valid holders");
        require(totalBasisPoints <= 10000, "Invalid basis points total");
        
        // Transfer asset from caller to this contract
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        // Distribute to each active holder
        for (uint256 i = 0; i < activeHolders.length; i++) {
            if (activeHolders[i].isActive && activeHolders[i].basisPoints > 0) {
                uint256 share = (amount * activeHolders[i].basisPoints) / totalBasisPoints;
                
                if (share > 0) {
                    asset.safeTransfer(activeHolders[i].holder, share);
                    userDistributions[projectId][activeHolders[i].holder] += share;
                    
                    emit HolderPaid(projectId, activeHolders[i].holder, share, activeHolders[i].basisPoints);
                }
            }
        }
        
        // Record distribution
        projectDistributions[projectId].push(Distribution({
            projectId: projectId,
            totalAmount: amount,
            totalBasisPoints: totalBasisPoints,
            timestamp: block.timestamp,
            activeHolders: activeCount
        }));
        
        emit RevenueDistributed(projectId, amount, totalBasisPoints, activeCount);
    }
    
    /**
     * @dev Get distribution history for a project
     */
    function getProjectDistributions(uint256 projectId) external view returns (Distribution[] memory) {
        return projectDistributions[projectId];
    }
    
    /**
     * @dev Get total amount received by a user for a project
     */
    function getUserTotalReceived(uint256 projectId, address user) external view returns (uint256) {
        return userDistributions[projectId][user];
    }
    
    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw(IERC20 asset) external onlyOwner {
        uint256 balance = asset.balanceOf(address(this));
        asset.safeTransfer(owner(), balance);
    }
}
