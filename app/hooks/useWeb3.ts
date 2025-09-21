'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum
      
      // Check if already connected
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet()
          }
        })
        .catch(console.error)

      // Listen for account changes
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          disconnect()
        }
      })

      // Listen for chain changes
      ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16))
        window.location.reload()
      })
    }
  }, [])

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const ethereum = window.ethereum
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.BrowserProvider(ethereum)
        const network = await provider.getNetwork()
        
        setAccount(accounts[0])
        setProvider(provider)
        setChainId(Number(network.chainId))
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setProvider(null)
    setIsConnected(false)
    setChainId(null)
  }

  const switchToFlare = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x72' }], // Flare Coston2 testnet
        })
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added, add it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x72',
              chainName: 'Flare Coston2 Testnet',
              nativeCurrency: {
                name: 'Flare',
                symbol: 'FLR',
                decimals: 18,
              },
              rpcUrls: ['https://coston2-api.flare.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://coston2-explorer.flare.network/'],
            }],
          })
        }
      }
    }
  }

  return {
    account,
    provider,
    isConnected,
    chainId,
    connectWallet,
    disconnect,
    switchToFlare
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
