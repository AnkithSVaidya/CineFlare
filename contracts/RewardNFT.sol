// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RewardNFT
 * @dev Transferable NFT representing a shareable reward from a staked claim
 */
contract RewardNFT is ERC721, Ownable, ReentrancyGuard {
    
    struct RewardData {
        uint256 claimTokenId; // Original claim SBT token ID
        uint256 projectId;
        uint256 basisPoints; // Share percentage
        uint256 mintTimestamp;
        bool isActive;
    }
    
    uint256 private _tokenIdCounter;
    mapping(uint256 => RewardData) public rewards;
    mapping(uint256 => uint256) public claimToReward; // claimTokenId => rewardTokenId
    
    event RewardMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed claimTokenId,
        uint256 projectId,
        uint256 basisPoints
    );
    
    event RewardBurned(
        uint256 indexed tokenId,
        uint256 indexed claimTokenId
    );
    
    constructor() ERC721("FilmRewardNFT", "FRNFT") {}
    
    /**
     * @dev Mint a reward NFT from a staked claim
     */
    function mintReward(
        address to,
        uint256 claimTokenId,
        uint256 projectId,
        uint256 basisPoints
    ) external onlyOwner returns (uint256) {
        require(claimToReward[claimTokenId] == 0, "Reward already exists for this claim");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        
        rewards[tokenId] = RewardData({
            claimTokenId: claimTokenId,
            projectId: projectId,
            basisPoints: basisPoints,
            mintTimestamp: block.timestamp,
            isActive: true
        });
        
        claimToReward[claimTokenId] = tokenId;
        
        emit RewardMinted(to, tokenId, claimTokenId, projectId, basisPoints);
        return tokenId;
    }
    
    /**
     * @dev Burn a reward NFT to unlock the underlying claim
     */
    function burnReward(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(rewards[tokenId].isActive, "Reward already burned");
        
        uint256 claimTokenId = rewards[tokenId].claimTokenId;
        rewards[tokenId].isActive = false;
        claimToReward[claimTokenId] = 0;
        
        _burn(tokenId);
        
        emit RewardBurned(tokenId, claimTokenId);
    }
    
    /**
     * @dev Get reward data
     */
    function getRewardData(uint256 tokenId) external view returns (RewardData memory) {
        require(_exists(tokenId), "Token does not exist");
        return rewards[tokenId];
    }
    
    /**
     * @dev Get reward token ID for a claim
     */
    function getRewardForClaim(uint256 claimTokenId) external view returns (uint256) {
        return claimToReward[claimTokenId];
    }
    
    /**
     * @dev Check if a claim has an active reward NFT
     */
    function hasActiveReward(uint256 claimTokenId) external view returns (bool) {
        uint256 rewardTokenId = claimToReward[claimTokenId];
        return rewardTokenId != 0 && rewards[rewardTokenId].isActive;
    }
    
    /**
     * @dev Override transfer to track when reward is shared
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        // Allow transfers (this is the key difference from SBT)
        // The sharing mechanism is handled by the StakeManager
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
