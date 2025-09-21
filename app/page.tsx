'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from './components/ConnectButton'
import { ProjectCard } from './components/ProjectCard'
import { CreateProjectModal } from './components/CreateProjectModal'
import { Header } from './components/Header'
import OracleInfo from './components/OracleInfo'
import FAssetsManager from './components/FAssetsManager'
import SessionKeyManager from './components/SessionKeyManager'
import { useWeb3 } from './hooks/useWeb3'
import { ProjectFactory } from './lib/contracts'
import { Project } from './types'

export default function Home() {
  const { account, provider, isConnected } = useWeb3()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (isConnected && provider) {
      loadProjects()
    }
  }, [isConnected, provider])

  const loadProjects = async () => {
    try {
      setLoading(true)
      // In a real app, you'd fetch from your backend or indexer
      // For now, we'll show some mock projects
      const mockProjects: Project[] = [
        {
          id: 1,
          title: "The Last Blockchain",
          description: "A sci-fi thriller about a world where blockchain technology has become sentient.",
          creator: "0x1234...5678",
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
          creator: "0x8765...4321",
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
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
    setShowCreateModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header 
        isConnected={isConnected} 
        account={account}
        onCreateProject={() => setShowCreateModal(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Fund Films with{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              XRP
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Decentralized film funding platform using XRPL and Flare. 
            Invest in projects, earn rewards, and share your success with others.
          </p>
          
          {!isConnected ? (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Create Project
              </button>
            </div>
          )}
        </div>

        {/* Oracle & FTSO Section */}
        {isConnected && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Oracle & Cross-Chain Tools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <OracleInfo showDetails={true} />
              <FAssetsManager />
              <SessionKeyManager />
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">$2.4M</div>
            <div className="text-gray-300">Total Funding Raised</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">47</div>
            <div className="text-gray-300">Active Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">1,234</div>
            <div className="text-gray-300">Investors</div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Featured Projects</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-white/20 rounded mb-4"></div>
                  <div className="h-3 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 bg-white/20 rounded mb-4"></div>
                  <div className="h-8 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  isConnected={isConnected}
                />
              ))}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Project</h3>
              <p className="text-gray-300">Set funding goals and milestones with Oracle attestations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fund with XRP/FXRP</h3>
              <p className="text-gray-300">Use XRPL or Flare FAssets with FTSO price feeds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Milestone Verification</h3>
              <p className="text-gray-300">Oracle verifies milestones with State Connector proofs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cross-Chain Rewards</h3>
              <p className="text-gray-300">Earn rewards with XLS-20 badges on both chains</p>
            </div>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
          isConnected={isConnected}
        />
      )}
    </div>
  )
}
