'use client'

import { ConnectButton } from './ConnectButton'
import { Film, Wallet } from 'lucide-react'

interface HeaderProps {
  isConnected: boolean
  account: string | null
  onCreateProject: () => void
}

export function Header({ isConnected, account, onCreateProject }: HeaderProps) {
  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">XRP Film Funding</h1>
              <p className="text-xs text-gray-400">Powered by Flare</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Projects
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              My Investments
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Rewards
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Docs
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <button
                onClick={onCreateProject}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <span>Create Project</span>
              </button>
            )}
            
            <ConnectButton />
            
            {isConnected && account && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
                <Wallet className="w-4 h-4" />
                <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
