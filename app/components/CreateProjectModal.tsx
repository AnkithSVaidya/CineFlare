'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Project } from '../types'
import toast from 'react-hot-toast'

interface CreateProjectModalProps {
  onClose: () => void
  onProjectCreated: (project: Project) => void
  isConnected: boolean
}

export function CreateProjectModal({ onClose, onProjectCreated, isConnected }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalFunding: '',
  })
  const [milestones, setMilestones] = useState([
    { name: 'Script', description: 'Complete screenplay', unlockAmount: '20000' },
    { name: 'Casting', description: 'Cast main actors', unlockAmount: '30000' },
    { name: 'Production', description: 'Film principal photography', unlockAmount: '40000' },
    { name: 'Post-Production', description: 'Edit and finalize film', unlockAmount: '50000' },
    { name: 'Release', description: 'Distribute and release', unlockAmount: '60000' }
  ])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    
    try {
      // Simulate project creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newProject: Project = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        creator: '0x1234...5678', // In real app, get from connected wallet
        totalFunding: parseInt(formData.totalFunding),
        totalRaised: 0,
        milestones: milestones.map(m => ({
          name: m.name,
          description: m.description,
          status: 'pending' as const,
          unlockAmount: parseInt(m.unlockAmount)
        })),
        isActive: true,
        createdAt: Date.now()
      }
      
      onProjectCreated(newProject)
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error('Failed to create project')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const addMilestone = () => {
    setMilestones([...milestones, { name: '', description: '', unlockAmount: '0' }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your film project title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Describe your film project, genre, story, and vision..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Funding Goal (USD)
              </label>
              <input
                type="number"
                required
                min="1000"
                value={formData.totalFunding}
                onChange={(e) => setFormData({ ...formData, totalFunding: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="100000"
              />
            </div>
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Project Milestones
              </label>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">
                      Milestone {index + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        required
                        value={milestone.name}
                        onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                        placeholder="Milestone name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                        placeholder="Description"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        required
                        min="0"
                        value={milestone.unlockAmount}
                        onChange={(e) => updateMilestone(index, 'unlockAmount', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                        placeholder="Unlock amount"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
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
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
