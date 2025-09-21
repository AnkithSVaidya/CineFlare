'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Header } from '../components/Header'
import { ClaimCard } from '../components/ClaimCard'
import { RewardNFTCard } from '../components/RewardNFTCard'
import { StakeModal } from '../components/StakeModal'
import { Claim, RewardNFT } from '../types'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { account, provider, isConnected } = useWeb3()
  const [claims, setClaims] = useState<Claim[]>([])
  const [rewardNFTs, setRewardNFTs] = useState<RewardNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

  useEffect(() => {
    if (isConnected && account) {
      loadUserData()
    }
  }, [isConnected, account])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demo
      const mockClaims: Claim[] = [
        {
          tokenId: 1,
          projectId: 1,
          basisPoints: 500, // 5%
          status: 'active',
          joinPrice: 0.62,
          xrplSourceTx: '0x1234...5678',
          timestamp: Date.now() - 86400000
        },
        {
          tokenId: 2,
          projectId: 2,
          basisPoints: 1000, // 10%
          status: 'staked',
          joinPrice: 0.58,
          xrplSourceTx: '0x8765...4321',
          timestamp: Date.now() - 172800000
        }
      ]

      const mockRewardNFTs: RewardNFT[] = [
        {
          tokenId: 1,
          claimTokenId: 2,
          projectId: 2,
          basisPoints: 1000,
          mintTimestamp: Date.now() - 86400000,
          isActive: true
        }
      ]

      setClaims(mockClaims)
      setRewardNFTs(mockRewardNFTs)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleStakeClaim = (claim: Claim) => {
    setSelectedClaim(claim)
    setShowStakeModal(true)
  }

  const handleUnstakeClaim = async (claimTokenId: number) => {
    try {
      // Simulate unstaking
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setClaims(prev => prev.map(claim => 
        claim.tokenId === claimTokenId 
          ? { ...claim, status: 'active' as const }
          : claim
      ))
      
      setRewardNFTs(prev => prev.filter(nft => nft.claimTokenId !== claimTokenId))
      
      toast.success('Claim unstaked successfully!')
    } catch (error) {
      toast.error('Failed to unstake claim')
    }
  }

  const handleShareReward = async (rewardNFT: RewardNFT) => {
    try {
      // Simulate sharing (transferring) the reward NFT
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Reward NFT shared! Your claim is now paused until you reclaim it.')
    } catch (error) {
      toast.error('Failed to share reward NFT')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header isConnected={false} account={null} onCreateProject={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-300">Please connect your wallet to view your dashboard</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header isConnected={isConnected} account={account} onCreateProject={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-gray-300">Manage your film investments and rewards</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {claims.length}
            </div>
            <div className="text-gray-300">Total Claims</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-orange-400 mb-2">
              {claims.filter(c => c.status === 'active').length}
            </div>
            <div className="text-gray-300">Active Claims</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {claims.filter(c => c.status === 'staked').length}
            </div>
            <div className="text-gray-300">Staked Claims</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {rewardNFTs.length}
            </div>
            <div className="text-gray-300">Reward NFTs</div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-3 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Claims Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">My Claims</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {claims.map(claim => (
                  <ClaimCard
                    key={claim.tokenId}
                    claim={claim}
                    onStake={() => handleStakeClaim(claim)}
                    onUnstake={() => handleUnstakeClaim(claim.tokenId)}
                  />
                ))}
              </div>
            </div>

            {/* Reward NFTs Section */}
            {rewardNFTs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">My Reward NFTs</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {rewardNFTs.map(nft => (
                    <RewardNFTCard
                      key={nft.tokenId}
                      rewardNFT={nft}
                      onShare={() => handleShareReward(nft)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* How Rewards Work */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">How Reward Sharing Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Stake Your Claim</h3>
                  <p className="text-gray-300 text-sm">Lock your claim to mint a shareable reward NFT</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Share the NFT</h3>
                  <p className="text-gray-300 text-sm">Transfer the reward NFT to share your success with others</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Reclaim When Ready</h3>
                  <p className="text-gray-300 text-sm">Burn the NFT to unlock your claim and resume earning</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  <strong>Important:</strong> While your claim is staked (reward NFT exists), you won't receive revenue distributions. 
                  This creates a "sharing = losing yield" mechanism that encourages thoughtful sharing.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {showStakeModal && selectedClaim && (
        <StakeModal
          claim={selectedClaim}
          onClose={() => {
            setShowStakeModal(false)
            setSelectedClaim(null)
          }}
          onStaked={() => {
            setClaims(prev => prev.map(claim => 
              claim.tokenId === selectedClaim.tokenId 
                ? { ...claim, status: 'staked' as const }
                : claim
            ))
            setShowStakeModal(false)
            setSelectedClaim(null)
          }}
        />
      )}
    </div>
  )
}
