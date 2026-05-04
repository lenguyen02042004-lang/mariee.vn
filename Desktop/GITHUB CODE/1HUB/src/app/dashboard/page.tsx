'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Award, Zap, Layers, ChevronRight, Plus, Info } from 'lucide-react'
import Link from 'next/link'

import { SynergyGraph } from '@/components/ui/SynergyGraph'
import { SEED_PROJECTS } from '@/lib/mock-data'

const MOCK_USER = {
  name: "Aris Thorne",
  level: 1,
  score: 12400,
  major: "Architecture & Urbanism"
}

// Filter recommendations based on user major
const RECOMMENDATIONS = Object.values(SEED_PROJECTS)
  .filter(p => p.industry.includes('Architecture') || p.industry.includes('Sustainability'))
  .slice(0, 3);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-6 md:p-12 selection:bg-slate-400/30 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Main Command Area */}
        <div className="lg:col-span-8 space-y-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse shadow-[0_0_8px_white]" />
              Sovereign Repository Online
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight">
              Welcome, <br/> Master <span className="text-zinc-600">{MOCK_USER.name.split(' ')[0]}.</span>
            </h1>
          </header>

          {/* 3D Glassmorphism Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Heritage Level Badge - Enhanced */}
            <div className="glass-card p-8 flex flex-col justify-between h-48 relative overflow-hidden group border-white/10 bg-white/[0.01]">
               <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12">
                  <Award size={160} />
               </div>
               <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Honorary Rank</span>
                    <div className="group/tooltip relative">
                       <Info size={10} className="text-zinc-700 cursor-help" />
                       <div className="absolute bottom-full left-0 mb-3 w-56 p-3 bg-zinc-900 border border-white/10 rounded-xl text-[9px] text-zinc-400 leading-relaxed opacity-0 group-hover/tooltip:opacity-100 transition-all transform translate-y-2 group-hover/tooltip:translate-y-0 pointer-events-none shadow-2xl backdrop-blur-xl">
                         Accumulate **Impact Points** to ascend. Level 1 Masters hold ultimate governance weight.
                       </div>
                    </div>
                  </div>
                  <div className="relative inline-block">
                    <p className="text-5xl font-display font-bold text-white relative z-10">L{MOCK_USER.level}</p>
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-50 animate-pulse" />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    <span>Progression</span>
                    <span>{MOCK_USER.level === 1 ? '98%' : '12%'}</span>
                  </div>
                  <div className="w-full h-[2px] bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: MOCK_USER.level === 1 ? '98%' : '12%' }}
                      transition={{ duration: 2, ease: "circOut" }}
                      className="h-full bg-white shadow-[0_0_10px_white]" 
                    />
                  </div>
               </div>
            </div>

            <div className="glass-card p-8 flex flex-col justify-between h-48 relative overflow-hidden group border-white/10 bg-white/[0.01]">
               <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                  <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-slate-400/10 to-transparent" />
               </div>
               <div className="relative z-10 space-y-2">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Verified Merit</span>
                  <p className="text-5xl font-display font-bold text-white">{MOCK_USER.score.toLocaleString()}</p>
               </div>
               <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2">
                  <Zap size={10} className="text-white" /> +12.4% legacy growth
               </div>
            </div>

            {/* Synergy Discovery */}
            <div className="glass-card p-8 flex flex-col justify-between h-48 relative overflow-hidden group border-white/10 bg-white/[0.01]">
               <div className="relative z-10 space-y-2">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Synergy Network</span>
                  <p className="text-5xl font-display font-bold text-white">1.2K</p>
               </div>
               <div className="flex -space-x-3 items-center">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-900 overflow-hidden relative grayscale hover:grayscale-0 transition-all cursor-pointer">
                      <div className="absolute inset-0 bg-slate-400/20" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[9px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer">
                    +8
                  </div>
               </div>
            </div>
          </div>

          {/* Connection Graph Visualization */}
          <section className="glass-card p-12 border-white/5 bg-white/[0.01]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold text-white tracking-tight">Synergy Pulse.</h3>
                  <p className="text-xs text-zinc-500 font-serif italic leading-relaxed">
                    Visualizing your verified professional resonance across multiple industries. Every node represents a successful collaboration within the Sovereign Repository.
                  </p>
                </div>
                <div className="space-y-4 pt-4">
                  {[
                    { label: 'Core Collaborators', val: '12 Active' },
                    { label: 'Cross-Industry Reach', val: '4 Sectors' },
                    { label: 'Network Integrity', val: '99.4%' }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-[10px] font-mono text-white tracking-tighter">{stat.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative flex justify-center">
                <SynergyGraph />
              </div>
            </div>
          </section>

          {/* Synergy Recommendations - NEW */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Recommended Synergy Opportunities</h3>
              <Link href="/projects" className="text-[9px] font-mono text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">Explore All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RECOMMENDATIONS.map(project => (
                <div key={project.id} className="p-6 border border-white/5 bg-zinc-900/20 rounded-2xl hover:border-white/10 transition-all group cursor-pointer">
                  <p className="text-[9px] font-mono text-accent uppercase tracking-widest mb-2">{project.industry}</p>
                  <p className="text-sm font-medium text-white mb-4 line-clamp-2">{project.title}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase">Impact: {project.impactPoints}</span>
                    <ChevronRight size={12} className="text-zinc-800 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Global Activity Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="glass-card p-8 border-white/10 space-y-8 min-h-[600px] flex flex-col">
              <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">
                Global Pulse
              </h3>
              
              <div className="flex-1 space-y-8 relative overflow-hidden">
                {[
                  { user: "Master Thorne", action: "verified", target: "Nexus Protocol", time: "2m" },
                  { user: "Expert Kenji", action: "published", target: "ZK-Docs", time: "14m" },
                  { user: "Master Elena", action: "endorsed", target: "Sarah Miller", time: "1h" },
                  { user: "System", action: "minted", target: "Heritage Block #4202", time: "3h" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 relative animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-px h-full bg-zinc-900 absolute left-2.5 top-6" />
                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] leading-relaxed text-zinc-400">
                        <span className="text-white font-medium">{item.user}</span> {item.action}{' '}
                        <span className="text-zinc-200 underline underline-offset-4 decoration-white/10">{item.target}</span>
                      </p>
                      <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">{item.time} ago</p>
                    </div>
                  </div>
                ))}
                
                {/* Skeleton Loader Simulation */}
                <div className="space-y-8 opacity-40">
                   {[1,2].map(i => (
                     <div key={i} className="flex gap-4">
                        <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/10 shrink-0" />
                        <div className="space-y-2 w-full pt-1">
                          <div className="h-2 w-3/4 bg-zinc-900 rounded-full animate-pulse" />
                          <div className="h-1.5 w-1/4 bg-zinc-900 rounded-full animate-pulse" />
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button className="w-full py-3 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                  Join Discussion
                </button>
              </div>
           </div>
        </aside>
      </div>
    </div>
  )
}

