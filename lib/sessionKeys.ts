import { ethers } from 'ethers'
import { ContractService } from './contracts'

/**
 * Session Key service for managing fee-sponsored transactions
 */
export class SessionKeyService {
  private contractService: ContractService

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.contractService = new ContractService(provider, signer)
  }

  /**
   * Create a new session key
   */
  async createSessionKey(
    sessionKeyAddress: string,
    validUntil: number,
    maxGasPrice: number,
    maxGasLimit: number,
    userPrivateKey: string
  ): Promise<boolean> {
    try {
      // Create message hash for signing
      const messageHash = ethers.keccak256(ethers.solidityPacked(
        ['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [await this.contractService.signer?.getAddress(), sessionKeyAddress, validUntil, maxGasPrice, maxGasLimit, await this.contractService.provider.getNetwork().then(n => n.chainId)]
      ))

      // Sign with user's private key
      const wallet = new ethers.Wallet(userPrivateKey)
      const signature = await wallet.signMessage(ethers.getBytes(messageHash))

      const receipt = await this.contractService.createSessionKey(
        sessionKeyAddress,
        validUntil,
        maxGasPrice,
        maxGasLimit,
        signature
      )

      return receipt.status === 1
    } catch (error) {
      console.error('Error creating session key:', error)
      return false
    }
  }

  /**
   * Revoke a session key
   */
  async revokeSessionKey(sessionKeyAddress: string): Promise<boolean> {
    try {
      const sessionKeyManager = this.contractService.getSessionKeyManager(
        this.contractService.provider,
        this.contractService.signer
      )
      
      const tx = await sessionKeyManager.revokeSessionKey(sessionKeyAddress)
      const receipt = await tx.wait()
      return receipt.status === 1
    } catch (error) {
      console.error('Error revoking session key:', error)
      return false
    }
  }

  /**
   * Execute transaction using session key
   */
  async executeTransaction(
    userAddress: string,
    to: string,
    value: number,
    data: string,
    gasLimit: number,
    nonce: number,
    sessionKeyPrivateKey: string
  ): Promise<boolean> {
    try {
      const sessionKeyManager = this.contractService.getSessionKeyManager(
        this.contractService.provider,
        this.contractService.signer
      )

      // Create message hash for signing
      const messageHash = ethers.keccak256(ethers.solidityPacked(
        ['address', 'address', 'uint256', 'bytes32', 'uint256', 'uint256', 'uint256'],
        [userAddress, to, value, ethers.keccak256(data), gasLimit, nonce, await this.contractService.provider.getNetwork().then(n => n.chainId)]
      ))

      // Sign with session key
      const wallet = new ethers.Wallet(sessionKeyPrivateKey)
      const signature = await wallet.signMessage(ethers.getBytes(messageHash))

      const tx = await sessionKeyManager.executeTransaction(
        userAddress,
        to,
        value,
        data,
        gasLimit,
        nonce,
        signature
      )

      return tx
    } catch (error) {
      console.error('Error executing transaction with session key:', error)
      return false
    }
  }

  /**
   * Get user's session keys
   */
  async getUserSessionKeys(userAddress: string) {
    try {
      return await this.contractService.getUserSessionKeys(userAddress)
    } catch (error) {
      console.error('Error getting user session keys:', error)
      return []
    }
  }

  /**
   * Get user's next nonce
   */
  async getUserNonce(userAddress: string): Promise<number> {
    try {
      const sessionKeyManager = this.contractService.getSessionKeyManager(this.contractService.provider)
      return await sessionKeyManager.getUserNonce(userAddress)
    } catch (error) {
      console.error('Error getting user nonce:', error)
      return 0
    }
  }

  /**
   * Get user's sponsored gas usage
   */
  async getSponsoredGasUsed(userAddress: string): Promise<number> {
    try {
      const sessionKeyManager = this.contractService.getSessionKeyManager(this.contractService.provider)
      return await sessionKeyManager.getSponsoredGasUsed(userAddress)
    } catch (error) {
      console.error('Error getting sponsored gas usage:', error)
      return 0
    }
  }

  /**
   * Check if session key is valid
   */
  async isSessionKeyValid(userAddress: string, sessionKeyAddress: string): Promise<boolean> {
    try {
      const sessionKeyManager = this.contractService.getSessionKeyManager(this.contractService.provider)
      return await sessionKeyManager.isSessionKeyValid(userAddress, sessionKeyAddress)
    } catch (error) {
      console.error('Error checking session key validity:', error)
      return false
    }
  }

  /**
   * Generate a new session key pair
   */
  generateSessionKeyPair(): { address: string; privateKey: string } {
    const wallet = ethers.Wallet.createRandom()
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    }
  }

  /**
   * Get active session keys for a user
   */
  async getActiveSessionKeys(userAddress: string) {
    try {
      const allSessionKeys = await this.getUserSessionKeys(userAddress)
      const currentTime = Math.floor(Date.now() / 1000)
      
      return allSessionKeys.filter((key: any) => 
        key.isActive && key.validUntil > currentTime
      )
    } catch (error) {
      console.error('Error getting active session keys:', error)
      return []
    }
  }

  /**
   * Check if user has any active session keys
   */
  async hasActiveSessionKeys(userAddress: string): Promise<boolean> {
    try {
      const activeKeys = await this.getActiveSessionKeys(userAddress)
      return activeKeys.length > 0
    } catch (error) {
      console.error('Error checking active session keys:', error)
      return false
    }
  }

  /**
   * Get session key status for a user
   */
  async getSessionKeyStatus(userAddress: string) {
    try {
      const [allKeys, activeKeys, nonce, sponsoredGas] = await Promise.all([
        this.getUserSessionKeys(userAddress),
        this.getActiveSessionKeys(userAddress),
        this.getUserNonce(userAddress),
        this.getSponsoredGasUsed(userAddress)
      ])

      return {
        totalKeys: allKeys.length,
        activeKeys: activeKeys.length,
        nextNonce: nonce,
        sponsoredGasUsed: sponsoredGas,
        hasActiveKeys: activeKeys.length > 0
      }
    } catch (error) {
      console.error('Error getting session key status:', error)
      return {
        totalKeys: 0,
        activeKeys: 0,
        nextNonce: 0,
        sponsoredGasUsed: 0,
        hasActiveKeys: false
      }
    }
  }

  /**
   * Batch execute transactions (for relayer efficiency)
   */
  async batchExecuteTransactions(transactions: Array<{
    userAddress: string
    to: string
    value: number
    data: string
    gasLimit: number
    nonce: number
    sessionKeyPrivateKey: string
  }>): Promise<boolean[]> {
    try {
      const results = await Promise.allSettled(
        transactions.map(tx => this.executeTransaction(
          tx.userAddress,
          tx.to,
          tx.value,
          tx.data,
          tx.gasLimit,
          tx.nonce,
          tx.sessionKeyPrivateKey
        ))
      )

      return results.map(result => 
        result.status === 'fulfilled' ? result.value : false
      )
    } catch (error) {
      console.error('Error batch executing transactions:', error)
      return transactions.map(() => false)
    }
  }
}

// Singleton instance
let sessionKeyService: SessionKeyService | null = null

export function getSessionKeyService(provider?: ethers.Provider, signer?: ethers.Signer): SessionKeyService {
  if (!sessionKeyService && provider) {
    sessionKeyService = new SessionKeyService(provider, signer)
  }
  return sessionKeyService!
}
