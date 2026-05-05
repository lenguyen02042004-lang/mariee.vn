'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Zap, Layers, ChevronRight, Plus, Info, Share2, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { SynergyGraph } from '@/components/ui/SynergyGraph'
import { SEED_PROJECTS } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch Profile
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profData) {
          setProfile(profData)
        }

        // Fetch Notifications
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (notifData) {
          setNotifications(notifData)
        }
      }
      setIsLoading(false)
    }

    fetchProfile()
  }, [])

  // Use profile data or fallback to demo data if not configured
  const userData = profile || {
    full_name: "Aris Thorne",
    current_level: 1,
    reputation_score: 12400,
    major: "Architecture & Urbanism"
  }

  // Filter recommendations based on user major
  const RECOMMENDATIONS = Object.values(SEED_PROJECTS)
    .filter(p => p.industry.includes(userData.major) || p.industry.includes('Strategy'))
    .slice(0, 3);

  const handleExport = () => {
    window.print();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-6 md:p-12 selection:bg-slate-400/30 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Main Command Area */}
        <div className="lg:col-span-8 space-y-12">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse shadow-[0_0_8px_white]" />
                Sovereign Repository Online
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight">
                Welcome, <br/> 
                {userData.current_level <= 2 ? 'Master' : 'Expert'} <span className="text-zinc-600">{(userData.full_name || userData.name || 'Professional').split(' ')[0]}.</span>
              </h1>
            </div>

            {/* ACTION HUB - NEW */}
            <div className="flex gap-4">
               <button 
                onClick={handleExport}
                className="flex items-center gap-3 px-6 py-4 border border-white/5 bg-white/[0.02] rounded-2xl text-[10px] font-mono text-zinc-400 uppercase tracking-widest hover:border-white/20 hover:text-white transition-all group"
               >
                  <Share2 size={14} className="group-hover:scale-110 transition-transform" />
                  <span>Export Heritage</span>
               </button>
               <Link 
                href="/projects/new"
                className="premium-button flex items-center gap-3 px-8 py-4"
               >
                  <Plus size={16} />
                  <span>Initiate Heritage</span>
               </Link>
            </div>
          </header>

          {/* 3D Glassmorphism Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Heritage Level Badge */}
            <div className="glass-card p-8 flex flex-col justify-between h-48 relative overflow-hidden group border-white/10 bg-white/[0.01]">
               <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12">
                  <Award size={160} />
               </div>
               <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Honorary Rank</span>
                    <div className="group/tooltip relative">
                       <Info size={10} className="text-zinc-700 cursor-help" />
                       <div className="absolute bottom-full left-0 mb-3 w-56 p-3 bg-zinc-900 border border-white/10 rounded-xl text-[9px] text-zinc-400 leading-relaxed opacity-0 group-hover/tooltip:opacity-100 transition-all transform translate-y-2 group-hover/tooltip:translate-y-0 pointer-events-none shadow-2xl backdrop-blur-xl z-50">
                         Accumulate **Impact Points** to ascend. Level 1 Masters hold ultimate governance weight.
                       </div>
                    </div>
                  </div>
                  <div className="relative inline-block">
                    <p className="text-5xl font-display font-bold text-white relative z-10">L{userData.current_level}</p>
                    {userData.current_level <= 2 && (
                      <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-50 animate-pulse" />
                    )}
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    <span>Progression</span>
                    <span>{userData.current_level === 1 ? '98%' : 'Active'}</span>
                  </div>
                  <div className="w-full h-[2px] bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: userData.current_level === 1 ? '98%' : '45%' }}
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
                  <p className="text-5xl font-display font-bold text-white">{(userData.reputation_score || 0).toLocaleString()}</p>
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

          {/* Synergy Recommendations */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Recommended Synergy Opportunities</h3>
              <Link href="/projects" className="text-[9px] font-mono text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">Explore All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RECOMMENDATIONS.map(project => (
                <Link 
                  href={`/projects/${project.id}`}
                  key={project.id} 
                  className="p-6 border border-white/5 bg-zinc-900/20 rounded-2xl hover:border-white/10 transition-all group cursor-pointer block"
                >
                  <p className="text-[9px] font-mono text-accent uppercase tracking-widest mb-2">{project.industry}</p>
                  <p className="text-sm font-medium text-white mb-4 line-clamp-2">{project.title}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase">Impact: {project.impactPoints}</span>
                    <ChevronRight size={12} className="text-zinc-800 group-hover:text-accent transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Action Call for Case Studies - NEW */}
          <div className="p-12 rounded-3xl border border-white/5 bg-gradient-to-r from-accent/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-2">
                <h4 className="text-2xl font-display text-white italic">Document your Logic.</h4>
                <p className="text-sm text-zinc-500 max-w-sm">Every masterpiece requires a rationale. Start your first Case Study to lock in your legacy points.</p>
             </div>
             <Link href="/case-studies/new" className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-mono uppercase tracking-[0.3em] font-bold hover:bg-zinc-200 transition-colors">
                <FileText size={16} />
                <span>Write Case Study</span>
             </Link>
          </div>
        </div>

        {/* Global Activity Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="glass-card p-8 border-white/10 space-y-8 min-h-[600px] flex flex-col">
              <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">
                Incoming Synergies
              </h3>
              
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest text-center py-8">No pending handshakes</p>
                ) : (
                  notifications.map((n: any) => (
                    <div key={n.id} className="p-4 bg-accent/[0.03] border border-accent/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                       <div className="flex justify-between items-start">
                          <p className="text-[10px] font-mono text-accent uppercase tracking-widest">{n.title}</p>
                          <span className="text-[8px] font-mono text-zinc-600 uppercase">New</span>
                       </div>
                       <p className="text-xs text-zinc-400 font-serif leading-relaxed line-clamp-2 italic">"{n.message}"</p>
                       <div className="flex gap-3">
                          <Link href={n.link || '#'} className="flex-1 py-2 bg-accent/10 border border-accent/20 rounded-lg text-[9px] font-mono text-accent uppercase tracking-widest text-center hover:bg-accent/20 transition-all">
                             Review Heritage
                          </Link>
                          <button className="px-3 py-2 border border-white/5 rounded-lg text-[9px] font-mono text-zinc-600 uppercase hover:text-white transition-colors">
                             Discard
                          </button>
                       </div>
                    </div>
                  ))
                )}
              </div>

              <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4 pt-8">
                Global Pulse
              </h3>
              
              <div className="flex-1 space-y-8 relative overflow-hidden">
                {[
                  { user: "Master Thorne", action: "verified", target: "Nexus Protocol", targetId: "nexus-protocol", time: "2m" },
                  { user: "Expert Kenji", action: "published", target: "ZK-Docs", targetId: "zk-docs", time: "14m" },
                  { user: "Master Elena", action: "endorsed", target: "Sarah Miller", targetId: "sarah-miller", time: "1h" },
                  { user: "System", action: "minted", target: "Heritage Block #4202", targetId: "block-4202", time: "3h" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 relative animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-px h-full bg-zinc-900 absolute left-2.5 top-6" />
                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] leading-relaxed text-zinc-400">
                        <span className="text-white font-medium">{item.user}</span> {item.action}{' '}
                        <Link href={`/projects/${item.targetId}`} className="text-zinc-200 underline underline-offset-4 decoration-white/10 hover:text-white transition-colors">{item.target}</Link>
                      </p>
                      <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">{item.time} ago</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5">
                <Link href="/knowledge" className="w-full py-3 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 group">
                  <ExternalLink size={12} className="group-hover:text-white transition-colors" />
                  <span>Join Expert Insights</span>
                </Link>
              </div>
           </div>
        </aside>
      </div>
    </div>
  )
}

