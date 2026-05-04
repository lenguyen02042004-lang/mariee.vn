'use client'

import React, { useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ContributionTimeline } from '@/components/project/Timeline'
import { MasterBadge } from '@/components/ui/MasterBadge'
import { ArrowLeft, ExternalLink, ShieldCheck, ChevronDown, Info } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SEED_PROJECTS } from '@/lib/mock-data'

export default function ProjectHeritagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const project = SEED_PROJECTS[id] || Object.values(SEED_PROJECTS)[0]
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0)
  const [showDispute, setShowDispute] = useState(false)
  const [showAlgorithm, setShowAlgorithm] = useState(false)
  const [endorseError, setEndorseError] = useState<string | null>(null)

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 200])

  // Mock User Level (e.g., L4 - needs L1-3 to endorse)
  const currentUserLevel = 4

  const handleEndorse = () => {
    if (currentUserLevel > 3) {
      setEndorseError("Chỉ những Master cấp cao (L1-L3) mới có quyền bảo chứng di sản này.")
      setTimeout(() => setEndorseError(null), 3000)
    } else {
      // Logic for endorsement
    }
  }

  if (!project && id !== 'demo') {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20 overflow-x-hidden">
      {/* 1. PERSISTENT NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-20 flex items-center justify-between px-10 z-[100] bg-black/20 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">The Repository</span>
        </Link>
        <div className="flex items-center gap-8">
           <div className="hidden lg:flex items-center gap-6">
              <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">ID: {id.split('-').join('.')}</span>
              <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Status: {project.status}</span>
           </div>
           <button className="premium-button py-2 px-6 text-[10px] uppercase tracking-widest font-mono flex items-center gap-2">
             <ExternalLink size={12} /> Share Heritage
           </button>
        </div>
      </nav>

      {/* 2. CINEMATIC HERO (70vh) */}
      <section className="relative h-[70vh] flex items-end overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <img 
            src={project.coverImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"} 
            alt={project.title}
            className="w-full h-[140%] object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-10 pb-24 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
               <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em]">
                 {project.industry}
               </span>
               <div className="flex items-center gap-2 text-accent font-mono text-[10px] uppercase tracking-widest">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 Heritage Verified
               </div>
            </div>
            <h1 className="editorial-title text-white max-w-5xl">
              {project.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* 3. THE HERITAGE CANVAS (70/30) */}
      <main className="max-w-[1400px] mx-auto px-10 py-40 grid grid-cols-1 lg:grid-cols-12 gap-24 relative z-10">
        
        {/* Left Column: Visuals & Narrative (70%) */}
        <div className="lg:col-span-8 space-y-32">
          
          {/* Summary Section */}
          <section className="space-y-16">
            <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.6em] border-b border-white/5 pb-6">
              Strategic Intent
            </h2>
            <p className="text-3xl md:text-5xl text-zinc-200 font-serif leading-tight italic">
              "{project.description}"
            </p>
          </section>

          {/* Timeline Section */}
          <section className="space-y-16">
            <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.6em] border-b border-white/5 pb-6">
              Contribution Heritage
            </h2>
            <ContributionTimeline 
              members={project.members} 
              durationMonths={project.duration} 
              industry={project.industry.split(' / ')[0] as any}
            />
          </section>

          {/* Case Studies (Accordion) */}
          <section className="space-y-16">
            <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.6em] border-b border-white/5 pb-6">
              Expert Perspectives
            </h2>
            <div className="space-y-4">
              {project.caseStudies.map((study, idx) => (
                <div key={idx} className="glass-card">
                  <button 
                    onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                    className="w-full px-8 py-6 flex items-center justify-between group"
                  >
                    <span className="font-display text-xl text-white group-hover:text-accent transition-colors">
                      {study.title}
                    </span>
                    <ChevronDown className={`text-zinc-600 transition-transform duration-500 ${activeAccordion === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 text-zinc-400 font-sans leading-relaxed">
                          {study.title === "Strategic Impact" ? (
                            <div dangerouslySetInnerHTML={{ 
                              __html: study.content.replace(/(\d+(?:\.\d+)?(?:\s?\w+)?)/g, '<span class="text-accent font-bold">$1</span>') 
                            }} />
                          ) : (
                            study.content
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* Objective Witness (Dispute Logic) */}
          <section className="pt-20">
            <button 
              onClick={() => setShowDispute(!showDispute)}
              className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest hover:text-white transition-colors group"
            >
              <Info size={14} className={showDispute ? 'text-accent' : ''} /> 
              Information Conflict Transparency
              {id === 'esg-framework' && !showDispute && (
                <span className="ml-4 px-2 py-0.5 rounded bg-red-950/30 border border-red-900/30 text-red-500 text-[8px] animate-pulse">
                  1 Discrepancy Detected
                </span>
              )}
            </button>
            <AnimatePresence>
              {showDispute && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-8 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-6"
                >
                  <div className="flex items-center gap-3 text-white">
                    <ShieldCheck size={18} className="text-accent" />
                    <h4 className="text-sm font-bold uppercase tracking-widest">The Objective Witness Protocol</h4>
                  </div>
                  
                  {id === 'esg-framework' ? (
                    <div className="space-y-4">
                      <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                        System detected a mismatch in "Project Duration" reporting between Founder and Core Member.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                          <p className="text-[8px] font-mono text-zinc-600 uppercase">Founder Claim</p>
                          <p className="text-xs text-zinc-300">24 Months Execution</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                          <p className="text-[8px] font-mono text-zinc-600 uppercase">Core Member Claim</p>
                          <p className="text-xs text-zinc-300">18 Months Execution</p>
                        </div>
                      </div>
                      <Link href="/governance/dispute-audit" className="inline-block text-[9px] font-mono text-accent hover:underline uppercase tracking-widest">
                        View Parallel Data Comparison →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 border-l-2 border-accent/20 bg-accent/5 italic text-zinc-400 text-xs">
                      "No unresolved conflicts reported for this heritage record."
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>

        {/* Right Column: Quantitative Merit (30%) */}
        <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-32 h-fit">
          
          {/* Heritage Points Card */}
          <div className="glass-card p-10 space-y-10 border-accent/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">Heritage Capital</p>
                  <div className="relative">
                    <button 
                      onMouseEnter={() => setShowAlgorithm(true)}
                      onMouseLeave={() => setShowAlgorithm(false)}
                      className="text-zinc-700 hover:text-accent transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <AnimatePresence>
                      {showAlgorithm && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-full right-0 mb-4 p-4 rounded-xl bg-zinc-950 border border-white/10 w-48 z-50 shadow-2xl"
                        >
                          <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Algorithm</p>
                          <p className="text-[10px] font-mono text-accent tracking-tighter">$R = \sum (V \times W \times M)$</p>
                          <p className="text-[8px] text-zinc-600 mt-2 font-sans italic">Verified by cross-industry synergy weights.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="text-7xl font-display font-bold text-white tracking-tighter">{project.impactPoints}</p>
                  <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Points</span>
                </div>
             </div>

             <div className="space-y-6 pt-10 border-t border-white/5">
                <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Verified Contributors</h3>
                <div className="space-y-4">
                  {project.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300 font-medium">{member.name}</span>
                      <MasterBadge level={member.level} className="scale-90" />
                    </div>
                  ))}
                </div>
             </div>

             <div className="pt-10 border-t border-white/5 space-y-6">
                <div className="relative group">
                  <button 
                    onClick={handleEndorse}
                    className={`w-full premium-button group relative ${currentUserLevel > 3 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    Endorse Heritage
                  </button>
                  <AnimatePresence>
                    {endorseError && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-full left-0 right-0 mt-4 p-3 rounded bg-red-950/20 border border-red-900/30 text-red-500 text-[10px] font-mono text-center uppercase tracking-widest"
                      >
                        {endorseError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center justify-center gap-3 opacity-30">
                   <ShieldCheck size={14} className="text-zinc-500" />
                   <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Continuous Audit active</p>
                </div>
             </div>
          </div>

          {/* Domains */}
          <div className="px-4 space-y-4">
            <h3 className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Domains</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="text-[9px] font-mono text-zinc-400 border border-white/5 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </aside>

      </main>

      {/* Footer */}
      <footer className="py-32 border-t border-white/5 text-center opacity-20">
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.5em]">The Professional Heritage Network</p>
      </footer>
    </div>
  )
}
