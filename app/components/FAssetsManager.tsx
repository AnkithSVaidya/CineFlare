'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { getFAssetsService } from '../../lib/fassets'

export default function FAssetsManager() {
  const { provider, signer, address } = useWeb3()
  const [xrplAddress, setXrplAddress] = useState('')
  const [fxrpBalance, setFxrpBalance] = useState(0)
  const [bridgeStatus, setBridgeStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (provider && address) {
      fetchBridgeStatus()
    }
  }, [provider, address])

  const fetchBridgeStatus = async () => {
    if (!provider || !address) return

    try {
      const fassetsService = getFAssetsService(provider, signer)
      const status = await fassetsService.getBridgeStatus(address)
      setBridgeStatus(status)
      setFxrpBalance(status.fxrpBalance)
    } catch (err) {
      console.error('Error fetching bridge status:', err)
    }
  }

  const handleRegisterXRPLAddress = async () => {
    if (!provider || !signer) {
      setError('Please connect your wallet')
      return
    }

    if (!xrplAddress.trim()) {
      setError('Please enter your XRPL address')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const fassetsService = getFAssetsService(provider, signer)
      const success = await fassetsService.registerXRPLAddress(xrplAddress)

      if (success) {
        setSuccess('XRPL address registered successfully!')
        await fetchBridgeStatus()
      } else {
        setError('Failed to register XRPL address')
      }
    } catch (err) {
      console.error('Error registering XRPL address:', err)
      setError('Failed to register XRPL address')
    } finally {
      setLoading(false)
    }
  }

  const handleBurnFXRP = async () => {
    if (!provider || !signer) {
      setError('Please connect your wallet')
      return
    }

    if (fxrpBalance <= 0) {
      setError('No FXRP to burn')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const fassetsService = getFAssetsService(provider, signer)
      const success = await fassetsService.burnFXRP(fxrpBalance, xrplAddress)

      if (success) {
        setSuccess('FXRP burned successfully! Withdrawal initiated to XRPL.')
        await fetchBridgeStatus()
      } else {
        setError('Failed to burn FXRP')
      }
    } catch (err) {
      console.error('Error burning FXRP:', err)
      setError('Failed to burn FXRP')
    } finally {
      setLoading(false)
    }
  }

  if (!provider) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Connect wallet to manage FAssets
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        FAssets (FXRP) Manager
      </h3>

      <div className="space-y-4">
        {/* Bridge Status */}
        {bridgeStatus && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Bridge Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">FXRP Balance:</span>
                <p className="font-medium text-gray-900">{fxrpBalance.toFixed(4)} FXRP</p>
              </div>
              <div>
                <span className="text-gray-600">XRPL Registered:</span>
                <p className="font-medium text-gray-900">
                  {bridgeStatus.hasRegisteredXRPL ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Register XRPL Address */}
        {!bridgeStatus?.hasRegisteredXRPL && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Register XRPL Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={xrplAddress}
                onChange={(e) => setXrplAddress(e.target.value)}
                placeholder="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleRegisterXRPLAddress}
                disabled={loading || !xrplAddress.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        )}

        {/* Burn FXRP */}
        {bridgeStatus?.hasRegisteredXRPL && fxrpBalance > 0 && (
          <div>
            <button
              onClick={handleBurnFXRP}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Burning...' : `Burn ${fxrpBalance.toFixed(4)} FXRP`}
            </button>
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
          <p>• FAssets enable seamless XRPL-Flare bridge</p>
          <p>• Register XRPL address to enable cross-chain operations</p>
          <p>• Burn FXRP to withdraw XRP back to XRPL</p>
        </div>
      </div>
    </div>
  )
}
