'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowUpRight, 
  Users, 
  Award, 
  Target,
  ChevronRight,
  ShieldCheck,
  Send,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string
  avatar_url: string
  current_level: number
  reputation_score: number
  major: string
  bio: string
  compatibility?: number
}

export default function SynergyPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('All')
  const [proposingTo, setProposingTo] = useState<Profile | null>(null)
  const [proposalMessage, setProposalMessage] = useState('')
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  
  // Advanced Filter states
  const [minLevel, setMinLevel] = useState(1)
  const [maxLevel, setMaxLevel] = useState(7)
  const [minReputation, setMinReputation] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      let query = supabase
        .from('profiles')
        .select('*')
        .order('reputation_score', { ascending: false })

      if (user) {
        query = query.neq('id', user.id)
      }

      const { data } = await query

      if (data) {
        // Calculate mock compatibility for demo
        const processed = data.map(p => ({
          ...p,
          compatibility: Math.floor(Math.random() * (98 - 75 + 1) + 75) // Mock logic
        }))
        setProfiles(processed)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.major?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMajor = selectedMajor === 'All' || p.major === selectedMajor
    const matchesLevel = p.current_level >= Math.min(minLevel, maxLevel) && p.current_level <= Math.max(minLevel, maxLevel)
    const matchesReputation = p.reputation_score >= minReputation
    
    return matchesSearch && matchesMajor && matchesLevel && matchesReputation
  })

  async function handleProposeSynergy() {
    if (!currentUser || !proposingTo) return

    try {
      const { initiateHandshake } = await import('@/services/handshake')
      await initiateHandshake(proposingTo.id, proposalMessage)
      
      setProposingTo(null)
      setProposalMessage('')
      alert('Handshake sent to the Global Pulse.')
    } catch (err) {
      console.error(err)
      alert('Failed to initiate handshake.')
    }
  }

  const majors = ['All', ...new Set(profiles.map(p => p.major).filter(Boolean))]

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-accent/20">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.03)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-10 py-20 md:py-32">
        {/* Cinematic Header */}
        <header className="space-y-12 mb-24">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5">
                  <Zap className="text-accent" size={18} />
                </div>
                <h2 className="text-[10px] font-mono text-accent uppercase tracking-[0.6em]">The Synergy Engine</h2>
             </div>
             <h1 className="editorial-title text-white text-6xl md:text-8xl tracking-tighter">Matchmaking.</h1>
             <p className="text-xl font-serif italic text-zinc-500 max-w-2xl leading-relaxed">
               &quot;Lực hấp dẫn của các thiên hà chuyên gia. Kết nối dựa trên thực thi, không phải lời hứa.&quot;
             </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-6 p-4 bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-3xl">
             <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  type="text" 
                  placeholder="Search for Masters, Disciplines, or Heritage Insights..."
                  className="w-full bg-transparent border-none py-4 pl-16 pr-8 text-white outline-none placeholder:text-zinc-500 font-serif"
                />
             </div>
             <div className="flex gap-4">
                <select 
                  value={selectedMajor}
                  onChange={e => setSelectedMajor(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-mono text-zinc-400 uppercase tracking-widest outline-none appearance-none cursor-pointer"
                >
                   {majors.map(m => <option key={m} value={m} className="bg-zinc-900">{m}</option>)}
                </select>
                 <button 
                   onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                   className={`px-6 py-4 rounded-2xl flex items-center gap-3 transition-all ${
                     isAdvancedFilterOpen 
                       ? 'bg-accent text-black font-bold' 
                       : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                   }`}
                 >
                    <Filter size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Advanced Filter</span>
                 </button>
              </div>
           </div>

           {/* Advanced Filter Panel */}
           <AnimatePresence>
             {isAdvancedFilterOpen && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12 p-10 bg-zinc-950/40 border border-white/5 rounded-3xl mt-6">
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Mastery Range</p>
                          <span className="text-xl font-display text-accent italic">L{minLevel}</span>
                       </div>
                       <div className="relative h-6 flex items-center">
                          <input 
                            type="range" min="1" max="7" step="1"
                            value={minLevel} onChange={e => setMinLevel(parseInt(e.target.value))}
                            className="w-full h-px bg-zinc-800 appearance-none outline-none accent-accent cursor-pointer"
                          />
                          <div className="absolute inset-x-0 flex justify-between px-0.5 pointer-events-none">
                             {[1,2,3,4,5,6,7].map(l => (
                               <div key={l} className={`w-1 h-1 rounded-full ${minLevel >= l ? 'bg-accent' : 'bg-zinc-700'}`} />
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Target Threshold</p>
                          <span className="text-xl font-display text-accent italic">L{maxLevel}</span>
                       </div>
                       <div className="relative h-6 flex items-center">
                          <input 
                            type="range" min="1" max="7" step="1"
                            value={maxLevel} onChange={e => setMaxLevel(parseInt(e.target.value))}
                            className="w-full h-px bg-zinc-800 appearance-none outline-none accent-accent cursor-pointer"
                          />
                          <div className="absolute inset-x-0 flex justify-between px-0.5 pointer-events-none">
                             {[1,2,3,4,5,6,7].map(l => (
                               <div key={l} className={`w-1 h-1 rounded-full ${maxLevel >= l ? 'bg-accent' : 'bg-zinc-700'}`} />
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Merit Threshold ($R)</p>
                          <span className="text-xl font-display text-white italic">{minReputation} <span className="text-accent text-sm">ℛ</span></span>
                       </div>
                       <div className="relative h-6 flex items-center">
                          <input 
                            type="range" min="0" max="5000" step="100"
                            value={minReputation} onChange={e => setMinReputation(parseInt(e.target.value))}
                            className="w-full h-px bg-zinc-800 appearance-none outline-none accent-accent cursor-pointer"
                          />
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </header>

        {/* Editorial Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[500px] bg-zinc-900/20 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredProfiles.map((p, index) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card group hover:border-accent/50 hover:-translate-y-2 transition-all duration-700 overflow-hidden relative flex flex-col h-[580px] ${
                    (p.compatibility ?? 0) > 90 ? 'shadow-[0_0_50px_rgba(212,175,55,0.05)] border-accent/20' : ''
                  }`}
                >
                   {/* Card Background Polish */}
                   <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   
                   <div className="p-10 flex-1 flex flex-col justify-between relative z-10">
                      <div className="space-y-8">
                        {/* Level & Badge */}
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <p className="text-[9px] font-mono text-accent uppercase tracking-widest">Mastery Level</p>
                              <div className="flex items-center gap-2">
                                 <Award className="text-accent" size={14} />
                                 <span className="text-xl font-display text-white">L{p.current_level} <span className="text-xs text-zinc-500 font-serif italic">Specialist</span></span>
                              </div>
                           </div>
                           <div className="relative">
                              <div className="w-14 h-14 rounded-full border border-white/5 bg-zinc-900 overflow-hidden p-0.5">
                                 {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full bg-zinc-800 rounded-full" />}
                              </div>
                              {(p.compatibility ?? 0) > 90 && (
                                <div className="absolute -inset-1 rounded-full bg-accent/20 blur-md -z-10 animate-pulse" />
                              )}
                           </div>
                        </div>

                        {/* Identity */}
                        <div className="space-y-3">
                           <h3 className="text-3xl font-display text-white group-hover:text-accent transition-colors duration-500">{p.full_name}</h3>
                           <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">{p.major || 'Global Specialist'}</p>
                        </div>

                        {/* Bio / Strategic Intent */}
                        <p className="text-sm text-zinc-500 font-serif line-clamp-4 leading-relaxed italic">
                           &quot;{p.bio || 'This specialist is a sovereign architect of multidisciplinary heritage, currently maintaining a record-only status.'}&quot;
                        </p>
                      </div>

                      <div className="space-y-8">
                         {/* Stats */}
                         <div className="flex justify-between border-t border-white/5 pt-8">
                            <div className="space-y-1">
                               <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Merit Score</p>
                               <div className="flex items-center gap-2">
                                  <Crown size={12} className="text-accent" />
                                  <p className="text-lg font-mono text-white italic">{p.reputation_score.toFixed(1)} <span className="text-accent text-sm">ℛ</span></p>
                               </div>
                            </div>
                            <div className="space-y-1 text-right">
                               <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Compatibility</p>
                               <p className="text-lg font-mono text-accent">{p.compatibility}%</p>
                            </div>
                         </div>

                         {/* Action */}
                         <div className="flex gap-4">
                            <Link href={`/profile/${p.id}`} className="flex-1 py-4 bg-zinc-950/50 border border-white/10 rounded-xl flex items-center justify-center gap-3 group/link hover:bg-white/10 hover:border-accent/30 transition-all">
                               <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest group-hover/link:text-white">Inspect Heritage</span>
                               <ArrowUpRight size={14} className="text-zinc-700 group-hover/link:text-accent group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                            </Link>
                            <button 
                               onClick={() => setProposingTo(p)}
                               className="px-6 py-4 bg-accent/5 border border-accent/20 rounded-xl hover:bg-accent/10 transition-all group/btn"
                            >
                               <Send size={14} className="text-accent group-hover/btn:rotate-12 transition-transform" />
                            </button>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Propose Synergy Modal */}
        <AnimatePresence>
          {proposingTo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setProposingTo(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 max-w-xl w-full glass-card p-12 border-accent/30 bg-zinc-950"
              >
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-mono text-accent uppercase tracking-[0.5em]">Initiate Handshake</h3>
                    <h2 className="text-3xl font-display text-white italic">Propose Synergy with {proposingTo.full_name}.</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Strategic Intent (Invitation)</label>
                    <textarea 
                      value={proposalMessage}
                      onChange={e => setProposalMessage(e.target.value)}
                      placeholder="Define the project logic and why this synergy is vital..."
                      rows={6}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm text-zinc-300 outline-none focus:border-accent/30 transition-all resize-none font-serif"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setProposingTo(null)} className="flex-1 py-5 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:bg-white/5">Abort</button>
                    <button 
                      onClick={handleProposeSynergy}
                      className="premium-button flex-[2] py-5 flex items-center justify-center gap-4 group"
                    >
                      <Sparkles size={16} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Consecrate Alliance</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Pulse Tracker (Small) */}
        <div className="mt-40 space-y-16">
           <div className="border-t border-white/5 pt-20 flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex items-center gap-8">
                 <div className="flex -space-x-4">
                   {profiles.slice(0, 5).map(p => (
                     <div key={p.id} className="w-14 h-14 rounded-full border-2 border-black bg-zinc-900 overflow-hidden shadow-xl">
                       <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
                 <div className="space-y-1">
                    <p className="text-lg text-white font-display italic">{profiles.length}+ Masters active</p>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Establishing global tri-alliances</p>
                 </div>
              </div>
              <div className="flex gap-20">
                 <div className="text-center space-y-2">
                    <p className="text-4xl font-display text-white italic">1,240</p>
                    <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.2em]">Successful Synergies</p>
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-4xl font-display text-white italic">458</p>
                    <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.2em]">Heritage Records</p>
                 </div>
              </div>
           </div>

           {/* Live Activity Marquee */}
           <div className="relative h-12 overflow-hidden bg-white/5 border-y border-white/5 flex items-center">
              <div className="flex animate-marquee whitespace-nowrap gap-20 text-[9px] font-mono text-zinc-500 uppercase tracking-widest px-10">
                 <span>Master Aris Thorne just endorsed Project Synergy...</span>
                 <span className="text-accent/50">System minted Heritage Block #4202...</span>
                 <span>Sarah Miller achieved L2 Mentor status...</span>
                 <span className="text-accent/50">New Synergy handshake initiated in Singapore...</span>
                 <span>Heritage Record verified for Project Heritage Sanctuary...</span>
                 <span className="text-accent/50">Alliance consecrated between Expert Node 7 and 12...</span>
                 {/* Duplicated for seamless loop */}
                 <span>Master Aris Thorne just endorsed Project Synergy...</span>
                 <span className="text-accent/50">System minted Heritage Block #4202...</span>
                 <span>Sarah Miller achieved L2 Mentor status...</span>
                 <span className="text-accent/50">New Synergy handshake initiated in Singapore...</span>
                 <span>Heritage Record verified for Project Heritage Sanctuary...</span>
                 <span className="text-accent/50">Alliance consecrated between Expert Node 7 and 12...</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
