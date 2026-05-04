'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { RadarExpertise } from '@/components/ui/RadarExpertise'
import { MasterBadge } from '@/components/ui/MasterBadge'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { ArrowLeft, Globe, Mail, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'

const MOCK_USER = {
  name: 'Dr. Aris Thorne',
  title: 'Principal Urban Architect',
  level: 1,
  reputation: 9840,
  bio: 'Dedicated to the intersection of biophilic design and urban infrastructure. With over 20 years of experience, my mission is to build the heritage of sustainable living.',
  expertise: [
    { label: 'Creative Vision', value: 95 },
    { label: 'Technical Execution', value: 88 },
    { label: 'Leadership', value: 92 },
    { label: 'Strategic Impact', value: 96 },
    { label: 'Synergy', value: 90 }
  ],
  projects: [
    {
      id: 'vertical-forest',
      title: 'The Vertical Forest: Urban Biophilia',
      industry: 'Architecture / Sustainability',
      coverImage: 'https://images.unsplash.com/photo-1518005020250-68594f2146e2?auto=format&fit=crop&q=80',
      synergyScore: 98
    },
    {
      id: 'decentralized-trust',
      title: 'Decentralized Trust Protocol',
      industry: 'Tech / Cryptography',
      coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80',
      synergyScore: 96
    }
  ]
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1. IDENTITY HEADER (The Sanctuary) */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#171717,transparent)] opacity-60" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl px-6">
          <Link href="/" className="absolute -top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em] hover:text-white transition-colors">
            <ArrowLeft size={12} /> Return to Grid
          </Link>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="w-32 h-32 rounded-full border border-white/10 p-1 glass-3d">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>
            
            <div className="space-y-2">
              <MasterBadge level={MOCK_USER.level} label="L1 MASTER ARCHITECT" />
              <h1 className="editorial-title text-white">{MOCK_USER.name}</h1>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">{MOCK_USER.title}</p>
            </div>
          </motion.div>

          <div className="flex justify-center gap-8 pt-4">
             <div className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors cursor-pointer">
                <Globe size={14} /> <span className="text-[9px] font-mono uppercase tracking-widest">Global Protocol</span>
             </div>
             <div className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors cursor-pointer">
                <Mail size={14} /> <span className="text-[9px] font-mono uppercase tracking-widest">Secure Link</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. MASTERY & LEGACY (70/30 or Split) */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-12 gap-24">
        
        {/* Left: Professional Legacy (Project Gallery) */}
        <div className="lg:col-span-7 space-y-20">
          <div className="space-y-4">
            <h2 className="font-display text-4xl text-white">Professional Legacy</h2>
            <p className="text-zinc-500 font-sans max-w-lg italic">
              "Every project is a verified testament to collaborative excellence. These works define my contribution to the global heritage."
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {MOCK_USER.projects.map(project => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>

        {/* Right: Expertise Map & Stats */}
        <aside className="lg:col-span-5 space-y-16 lg:sticky lg:top-32 h-fit">
          
          {/* Radar Chart Section */}
          <div className="glass-card p-10 space-y-12">
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Mastery Distribution</h3>
              <p className="text-xs text-zinc-600 font-sans">Verified by 42 peers across 12 countries.</p>
            </div>
            
            <RadarExpertise data={MOCK_USER.expertise} size={320} />
            
            <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-10">
               <div className="space-y-1">
                 <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Heritage Score</p>
                 <p className="text-3xl font-display text-white">{MOCK_USER.reputation}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Synergy Weight</p>
                 <p className="text-3xl font-display text-accent">1.4x</p>
               </div>
            </div>
          </div>

          {/* Bio / Manifesto */}
          <div className="p-8 space-y-6 bg-surface rounded-3xl border border-white/5">
             <Shield size={24} className="text-zinc-800" />
             <p className="text-zinc-400 font-serif text-lg leading-relaxed italic">
               "{MOCK_USER.bio}"
             </p>
             <div className="flex items-center gap-2 pt-4 opacity-30">
                <Sparkles size={12} className="text-zinc-500" />
                <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Verified Heritage Record</span>
             </div>
          </div>

        </aside>

      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 text-center opacity-20">
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.5em]">Identity Preserved in the 1Hub Sanctuary</p>
      </footer>
    </main>
  )
}
