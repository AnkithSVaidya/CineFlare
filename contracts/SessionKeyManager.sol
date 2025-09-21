// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title SessionKeyManager
 * @dev Manages session keys for fee-sponsored user experience
 * Allows users to pre-authorize transactions without paying gas fees
 */
contract SessionKeyManager is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    struct SessionKey {
        address user;
        address sessionKey;
        uint256 validUntil;
        uint256 maxGasPrice;
        uint256 maxGasLimit;
        bool isActive;
        uint256 createdAt;
    }

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        uint256 gasLimit;
        uint256 nonce;
        bool executed;
    }

    // Session key storage
    mapping(address => SessionKey[]) public userSessionKeys;
    mapping(address => mapping(address => bool)) public isSessionKeyActive;
    
    // Transaction storage
    mapping(address => mapping(uint256 => Transaction)) public userTransactions;
    mapping(address => uint256) public userNonces;
    
    // Fee sponsor (relayer)
    address public feeSponsor;
    mapping(address => uint256) public sponsoredGasUsed;
    
    // Events
    event SessionKeyCreated(
        address indexed user,
        address indexed sessionKey,
        uint256 validUntil,
        uint256 maxGasPrice
    );
    
    event SessionKeyRevoked(
        address indexed user,
        address indexed sessionKey
    );
    
    event TransactionExecuted(
        address indexed user,
        address indexed sessionKey,
        uint256 indexed nonce,
        bool success
    );
    
    event FeeSponsorUpdated(address indexed oldSponsor, address indexed newSponsor);

    constructor(address _feeSponsor) {
        feeSponsor = _feeSponsor;
    }

    /**
     * @dev Create a new session key
     */
    function createSessionKey(
        address sessionKey,
        uint256 validUntil,
        uint256 maxGasPrice,
        uint256 maxGasLimit,
        bytes memory signature
    ) external {
        require(validUntil > block.timestamp, "Invalid expiration time");
        require(maxGasPrice > 0, "Invalid max gas price");
        require(maxGasLimit > 0, "Invalid max gas limit");
        require(!isSessionKeyActive[msg.sender][sessionKey], "Session key already active");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            sessionKey,
            validUntil,
            maxGasPrice,
            maxGasLimit,
            block.chainid
        ));
        
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        require(signer == sessionKey, "Invalid signature");
        
        SessionKey memory newSessionKey = SessionKey({
            user: msg.sender,
            sessionKey: sessionKey,
            validUntil: validUntil,
            maxGasPrice: maxGasPrice,
            maxGasLimit: maxGasLimit,
            isActive: true,
            createdAt: block.timestamp
        });
        
        userSessionKeys[msg.sender].push(newSessionKey);
        isSessionKeyActive[msg.sender][sessionKey] = true;
        
        emit SessionKeyCreated(msg.sender, sessionKey, validUntil, maxGasPrice);
    }

    /**
     * @dev Revoke a session key
     */
    function revokeSessionKey(address sessionKey) external {
        require(isSessionKeyActive[msg.sender][sessionKey], "Session key not active");
        
        // Find and deactivate the session key
        for (uint256 i = 0; i < userSessionKeys[msg.sender].length; i++) {
            if (userSessionKeys[msg.sender][i].sessionKey == sessionKey) {
                userSessionKeys[msg.sender][i].isActive = false;
                break;
            }
        }
        
        isSessionKeyActive[msg.sender][sessionKey] = false;
        
        emit SessionKeyRevoked(msg.sender, sessionKey);
    }

    /**
     * @dev Execute transaction using session key
     */
    function executeTransaction(
        address user,
        address to,
        uint256 value,
        bytes memory data,
        uint256 gasLimit,
        uint256 nonce,
        bytes memory signature
    ) external onlyOwner returns (bool success) {
        require(isSessionKeyActive[user][msg.sender], "Invalid session key");
        require(!userTransactions[user][nonce].executed, "Transaction already executed");
        require(nonce == userNonces[user], "Invalid nonce");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            user,
            to,
            value,
            keccak256(data),
            gasLimit,
            nonce,
            block.chainid
        ));
        
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        require(signer == msg.sender, "Invalid signature");
        
        // Check session key validity
        SessionKey memory sessionKey = getActiveSessionKey(user, msg.sender);
        require(sessionKey.validUntil > block.timestamp, "Session key expired");
        require(gasLimit <= sessionKey.maxGasLimit, "Gas limit exceeded");
        require(tx.gasprice <= sessionKey.maxGasPrice, "Gas price exceeded");
        
        // Store transaction
        userTransactions[user][nonce] = Transaction({
            to: to,
            value: value,
            data: data,
            gasLimit: gasLimit,
            nonce: nonce,
            executed: true
        });
        
        userNonces[user]++;
        
        // Execute transaction
        (success, ) = to.call{value: value, gas: gasLimit}(data);
        
        // Track sponsored gas usage
        if (success) {
            sponsoredGasUsed[user] += gasLimit;
        }
        
        emit TransactionExecuted(user, msg.sender, nonce, success);
    }

    /**
     * @dev Get active session key for user
     */
    function getActiveSessionKey(address user, address sessionKey) public view returns (SessionKey memory) {
        for (uint256 i = 0; i < userSessionKeys[user].length; i++) {
            if (userSessionKeys[user][i].sessionKey == sessionKey && 
                userSessionKeys[user][i].isActive &&
                userSessionKeys[user][i].validUntil > block.timestamp) {
                return userSessionKeys[user][i];
            }
        }
        revert("Session key not found or expired");
    }

    /**
     * @dev Get user's session keys
     */
    function getUserSessionKeys(address user) external view returns (SessionKey[] memory) {
        return userSessionKeys[user];
    }

    /**
     * @dev Get user's next nonce
     */
    function getUserNonce(address user) external view returns (uint256) {
        return userNonces[user];
    }

    /**
     * @dev Get user's sponsored gas usage
     */
    function getSponsoredGasUsed(address user) external view returns (uint256) {
        return sponsoredGasUsed[user];
    }

    /**
     * @dev Check if session key is valid
     */
    function isSessionKeyValid(address user, address sessionKey) external view returns (bool) {
        if (!isSessionKeyActive[user][sessionKey]) {
            return false;
        }
        
        try this.getActiveSessionKey(user, sessionKey) returns (SessionKey memory) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Update fee sponsor
     */
    function setFeeSponsor(address _feeSponsor) external onlyOwner {
        address oldSponsor = feeSponsor;
        feeSponsor = _feeSponsor;
        emit FeeSponsorUpdated(oldSponsor, _feeSponsor);
    }

    /**
     * @dev Emergency function to revoke all session keys for a user
     */
    function emergencyRevokeAllSessionKeys(address user) external onlyOwner {
        for (uint256 i = 0; i < userSessionKeys[user].length; i++) {
            if (userSessionKeys[user][i].isActive) {
                userSessionKeys[user][i].isActive = false;
                isSessionKeyActive[user][userSessionKeys[user][i].sessionKey] = false;
            }
        }
    }

    /**
     * @dev Batch execute transactions (for relayer efficiency)
     */
    function batchExecuteTransactions(
        address[] memory users,
        address[] memory tos,
        uint256[] memory values,
        bytes[] memory datas,
        uint256[] memory gasLimits,
        uint256[] memory nonces,
        bytes[] memory signatures
    ) external onlyOwner {
        require(users.length == tos.length, "Array length mismatch");
        require(users.length == values.length, "Array length mismatch");
        require(users.length == datas.length, "Array length mismatch");
        require(users.length == gasLimits.length, "Array length mismatch");
        require(users.length == nonces.length, "Array length mismatch");
        require(users.length == signatures.length, "Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            this.executeTransaction(
                users[i],
                tos[i],
                values[i],
                datas[i],
                gasLimits[i],
                nonces[i],
                signatures[i]
            );
        }
    }
}
