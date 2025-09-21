// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ClaimSBT.sol";
import "./StakeManager.sol";
import "./OracleAdapter.sol";

/**
 * @title ProjectVault
 * @dev Manages project funding, milestone releases, and revenue distribution
 * Integrates with Oracle system for FTSO price feeds and milestone attestations
 */
contract ProjectVault is Ownable, ReentrancyGuard {
    
    using SafeERC20 for IERC20;
    
    enum MilestoneStatus { Pending, Unlocked, Completed }
    
    struct Project {
        uint256 projectId;
        string title;
        string description;
        address creator;
        uint256 totalFunding;
        uint256 totalRaised;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Milestone {
        string name;
        string description;
        uint256 unlockAmount;
        MilestoneStatus status;
        uint256 unlockTimestamp;
        string attestationHash;
    }
    
    struct RevenueEntry {
        uint256 amount;
        uint256 timestamp;
        string source;
    }
    
    Project public project;
    Milestone[] public milestones;
    RevenueEntry[] public revenueEntries;
    
    ClaimSBT public claimSBT;
    StakeManager public stakeManager;
    IERC20 public flareToken;
    OracleAdapter public oracleAdapter;
    
    mapping(address => uint256) public userContributions;
    mapping(bytes32 => bool) public processedPayments;
    mapping(bytes32 => bool) public fulfilledMilestone; // attested by FDC/StateConnector
    
    event ProjectCreated(
        uint256 indexed projectId,
        string title,
        address indexed creator,
        uint256 totalFunding
    );
    
    event PaymentProcessed(
        address indexed investor,
        uint256 amount,
        uint256 basisPoints,
        string xrplTxHash
    );
    
    event MilestoneAdded(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        string name,
        uint256 unlockAmount
    );
    
    event MilestoneUnlocked(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        string attestationHash
    );
    
    event RevenueAdded(
        uint256 indexed projectId,
        uint256 amount,
        string source
    );
    
    event RevenueDistributed(
        uint256 indexed projectId,
        uint256 totalAmount,
        uint256 activeClaims
    );
    
    constructor(
        uint256 _projectId,
        string memory _title,
        string memory _description,
        address _creator,
        uint256 _totalFunding,
        address _claimSBT,
        address _stakeManager,
        address _flareToken,
        address _oracleAdapter
    ) {
        project = Project({
            projectId: _projectId,
            title: _title,
            description: _description,
            creator: _creator,
            totalFunding: _totalFunding,
            totalRaised: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        claimSBT = ClaimSBT(_claimSBT);
        stakeManager = StakeManager(_stakeManager);
        flareToken = IERC20(_flareToken);
        oracleAdapter = OracleAdapter(_oracleAdapter);
        
        emit ProjectCreated(_projectId, _title, _creator, _totalFunding);
    }
    
    /**
     * @dev Add a milestone to the project
     */
    function addMilestone(
        string memory name,
        string memory description,
        uint256 unlockAmount
    ) external onlyOwner {
        require(project.isActive, "Project not active");
        require(unlockAmount > 0, "Invalid unlock amount");
        
        milestones.push(Milestone({
            name: name,
            description: description,
            unlockAmount: unlockAmount,
            status: MilestoneStatus.Pending,
            unlockTimestamp: 0,
            attestationHash: ""
        }));
        
        emit MilestoneAdded(project.projectId, milestones.length - 1, name, unlockAmount);
    }
    
    /**
     * @dev Process XRPL payment and mint claim SBT
     * Uses FTSO price feed for XRP/USD conversion
     */
    function processPayment(
        address investor,
        uint256 xrpAmount,
        string memory xrplTxHash,
        uint256 xrpPrice // XRP price in USD at time of payment
    ) external onlyOwner {
        require(project.isActive, "Project not active");
        require(!processedPayments[keccak256(abi.encodePacked(xrplTxHash))], "Payment already processed");
        require(xrpAmount > 0, "Invalid amount");
        
        // Verify XRPL payment with Oracle
        require(oracleAdapter.isXRPLPaymentVerified(xrplTxHash), "XRPL payment not verified");
        
        // Calculate basis points (share percentage)
        uint256 basisPoints = (xrpAmount * 10000) / project.totalFunding;
        require(basisPoints > 0, "Contribution too small");
        
        // Update project state
        project.totalRaised += xrpAmount;
        userContributions[investor] += xrpAmount;
        processedPayments[keccak256(abi.encodePacked(xrplTxHash))] = true;
        
        // Mint claim SBT
        claimSBT.mintClaim(
            investor,
            project.projectId,
            basisPoints,
            xrpPrice,
            xrplTxHash
        );
        
        emit PaymentProcessed(investor, xrpAmount, basisPoints, xrplTxHash);
    }
    
    /**
     * @dev Unlock milestone with attestation verification
     */
    function unlockMilestone(
        uint256 milestoneIndex,
        string memory attestationHash
    ) external onlyOwner {
        require(milestoneIndex < milestones.length, "Invalid milestone");
        require(milestones[milestoneIndex].status == MilestoneStatus.Pending, "Milestone already unlocked");
        
        // Verify attestation with Oracle
        bytes32 attestationBytes = keccak256(abi.encodePacked(attestationHash));
        require(oracleAdapter.verifyMilestoneAttestation(attestationBytes), "Invalid attestation");
        
        milestones[milestoneIndex].status = MilestoneStatus.Unlocked;
        milestones[milestoneIndex].unlockTimestamp = block.timestamp;
        milestones[milestoneIndex].attestationHash = attestationHash;
        
        emit MilestoneUnlocked(project.projectId, milestoneIndex, attestationHash);
    }
    
    /**
     * @dev Add revenue to the project
     */
    function addRevenue(
        uint256 amount,
        string memory source
    ) external onlyOwner {
        require(amount > 0, "Invalid amount");
        
        revenueEntries.push(RevenueEntry({
            amount: amount,
            timestamp: block.timestamp,
            source: source
        }));
        
        emit RevenueAdded(project.projectId, amount, source);
    }
    
    /**
     * @dev Distribute revenue to active claim holders
     */
    function distributeRevenue() external onlyOwner nonReentrant {
        require(revenueEntries.length > 0, "No revenue to distribute");
        
        // Calculate total revenue
        uint256 totalRevenue = 0;
        for (uint256 i = 0; i < revenueEntries.length; i++) {
            totalRevenue += revenueEntries[i].amount;
        }
        
        require(totalRevenue > 0, "No revenue available");
        
        // Get all claims for this project
        uint256[] memory claimTokenIds = claimSBT.getProjectClaims(project.projectId);
        uint256 activeClaims = 0;
        uint256 totalActiveBasisPoints = 0;
        
        // Calculate total active basis points
        for (uint256 i = 0; i < claimTokenIds.length; i++) {
            ClaimSBT.ClaimData memory claimData = claimSBT.getClaimData(claimTokenIds[i]);
            if (claimData.status == ClaimSBT.ClaimStatus.Active) {
                activeClaims++;
                totalActiveBasisPoints += claimData.basisPoints;
            }
        }
        
        require(activeClaims > 0, "No active claims");
        
        // Distribute revenue proportionally
        for (uint256 i = 0; i < claimTokenIds.length; i++) {
            ClaimSBT.ClaimData memory claimData = claimSBT.getClaimData(claimTokenIds[i]);
            if (claimData.status == ClaimSBT.ClaimStatus.Active) {
                uint256 share = (totalRevenue * claimData.basisPoints) / totalActiveBasisPoints;
                if (share > 0) {
                    flareToken.safeTransfer(claimSBT.ownerOf(claimTokenIds[i]), share);
                }
            }
        }
        
        // Clear revenue entries
        delete revenueEntries;
        
        emit RevenueDistributed(project.projectId, totalRevenue, activeClaims);
    }
    
    /**
     * @dev Get project info
     */
    function getProjectInfo() external view returns (Project memory) {
        return project;
    }
    
    /**
     * @dev Get all milestones
     */
    function getAllMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }
    
    /**
     * @dev Get revenue entries
     */
    function getRevenueEntries() external view returns (RevenueEntry[] memory) {
        return revenueEntries;
    }
    
    /**
     * @dev Check if payment was processed
     */
    function isPaymentProcessed(string memory xrplTxHash) external view returns (bool) {
        return processedPayments[keccak256(abi.encodePacked(xrplTxHash))];
    }
    
    /**
     * @dev Get current XRP price from FTSO
     */
    function getCurrentXRPPrice() external view returns (uint256 price, uint256 timestamp) {
        return oracleAdapter.getCurrentXRPPrice();
    }
    
    /**
     * @dev Update Oracle adapter address
     */
    function setOracleAdapter(address _oracleAdapter) external onlyOwner {
        oracleAdapter = OracleAdapter(_oracleAdapter);
    }
}