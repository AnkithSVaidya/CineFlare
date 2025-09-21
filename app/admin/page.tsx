'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Header } from '../components/Header'
import { RevenueDistributionModal } from '../components/RevenueDistributionModal'
import { MilestoneManagementModal } from '../components/MilestoneManagementModal'
import { Project } from '../types'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { account, provider, isConnected } = useWeb3()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showRevenueModal, setShowRevenueModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    if (isConnected && account) {
      loadProjects()
    }
  }, [isConnected, account])

  const loadProjects = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockProjects: Project[] = [
        {
          id: 1,
          title: "The Last Blockchain",
          description: "A sci-fi thriller about a world where blockchain technology has become sentient.",
          creator: account || "0x1234...5678",
          totalFunding: 100000,
          totalRaised: 45000,
          milestones: [
            { name: "Script", status: "completed" },
            { name: "Casting", status: "in_progress" },
            { name: "Production", status: "pending" },
            { name: "Post-Production", status: "pending" },
            { name: "Release", status: "pending" }
          ],
          isActive: true
        },
        {
          id: 2,
          title: "Crypto Dreams",
          description: "A documentary exploring the human stories behind cryptocurrency adoption.",
          creator: account || "0x8765...4321",
          totalFunding: 75000,
          totalRaised: 75000,
          milestones: [
            { name: "Research", status: "completed" },
            { name: "Filming", status: "completed" },
            { name: "Editing", status: "in_progress" },
            { name: "Distribution", status: "pending" }
          ],
          isActive: true
        }
      ]
      setProjects(mockProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleRevenueDistribution = (project: Project) => {
    setSelectedProject(project)
    setShowRevenueModal(true)
  }

  const handleMilestoneManagement = (project: Project) => {
    setSelectedProject(project)
    setShowMilestoneModal(true)
  }

  const isCreator = (project: Project) => {
    return project.creator.toLowerCase() === account?.toLowerCase()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header isConnected={false} account={null} onCreateProject={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-300">Please connect your wallet to access admin features</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header isConnected={isConnected} account={account} onCreateProject={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Project Management</h1>
          <p className="text-gray-300">Manage your film projects, milestones, and revenue distribution</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {projects.filter(p => isCreator(p)).length}
            </div>
            <div className="text-gray-300">My Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400 mb-2">
              ${projects.filter(p => isCreator(p)).reduce((sum, p) => sum + p.totalRaised, 0).toLocaleString()}
            </div>
            <div className="text-gray-300">Total Raised</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {projects.filter(p => isCreator(p)).reduce((sum, p) => sum + p.milestones.filter(m => m.status === 'completed').length, 0)}
            </div>
            <div className="text-gray-300">Completed Milestones</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {projects.filter(p => isCreator(p) && p.totalRaised >= p.totalFunding).length}
            </div>
            <div className="text-gray-300">Fully Funded</div>
          </div>
        </div>

        {/* Projects List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Projects</h2>
          
          {loading ? (
            <div className="space-y-4">
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
            <div className="space-y-6">
              {projects.filter(p => isCreator(p)).map(project => (
                <div key={project.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>Funding Progress</span>
                          <span>{((project.totalRaised / project.totalFunding) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((project.totalRaised / project.totalFunding) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Milestones</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.milestones.map((milestone, index) => (
                            <div
                              key={index}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                milestone.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                milestone.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {milestone.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleMilestoneManagement(project)}
                      className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Manage Milestones
                    </button>
                    <button
                      onClick={() => handleRevenueDistribution(project)}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Distribute Revenue
                    </button>
                  </div>
                </div>
              ))}

              {projects.filter(p => isCreator(p)).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No projects found</div>
                  <p className="text-gray-500">Create your first film project to get started</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Features Info */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Milestone Management</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Unlock milestones with attestations</li>
                <li>• Track project progress</li>
                <li>• Release funds to creators</li>
                <li>• Verify completion with FDC/State Connector</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Revenue Distribution</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Add revenue from various sources</li>
                <li>• Distribute to active claim holders</li>
                <li>• Exclude staked claims from distribution</li>
                <li>• Track distribution history</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {showRevenueModal && selectedProject && (
        <RevenueDistributionModal
          project={selectedProject}
          onClose={() => {
            setShowRevenueModal(false)
            setSelectedProject(null)
          }}
        />
      )}

      {showMilestoneModal && selectedProject && (
        <MilestoneManagementModal
          project={selectedProject}
          onClose={() => {
            setShowMilestoneModal(false)
            setSelectedProject(null)
          }}
        />
      )}
    </div>
  )
}
