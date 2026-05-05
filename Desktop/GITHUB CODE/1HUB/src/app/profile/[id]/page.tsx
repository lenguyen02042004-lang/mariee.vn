'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RadarExpertise } from '@/components/ui/RadarExpertise'
import { MasterBadge } from '@/components/ui/MasterBadge'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { ArrowLeft, Globe, Mail, Shield, Sparkles, Plus, Download, Printer } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const id = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      let targetId = id
      let query = supabase.from('profiles').select('*')
      
      if (id === 'me') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) targetId = user.id
        else {
          setIsLoading(false)
          return
        }
        query = query.eq('id', targetId)
      } else {
        // Try to match by username first, then by ID
        const { data: byUsername } = await supabase.from('profiles').select('*').eq('username', id).single()
        if (byUsername) {
          setProfile(byUsername)
          await fetchProjects(byUsername.id)
          setIsLoading(false)
          return
        }
        query = query.eq('id', id)
      }

      const { data, error } = await query.single()
      
      if (data) {
        setProfile(data)
        await fetchProjects(data.id)
      }
      setIsLoading(false)
    }

    async function fetchProjects(userId: string) {
      const { data } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(profile_id)
        `)
        .eq('project_members.profile_id', userId)
      
      if (data) setProjects(data)
    }

    fetchProfile()
  }, [id])

  const handleExport = () => {
    window.print()
  }

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-accent font-mono uppercase tracking-widest animate-pulse">Syncing Heritage...</div>

  const userData = profile || {
    full_name: 'Unknown Specialist',
    major: 'Global Pioneer',
    current_level: 7,
    reputation_score: 0,
    bio: 'Profile pending consecration.',
  }

  // derived metrics
  const expertise = [
    { label: 'Creative Vision', value: 70 + (userData.reputation_score % 30) },
    { label: 'Technical Execution', value: 65 + (userData.reputation_score % 35) },
    { label: 'Leadership', value: 60 + (userData.reputation_score % 40) },
    { label: 'Strategic Impact', value: 75 + (userData.reputation_score % 25) },
    { label: 'Synergy', value: 80 + (userData.reputation_score % 20) }
  ]

  return (
    <main className="min-h-screen bg-background print:bg-white print:text-black">
      {/* 1. IDENTITY HEADER (The Sanctuary) */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-20 border-b border-white/5 print:h-auto print:py-20 print:border-black/10">
        <div className="absolute inset-0 z-0 print:hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#171717,transparent)] opacity-60" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        </div>

        <div className="relative z-10 text-center space-y-10 max-w-4xl px-6">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative z-20 w-40 h-40 rounded-full border border-white/10 p-1 glass-3d print:border-black/10 print:shadow-none">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                <img src={userData.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"} alt="Avatar" className="w-full h-full object-cover print:opacity-100" />
              </div>
            </div>
            
            <div className="space-y-4">
              <MasterBadge level={userData.current_level} className="print:border-black/20" />
              <h1 className="editorial-title text-white print:text-black text-6xl md:text-8xl">{userData.full_name}</h1>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] print:text-zinc-600">@{userData.username || userData.id?.substring(0,8)}</p>
            </div>
          </div>

          <div className="flex justify-center gap-12 pt-8 print:hidden">
             <button onClick={handleExport} className="flex items-center gap-3 text-accent hover:text-white transition-colors">
                <Printer size={16} /> <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Export Portfolio</span>
             </button>
             <div className="flex items-center gap-3 text-zinc-600 hover:text-white transition-colors cursor-pointer">
                <Mail size={16} /> <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Secure Contact</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. MASTERY & LEGACY */}
      <section className="max-w-7xl mx-auto px-10 py-32 grid grid-cols-1 lg:grid-cols-12 gap-24 print:block print:py-10">
        
        {/* Left: Professional Legacy (Project Gallery) */}
        <div className="lg:col-span-7 space-y-24 print:space-y-12">
          <div className="space-y-6">
            <h2 className="font-display text-5xl text-white print:text-black italic">Verified Heritage</h2>
            <p className="text-zinc-500 font-serif text-lg max-w-lg italic leading-relaxed print:text-zinc-700">
              &quot;Mọi dự án là một chứng thư về sự xuất sắc trong cộng tác. Những công trình này định nghĩa sự đóng góp của tôi vào di sản toàn cầu.&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16">
            {projects.map(project => (
              <ProjectCard key={project.id} {...project} />
            ))}
            
            {projects.length === 0 && (
              <div className="p-20 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-6 print:hidden">
                 <Shield size={40} className="text-zinc-800" />
                 <p className="text-zinc-600 font-serif italic text-xl">Heritage entries pending verification.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Expertise Map & Stats */}
        <aside className="lg:col-span-5 space-y-16 lg:sticky lg:top-32 h-fit print:static print:mt-20">
          
          <div className="glass-card p-12 space-y-12 print:border-black/10 print:bg-white print:shadow-none">
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em] mb-4">Mastery Distribution</h3>
              <p className="text-xs text-zinc-500 font-sans">Verified by synergy resonance across global nodes.</p>
            </div>
            
            <RadarExpertise data={expertise} size={350} />
            
            <div className="grid grid-cols-2 gap-10 border-t border-white/5 pt-12 print:border-black/10">
               <div className="space-y-2">
                 <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Heritage Capital</p>
                 <p className="text-4xl font-display text-white print:text-black italic">{userData.reputation_score.toFixed(1)} $R</p>
               </div>
               <div className="space-y-2 text-right">
                 <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Resonance Factor</p>
                 <p className="text-4xl font-display text-accent">{(1 + userData.reputation_score / 1000).toFixed(2)}x</p>
               </div>
            </div>
          </div>

          {/* Bio / Manifesto */}
          <div className="p-10 space-y-8 bg-zinc-900/20 rounded-3xl border border-white/5 print:border-black/10 print:bg-white">
             <div className="flex justify-between items-center">
               <Shield size={20} className="text-accent/50" />
               <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Mastery Logic</span>
             </div>
             <p className="text-zinc-400 font-serif text-xl leading-relaxed italic print:text-zinc-800">
               &quot;{userData.bio || 'This specialist maintains a record-only status, prioritizing execution over self-claim.'}&quot;
             </p>
          </div>

        </aside>

      </section>

      <footer className="py-20 border-t border-white/5 text-center print:border-black/10">
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[1em] print:text-zinc-400">1HUB. THE SYNERGY NETWORK | HERITAGE ID: {userData.id?.substring(0,12).toUpperCase()}</p>
      </footer>
    </main>
  )
}
