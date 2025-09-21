import { ethers } from 'ethers'
import { ContractService } from './contracts'

/**
 * Oracle service for handling FTSO price feeds and milestone attestations
 */
export class OracleService {
  private contractService: ContractService

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.contractService = new ContractService(provider, signer)
  }

  /**
   * Get current XRP price from FTSO
   */
  async getCurrentXRPPrice(): Promise<{ price: number; timestamp: number }> {
    try {
      const [price, timestamp] = await this.contractService.getCurrentXRPPrice()
      return {
        price: Number(price) / 1e18, // Convert from wei
        timestamp: Number(timestamp)
      }
    } catch (error) {
      console.error('Error fetching XRP price:', error)
      // Fallback to mock price
      return {
        price: 0.62,
        timestamp: Date.now()
      }
    }
  }

  /**
   * Get XRP price at specific epoch
   */
  async getXRPPriceAtEpoch(epochId: number): Promise<{ price: number; timestamp: number }> {
    try {
      const oracleAdapter = this.contractService.getOracleAdapter(this.contractService.provider)
      const [price, timestamp] = await oracleAdapter.getXRPPriceAtEpoch(epochId)
      return {
        price: Number(price) / 1e18,
        timestamp: Number(timestamp)
      }
    } catch (error) {
      console.error('Error fetching XRP price at epoch:', error)
      throw error
    }
  }

  /**
   * Create milestone attestation
   */
  async createMilestoneAttestation(
    projectId: number,
    milestoneIndex: number,
    milestoneName: string,
    description: string,
    proofHash: string,
    verifierPrivateKey: string
  ): Promise<string> {
    try {
      // Create message hash for signing
      const messageHash = ethers.keccak256(ethers.solidityPacked(
        ['uint256', 'uint256', 'string', 'string', 'string', 'uint256'],
        [projectId, milestoneIndex, milestoneName, description, proofHash, Date.now()]
      ))

      // Sign with verifier key
      const wallet = new ethers.Wallet(verifierPrivateKey)
      const signature = await wallet.signMessage(ethers.getBytes(messageHash))

      // Submit attestation
      const receipt = await this.contractService.createMilestoneAttestation(
        projectId,
        milestoneIndex,
        milestoneName,
        description,
        proofHash,
        signature
      )

      // Extract attestation hash from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contractService.getOracleAdapter(this.contractService.provider).interface.parseLog(log)
          return parsed?.name === 'MilestoneAttestationCreated'
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = this.contractService.getOracleAdapter(this.contractService.provider).interface.parseLog(event)
        return parsed?.args.attestationHash || ''
      }

      return ''
    } catch (error) {
      console.error('Error creating milestone attestation:', error)
      throw error
    }
  }

  /**
   * Verify milestone attestation
   */
  async verifyMilestoneAttestation(attestationHash: string): Promise<boolean> {
    try {
      return await this.contractService.verifyMilestoneAttestation(attestationHash)
    } catch (error) {
      console.error('Error verifying milestone attestation:', error)
      return false
    }
  }

  /**
   * Get milestone attestation data
   */
  async getMilestoneAttestation(attestationHash: string) {
    try {
      const oracleAdapter = this.contractService.getOracleAdapter(this.contractService.provider)
      return await oracleAdapter.getMilestoneAttestation(attestationHash)
    } catch (error) {
      console.error('Error getting milestone attestation:', error)
      throw error
    }
  }

  /**
   * Verify XRPL payment
   */
  async verifyXRPLPayment(
    txHash: string,
    sender: string,
    recipient: string,
    amount: number,
    timestamp: number,
    blockNumber: number
  ): Promise<boolean> {
    try {
      const oracleAdapter = this.contractService.getOracleAdapter(
        this.contractService.provider,
        this.contractService.signer
      )
      
      const tx = await oracleAdapter.verifyXRPLPayment(
        txHash,
        sender,
        recipient,
        amount,
        timestamp,
        blockNumber
      )
      
      return tx
    } catch (error) {
      console.error('Error verifying XRPL payment:', error)
      return false
    }
  }

  /**
   * Check if XRPL payment is verified
   */
  async isXRPLPaymentVerified(txHash: string): Promise<boolean> {
    try {
      const oracleAdapter = this.contractService.getOracleAdapter(this.contractService.provider)
      return await oracleAdapter.isXRPLPaymentVerified(txHash)
    } catch (error) {
      console.error('Error checking XRPL payment verification:', error)
      return false
    }
  }

  /**
   * Get XRPL payment proof
   */
  async getXRPLPaymentProof(txHash: string) {
    try {
      const oracleAdapter = this.contractService.getOracleAdapter(this.contractService.provider)
      return await oracleAdapter.getXRPLPaymentProof(txHash)
    } catch (error) {
      console.error('Error getting XRPL payment proof:', error)
      throw error
    }
  }

  /**
   * Batch verify XRPL payments
   */
  async batchVerifyXRPLPayments(payments: Array<{
    txHash: string
    sender: string
    recipient: string
    amount: number
    timestamp: number
    blockNumber: number
  }>): Promise<boolean> {
    try {
      const oracleAdapter = this.contractService.getOracleAdapter(
        this.contractService.provider,
        this.contractService.signer
      )

      const txHashes = payments.map(p => p.txHash)
      const senders = payments.map(p => p.sender)
      const recipients = payments.map(p => p.recipient)
      const amounts = payments.map(p => p.amount)
      const timestamps = payments.map(p => p.timestamp)
      const blockNumbers = payments.map(p => p.blockNumber)

      const tx = await oracleAdapter.batchVerifyXRPLPayments(
        txHashes,
        senders,
        recipients,
        amounts,
        timestamps,
        blockNumbers
      )

      return true
    } catch (error) {
      console.error('Error batch verifying XRPL payments:', error)
      return false
    }
  }

  /**
   * Convert XRP amount to USD using current FTSO price
   */
  async convertXRPToUSD(xrpAmount: number): Promise<number> {
    try {
      const { price } = await this.getCurrentXRPPrice()
      return xrpAmount * price
    } catch (error) {
      console.error('Error converting XRP to USD:', error)
      return xrpAmount * 0.62 // Fallback price
    }
  }

  /**
   * Convert USD amount to XRP using current FTSO price
   */
  async convertUSDToXRP(usdAmount: number): Promise<number> {
    try {
      const { price } = await this.getCurrentXRPPrice()
      return usdAmount / price
    } catch (error) {
      console.error('Error converting USD to XRP:', error)
      return usdAmount / 0.62 // Fallback price
    }
  }
}

// Singleton instance
let oracleService: OracleService | null = null

export function getOracleService(provider?: ethers.Provider, signer?: ethers.Signer): OracleService {
  if (!oracleService && provider) {
    oracleService = new OracleService(provider, signer)
  }
  return oracleService!
}
