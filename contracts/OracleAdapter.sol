// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title OracleAdapter
 * @dev Handles attestation verification for milestones and XRPL payments
 * Integrates with Flare's FTSO for price feeds and State Connector for external data
 */
contract OracleAdapter is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // FTSO price feed interface (simplified for demo)
    interface IFTSO {
        function getCurrentPrice() external view returns (uint256, uint256);
        function getPrice(uint256 epochId) external view returns (uint256, uint256);
    }

    // State Connector interface (simplified for demo)
    interface IStateConnector {
        function getAttestation(bytes32 attestationHash) external view returns (bool, uint256);
    }

    struct MilestoneAttestation {
        uint256 projectId;
        uint256 milestoneIndex;
        string milestoneName;
        string description;
        string proofHash; // IPFS hash or other proof
        uint256 timestamp;
        address verifier;
        bool verified;
    }

    struct XRPLPaymentProof {
        string txHash;
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        uint256 blockNumber;
        bool verified;
    }

    // Contract addresses
    address public ftsoAddress;
    address public stateConnectorAddress;
    
    // Verifier keys for milestone attestations
    mapping(address => bool) public authorizedVerifiers;
    
    // Attestation storage
    mapping(bytes32 => MilestoneAttestation) public milestoneAttestations;
    mapping(string => XRPLPaymentProof) public xrplPaymentProofs;
    
    // Events
    event MilestoneAttestationCreated(
        bytes32 indexed attestationHash,
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        address verifier
    );
    
    event MilestoneAttestationVerified(
        bytes32 indexed attestationHash,
        bool verified
    );
    
    event XRPLPaymentVerified(
        string indexed txHash,
        address indexed sender,
        uint256 amount
    );
    
    event VerifierAuthorized(address indexed verifier, bool authorized);

    constructor(address _ftsoAddress, address _stateConnectorAddress) {
        ftsoAddress = _ftsoAddress;
        stateConnectorAddress = _stateConnectorAddress;
    }

    /**
     * @dev Authorize/unauthorize verifier keys
     */
    function setVerifierAuthorization(address verifier, bool authorized) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
        emit VerifierAuthorized(verifier, authorized);
    }

    /**
     * @dev Get current XRP price from FTSO
     */
    function getCurrentXRPPrice() external view returns (uint256 price, uint256 timestamp) {
        require(ftsoAddress != address(0), "FTSO not configured");
        return IFTSO(ftsoAddress).getCurrentPrice();
    }

    /**
     * @dev Get XRP price at specific epoch
     */
    function getXRPPriceAtEpoch(uint256 epochId) external view returns (uint256 price, uint256 timestamp) {
        require(ftsoAddress != address(0), "FTSO not configured");
        return IFTSO(ftsoAddress).getPrice(epochId);
    }

    /**
     * @dev Create milestone attestation
     * Verifier signs a JSON milestone and submits the attestation
     */
    function createMilestoneAttestation(
        uint256 projectId,
        uint256 milestoneIndex,
        string memory milestoneName,
        string memory description,
        string memory proofHash,
        bytes memory signature
    ) external returns (bytes32) {
        // Verify the signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            projectId,
            milestoneIndex,
            milestoneName,
            description,
            proofHash,
            block.timestamp
        ));
        
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        require(authorizedVerifiers[signer], "Unauthorized verifier");
        
        bytes32 attestationHash = keccak256(abi.encodePacked(
            projectId,
            milestoneIndex,
            proofHash,
            block.timestamp
        ));
        
        milestoneAttestations[attestationHash] = MilestoneAttestation({
            projectId: projectId,
            milestoneIndex: milestoneIndex,
            milestoneName: milestoneName,
            description: description,
            proofHash: proofHash,
            timestamp: block.timestamp,
            verifier: signer,
            verified: true
        });
        
        emit MilestoneAttestationCreated(attestationHash, projectId, milestoneIndex, signer);
        return attestationHash;
    }

    /**
     * @dev Verify milestone attestation
     */
    function verifyMilestoneAttestation(bytes32 attestationHash) external view returns (bool) {
        MilestoneAttestation memory attestation = milestoneAttestations[attestationHash];
        return attestation.verified && attestation.verifier != address(0);
    }

    /**
     * @dev Get milestone attestation data
     */
    function getMilestoneAttestation(bytes32 attestationHash) external view returns (MilestoneAttestation memory) {
        return milestoneAttestations[attestationHash];
    }

    /**
     * @dev Verify XRPL payment proof
     * This would integrate with State Connector in a real implementation
     */
    function verifyXRPLPayment(
        string memory txHash,
        address sender,
        address recipient,
        uint256 amount,
        uint256 timestamp,
        uint256 blockNumber
    ) external onlyOwner returns (bool) {
        // In a real implementation, this would query State Connector
        // For demo purposes, we'll accept the proof if it's not already verified
        
        require(!xrplPaymentProofs[txHash].verified, "Payment already verified");
        
        xrplPaymentProofs[txHash] = XRPLPaymentProof({
            txHash: txHash,
            sender: sender,
            recipient: recipient,
            amount: amount,
            timestamp: timestamp,
            blockNumber: blockNumber,
            verified: true
        });
        
        emit XRPLPaymentVerified(txHash, sender, amount);
        return true;
    }

    /**
     * @dev Check if XRPL payment is verified
     */
    function isXRPLPaymentVerified(string memory txHash) external view returns (bool) {
        return xrplPaymentProofs[txHash].verified;
    }

    /**
     * @dev Get XRPL payment proof
     */
    function getXRPLPaymentProof(string memory txHash) external view returns (XRPLPaymentProof memory) {
        return xrplPaymentProofs[txHash];
    }

    /**
     * @dev Batch verify XRPL payments (for relayer efficiency)
     */
    function batchVerifyXRPLPayments(
        string[] memory txHashes,
        address[] memory senders,
        address[] memory recipients,
        uint256[] memory amounts,
        uint256[] memory timestamps,
        uint256[] memory blockNumbers
    ) external onlyOwner {
        require(txHashes.length == senders.length, "Array length mismatch");
        require(txHashes.length == recipients.length, "Array length mismatch");
        require(txHashes.length == amounts.length, "Array length mismatch");
        require(txHashes.length == timestamps.length, "Array length mismatch");
        require(txHashes.length == blockNumbers.length, "Array length mismatch");
        
        for (uint256 i = 0; i < txHashes.length; i++) {
            if (!xrplPaymentProofs[txHashes[i]].verified) {
                xrplPaymentProofs[txHashes[i]] = XRPLPaymentProof({
                    txHash: txHashes[i],
                    sender: senders[i],
                    recipient: recipients[i],
                    amount: amounts[i],
                    timestamp: timestamps[i],
                    blockNumber: blockNumbers[i],
                    verified: true
                });
                
                emit XRPLPaymentVerified(txHashes[i], senders[i], amounts[i]);
            }
        }
    }

    /**
     * @dev Update FTSO address
     */
    function setFTSOAddress(address _ftsoAddress) external onlyOwner {
        ftsoAddress = _ftsoAddress;
    }

    /**
     * @dev Update State Connector address
     */
    function setStateConnectorAddress(address _stateConnectorAddress) external onlyOwner {
        stateConnectorAddress = _stateConnectorAddress;
    }
}