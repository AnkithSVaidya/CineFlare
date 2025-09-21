'use client'

import { Claim } from '../types'
import { TrendingUp, Lock, Unlock, Share2, DollarSign, Calendar } from 'lucide-react'

interface ClaimCardProps {
  claim: Claim
  onStake: () => void
  onUnstake: () => void
}

export function ClaimCard({ claim, onStake, onUnstake }: ClaimCardProps) {
  const sharePercentage = (claim.basisPoints / 100).toFixed(2)
  const isStaked = claim.status === 'staked'
  const isActive = claim.status === 'active'

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isStaked ? (
            <Lock className="w-5 h-5 text-orange-400" />
          ) : (
            <Unlock className="w-5 h-5 text-green-400" />
          )}
          <span className="text-lg font-semibold text-white">
            Claim #{claim.tokenId}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-500/20 text-green-400' :
          isStaked ? 'bg-orange-500/20 text-orange-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {claim.status.toUpperCase()}
        </div>
      </div>

      {/* Project Info */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">Project ID</div>
        <div className="text-white font-mono">#{claim.projectId}</div>
      </div>

      {/* Share Percentage */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-400">Share Percentage</span>
        </div>
        <div className="text-2xl font-bold text-yellow-400">{sharePercentage}%</div>
      </div>

      {/* Investment Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Join Price</div>
          <div className="text-white">${claim.joinPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Basis Points</div>
          <div className="text-white">{claim.basisPoints}</div>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">XRPL Transaction</div>
        <div className="text-white font-mono text-xs break-all">
          {claim.xrplSourceTx}
        </div>
      </div>

      {/* Timestamp */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            Joined: {formatDate(claim.timestamp)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {isActive && (
          <button
            onClick={onStake}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            <span>Stake & Mint Reward NFT</span>
          </button>
        )}

        {isStaked && (
          <button
            onClick={onUnstake}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-lg transition-all duration-200"
          >
            <Unlock className="w-4 h-4" />
            <span>Unstake & Burn Reward NFT</span>
          </button>
        )}

        {isActive && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-green-400 text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Earning revenue</span>
            </div>
          </div>
        )}

        {isStaked && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-orange-400 text-sm">
              <Lock className="w-4 h-4" />
              <span>Revenue paused (staked)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
