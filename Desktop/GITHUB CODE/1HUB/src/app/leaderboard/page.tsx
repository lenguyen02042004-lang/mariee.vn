'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, TrendingUp, Users, ShieldCheck, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MasterBadge } from '@/components/ui/MasterBadge'

interface LeaderboardEntry {
  id: string
  full_name: string
  avatar_url: string
  current_level: number
  reputation_score: number
  major: string
  username: string
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_level, reputation_score, major, username')
        .order('reputation_score', { ascending: false })
        .limit(20)

      if (data) setEntries(data)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-32 px-6">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Header */}
        <div className="text-center space-y-6">
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/5 border border-accent/20 rounded-full">
              <TrendingUp size={14} className="text-accent" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Merit Leaderboard</span>
           </div>
           <h1 className="editorial-title text-white italic">The Hierarchy of Excellence.</h1>
           <p className="text-xl font-serif italic text-zinc-500 max-w-2xl mx-auto leading-relaxed">
             &quot;Quyền lực trong 1Hub không được mua, mà được tích lũy qua bằng chứng tri thức.&quot;
           </p>
        </div>

        {/* Podium / Top 3 (Future enhancement) */}

        {/* List */}
        <div className="glass-card border-white/5 overflow-visible">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="px-8 py-6 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Rank</th>
                       <th className="px-8 py-6 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Specialist</th>
                       <th className="px-8 py-6 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Industry</th>
                       <th className="px-8 py-6 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Heritage Capital</th>
                       <th className="px-8 py-6"></th>
                    </tr>
                 </thead>
                 <tbody>
                    {loading ? (
                      [1,2,3,4,5].map(i => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan={5} className="px-8 py-6 h-16 bg-white/[0.01]" />
                        </tr>
                      ))
                    ) : (
                      entries.map((entry, index) => (
                        <motion.tr 
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                        >
                           <td className="px-8 py-8">
                              <span className={`text-2xl font-display italic ${index < 3 ? 'text-accent' : 'text-zinc-700'}`}>
                                 {String(index + 1).padStart(2, '0')}
                              </span>
                           </td>
                           <td className="px-8 py-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full border border-white/10 bg-zinc-900 overflow-hidden shrink-0">
                                    {entry.avatar_url ? <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-800" />}
                                 </div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                       <span className="text-lg text-white font-display group-hover:text-accent transition-colors">{entry.full_name}</span>
                                       <MasterBadge level={entry.current_level} />
                                    </div>
                                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">@{entry.username || entry.id.substring(0, 8)}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-8">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{entry.major}</span>
                           </td>
                           <td className="px-8 py-8">
                              <div className="flex items-center gap-2">
                                 <Award size={14} className={index < 3 ? 'text-accent' : 'text-zinc-800'} />
                                 <span className={`text-xl font-mono italic ${index < 3 ? 'text-white' : 'text-zinc-400'}`}>
                                    {entry.reputation_score.toFixed(1)} <span className="text-[10px] not-italic text-zinc-700 ml-1">$R</span>
                                 </span>
                              </div>
                           </td>
                           <td className="px-8 py-8 text-right">
                              <Link href={`/profile/${entry.username || entry.id}`} className="inline-flex items-center gap-2 text-zinc-800 hover:text-white transition-colors group/link">
                                 <span className="text-[9px] font-mono uppercase tracking-[0.3em]">Inspect</span>
                                 <ArrowUpRight size={12} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                              </Link>
                           </td>
                        </motion.tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col md:flex-row justify-center gap-12 text-center border-t border-white/5 pt-20">
           <div className="space-y-2">
              <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Class I</p>
              <p className="text-white font-display italic text-lg">The Masters (L1-L2)</p>
           </div>
           <div className="space-y-2">
              <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Class II</p>
              <p className="text-zinc-400 font-display italic text-lg">The Experts (L3-L4)</p>
           </div>
           <div className="space-y-2">
              <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Class III</p>
              <p className="text-zinc-600 font-display italic text-lg">The Creators (L5-L7)</p>
           </div>
        </div>
      </div>
    </div>
  )
}
