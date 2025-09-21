'use client'

import { RewardNFT } from '../types'
import { Gift, Share2, Calendar, TrendingUp, Lock } from 'lucide-react'

interface RewardNFTCardProps {
  rewardNFT: RewardNFT
  onShare: () => void
}

export function RewardNFTCard({ rewardNFT, onShare }: RewardNFTCardProps) {
  const sharePercentage = (rewardNFT.basisPoints / 100).toFixed(2)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-purple-400" />
          <span className="text-lg font-semibold text-white">
            Reward NFT #{rewardNFT.tokenId}
          </span>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
          SHAREABLE
        </div>
      </div>

      {/* Project Info */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">Project ID</div>
        <div className="text-white font-mono">#{rewardNFT.projectId}</div>
      </div>

      {/* Share Percentage */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-400">Share Percentage</span>
        </div>
        <div className="text-2xl font-bold text-purple-400">{sharePercentage}%</div>
      </div>

      {/* Claim Token ID */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">Linked Claim Token</div>
        <div className="text-white font-mono">#{rewardNFT.claimTokenId}</div>
      </div>

      {/* Mint Date */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            Minted: {formatDate(rewardNFT.mintTimestamp)}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-orange-400">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Underlying claim is paused</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onShare}
        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg transition-all duration-200"
      >
        <Share2 className="w-4 h-4" />
        <span>Share This Reward</span>
      </button>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-purple-300">
          This NFT represents your shareable reward from the staked claim. 
          You can transfer it to others to share your success, but your underlying claim 
          will remain paused until you burn this NFT.
        </p>
      </div>
    </div>
  )
}
