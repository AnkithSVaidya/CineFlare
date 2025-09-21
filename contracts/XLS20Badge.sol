// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title XLS20Badge
 * @dev XRPL XLS-20 compatible NFT for cross-chain collectability
 * Mirrors Reward NFTs on XRPL for dual-chain ownership
 */
contract XLS20Badge is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    struct BadgeData {
        uint256 rewardTokenId; // Original Reward NFT token ID
        uint256 projectId;
        uint256 basisPoints;
        string xrplTokenId; // XRPL NFT token ID
        string xrplAccount; // XRPL account that holds the mirrored NFT
        uint256 mintTimestamp;
        bool isActive;
    }
    
    uint256 private _tokenIdCounter;
    mapping(uint256 => BadgeData) public badgeData;
    mapping(uint256 => uint256) public rewardToBadge; // Reward NFT ID -> Badge ID
    mapping(string => uint256) public xrplTokenToBadge; // XRPL Token ID -> Badge ID
    
    // XRPL integration
    address public xrplBridge;
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event BadgeMinted(
        uint256 indexed badgeId,
        uint256 indexed rewardTokenId,
        uint256 indexed projectId,
        string xrplTokenId
    );
    
    event BadgeBurned(
        uint256 indexed badgeId,
        string xrplTokenId
    );
    
    event XRPLTokenIdUpdated(
        uint256 indexed badgeId,
        string oldXrplTokenId,
        string newXrplTokenId
    );
    
    event XRPLAccountUpdated(
        uint256 indexed badgeId,
        string oldXrplAccount,
        string newXrplAccount
    );
    
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);

    constructor(address _xrplBridge) ERC721("XLS20Badge", "XLS20") {
        xrplBridge = _xrplBridge;
    }

    /**
     * @dev Mint XLS-20 badge from Reward NFT
     */
    function mintBadge(
        address to,
        uint256 rewardTokenId,
        uint256 projectId,
        uint256 basisPoints,
        string memory tokenURI
    ) external returns (uint256) {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Unauthorized minter");
        require(rewardToBadge[rewardTokenId] == 0, "Badge already exists for this reward");
        
        uint256 badgeId = _tokenIdCounter++;
        _safeMint(to, badgeId);
        _setTokenURI(badgeId, tokenURI);
        
        // Generate XRPL token ID (in real implementation, this would be from XRPL)
        string memory xrplTokenId = generateXRPLTokenId(badgeId);
        
        badgeData[badgeId] = BadgeData({
            rewardTokenId: rewardTokenId,
            projectId: projectId,
            basisPoints: basisPoints,
            xrplTokenId: xrplTokenId,
            xrplAccount: "",
            mintTimestamp: block.timestamp,
            isActive: true
        });
        
        rewardToBadge[rewardTokenId] = badgeId;
        xrplTokenToBadge[xrplTokenId] = badgeId;
        
        emit BadgeMinted(badgeId, rewardTokenId, projectId, xrplTokenId);
        return badgeId;
    }

    /**
     * @dev Burn badge and sync with XRPL
     */
    function burnBadge(uint256 badgeId) external {
        require(_exists(badgeId), "Badge does not exist");
        require(ownerOf(badgeId) == msg.sender || msg.sender == owner(), "Not authorized");
        
        BadgeData memory data = badgeData[badgeId];
        require(data.isActive, "Badge already burned");
        
        // Mark as inactive
        badgeData[badgeId].isActive = false;
        
        // Remove mappings
        delete rewardToBadge[data.rewardTokenId];
        delete xrplTokenToBadge[data.xrplTokenId];
        
        // Burn the token
        _burn(badgeId);
        
        emit BadgeBurned(badgeId, data.xrplTokenId);
    }

    /**
     * @dev Update XRPL token ID (for sync purposes)
     */
    function updateXRPLTokenId(uint256 badgeId, string memory newXrplTokenId) external onlyOwner {
        require(_exists(badgeId), "Badge does not exist");
        require(badgeData[badgeId].isActive, "Badge not active");
        
        string memory oldXrplTokenId = badgeData[badgeId].xrplTokenId;
        
        // Update mappings
        delete xrplTokenToBadge[oldXrplTokenId];
        xrplTokenToBadge[newXrplTokenId] = badgeId;
        
        badgeData[badgeId].xrplTokenId = newXrplTokenId;
        
        emit XRPLTokenIdUpdated(badgeId, oldXrplTokenId, newXrplTokenId);
    }

    /**
     * @dev Update XRPL account (for ownership sync)
     */
    function updateXRPLAccount(uint256 badgeId, string memory newXrplAccount) external onlyOwner {
        require(_exists(badgeId), "Badge does not exist");
        require(badgeData[badgeId].isActive, "Badge not active");
        
        string memory oldXrplAccount = badgeData[badgeId].xrplAccount;
        badgeData[badgeId].xrplAccount = newXrplAccount;
        
        emit XRPLAccountUpdated(badgeId, oldXrplAccount, newXrplAccount);
    }

    /**
     * @dev Get badge data
     */
    function getBadgeData(uint256 badgeId) external view returns (BadgeData memory) {
        require(_exists(badgeId), "Badge does not exist");
        return badgeData[badgeId];
    }

    /**
     * @dev Get badge ID from reward token ID
     */
    function getBadgeFromReward(uint256 rewardTokenId) external view returns (uint256) {
        return rewardToBadge[rewardTokenId];
    }

    /**
     * @dev Get badge ID from XRPL token ID
     */
    function getBadgeFromXRPLToken(string memory xrplTokenId) external view returns (uint256) {
        return xrplTokenToBadge[xrplTokenId];
    }

    /**
     * @dev Check if badge is active
     */
    function isBadgeActive(uint256 badgeId) external view returns (bool) {
        return _exists(badgeId) && badgeData[badgeId].isActive;
    }

    /**
     * @dev Set authorized minter
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit AuthorizedMinterUpdated(minter, authorized);
    }

    /**
     * @dev Update XRPL bridge address
     */
    function setXRPLBridge(address _xrplBridge) external onlyOwner {
        xrplBridge = _xrplBridge;
    }

    /**
     * @dev Generate XRPL token ID (mock implementation)
     */
    function generateXRPLTokenId(uint256 badgeId) internal pure returns (string memory) {
        return string(abi.encodePacked("XLS20_", _toString(badgeId)));
    }

    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
