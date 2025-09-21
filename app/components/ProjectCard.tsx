'use client'

import { useState } from 'react'
import { Project } from '../types'
import { Play, Users, Target, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { InvestModal } from './InvestModal'

interface ProjectCardProps {
  project: Project
  isConnected: boolean
}

export function ProjectCard({ project, isConnected }: ProjectCardProps) {
  const [showInvestModal, setShowInvestModal] = useState(false)
  
  const progressPercentage = (project.totalRaised / project.totalFunding) * 100
  const isFullyFunded = project.totalRaised >= project.totalFunding
  
  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
    }
  }

  return (
    <>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 card-hover">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-gray-300 text-sm line-clamp-2">{project.description}</p>
          </div>
          <div className="ml-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isFullyFunded 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isFullyFunded ? 'Funded' : 'Funding'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Funding Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              ${project.totalRaised.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Raised</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${project.totalFunding.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Goal</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Milestones</span>
          </div>
          <div className="space-y-2">
            {project.milestones.slice(0, 3).map((milestone, index) => (
              <div key={index} className="flex items-center space-x-2">
                {getMilestoneIcon(milestone.status)}
                <span className={`text-xs ${
                  milestone.status === 'completed' ? 'text-green-400' :
                  milestone.status === 'in_progress' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {milestone.name}
                </span>
              </div>
            ))}
            {project.milestones.length > 3 && (
              <div className="text-xs text-gray-500">
                +{project.milestones.length - 3} more milestones
              </div>
            )}
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              Creator: {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowInvestModal(true)}
          disabled={!isConnected || isFullyFunded}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            !isConnected
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : isFullyFunded
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black transform hover:scale-105'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>
            {!isConnected ? 'Connect to Invest' : 
             isFullyFunded ? 'Fully Funded' : 
             'Invest with XRP'}
          </span>
        </button>
      </div>

      {showInvestModal && (
        <InvestModal
          project={project}
          onClose={() => setShowInvestModal(false)}
        />
      )}
    </>
  )
}
