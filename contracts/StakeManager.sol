// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ClaimSBT.sol";
import "./RewardNFT.sol";

/**
 * @title StakeManager
 * @dev Manages staking/unstaking of claims to mint/burn reward NFTs
 */
contract StakeManager is Ownable, ReentrancyGuard {
    
    ClaimSBT public claimSBT;
    RewardNFT public rewardNFT;
    
    struct StakeInfo {
        uint256 claimTokenId;
        address staker;
        uint256 stakeTimestamp;
        bool isStaked;
    }
    
    mapping(uint256 => StakeInfo) public stakes; // claimTokenId => StakeInfo
    mapping(address => uint256[]) public userStakes;
    
    event ClaimStaked(
        address indexed staker,
        uint256 indexed claimTokenId,
        uint256 indexed rewardTokenId
    );
    
    event ClaimUnstaked(
        address indexed staker,
        uint256 indexed claimTokenId,
        uint256 indexed rewardTokenId
    );
    
    constructor(address _claimSBT, address _rewardNFT) {
        claimSBT = ClaimSBT(_claimSBT);
        rewardNFT = RewardNFT(_rewardNFT);
    }
    
    /**
     * @dev Stake a claim and mint reward NFT
     */
    function stakeAndMintReward(uint256 claimId) external nonReentrant {
        require(claimSBT.ownerOf(claimId) == msg.sender, "Not claim owner");
        require(!stakes[claimId].isStaked, "Claim already staked");
        require(!rewardNFT.hasActiveReward(claimId), "Reward NFT already exists");
        
        // Get claim data
        ClaimSBT.Claim memory claimData = claimSBT.getClaimData(claimId);
        require(claimData.status == ClaimSBT.ClaimStatus.Active, "Claim not active");
        
        // Pause the claim
        claimSBT.pause(claimId);
        
        // Create stake info
        stakes[claimId] = StakeInfo({
            claimTokenId: claimId,
            staker: msg.sender,
            stakeTimestamp: block.timestamp,
            isStaked: true
        });
        
        userStakes[msg.sender].push(claimId);
        
        // Mint reward NFT
        uint256 rewardTokenId = rewardNFT.mintReward(
            msg.sender,
            claimId,
            claimData.projectId,
            claimData.basisPoints
        );
        
        emit ClaimStaked(msg.sender, claimId, rewardTokenId);
    }
    
    /**
     * @dev Burn reward NFT to unstake claim
     */
    function burnReward(uint256 rewardId) external nonReentrant {
        require(rewardNFT.ownerOf(rewardId) == msg.sender, "Not reward NFT owner");
        
        uint256 claimId = rewardNFT.claimOf(rewardId);
        require(claimId != 0, "Invalid reward NFT");
        
        // Burn reward NFT
        rewardNFT.burnReward(rewardId);
        
        // Unpause the claim
        claimSBT.unpause(claimId);
        
        // Update stake info
        stakes[claimId].isStaked = false;
        
        emit ClaimUnstaked(msg.sender, claimId, rewardId);
    }
    
    /**
     * @dev Check if a claim is currently staked
     */
    function isClaimStaked(uint256 claimTokenId) external view returns (bool) {
        return stakes[claimTokenId].isStaked;
    }
    
    /**
     * @dev Get stake info for a claim
     */
    function getStakeInfo(uint256 claimTokenId) external view returns (StakeInfo memory) {
        return stakes[claimTokenId];
    }
    
    /**
     * @dev Get user's staked claims
     */
    function getUserStakes(address user) external view returns (uint256[] memory) {
        return userStakes[user];
    }
    
    /**
     * @dev Handle reward NFT transfer (when shared)
     * This is called by the RewardNFT contract when a reward is transferred
     */
    function onRewardTransferred(uint256 rewardTokenId, address from, address to) external {
        require(msg.sender == address(rewardNFT), "Only RewardNFT can call this");
        
        // The claim remains staked and paused until the reward NFT is burned
        // This implements the "sharing = losing yield" mechanism
    }
}
