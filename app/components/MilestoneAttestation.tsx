'use client'

import { useState } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { getOracleService } from '../../lib/oracle'

interface MilestoneAttestationProps {
  projectId: number
  milestoneIndex: number
  milestoneName: string
  description: string
  onAttestationCreated?: (attestationHash: string) => void
}

export default function MilestoneAttestation({
  projectId,
  milestoneIndex,
  milestoneName,
  description,
  onAttestationCreated
}: MilestoneAttestationProps) {
  const { provider, signer } = useWeb3()
  const [proofHash, setProofHash] = useState('')
  const [verifierKey, setVerifierKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateAttestation = async () => {
    if (!provider || !signer) {
      setError('Please connect your wallet')
      return
    }

    if (!proofHash.trim()) {
      setError('Please provide a proof hash (IPFS, Git tag, etc.)')
      return
    }

    if (!verifierKey.trim()) {
      setError('Please provide verifier private key')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const oracleService = getOracleService(provider, signer)
      const attestationHash = await oracleService.createMilestoneAttestation(
        projectId,
        milestoneIndex,
        milestoneName,
        description,
        proofHash,
        verifierKey
      )

      setSuccess(`Attestation created: ${attestationHash}`)
      onAttestationCreated?.(attestationHash)
    } catch (err) {
      console.error('Error creating attestation:', err)
      setError('Failed to create attestation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create Milestone Attestation
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proof Hash (IPFS, Git tag, etc.)
          </label>
          <input
            type="text"
            value={proofHash}
            onChange={(e) => setProofHash(e.target.value)}
            placeholder="QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verifier Private Key
          </label>
          <input
            type="password"
            value={verifierKey}
            onChange={(e) => setVerifierKey(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <button
          onClick={handleCreateAttestation}
          disabled={loading || !proofHash.trim() || !verifierKey.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Attestation...' : 'Create Attestation'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Verifier key signs the milestone data for authenticity</p>
          <p>• Proof hash links to external evidence (Git tag, IPFS, etc.)</p>
          <p>• Attestation is verified on-chain before milestone unlock</p>
        </div>
      </div>
    </div>
  )
}
