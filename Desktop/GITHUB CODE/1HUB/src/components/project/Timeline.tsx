'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Shield, Zap, Sparkles } from 'lucide-react'

interface MemberContribution {
  id: string
  name: string
  role: 'founder' | 'core' | 'rescuer' | 'contributor'
  level: number
  impactScore: number
  startMonth: number // 0 to 11 (relative to project start)
  endMonth: number
  industry?: 'Architecture' | 'Art' | 'Tech' | 'Legal'
}

interface TimelineProps {
  members: MemberContribution[]
  durationMonths: number
  industry?: 'Architecture' | 'Art' | 'Tech' | 'Legal' | string
  currentUserId?: string
  currentRole?: 'owner' | 'leader' | 'contributor' | 'guest'
}

export const ContributionTimeline: React.FC<TimelineProps> = ({ 
  members, 
  durationMonths, 
  industry = 'Tech',
  currentUserId = '1', // Default to first member for demo
  currentRole = 'contributor'
}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const getIndustryPhases = (ind: string) => {
    const i = ind.toLowerCase()
    if (i.includes('architecture')) return ['Concept', 'Schematics', 'Design Dev', 'Construction', 'Finish']
    if (i.includes('art')) return ['Inspiration', 'Sketch', 'Execution', 'Refinement', 'Exhibition']
    if (i.includes('finance')) return ['Research', 'Strategy', 'Modeling', 'Execution', 'Audit']
    if (i.includes('science') || i.includes('biotech')) return ['Hypothesis', 'Lab Test', 'Peer Review', 'Validation', 'Publication']
    if (i.includes('law') || i.includes('legal')) return ['Research', 'Discovery', 'Drafting', 'Filing', 'Resolution']
    if (i.includes('fashion')) return ['Inspiration', 'Sketching', 'Pattern', 'Sample', 'Show']
    return ['Ideation', 'MVP', 'Beta', 'Scaling', 'Launch']
  }

  const phases = getIndustryPhases(industry)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'founder': return 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
      case 'rescuer': return 'bg-accent shadow-[0_0_15px_rgba(212,175,55,0.4)]'
      case 'core': return 'bg-slate-400'
      default: return 'bg-zinc-600'
    }
  }

  const getRoleLabelColor = (role: string) => {
    switch (role) {
      case 'founder': return 'text-white'
      case 'rescuer': return 'text-accent'
      case 'core': return 'text-slate-400'
      default: return 'text-zinc-500'
    }
  }

  return (
    <div className="w-full space-y-12 py-12">
      {/* Industry Phases Header */}
      <div className="flex justify-between items-center px-4 md:px-12">
        <div className="space-y-1">
          <h4 className="font-display text-xl text-white tracking-widest uppercase">The Heritage Pulse</h4>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">{industry} Execution Stream</p>
        </div>
        <div className="flex gap-4">
          <Shield size={16} className="text-zinc-800" />
          <Zap size={16} className="text-zinc-800" />
        </div>
      </div>

      {/* Timeline Visualizer */}
      <div className="relative space-y-8">
        {/* Phase Markers */}
        <div className="flex justify-between px-[180px] text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em] border-b border-white/5 pb-4">
          {phases.map((phase, i) => (
            <span key={i}>{phase}</span>
          ))}
        </div>

        {/* Member Tracks */}
        <div className="space-y-6 relative px-4 md:px-0">
          {members.map((member) => (
            <motion.div 
              key={member.id}
              onHoverStart={() => setFocusedId(member.id)}
              onHoverEnd={() => setFocusedId(null)}
              animate={{ 
                opacity: focusedId && focusedId !== member.id ? 0.3 : 1,
                scale: focusedId === member.id ? 1.01 : 1
              }}
              className="group grid grid-cols-[160px_1fr] items-center gap-8 relative transition-all duration-500"
            >
              {/* Member Profile */}
              <div className="flex items-center gap-4 pl-4 md:pl-12">
                <div className={`w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-zinc-900 transition-all duration-500 overflow-hidden ${focusedId === member.id ? 'border-accent/40 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : ''}`}>
                  {member.name ? (
                    <span className={`text-[10px] font-mono font-bold transition-colors ${focusedId === member.id ? 'text-accent' : 'text-zinc-600'}`}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  ) : (
                    <User size={16} className={focusedId === member.id ? 'text-accent' : 'text-zinc-600'} />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-xs font-bold tracking-tight transition-colors duration-300 ${focusedId === member.id ? 'text-white' : 'text-zinc-400'}`}>
                    {member.name}
                  </p>
                  <p className={`text-[8px] font-mono uppercase tracking-tighter transition-colors duration-300 ${getRoleLabelColor(member.role)}`}>
                    {member.role} {member.role === 'rescuer' && <Sparkles size={8} className="inline ml-1" />}
                  </p>
                </div>
              </div>

              {/* Progress Track */}
              <div className="h-2 relative bg-white/[0.02] rounded-full overflow-visible border border-white/5 flex items-center">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((member.endMonth - member.startMonth) / durationMonths) * 100}%`,
                    left: `${(member.startMonth / durationMonths) * 100}%`
                  }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className={`absolute h-full rounded-full ${getRoleColor(member.role)} cursor-help group-hover:h-3 transition-all duration-500`}
                />
                
                {/* Dispute Trigger (Contributor Right) */}
                {currentRole === 'contributor' && member.id === currentUserId && (
                  <motion.button 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1, scale: 1.1 }}
                    animate={{ opacity: focusedId === member.id ? 0.6 : 0 }}
                    className="absolute -right-12 text-[8px] font-mono text-red-500 uppercase tracking-widest border border-red-500/20 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-all z-10"
                  >
                    Dispute Record
                  </motion.button>
                )}
              </div>

              {/* Enhanced Tooltip */}
              <AnimatePresence>
                {focusedId === member.id && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute left-[85%] top-0 z-50 p-6 min-w-[260px] glass-3d border-accent/20 rounded-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Merit Impact</span>
                        <span className="text-sm font-display text-accent">{member.impactScore}%</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] text-zinc-200 font-medium">Strategic Contribution</p>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-serif italic">
                          {member.role === 'rescuer' 
                            ? "Essential intervention during high-risk phase, preventing systemic failure."
                            : "Architected core framework and established foundational cross-industry synergy."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-8 pt-8 border-t border-white/5 px-12">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Heritage Founder</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Strategic Rescuer</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Core Execution</span>
        </div>
      </div>
    </div>
  )
}
