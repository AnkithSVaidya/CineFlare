'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { getOracleService } from '../../lib/oracle'

interface OracleInfoProps {
  showDetails?: boolean
}

export default function OracleInfo({ showDetails = false }: OracleInfoProps) {
  const { provider, signer } = useWeb3()
  const [xrpPrice, setXrpPrice] = useState<{ price: number; timestamp: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (provider) {
      fetchXRPPrice()
      // Update price every 30 seconds
      const interval = setInterval(fetchXRPPrice, 30000)
      return () => clearInterval(interval)
    }
  }, [provider])

  const fetchXRPPrice = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const oracleService = getOracleService(provider, signer)
      const priceData = await oracleService.getCurrentXRPPrice()
      setXrpPrice(priceData)
    } catch (err) {
      console.error('Error fetching XRP price:', err)
      setError('Failed to fetch XRP price')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  if (!provider) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              Connect wallet to view live XRP price from FTSO
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">FTSO Price Feed</h3>
        <button
          onClick={fetchXRPPrice}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      ) : xrpPrice ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">XRP/USD</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(xrpPrice.price)}
            </span>
          </div>
          
          {showDetails && (
            <div className="border-t border-gray-200 pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <p className="font-medium text-gray-900">
                    {formatTimestamp(xrpPrice.timestamp)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Source:</span>
                  <p className="font-medium text-gray-900">FTSO Oracle</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading price data...</span>
        </div>
      )}

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Prices are sourced from Flare's FTSO (Flare Time Series Oracle)</p>
            <p>• Updates every 30 seconds automatically</p>
            <p>• Used for transparent XRP/USD conversion at contribution time</p>
          </div>
        </div>
      )}
    </div>
  )
}
