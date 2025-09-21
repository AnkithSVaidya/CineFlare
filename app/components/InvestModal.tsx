'use client'

import { useState } from 'react'
import { X, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { Project } from '../types'
import toast from 'react-hot-toast'

interface InvestModalProps {
  project: Project
  onClose: () => void
}

export function InvestModal({ project, onClose }: InvestModalProps) {
  const [amount, setAmount] = useState('')
  const [flareAddress, setFlareAddress] = useState('')
  const [step, setStep] = useState(1) // 1: Enter details, 2: Payment instructions, 3: Confirmation
  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)

  const xrpPrice = 0.62 // Mock XRP price in USD
  const xrpAmount = amount ? (parseFloat(amount) / xrpPrice).toFixed(2) : '0'
  const sharePercentage = amount ? ((parseFloat(amount) / project.totalFunding) * 100).toFixed(2) : '0'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !flareAddress) {
      toast.error('Please fill in all fields')
      return
    }

    if (parseFloat(amount) < 10) {
      toast.error('Minimum investment is $10')
      return
    }

    setStep(2)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const simulatePayment = async () => {
    setLoading(true)
    
    try {
      // Simulate XRPL payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setTxHash(mockTxHash)
      setStep(3)
      
      toast.success('Payment processed successfully!')
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Investment Amount (USD)
        </label>
        <input
          type="number"
          required
          min="10"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="100"
        />
        <p className="text-xs text-gray-400 mt-1">Minimum: $10</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your Flare Address
        </label>
        <input
          type="text"
          required
          value={flareAddress}
          onChange={(e) => setFlareAddress(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="0x..."
        />
        <p className="text-xs text-gray-400 mt-1">This is where your claim tokens will be minted</p>
      </div>

      {/* Investment Summary */}
      {amount && (
        <div className="bg-white/5 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-white">Investment Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">USD Amount:</span>
              <span className="text-white ml-2">${amount}</span>
            </div>
            <div>
              <span className="text-gray-400">XRP Amount:</span>
              <span className="text-yellow-400 ml-2">{xrpAmount} XRP</span>
            </div>
            <div>
              <span className="text-gray-400">Share:</span>
              <span className="text-white ml-2">{sharePercentage}%</span>
            </div>
            <div>
              <span className="text-gray-400">Project:</span>
              <span className="text-white ml-2">{project.title}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold rounded-lg transition-all duration-200"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Send XRP Payment</h3>
        <p className="text-gray-300">Send the exact amount to the project's XRPL address</p>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            XRPL Address
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard("rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH")}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount to Send
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={`${xrpAmount} XRP`}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-yellow-400 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(xrpAmount)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Destination Tag
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value="123456789"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard("123456789")}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">Important Instructions:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Send exactly {xrpAmount} XRP to the address above</li>
          <li>• Include the destination tag: 123456789</li>
          <li>• Keep your transaction hash for verification</li>
          <li>• Your claim tokens will be minted on Flare after confirmation</li>
        </ul>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={simulatePayment}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'I\'ve Sent the Payment'}
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Confirmed!</h3>
        <p className="text-gray-300">Your investment has been processed successfully</p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Transaction Hash:</span>
          <span className="text-white font-mono">{txHash.slice(0, 10)}...</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Amount:</span>
          <span className="text-yellow-400">{xrpAmount} XRP</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Share:</span>
          <span className="text-white">{sharePercentage}%</span>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <p className="text-sm text-green-400">
          Your claim tokens will be minted on Flare within the next few minutes. 
          You can view them in your wallet or on the Flare explorer.
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200"
      >
        Done
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Invest in {project.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  )
}
