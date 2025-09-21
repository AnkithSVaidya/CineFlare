'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { getSessionKeyService } from '../../lib/sessionKeys'

export default function SessionKeyManager() {
  const { provider, signer, address } = useWeb3()
  const [sessionKeys, setSessionKeys] = useState<any[]>([])
  const [sessionKeyStatus, setSessionKeyStatus] = useState<any>(null)
  const [newSessionKey, setNewSessionKey] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [maxGasPrice, setMaxGasPrice] = useState('')
  const [maxGasLimit, setMaxGasLimit] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (provider && address) {
      fetchSessionKeys()
    }
  }, [provider, address])

  const fetchSessionKeys = async () => {
    if (!provider || !address) return

    try {
      const sessionKeyService = getSessionKeyService(provider, signer)
      const [keys, status] = await Promise.all([
        sessionKeyService.getUserSessionKeys(address),
        sessionKeyService.getSessionKeyStatus(address)
      ])
      setSessionKeys(keys)
      setSessionKeyStatus(status)
    } catch (err) {
      console.error('Error fetching session keys:', err)
    }
  }

  const generateSessionKey = () => {
    const sessionKeyService = getSessionKeyService(provider, signer)
    const keyPair = sessionKeyService.generateSessionKeyPair()
    setNewSessionKey(keyPair.privateKey)
  }

  const handleCreateSessionKey = async () => {
    if (!provider || !signer) {
      setError('Please connect your wallet')
      return
    }

    if (!newSessionKey.trim()) {
      setError('Please generate a session key')
      return
    }

    if (!validUntil || !maxGasPrice || !maxGasLimit) {
      setError('Please fill all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const sessionKeyService = getSessionKeyService(provider, signer)
      const wallet = new (await import('ethers')).Wallet(newSessionKey)
      
      const success = await sessionKeyService.createSessionKey(
        wallet.address,
        Math.floor(new Date(validUntil).getTime() / 1000),
        parseFloat(maxGasPrice) * 1e9, // Convert to wei
        parseInt(maxGasLimit),
        newSessionKey
      )

      if (success) {
        setSuccess('Session key created successfully!')
        await fetchSessionKeys()
        setNewSessionKey('')
        setValidUntil('')
        setMaxGasPrice('')
        setMaxGasLimit('')
      } else {
        setError('Failed to create session key')
      }
    } catch (err) {
      console.error('Error creating session key:', err)
      setError('Failed to create session key')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSessionKey = async (sessionKeyAddress: string) => {
    if (!provider || !signer) return

    try {
      setLoading(true)
      const sessionKeyService = getSessionKeyService(provider, signer)
      const success = await sessionKeyService.revokeSessionKey(sessionKeyAddress)
      
      if (success) {
        setSuccess('Session key revoked successfully!')
        await fetchSessionKeys()
      } else {
        setError('Failed to revoke session key')
      }
    } catch (err) {
      console.error('Error revoking session key:', err)
      setError('Failed to revoke session key')
    } finally {
      setLoading(false)
    }
  }

  if (!provider) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Connect wallet to manage session keys
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Session Key Manager
      </h3>

      <div className="space-y-6">
        {/* Status */}
        {sessionKeyStatus && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Keys:</span>
                <p className="font-medium text-gray-900">{sessionKeyStatus.totalKeys}</p>
              </div>
              <div>
                <span className="text-gray-600">Active Keys:</span>
                <p className="font-medium text-gray-900">{sessionKeyStatus.activeKeys}</p>
              </div>
              <div>
                <span className="text-gray-600">Next Nonce:</span>
                <p className="font-medium text-gray-900">{sessionKeyStatus.nextNonce}</p>
              </div>
              <div>
                <span className="text-gray-600">Sponsored Gas:</span>
                <p className="font-medium text-gray-900">{sessionKeyStatus.sponsoredGasUsed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create New Session Key */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Create New Session Key</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Key Private Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={newSessionKey}
                onChange={(e) => setNewSessionKey(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={generateSessionKey}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <input
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Gas Price (Gwei)
              </label>
              <input
                type="number"
                value={maxGasPrice}
                onChange={(e) => setMaxGasPrice(e.target.value)}
                placeholder="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Gas Limit
              </label>
              <input
                type="number"
                value={maxGasLimit}
                onChange={(e) => setMaxGasLimit(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleCreateSessionKey}
            disabled={loading || !newSessionKey.trim() || !validUntil || !maxGasPrice || !maxGasLimit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Session Key'}
          </button>
        </div>

        {/* Existing Session Keys */}
        {sessionKeys.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Existing Session Keys</h4>
            <div className="space-y-2">
              {sessionKeys.map((key, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{key.sessionKey}</p>
                    <p className="text-xs text-gray-600">
                      Valid until: {new Date(key.validUntil * 1000).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeSessionKey(key.sessionKey)}
                    disabled={loading}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Session keys enable fee-sponsored transactions</p>
          <p>• Set gas limits and expiration for security</p>
          <p>• Revoke keys anytime to stop sponsored transactions</p>
        </div>
      </div>
    </div>
  )
}
