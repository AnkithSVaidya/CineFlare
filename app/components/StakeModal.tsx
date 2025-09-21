'use client'

import { useState } from 'react'
import { X, Lock, Gift, AlertTriangle, CheckCircle } from 'lucide-react'
import { Claim } from '../types'
import toast from 'react-hot-toast'

interface StakeModalProps {
  claim: Claim
  onClose: () => void
  onStaked: () => void
}

export function StakeModal({ claim, onClose, onStaked }: StakeModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Confirmation, 2: Processing, 3: Success

  const sharePercentage = (claim.basisPoints / 100).toFixed(2)

  const handleStake = async () => {
    setLoading(true)
    setStep(2)
    
    try {
      // Simulate staking process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setStep(3)
      toast.success('Claim staked successfully! Reward NFT minted.')
      
      // Auto close after success
      setTimeout(() => {
        onStaked()
      }, 2000)
    } catch (error) {
      toast.error('Failed to stake claim')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Stake Your Claim</h3>
        <p className="text-gray-300">Lock your claim to mint a shareable reward NFT</p>
      </div>

      {/* Claim Details */}
      <div className="bg-white/5 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-white">Claim Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Token ID:</span>
            <span className="text-white ml-2">#{claim.tokenId}</span>
          </div>
          <div>
            <span className="text-gray-400">Project:</span>
            <span className="text-white ml-2">#{claim.projectId}</span>
          </div>
          <div>
            <span className="text-gray-400">Share:</span>
            <span className="text-yellow-400 ml-2">{sharePercentage}%</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <span className="text-green-400 ml-2">Active</span>
          </div>
        </div>
      </div>

      {/* What Happens */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-3">What happens when you stake:</h4>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>A shareable reward NFT will be minted to your address</span>
          </li>
          <li className="flex items-start space-x-2">
            <Lock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <span>Your claim will be locked and revenue will pause</span>
          </li>
          <li className="flex items-start space-x-2">
            <Gift className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <span>You can transfer the reward NFT to share your success</span>
          </li>
        </ul>
      </div>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-400 mb-1">Important</h4>
            <p className="text-sm text-yellow-300">
              While your claim is staked, you won't receive revenue distributions. 
              You can unstake anytime by burning the reward NFT.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleStake}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
        >
          Stake Claim
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <Lock className="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Staking Your Claim</h3>
        <p className="text-gray-300">Please wait while we process your stake...</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Locking claim token #{claim.tokenId}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span>Minting reward NFT</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span>Updating claim status</span>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Successfully Staked!</h3>
        <p className="text-gray-300">Your claim has been staked and reward NFT minted</p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Claim Token:</span>
          <span className="text-white">#{claim.tokenId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Reward NFT:</span>
          <span className="text-purple-400">Minted</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Status:</span>
          <span className="text-orange-400">Staked</span>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <p className="text-sm text-green-400">
          You can now share your reward NFT with others. Your claim will remain paused 
          until you burn the reward NFT to unstake.
        </p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Stake Claim</h2>
          {step === 1 && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  )
}
