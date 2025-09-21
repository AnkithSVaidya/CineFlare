import { ethers } from 'ethers'
import { xrplService } from './xrpl'
import { ContractService } from './contracts'

/**
 * Relayer service that bridges XRPL payments to Flare smart contracts
 * This service monitors XRPL for payments and submits attestations to Flare
 */
export class RelayerService {
  private contractService: ContractService
  private isMonitoring = false
  private monitoredAddresses = new Map<string, {
    projectId: number
    vaultAddress: string
    destinationTag: number
  }>()

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.contractService = new ContractService(provider, signer)
  }

  /**
   * Start monitoring XRPL payments for a project
   */
  async startMonitoring(
    xrplAddress: string,
    projectId: number,
    vaultAddress: string,
    destinationTag: number
  ) {
    this.monitoredAddresses.set(xrplAddress, {
      projectId,
      vaultAddress,
      destinationTag
    })

    if (!this.isMonitoring) {
      await this.startPaymentMonitoring()
    }
  }

  /**
   * Stop monitoring XRPL payments
   */
  async stopMonitoring() {
    this.isMonitoring = false
    await xrplService.stopMonitoring()
  }

  /**
   * Start monitoring all registered addresses
   */
  private async startPaymentMonitoring() {
    this.isMonitoring = true

    for (const [address, config] of this.monitoredAddresses) {
      await xrplService.monitorPayments(
        address,
        (tx) => this.handlePayment(tx, config),
        config.destinationTag
      )
    }
  }

  /**
   * Handle incoming XRPL payment
   */
  private async handlePayment(tx: any, config: {
    projectId: number
    vaultAddress: string
    destinationTag: number
  }) {
    try {
      console.log('Processing XRPL payment:', tx.transaction.hash)

      const payment = tx.transaction
      const amount = parseFloat(payment.Amount) / 1000000 // Convert drops to XRP
      const fromAddress = payment.Account
      const txHash = payment.hash

      // Get current XRP price from FTSO
      const [xrpPrice, priceTimestamp] = await this.contractService.getCurrentXRPPrice()

      // Check if payment was already processed
      const vault = this.contractService.getProjectVault(
        config.vaultAddress,
        this.contractService.provider
      )
      const isProcessed = await vault.isPaymentProcessed(txHash)

      if (isProcessed) {
        console.log('Payment already processed:', txHash)
        return
      }

      // Verify XRPL payment with Oracle Adapter
      const oracleAdapter = this.contractService.getOracleAdapter(
        this.contractService.provider,
        this.contractService.signer
      )
      
      // Submit payment proof to Oracle
      await oracleAdapter.verifyXRPLPayment(
        txHash,
        fromAddress,
        payment.Destination,
        amount,
        payment.date,
        payment.ledger_index
      )

      // Process payment on Flare
      await this.contractService.processPayment(
        config.vaultAddress,
        fromAddress,
        amount,
        txHash,
        xrpPrice
      )

      console.log('Payment processed successfully:', txHash)

    } catch (error) {
      console.error('Error processing payment:', error)
    }
  }

  /**
   * Manually process a payment (for testing or manual verification)
   */
  async processPaymentManually(
    xrplTxHash: string,
    vaultAddress: string,
    investorAddress: string,
    xrpAmount: number
  ) {
    try {
      // Verify transaction on XRPL
      const tx = await xrplService.getTransaction(xrplTxHash)
      
      if (!tx.result.validated) {
        throw new Error('Transaction not validated on XRPL')
      }

      const payment = tx.result.Transaction
      if (payment.TransactionType !== 'Payment') {
        throw new Error('Not a payment transaction')
      }

      // Get XRP price at time of transaction
      const xrpPrice = await xrplService.getXRPPrice()

      // Process on Flare
      await this.contractService.processPayment(
        vaultAddress,
        investorAddress,
        xrpAmount,
        xrplTxHash,
        xrpPrice
      )

      return true
    } catch (error) {
      console.error('Error manually processing payment:', error)
      throw error
    }
  }

  /**
   * Generate XRPL address and destination tag for a project
   */
  generateProjectAddress(projectId: number): {
    address: string
    destinationTag: number
  } {
    // In a real implementation, this would generate a unique address
    // For demo purposes, use a fixed address with project-specific destination tag
    return {
      address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH', // Demo address
      destinationTag: projectId + 1000000 // Ensure unique destination tags
    }
  }

  /**
   * Verify XRPL transaction
   */
  async verifyTransaction(txHash: string): Promise<{
    valid: boolean
    amount?: number
    from?: string
    to?: string
    destinationTag?: number
  }> {
    try {
      const tx = await xrplService.getTransaction(txHash)
      
      if (!tx.result.validated) {
        return { valid: false }
      }

      const payment = tx.result.Transaction
      if (payment.TransactionType !== 'Payment') {
        return { valid: false }
      }

      return {
        valid: true,
        amount: parseFloat(payment.Amount) / 1000000, // Convert drops to XRP
        from: payment.Account,
        to: payment.Destination,
        destinationTag: payment.DestinationTag
      }
    } catch (error) {
      console.error('Error verifying transaction:', error)
      return { valid: false }
    }
  }
}

// Singleton instance
let relayerService: RelayerService | null = null

export function getRelayerService(provider?: ethers.Provider, signer?: ethers.Signer): RelayerService {
  if (!relayerService && provider) {
    relayerService = new RelayerService(provider, signer)
  }
  return relayerService!
}
