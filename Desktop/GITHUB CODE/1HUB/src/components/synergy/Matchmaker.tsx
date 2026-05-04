'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Zap, GraduationCap, ArrowRight, Target, Sparkles, ShieldCheck } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Mode = 'mentor-mentee' | 'peer-to-peer'

const MOCK_MASTERS = [
  { name: "Dr. Aris Thorne", role: "Strategic Architect", expertise: "Biophilic Urbanism", match: 98, level: 1 },
  { name: "Elena Rossi", role: "Fine Arts Curator", expertise: "Visual Heritage", match: 94, level: 2 },
  { name: "James Wilson", role: "Legacy Consultant", expertise: "Wealth Governance", match: 89, level: 1 },
  { name: "Sofia Lind", role: "Sustainability Expert", expertise: "Carbon-Negative Infrastructure", match: 87, level: 3 }
]

export const Matchmaker: React.FC = () => {
  const [mode, setMode] = useState<Mode>('peer-to-peer')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 2000)
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-24 relative py-20 px-10">
      {/* Editorial Header */}
      <header className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-zinc-900/50 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
          <Target size={12} className="text-zinc-600" />
          The Radar Discovery Protocol
        </div>
        <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-white leading-tight">
          Find Your <br />
          <span className="text-zinc-700">SYNERGY.</span>
        </h2>
        <p className="text-zinc-500 text-lg md:text-xl font-sans leading-relaxed tracking-tight italic">
          "Bypassing social circles to identify masters through verified execution history and disciplinary merit."
        </p>
      </header>

      {/* Mode & Search Area (Editorial Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-4">
           <div className="flex flex-col gap-4">
             <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] mb-4">Discovery Mode</h3>
             <button
               onClick={() => setMode('peer-to-peer')}
               className={cn(
                 "flex items-center justify-between px-8 py-6 rounded-2xl border transition-all text-xs font-mono uppercase tracking-widest",
                 mode === 'peer-to-peer' ? "bg-white text-black border-white" : "bg-transparent text-zinc-500 border-white/5 hover:border-white/10"
               )}
             >
               <div className="flex items-center gap-4">
                 <Users size={16} />
                 <span>Peer-to-Peer</span>
               </div>
               {mode === 'peer-to-peer' && <ArrowRight size={14} />}
             </button>
             <button
               onClick={() => setMode('mentor-mentee')}
               className={cn(
                 "flex items-center justify-between px-8 py-6 rounded-2xl border transition-all text-xs font-mono uppercase tracking-widest",
                 mode === 'mentor-mentee' ? "bg-white text-black border-white" : "bg-transparent text-zinc-500 border-white/5 hover:border-white/10"
               )}
             >
               <div className="flex items-center gap-4">
                 <GraduationCap size={16} />
                 <span>Mentor-Mentee</span>
               </div>
               {mode === 'mentor-mentee' && <ArrowRight size={14} />}
             </button>
           </div>
        </div>

        <div className="lg:col-span-8">
           <div className="relative glass-card p-1 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col md:flex-row items-center gap-2">
                 <div className="flex-1 flex items-center gap-6 px-8 py-6">
                   <Search size={24} className="text-zinc-700" />
                   <input 
                     type="text" 
                     placeholder="Describe your vision or disciplinary bottleneck..."
                     className="w-full bg-transparent border-none text-zinc-200 placeholder:text-zinc-800 text-xl font-serif italic focus:ring-0"
                   />
                 </div>
                 <button 
                   onClick={handleSearch}
                   className="premium-button w-full md:w-auto px-12 py-7 flex items-center justify-center gap-4 group relative overflow-hidden"
                 >
                   {isSearching ? <Zap size={18} className="animate-spin text-zinc-400" /> : <Sparkles size={18} />}
                   <span className="font-mono text-xs uppercase tracking-[0.3em]">
                     {isSearching ? "SCANNING..." : "SCAN RADAR"}
                   </span>
                 </button>
              </div>
           </div>
        </div>

      </div>

      {/* Discovery Results (Magazine Grid) */}
      <div className="space-y-16">
        <div className="flex items-end justify-between border-b border-white/5 pb-8">
           <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">
             {isSearching ? "Calculating Synergy Probabilities..." : "Verified Heritage Candidates"}
           </h4>
           <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Protocol Version 1.0.4</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {MOCK_MASTERS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group space-y-8"
            >
              <div className="aspect-[3/4] relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5">
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
                 <div className="absolute top-6 left-6 z-20">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                       <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                       <span className="text-[9px] font-mono text-white uppercase tracking-widest">LV {item.level} MASTER</span>
                    </div>
                 </div>
                 <div className="absolute bottom-8 left-8 right-8 z-20 space-y-2">
                    <p className="text-3xl font-display font-bold text-white leading-tight">{item.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{item.role}</p>
                 </div>
              </div>

              <div className="px-2 space-y-6">
                 <div className="flex justify-between items-baseline">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Expertise</p>
                    <p className="text-lg font-display font-bold text-zinc-200">{item.match}%</p>
                 </div>
                 <p className="text-sm text-zinc-400 font-sans leading-relaxed tracking-tight border-l border-white/10 pl-4">
                   {item.expertise}
                 </p>
                 <button className="flex items-center gap-3 text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] hover:text-white transition-colors">
                    View Heritage <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

