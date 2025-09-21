import { ethers } from 'ethers'
import { ContractService } from './contracts'

/**
 * FAssets service for managing FXRP and cross-chain operations
 */
export class FAssetsService {
  private contractService: ContractService

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.contractService = new ContractService(provider, signer)
  }

  /**
   * Register user's XRPL address for FAsset minting
   */
  async registerXRPLAddress(xrplAddress: string): Promise<boolean> {
    try {
      const receipt = await this.contractService.registerXRPLAddress(xrplAddress)
      return receipt.status === 1
    } catch (error) {
      console.error('Error registering XRPL address:', error)
      return false
    }
  }

  /**
   * Create mint request for FXRP
   */
  async createMintRequest(
    xrplTxHash: string,
    userAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const fassetManager = this.contractService.getFAssetManager(
        this.contractService.provider,
        this.contractService.signer
      )
      
      const tx = await fassetManager.createMintRequest(xrplTxHash, userAddress, amount)
      const receipt = await tx.wait()
      
      // Extract mint request ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = fassetManager.interface.parseLog(log)
          return parsed?.name === 'MintRequestCreated'
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = fassetManager.interface.parseLog(event)
        return parsed?.args.xrplTxHash || xrplTxHash
      }

      return xrplTxHash
    } catch (error) {
      console.error('Error creating mint request:', error)
      throw error
    }
  }

  /**
   * Process mint request and mint FXRP
   */
  async processMintRequest(xrplTxHash: string): Promise<boolean> {
    try {
      const fassetManager = this.contractService.getFAssetManager(
        this.contractService.provider,
        this.contractService.signer
      )
      
      const tx = await fassetManager.processMintRequest(xrplTxHash)
      const receipt = await tx.wait()
      return receipt.status === 1
    } catch (error) {
      console.error('Error processing mint request:', error)
      return false
    }
  }

  /**
   * Burn FXRP and initiate XRPL withdrawal
   */
  async burnFXRP(amount: number, xrplDestination: string): Promise<boolean> {
    try {
      const receipt = await this.contractService.burnFXRP(amount, xrplDestination)
      return receipt.status === 1
    } catch (error) {
      console.error('Error burning FXRP:', error)
      return false
    }
  }

  /**
   * Get user's FXRP balance
   */
  async getFXRPBalance(userAddress: string): Promise<number> {
    try {
      const balance = await this.contractService.getFXRPBalance(userAddress)
      return Number(balance) / 1e18 // Convert from wei
    } catch (error) {
      console.error('Error getting FXRP balance:', error)
      return 0
    }
  }

  /**
   * Get user's XRPL address
   */
  async getUserXRPLAddress(userAddress: string): Promise<string> {
    try {
      const fassetManager = this.contractService.getFAssetManager(this.contractService.provider)
      return await fassetManager.getUserXRPLAddress(userAddress)
    } catch (error) {
      console.error('Error getting user XRPL address:', error)
      return ''
    }
  }

  /**
   * Get Flare address from XRPL address
   */
  async getFlareAddressFromXRPL(xrplAddress: string): Promise<string> {
    try {
      const fassetManager = this.contractService.getFAssetManager(this.contractService.provider)
      return await fassetManager.getFlareAddressFromXRPL(xrplAddress)
    } catch (error) {
      console.error('Error getting Flare address from XRPL:', error)
      return ''
    }
  }

  /**
   * Get pending mint requests
   */
  async getPendingMintRequests(): Promise<string[]> {
    try {
      const fassetManager = this.contractService.getFAssetManager(this.contractService.provider)
      return await fassetManager.getPendingMintRequests()
    } catch (error) {
      console.error('Error getting pending mint requests:', error)
      return []
    }
  }

  /**
   * Get mint request details
   */
  async getMintRequest(xrplTxHash: string) {
    try {
      const fassetManager = this.contractService.getFAssetManager(this.contractService.provider)
      return await fassetManager.getMintRequest(xrplTxHash)
    } catch (error) {
      console.error('Error getting mint request:', error)
      throw error
    }
  }

  /**
   * Batch process mint requests
   */
  async batchProcessMintRequests(xrplTxHashes: string[]): Promise<boolean> {
    try {
      const fassetManager = this.contractService.getFAssetManager(
        this.contractService.provider,
        this.contractService.signer
      )
      
      const tx = await fassetManager.batchProcessMintRequests(xrplTxHashes)
      const receipt = await tx.wait()
      return receipt.status === 1
    } catch (error) {
      console.error('Error batch processing mint requests:', error)
      return false
    }
  }

  /**
   * Check if user has registered XRPL address
   */
  async hasRegisteredXRPLAddress(userAddress: string): Promise<boolean> {
    try {
      const xrplAddress = await this.getUserXRPLAddress(userAddress)
      return xrplAddress.length > 0
    } catch (error) {
      console.error('Error checking XRPL address registration:', error)
      return false
    }
  }

  /**
   * Get bridge status for a user
   */
  async getBridgeStatus(userAddress: string) {
    try {
      const [fxrpBalance, xrplAddress, pendingRequests] = await Promise.all([
        this.getFXRPBalance(userAddress),
        this.getUserXRPLAddress(userAddress),
        this.getPendingMintRequests()
      ])

      return {
        fxrpBalance,
        xrplAddress,
        hasRegisteredXRPL: xrplAddress.length > 0,
        pendingMintRequests: pendingRequests.length
      }
    } catch (error) {
      console.error('Error getting bridge status:', error)
      return {
        fxrpBalance: 0,
        xrplAddress: '',
        hasRegisteredXRPL: false,
        pendingMintRequests: 0
      }
    }
  }
}

// Singleton instance
let fassetsService: FAssetsService | null = null

export function getFAssetsService(provider?: ethers.Provider, signer?: ethers.Signer): FAssetsService {
  if (!fassetsService && provider) {
    fassetsService = new FAssetsService(provider, signer)
  }
  return fassetsService!
}
