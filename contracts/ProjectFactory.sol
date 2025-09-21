// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ProjectVault.sol";
import "./ClaimSBT.sol";
import "./RewardNFT.sol";
import "./StakeManager.sol";
import "./OracleAdapter.sol";
import "./RevenueSplitter.sol";

/**
 * @title ProjectFactory
 * @dev Factory contract for creating new film funding projects
 */
contract ProjectFactory is Ownable, ReentrancyGuard {
    
    struct ProjectInit {
        string title;
        string description;
        uint256 totalFunding;
        address asset; // FLR token or stablecoin
        uint256[] milestoneAmounts;
        string[] milestoneNames;
    }
    
    ClaimSBT public claimSBT;
    RewardNFT public rewardNFT;
    StakeManager public stakeManager;
    OracleAdapter public oracle;
    RevenueSplitter public splitter;
    
    uint256 public projectCounter;
    mapping(bytes32 => address) public projects; // projectId => ProjectVault address
    mapping(address => bytes32[]) public creatorProjects;
    
    event ProjectCreated(
        bytes32 indexed projectId,
        address indexed creator,
        address indexed vault,
        string title,
        uint256 totalFunding
    );
    
    constructor() {
        // Deploy core contracts
        claimSBT = new ClaimSBT();
        rewardNFT = new RewardNFT();
        stakeManager = new StakeManager(address(claimSBT), address(rewardNFT));
        oracle = new OracleAdapter();
        splitter = new RevenueSplitter();
        
        // Transfer ownership of core contracts to this factory
        claimSBT.transferOwnership(address(this));
        rewardNFT.transferOwnership(address(this));
        stakeManager.transferOwnership(address(this));
        oracle.transferOwnership(address(this));
        splitter.transferOwnership(address(this));
    }
    
    /**
     * @dev Create a new film funding project
     */
    function createProject(ProjectInit calldata cfg) external returns (address vault) {
        require(bytes(cfg.title).length > 0, "Title required");
        require(bytes(cfg.description).length > 0, "Description required");
        require(cfg.totalFunding > 0, "Invalid funding amount");
        require(cfg.asset != address(0), "Invalid asset address");
        require(cfg.milestoneAmounts.length == cfg.milestoneNames.length, "Milestone arrays length mismatch");
        
        bytes32 projectId = keccak256(abi.encodePacked(
            msg.sender,
            cfg.title,
            cfg.totalFunding,
            block.timestamp,
            projectCounter++
        ));
        
        // Deploy new ProjectVault
        vault = address(new ProjectVault(
            projectId,
            cfg.title,
            cfg.description,
            msg.sender,
            cfg.totalFunding,
            cfg.asset,
            address(claimSBT),
            address(stakeManager),
            address(oracle),
            address(splitter)
        ));
        
        // Transfer vault ownership to creator
        ProjectVault(vault).transferOwnership(msg.sender);
        
        // Store project info
        projects[projectId] = vault;
        creatorProjects[msg.sender].push(projectId);
        
        emit ProjectCreated(projectId, msg.sender, vault, cfg.title, cfg.totalFunding);
        
        return vault;
    }
    
    /**
     * @dev Get project vault address
     */
    function getProjectVault(bytes32 projectId) external view returns (address) {
        return projects[projectId];
    }
    
    /**
     * @dev Get creator's projects
     */
    function getCreatorProjects(address creator) external view returns (bytes32[] memory) {
        return creatorProjects[creator];
    }
    
    /**
     * @dev Get total number of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return projectCounter;
    }
    
    /**
     * @dev Get core contract addresses
     */
    function getCoreContracts() external view returns (
        address _claimSBT,
        address _rewardNFT,
        address _stakeManager,
        address _oracle,
        address _splitter
    ) {
        return (address(claimSBT), address(rewardNFT), address(stakeManager), address(oracle), address(splitter));
    }
}
