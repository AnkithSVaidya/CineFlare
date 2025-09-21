// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FAssetManager
 * @dev Manages FAssets (FXRP) for cross-chain funding
 * Integrates with Flare's FAsset system for XRPL-Flare bridge
 */
contract FAssetManager is Ownable, ReentrancyGuard {
    
    // FAsset interface (simplified for demo)
    interface IFAsset {
        function mint(uint256 amount, address to) external;
        function burn(uint256 amount) external;
        function balanceOf(address account) external view returns (uint256);
        function transfer(address to, uint256 amount) external returns (bool);
    }

    // FAsset contract addresses
    address public fxrpAddress;
    address public fassetManagerAddress;
    
    // XRPL address mapping for FAsset minting
    mapping(address => string) public userXRPLAddresses;
    mapping(string => address) public xrplToFlareAddress;
    
    // Minting requests
    struct MintRequest {
        address user;
        uint256 amount;
        string xrplTxHash;
        uint256 timestamp;
        bool processed;
    }
    
    mapping(string => MintRequest) public mintRequests;
    string[] public pendingMintRequests;
    
    // Events
    event XRPLAddressRegistered(address indexed user, string xrplAddress);
    event MintRequestCreated(string indexed xrplTxHash, address indexed user, uint256 amount);
    event FXRPMinted(address indexed user, uint256 amount, string xrplTxHash);
    event FXRPBurned(address indexed user, uint256 amount, string xrplTxHash);
    
    constructor(address _fxrpAddress, address _fassetManagerAddress) {
        fxrpAddress = _fxrpAddress;
        fassetManagerAddress = _fassetManagerAddress;
    }

    /**
     * @dev Register user's XRPL address for FAsset minting
     */
    function registerXRPLAddress(string memory xrplAddress) external {
        require(bytes(xrplAddress).length > 0, "Invalid XRPL address");
        require(xrplToFlareAddress[xrplAddress] == address(0), "XRPL address already registered");
        
        userXRPLAddresses[msg.sender] = xrplAddress;
        xrplToFlareAddress[xrplAddress] = msg.sender;
        
        emit XRPLAddressRegistered(msg.sender, xrplAddress);
    }

    /**
     * @dev Create mint request for FXRP
     * Called when user sends XRP to the bridge address
     */
    function createMintRequest(
        string memory xrplTxHash,
        address user,
        uint256 amount
    ) external onlyOwner returns (string memory) {
        require(mintRequests[xrplTxHash].user == address(0), "Request already exists");
        require(amount > 0, "Invalid amount");
        
        mintRequests[xrplTxHash] = MintRequest({
            user: user,
            amount: amount,
            xrplTxHash: xrplTxHash,
            timestamp: block.timestamp,
            processed: false
        });
        
        pendingMintRequests.push(xrplTxHash);
        
        emit MintRequestCreated(xrplTxHash, user, amount);
        return xrplTxHash;
    }

    /**
     * @dev Process mint request and mint FXRP
     */
    function processMintRequest(string memory xrplTxHash) external onlyOwner {
        MintRequest storage request = mintRequests[xrplTxHash];
        require(request.user != address(0), "Request not found");
        require(!request.processed, "Request already processed");
        
        // Mint FXRP to user
        IFAsset(fxrpAddress).mint(request.amount, request.user);
        request.processed = true;
        
        // Remove from pending requests
        for (uint256 i = 0; i < pendingMintRequests.length; i++) {
            if (keccak256(bytes(pendingMintRequests[i])) == keccak256(bytes(xrplTxHash))) {
                pendingMintRequests[i] = pendingMintRequests[pendingMintRequests.length - 1];
                pendingMintRequests.pop();
                break;
            }
        }
        
        emit FXRPMinted(request.user, request.amount, xrplTxHash);
    }

    /**
     * @dev Burn FXRP and initiate XRPL withdrawal
     */
    function burnFXRP(uint256 amount, string memory xrplDestination) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(bytes(xrplDestination).length > 0, "Invalid XRPL destination");
        
        // Check user has enough FXRP
        require(IFAsset(fxrpAddress).balanceOf(msg.sender) >= amount, "Insufficient FXRP balance");
        
        // Burn FXRP
        IFAsset(fxrpAddress).burn(amount);
        
        // In a real implementation, this would trigger XRPL withdrawal
        // For demo purposes, we'll just emit an event
        emit FXRPBurned(msg.sender, amount, xrplDestination);
    }

    /**
     * @dev Get user's FXRP balance
     */
    function getFXRPBalance(address user) external view returns (uint256) {
        return IFAsset(fxrpAddress).balanceOf(user);
    }

    /**
     * @dev Get user's XRPL address
     */
    function getUserXRPLAddress(address user) external view returns (string memory) {
        return userXRPLAddresses[user];
    }

    /**
     * @dev Get Flare address from XRPL address
     */
    function getFlareAddressFromXRPL(string memory xrplAddress) external view returns (address) {
        return xrplToFlareAddress[xrplAddress];
    }

    /**
     * @dev Get pending mint requests
     */
    function getPendingMintRequests() external view returns (string[] memory) {
        return pendingMintRequests;
    }

    /**
     * @dev Get mint request details
     */
    function getMintRequest(string memory xrplTxHash) external view returns (MintRequest memory) {
        return mintRequests[xrplTxHash];
    }

    /**
     * @dev Batch process mint requests
     */
    function batchProcessMintRequests(string[] memory xrplTxHashes) external onlyOwner {
        for (uint256 i = 0; i < xrplTxHashes.length; i++) {
            processMintRequest(xrplTxHashes[i]);
        }
    }

    /**
     * @dev Update FXRP contract address
     */
    function setFXRPAddress(address _fxrpAddress) external onlyOwner {
        fxrpAddress = _fxrpAddress;
    }

    /**
     * @dev Update FAsset manager address
     */
    function setFAssetManagerAddress(address _fassetManagerAddress) external onlyOwner {
        fassetManagerAddress = _fassetManagerAddress;
    }
}
