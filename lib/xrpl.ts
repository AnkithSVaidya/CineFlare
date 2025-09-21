import { Client, Wallet, Payment, xrpToDrops } from 'xrpl'

export class XRPLService {
  private client: Client
  private isConnected = false

  constructor() {
    this.client = new Client('wss://s.altnet.rippletest.net:51233') // XRPL Testnet
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect()
      this.isConnected = true
      console.log('Connected to XRPL Testnet')
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect()
      this.isConnected = false
      console.log('Disconnected from XRPL')
    }
  }

  async getAccountInfo(address: string) {
    await this.connect()
    return await this.client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    })
  }

  async getAccountBalance(address: string): Promise<string> {
    await this.connect()
    const accountInfo = await this.getAccountInfo(address)
    return accountInfo.result.account_data.Balance
  }

  async sendPayment(
    fromWallet: Wallet,
    toAddress: string,
    amount: string,
    destinationTag?: number
  ): Promise<string> {
    await this.connect()

    const payment: Payment = {
      TransactionType: 'Payment',
      Account: fromWallet.address,
      Destination: toAddress,
      Amount: xrpToDrops(amount),
      ...(destinationTag && { DestinationTag: destinationTag })
    }

    // Submit and wait for validation
    const response = await this.client.submitAndWait(payment, { wallet: fromWallet })
    
    if (response.result.validated) {
      return response.result.hash
    } else {
      throw new Error('Transaction failed to validate')
    }
  }

  async getTransaction(txHash: string) {
    await this.connect()
    return await this.client.request({
      command: 'tx',
      transaction: txHash
    })
  }

  async getAccountTransactions(address: string, limit = 20) {
    await this.connect()
    return await this.client.request({
      command: 'account_tx',
      account: address,
      limit: limit,
      ledger_index_min: -1,
      ledger_index_max: -1
    })
  }

  // Generate a new wallet for testing
  generateWallet(): Wallet {
    return Wallet.generate()
  }

  // Import wallet from seed
  importWallet(seed: string): Wallet {
    return Wallet.fromSeed(seed)
  }

  // Get current XRP price (mock implementation)
  async getXRPPrice(): Promise<number> {
    // In a real implementation, you'd fetch from an API
    // For demo purposes, return a mock price
    return 0.62
  }

  // Monitor payments to a specific address
  async monitorPayments(
    address: string,
    onPayment: (tx: any) => void,
    destinationTag?: number
  ) {
    await this.connect()
    
    const subscription = {
      command: 'subscribe',
      accounts: [address]
    }

    this.client.request(subscription)

    this.client.on('transaction', (tx) => {
      if (tx.transaction && 
          tx.transaction.TransactionType === 'Payment' &&
          tx.transaction.Destination === address &&
          (!destinationTag || tx.transaction.DestinationTag === destinationTag)) {
        onPayment(tx)
      }
    })
  }

  // Stop monitoring payments
  async stopMonitoring() {
    await this.client.request({
      command: 'unsubscribe',
      accounts: []
    })
  }
}

// Singleton instance
export const xrplService = new XRPLService()
