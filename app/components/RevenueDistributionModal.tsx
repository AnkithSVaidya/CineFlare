'use client'

import { useState } from 'react'
import { X, DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react'
import { Project } from '../types'
import toast from 'react-hot-toast'

interface RevenueDistributionModalProps {
  project: Project
  onClose: () => void
}

export function RevenueDistributionModal({ project, onClose }: RevenueDistributionModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Add Revenue, 2: Distribute, 3: Success

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.source) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      // Simulate adding revenue
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep(2)
      toast.success('Revenue added successfully!')
    } catch (error) {
      toast.error('Failed to add revenue')
    } finally {
      setLoading(false)
    }
  }

  const handleDistribute = async () => {
    setLoading(true)
    
    try {
      // Simulate distribution
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setStep(3)
      toast.success('Revenue distributed successfully!')
    } catch (error) {
      toast.error('Failed to distribute revenue')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <form onSubmit={handleAddRevenue} className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Add Revenue</h3>
        <p className="text-gray-300">Record revenue from your film project</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Revenue Amount (USD)
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="10000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Revenue Source
        </label>
        <select
          required
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select source</option>
          <option value="box_office">Box Office</option>
          <option value="streaming">Streaming Revenue</option>
          <option value="merchandise">Merchandise</option>
          <option value="licensing">Licensing</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="Additional details about this revenue..."
        />
      </div>

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
          disabled={loading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Revenue'}
        </button>
      </div>
    </form>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Distribute Revenue</h3>
        <p className="text-gray-300">Distribute revenue to active claim holders</p>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white/5 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-white">Revenue to Distribute</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Amount:</span>
            <span className="text-green-400 ml-2">${parseFloat(formData.amount).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Source:</span>
            <span className="text-white ml-2 capitalize">{formData.source.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Distribution Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-3">Distribution Details</h4>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Revenue will be distributed proportionally to active claim holders</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Staked claims are excluded from distribution</span>
          </li>
          <li className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span>Distribution happens on Flare network</span>
          </li>
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
          onClick={handleDistribute}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Distributing...' : 'Distribute Revenue'}
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
        <h3 className="text-xl font-bold text-white mb-2">Revenue Distributed!</h3>
        <p className="text-gray-300">Revenue has been successfully distributed to claim holders</p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Amount Distributed:</span>
          <span className="text-green-400">${parseFloat(formData.amount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Source:</span>
          <span className="text-white capitalize">{formData.source.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Project:</span>
          <span className="text-white">{project.title}</span>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <p className="text-sm text-green-400">
          Revenue has been distributed proportionally to all active claim holders. 
          Staked claims were excluded from this distribution.
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
          <h2 className="text-xl font-bold text-white">Revenue Distribution</h2>
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
