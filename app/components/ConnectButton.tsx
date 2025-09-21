'use client'

import { useState } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Wallet, ExternalLink, LogOut } from 'lucide-react'

export function ConnectButton() {
  const { isConnected, account, connectWallet, disconnect, chainId, switchToFlare } = useWeb3()
  const [showMenu, setShowMenu] = useState(false)

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
      >
        <Wallet className="w-5 h-5" />
        <span>Connect Wallet</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="hidden sm:inline">
          {account?.slice(0, 6)}...{account?.slice(-4)}
        </span>
        <span className="sm:hidden">Connected</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="text-sm text-gray-300 mb-3">
              <div className="font-medium text-white">Connected Account</div>
              <div className="font-mono text-xs break-all">{account}</div>
            </div>
            
            <div className="text-sm text-gray-300 mb-3">
              <div className="font-medium text-white">Network</div>
              <div className="flex items-center space-x-2">
                <span>Chain ID: {chainId}</span>
                {chainId !== 114 && (
                  <button
                    onClick={switchToFlare}
                    className="text-orange-400 hover:text-orange-300 text-xs"
                  >
                    Switch to Flare
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  window.open(`https://coston2-explorer.flare.network/address/${account}`, '_blank')
                  setShowMenu(false)
                }}
                className="w-full flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </button>
              
              <button
                onClick={() => {
                  disconnect()
                  setShowMenu(false)
                }}
                className="w-full flex items-center space-x-2 text-red-400 hover:text-red-300 p-2 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
