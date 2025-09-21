'use client'

import { useState } from 'react'
import { X, Target, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Project } from '../types'
import toast from 'react-hot-toast'

interface MilestoneManagementModalProps {
  project: Project
  onClose: () => void
}

export function MilestoneManagementModal({ project, onClose }: MilestoneManagementModalProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null)
  const [attestationHash, setAttestationHash] = useState('')
  const [loading, setLoading] = useState(false)

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <Target className="w-5 h-5 text-gray-400" />
    }
  }

  const handleUnlockMilestone = async () => {
    if (!selectedMilestone || !attestationHash) {
      toast.error('Please select a milestone and provide attestation hash')
      return
    }

    setLoading(true)
    
    try {
      // Simulate milestone unlock
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Milestone unlocked successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to unlock milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Manage Milestones</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
            <p className="text-gray-300 text-sm">{project.description}</p>
          </div>

          {/* Milestones List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Project Milestones</h3>
            <div className="space-y-3">
              {project.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    selectedMilestone === index
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMilestoneIcon(milestone.status)}
                      <div>
                        <h4 className="font-medium text-white">{milestone.name}</h4>
                        {milestone.description && (
                          <p className="text-sm text-gray-400">{milestone.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        milestone.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {milestone.status.toUpperCase()}
                      </div>
                      
                      {milestone.status === 'pending' && (
                        <button
                          onClick={() => setSelectedMilestone(index)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attestation Input */}
          {selectedMilestone !== null && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-3">
                Unlock Milestone: {project.milestones[selectedMilestone].name}
              </h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attestation Hash (FDC/State Connector)
                </label>
                <input
                  type="text"
                  value={attestationHash}
                  onChange={(e) => setAttestationHash(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Provide the attestation hash from FDC or State Connector verification
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-yellow-400 mb-1">Important</h5>
                    <p className="text-sm text-yellow-300">
                      Unlocking a milestone will release the corresponding funds to the project creator. 
                      Make sure the milestone has been completed and verified before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedMilestone(null)
                    setAttestationHash('')
                  }}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlockMilestone}
                  disabled={loading || !attestationHash}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Unlocking...' : 'Unlock Milestone'}
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">How Milestone Unlocking Works</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Milestones are unlocked with attestations from FDC or State Connector</li>
              <li>• Each milestone has a specific unlock amount that gets released to the creator</li>
              <li>• Attestations verify that the milestone has been completed</li>
              <li>• Unlocked milestones cannot be reversed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
