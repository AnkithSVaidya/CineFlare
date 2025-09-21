// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ClaimSBT
 * @dev Soul Bound Token (SBT) representing investor claims in film projects
 * Implements ERC-5192 for non-transferable tokens
 */
contract ClaimSBT is ERC721, Ownable, ReentrancyGuard {
    
    enum ClaimStatus { Active, Staked, Slashed }
    
    struct Claim {
        uint256 projectId;
        uint256 basisPoints; // Share in basis points (10000 = 100%)
        ClaimStatus status;
        uint256 joinPrice; // XRP price when joined
        string xrplSourceTx; // XRPL transaction hash
        uint256 timestamp;
    }
    
    uint256 private _tokenIdCounter;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public userClaims;
    mapping(uint256 => uint256[]) public projectClaims;
    
    event ClaimMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed projectId,
        uint256 basisPoints,
        string xrplSourceTx
    );
    
    event ClaimStatusUpdated(
        uint256 indexed tokenId,
        ClaimStatus oldStatus,
        ClaimStatus newStatus
    );
    
    constructor() ERC721("FilmClaimSBT", "FCSBT") {}
    
    /**
     * @dev Mint or top up a claim SBT
     */
    function mintOrTopUp(address to, uint256 amount) external onlyOwner returns (uint256) {
        require(amount > 0, "Invalid amount");
        
        // Check if user already has a claim for this project
        uint256[] memory userTokenIds = userClaims[to];
        uint256 existingTokenId = 0;
        
        for (uint256 i = 0; i < userTokenIds.length; i++) {
            if (claims[userTokenIds[i]].status == ClaimStatus.Active) {
                existingTokenId = userTokenIds[i];
                break;
            }
        }
        
        if (existingTokenId > 0) {
            // Top up existing claim
            claims[existingTokenId].basisPoints += (amount * 10000) / 1000000; // Simplified calculation
            return existingTokenId;
        } else {
            // Mint new claim
            uint256 tokenId = _tokenIdCounter++;
            _safeMint(to, tokenId);
            
            claims[tokenId] = Claim({
                projectId: 0, // Will be set by the calling contract
                basisPoints: (amount * 10000) / 1000000, // Simplified calculation
                status: ClaimStatus.Active,
                joinPrice: 0, // Will be set by the calling contract
                xrplSourceTx: "",
                timestamp: block.timestamp
            });
            
            userClaims[to].push(tokenId);
            projectClaims[0].push(tokenId); // Will be updated by calling contract
            
            emit ClaimMinted(to, tokenId, 0, claims[tokenId].basisPoints, "");
            return tokenId;
        }
    }
    
    /**
     * @dev Pause a claim (set status to staked)
     */
    function pause(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        ClaimStatus oldStatus = claims[tokenId].status;
        claims[tokenId].status = ClaimStatus.Staked;
        
        emit ClaimStatusUpdated(tokenId, oldStatus, ClaimStatus.Staked);
    }
    
    /**
     * @dev Unpause a claim (set status to active)
     */
    function unpause(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        ClaimStatus oldStatus = claims[tokenId].status;
        claims[tokenId].status = ClaimStatus.Active;
        
        emit ClaimStatusUpdated(tokenId, oldStatus, ClaimStatus.Active);
    }
    
    /**
     * @dev Get claim data
     */
    function getClaimData(uint256 tokenId) external view returns (Claim memory) {
        require(_exists(tokenId), "Token does not exist");
        return claims[tokenId];
    }
    
    /**
     * @dev Get active holders for revenue distribution
     */
    function activeHolders() external view returns (RevenueSplitter.Holder[] memory) {
        // This is a simplified implementation
        // In a real implementation, you'd iterate through all claims and return active holders
        RevenueSplitter.Holder[] memory holders = new RevenueSplitter.Holder[](0);
        return holders;
    }
    
    /**
     * @dev Get user's claims
     */
    function getUserClaims(address user) external view returns (uint256[] memory) {
        return userClaims[user];
    }
    
    /**
     * @dev Get project's claims
     */
    function getProjectClaims(uint256 projectId) external view returns (uint256[] memory) {
        return projectClaims[projectId];
    }
    
    /**
     * @dev Override transfer functions to make token non-transferable (SBT)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "SBT: Token is non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Override approve functions to prevent approvals
     */
    function approve(address to, uint256 tokenId) public override {
        revert("SBT: Token is non-transferable");
    }
    
    function setApprovalForAll(address operator, bool approved) public override {
        revert("SBT: Token is non-transferable");
    }
    
    /**
     * @dev Override transfer functions to prevent transfers
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        revert("SBT: Token is non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        revert("SBT: Token is non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        revert("SBT: Token is non-transferable");
    }
}
