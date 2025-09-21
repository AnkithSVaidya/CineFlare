import { ethers } from 'ethers'

// Contract ABIs (simplified for demo)
export const ProjectFactoryABI = [
  "function createProject(string memory title, string memory description, uint256 totalFunding, address flareToken) external returns (uint256, address)",
  "function getProjectVault(uint256 projectId) external view returns (address)",
  "function getCoreContracts() external view returns (address, address, address)",
  "function getTotalProjects() external view returns (uint256)"
]

export const ProjectVaultABI = [
  "function processPayment(address investor, uint256 xrpAmount, string memory xrplTxHash, uint256 xrpPrice) external",
  "function addMilestone(string memory name, string memory description, uint256 unlockAmount) external",
  "function unlockMilestone(uint256 milestoneIndex, string memory attestationHash) external",
  "function addRevenue(uint256 amount, string memory source) external",
  "function distributeRevenue() external",
  "function getProjectInfo() external view returns (tuple(uint256 projectId, string title, string description, address creator, uint256 totalFunding, uint256 totalRaised, bool isActive, uint256 createdAt))",
  "function getAllMilestones() external view returns (tuple(string name, string description, uint256 unlockAmount, uint8 status, uint256 unlockTimestamp, string attestationHash)[])",
  "function isPaymentProcessed(string memory xrplTxHash) external view returns (bool)"
]

export const ClaimSBTABI = [
  "function mintClaim(address to, uint256 projectId, uint256 basisPoints, uint256 joinPrice, string memory xrplSourceTx) external returns (uint256)",
  "function updateClaimStatus(uint256 tokenId, uint8 newStatus) external",
  "function getClaimData(uint256 tokenId) external view returns (tuple(uint256 projectId, uint256 basisPoints, uint8 status, uint256 joinPrice, string xrplSourceTx, uint256 timestamp))",
  "function getUserClaims(address user) external view returns (uint256[])",
  "function getProjectClaims(uint256 projectId) external view returns (uint256[])",
  "function ownerOf(uint256 tokenId) external view returns (address)"
]

export const RewardNFTABI = [
  "function mintReward(address to, uint256 claimTokenId, uint256 projectId, uint256 basisPoints) external returns (uint256)",
  "function burnReward(uint256 tokenId) external",
  "function getRewardData(uint256 tokenId) external view returns (tuple(uint256 claimTokenId, uint256 projectId, uint256 basisPoints, uint256 mintTimestamp, bool isActive))",
  "function getRewardForClaim(uint256 claimTokenId) external view returns (uint256)",
  "function hasActiveReward(uint256 claimTokenId) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
]

export const StakeManagerABI = [
  "function stakeClaim(uint256 claimTokenId) external",
  "function unstakeClaim(uint256 claimTokenId) external",
  "function isClaimStaked(uint256 claimTokenId) external view returns (bool)",
  "function getStakeInfo(uint256 claimTokenId) external view returns (tuple(uint256 claimTokenId, address staker, uint256 stakeTimestamp, bool isStaked))",
  "function getUserStakes(address user) external view returns (uint256[])"
]

export const MockFLRABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)"
]

export const OracleAdapterABI = [
  "function getCurrentXRPPrice() external view returns (uint256, uint256)",
  "function getXRPPriceAtEpoch(uint256 epochId) external view returns (uint256, uint256)",
  "function createMilestoneAttestation(uint256 projectId, uint256 milestoneIndex, string memory milestoneName, string memory description, string memory proofHash, bytes memory signature) external returns (bytes32)",
  "function verifyMilestoneAttestation(bytes32 attestationHash) external view returns (bool)",
  "function getMilestoneAttestation(bytes32 attestationHash) external view returns (tuple(uint256 projectId, uint256 milestoneIndex, string milestoneName, string description, string proofHash, uint256 timestamp, address verifier, bool verified))",
  "function verifyXRPLPayment(string memory txHash, address sender, address recipient, uint256 amount, uint256 timestamp, uint256 blockNumber) external returns (bool)",
  "function isXRPLPaymentVerified(string memory txHash) external view returns (bool)",
  "function getXRPLPaymentProof(string memory txHash) external view returns (tuple(string txHash, address sender, address recipient, uint256 amount, uint256 timestamp, uint256 blockNumber, bool verified))",
  "function setVerifierAuthorization(address verifier, bool authorized) external"
]

export const FAssetManagerABI = [
  "function registerXRPLAddress(string memory xrplAddress) external",
  "function createMintRequest(string memory xrplTxHash, address user, uint256 amount) external returns (string memory)",
  "function processMintRequest(string memory xrplTxHash) external",
  "function burnFXRP(uint256 amount, string memory xrplDestination) external",
  "function getFXRPBalance(address user) external view returns (uint256)",
  "function getUserXRPLAddress(address user) external view returns (string memory)",
  "function getFlareAddressFromXRPL(string memory xrplAddress) external view returns (address)",
  "function getPendingMintRequests() external view returns (string[] memory)",
  "function getMintRequest(string memory xrplTxHash) external view returns (tuple(address user, uint256 amount, string xrplTxHash, uint256 timestamp, bool processed))"
]

export const SessionKeyManagerABI = [
  "function createSessionKey(address sessionKey, uint256 validUntil, uint256 maxGasPrice, uint256 maxGasLimit, bytes memory signature) external",
  "function revokeSessionKey(address sessionKey) external",
  "function executeTransaction(address user, address to, uint256 value, bytes memory data, uint256 gasLimit, uint256 nonce, bytes memory signature) external returns (bool)",
  "function getUserSessionKeys(address user) external view returns (tuple(address user, address sessionKey, uint256 validUntil, uint256 maxGasPrice, uint256 maxGasLimit, bool isActive, uint256 createdAt)[])",
  "function getUserNonce(address user) external view returns (uint256)",
  "function getSponsoredGasUsed(address user) external view returns (uint256)",
  "function isSessionKeyValid(address user, address sessionKey) external view returns (bool)"
]

export const XLS20BadgeABI = [
  "function mintBadge(address to, uint256 rewardTokenId, uint256 projectId, uint256 basisPoints, string memory tokenURI) external returns (uint256)",
  "function burnBadge(uint256 badgeId) external",
  "function updateXRPLTokenId(uint256 badgeId, string memory newXrplTokenId) external",
  "function updateXRPLAccount(uint256 badgeId, string memory newXrplAccount) external",
  "function getBadgeData(uint256 badgeId) external view returns (tuple(uint256 rewardTokenId, uint256 projectId, uint256 basisPoints, string xrplTokenId, string xrplAccount, uint256 mintTimestamp, bool isActive))",
  "function getBadgeFromReward(uint256 rewardTokenId) external view returns (uint256)",
  "function getBadgeFromXRPLToken(string memory xrplTokenId) external view returns (uint256)",
  "function isBadgeActive(uint256 badgeId) external view returns (bool)",
  "function setAuthorizedMinter(address minter, bool authorized) external"
]

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  PROJECT_FACTORY: process.env.NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS || '',
  CLAIM_SBT: process.env.NEXT_PUBLIC_CLAIM_SBT_ADDRESS || '',
  REWARD_NFT: process.env.NEXT_PUBLIC_REWARD_NFT_ADDRESS || '',
  STAKE_MANAGER: process.env.NEXT_PUBLIC_STAKE_MANAGER_ADDRESS || '',
  MOCK_FLR: process.env.NEXT_PUBLIC_MOCK_FLR_ADDRESS || '',
  ORACLE_ADAPTER: process.env.NEXT_PUBLIC_ORACLE_ADAPTER_ADDRESS || '',
  FASSET_MANAGER: process.env.NEXT_PUBLIC_FASSET_MANAGER_ADDRESS || '',
  SESSION_KEY_MANAGER: process.env.NEXT_PUBLIC_SESSION_KEY_MANAGER_ADDRESS || '',
  XLS20_BADGE: process.env.NEXT_PUBLIC_XLS20_BADGE_ADDRESS || ''
}

// Contract factory functions
export function getProjectFactory(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.PROJECT_FACTORY,
    ProjectFactoryABI,
    signer || provider
  )
  return contract
}

export function getProjectVault(vaultAddress: string, provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    vaultAddress,
    ProjectVaultABI,
    signer || provider
  )
  return contract
}

export function getClaimSBT(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.CLAIM_SBT,
    ClaimSBTABI,
    signer || provider
  )
  return contract
}

export function getRewardNFT(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.REWARD_NFT,
    RewardNFTABI,
    signer || provider
  )
  return contract
}

export function getStakeManager(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.STAKE_MANAGER,
    StakeManagerABI,
    signer || provider
  )
  return contract
}

export function getMockFLR(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.MOCK_FLR,
    MockFLRABI,
    signer || provider
  )
  return contract
}

export function getOracleAdapter(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.ORACLE_ADAPTER,
    OracleAdapterABI,
    signer || provider
  )
  return contract
}

export function getFAssetManager(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.FASSET_MANAGER,
    FAssetManagerABI,
    signer || provider
  )
  return contract
}

export function getSessionKeyManager(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.SESSION_KEY_MANAGER,
    SessionKeyManagerABI,
    signer || provider
  )
  return contract
}

export function getXLS20Badge(provider: ethers.Provider, signer?: ethers.Signer) {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.XLS20_BADGE,
    XLS20BadgeABI,
    signer || provider
  )
  return contract
}

// Contract interaction helpers
export class ContractService {
  private provider: ethers.Provider
  private signer?: ethers.Signer

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider
    this.signer = signer
  }

  async createProject(
    title: string,
    description: string,
    totalFunding: number,
    flareTokenAddress: string
  ) {
    const factory = getProjectFactory(this.provider, this.signer)
    const tx = await factory.createProject(title, description, totalFunding, flareTokenAddress)
    const receipt = await tx.wait()
    return receipt
  }

  async processPayment(
    vaultAddress: string,
    investor: string,
    xrpAmount: number,
    xrplTxHash: string,
    xrpPrice: number
  ) {
    const vault = getProjectVault(vaultAddress, this.provider, this.signer)
    const tx = await vault.processPayment(investor, xrpAmount, xrplTxHash, xrpPrice)
    const receipt = await tx.wait()
    return receipt
  }

  async stakeClaim(claimTokenId: number) {
    const stakeManager = getStakeManager(this.provider, this.signer)
    const tx = await stakeManager.stakeClaim(claimTokenId)
    const receipt = await tx.wait()
    return receipt
  }

  async unstakeClaim(claimTokenId: number) {
    const stakeManager = getStakeManager(this.provider, this.signer)
    const tx = await stakeManager.unstakeClaim(claimTokenId)
    const receipt = await tx.wait()
    return receipt
  }

  async getUserClaims(userAddress: string) {
    const claimSBT = getClaimSBT(this.provider)
    return await claimSBT.getUserClaims(userAddress)
  }

  async getClaimData(tokenId: number) {
    const claimSBT = getClaimSBT(this.provider)
    return await claimSBT.getClaimData(tokenId)
  }

  async getUserRewardNFTs(userAddress: string) {
    const rewardNFT = getRewardNFT(this.provider)
    // This would require additional contract methods to get user's NFTs
    // For now, return empty array
    return []
  }

  // Oracle Adapter methods
  async getCurrentXRPPrice() {
    const oracleAdapter = getOracleAdapter(this.provider)
    return await oracleAdapter.getCurrentXRPPrice()
  }

  async createMilestoneAttestation(
    projectId: number,
    milestoneIndex: number,
    milestoneName: string,
    description: string,
    proofHash: string,
    signature: string
  ) {
    const oracleAdapter = getOracleAdapter(this.provider, this.signer)
    const tx = await oracleAdapter.createMilestoneAttestation(
      projectId,
      milestoneIndex,
      milestoneName,
      description,
      proofHash,
      signature
    )
    const receipt = await tx.wait()
    return receipt
  }

  async verifyMilestoneAttestation(attestationHash: string) {
    const oracleAdapter = getOracleAdapter(this.provider)
    return await oracleAdapter.verifyMilestoneAttestation(attestationHash)
  }

  // FAsset Manager methods
  async registerXRPLAddress(xrplAddress: string) {
    const fassetManager = getFAssetManager(this.provider, this.signer)
    const tx = await fassetManager.registerXRPLAddress(xrplAddress)
    const receipt = await tx.wait()
    return receipt
  }

  async getFXRPBalance(userAddress: string) {
    const fassetManager = getFAssetManager(this.provider)
    return await fassetManager.getFXRPBalance(userAddress)
  }

  async burnFXRP(amount: number, xrplDestination: string) {
    const fassetManager = getFAssetManager(this.provider, this.signer)
    const tx = await fassetManager.burnFXRP(amount, xrplDestination)
    const receipt = await tx.wait()
    return receipt
  }

  // Session Key Manager methods
  async createSessionKey(
    sessionKey: string,
    validUntil: number,
    maxGasPrice: number,
    maxGasLimit: number,
    signature: string
  ) {
    const sessionKeyManager = getSessionKeyManager(this.provider, this.signer)
    const tx = await sessionKeyManager.createSessionKey(
      sessionKey,
      validUntil,
      maxGasPrice,
      maxGasLimit,
      signature
    )
    const receipt = await tx.wait()
    return receipt
  }

  async getUserSessionKeys(userAddress: string) {
    const sessionKeyManager = getSessionKeyManager(this.provider)
    return await sessionKeyManager.getUserSessionKeys(userAddress)
  }

  // XLS20 Badge methods
  async mintBadge(
    to: string,
    rewardTokenId: number,
    projectId: number,
    basisPoints: number,
    tokenURI: string
  ) {
    const xls20Badge = getXLS20Badge(this.provider, this.signer)
    const tx = await xls20Badge.mintBadge(to, rewardTokenId, projectId, basisPoints, tokenURI)
    const receipt = await tx.wait()
    return receipt
  }

  async getBadgeData(badgeId: number) {
    const xls20Badge = getXLS20Badge(this.provider)
    return await xls20Badge.getBadgeData(badgeId)
  }
}
