export interface Project {
  id: number
  title: string
  description: string
  creator: string
  totalFunding: number
  totalRaised: number
  milestones: Milestone[]
  isActive: boolean
  createdAt?: number
}

export interface Milestone {
  name: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  unlockAmount?: number
  unlockTimestamp?: number
  attestationHash?: string
}

export interface Claim {
  tokenId: number
  projectId: number
  basisPoints: number
  status: 'active' | 'staked' | 'slashed'
  joinPrice: number
  xrplSourceTx: string
  timestamp: number
}

export interface RewardNFT {
  tokenId: number
  claimTokenId: number
  projectId: number
  basisPoints: number
  mintTimestamp: number
  isActive: boolean
}

export interface UserProfile {
  address: string
  claims: Claim[]
  rewardNFTs: RewardNFT[]
  totalInvested: number
  totalEarned: number
}

export interface XRPLPayment {
  txHash: string
  amount: number
  from: string
  to: string
  timestamp: number
}
