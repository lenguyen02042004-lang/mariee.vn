'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Layout, Clock, Users, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    industry: 'Architecture',
    description: '',
    phases: [
      { name: 'Concept & Theory', status: 'completed' },
      { name: 'Technical Execution', status: 'in-progress' },
      { name: 'Global Resonance', status: 'planned' }
    ]
  })

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const supabase = createClient()

  async function handleSubmit() {
    setIsSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Demo mode fallback
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      return
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          industry: formData.industry,
          description: formData.description,
          owner_id: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      // Automatically add owner as the Project Owner role
      await supabase.from('project_members').insert({
        project_id: data.id,
        profile_id: user.id,
        role: 'owner'
      })

      router.push(`/projects/${data.id}`)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6 selection:bg-slate-400/30 overflow-hidden relative">
      {/* Sovereign Ambient Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-slate-400/5 rounded-full blur-[140px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-zinc-400/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }} />
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      
      <div className="relative z-10 max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-12 md:p-16 space-y-12 border-white/5 bg-zinc-900/20 backdrop-blur-3xl"
          >
            {/* Ritual Step Indicator */}
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="relative h-1 w-12 bg-zinc-900 rounded-full overflow-hidden">
                    {step >= i && (
                      <motion.div 
                        layoutId="step-bar-project"
                        className="absolute inset-0 bg-white shadow-[0_0_10px_white]"
                      />
                    )}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">
                Abort Initiation
              </Link>
            </div>

            {/* Step 1: The Vision */}
            {step === 1 && (
              <div className="space-y-10">
                <div className="space-y-3">
                  <h1 className="text-4xl font-display font-bold tracking-tight text-white italic">The Initiation.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] leading-relaxed">
                    &quot;Define the vessel for your collective <br/> professional heritage.&quot;
                  </p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Heritage Title</label>
                    <input 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      type="text" 
                      placeholder="e.g. Nexus Urban Core"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-xl text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-800 font-serif"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Industry Domain</label>
                    <select 
                      value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-8 py-5 text-lg text-white outline-none appearance-none cursor-pointer focus:border-white/20 transition-all font-serif"
                    >
                      <option value="Architecture" className="bg-zinc-900">Architecture & Urbanism</option>
                      <option value="Artificial Intelligence" className="bg-zinc-900">Artificial Intelligence & Deep Tech</option>
                      <option value="Fintech" className="bg-zinc-900">Fintech & Global Finance</option>
                      <option value="Fine Arts" className="bg-zinc-900">Fine Arts & Heritage</option>
                      <option value="Sustainable Energy" className="bg-zinc-900">Sustainable Energy & ESG</option>
                      <option value="Bioengineering" className="bg-zinc-900">Bioengineering & Healthcare</option>
                      <option value="Strategic Management" className="bg-zinc-900">Strategic Management</option>
                      <option value="Legal Tech" className="bg-zinc-900">Legal Tech & Governance</option>
                      <option value="Aerospace" className="bg-zinc-900">Aerospace Engineering</option>
                      <option value="Quantum Computing" className="bg-zinc-900">Quantum Computing</option>
                      <option value="Digital Heritage" className="bg-zinc-900">Digital Heritage & Archiving</option>
                      <option value="Neuroscience" className="bg-zinc-900">Neuroscience & BCI</option>
                      <option value="Environmental Science" className="bg-zinc-900">Environmental Science</option>
                      <option value="Creative Direction" className="bg-zinc-900">Creative Direction & Branding</option>
                      <option value="Product Engineering" className="bg-zinc-900">Product Engineering</option>
                      <option value="Behavioral Economics" className="bg-zinc-900">Behavioral Economics</option>
                      <option value="Logistics" className="bg-zinc-900">Logistics & Supply Chain</option>
                      <option value="Maritime" className="bg-zinc-900">Maritime Technology</option>
                      <option value="Media" className="bg-zinc-900">Media & Journalism</option>
                      <option value="Fashion" className="bg-zinc-900">Fashion & Textile Design</option>
                      <option value="Interior Design" className="bg-zinc-900">Interior Design</option>
                      <option value="Cybersecurity" className="bg-zinc-900">Cybersecurity</option>
                      <option value="Blockchain" className="bg-zinc-900">Blockchain Infrastructure</option>
                    </select>
                  </div>
                </div>
                <button onClick={nextStep} disabled={!formData.title} className="premium-button w-full py-6 flex items-center justify-center gap-4 group">
                  <span className="text-sm tracking-widest uppercase">Define Timeline</span>
                  <Clock size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            )}

            {/* Step 2: The Logic */}
            {step === 2 && (
              <div className="space-y-10">
                <div className="space-y-3">
                  <h1 className="text-4xl font-display font-bold tracking-tight text-white italic">The Rationale.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] leading-relaxed">
                    &quot;Articulate the execution logic behind <br/> this professional contribution.&quot;
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Executive Summary</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the objective witness and core value proposition..."
                    rows={6}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-sm text-zinc-300 focus:border-white/20 outline-none transition-all resize-none font-serif leading-relaxed"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={prevStep} className="w-1/3 py-6 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:bg-white/5">Back</button>
                  <button onClick={nextStep} disabled={!formData.description} className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group">
                    <span className="text-sm tracking-widest uppercase">Summon Synergy</span>
                    <Users size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: The Consecration */}
            {step === 3 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-display font-bold tracking-tight text-white">Seal the Heritage.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    &quot;By initiating this project, you become the <br/> Sovereign Architect of its record.&quot;
                  </p>
                </div>
                
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-white">
                         <Layout size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Project Container</p>
                         <p className="text-lg font-display text-white">{formData.title}</p>
                      </div>
                   </div>
                   <div className="space-y-2 border-t border-white/5 pt-6">
                      <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.3em]">Governance Rules:</p>
                      <ul className="space-y-2">
                         <li className="text-[10px] text-zinc-500 flex items-center gap-2">
                            <Sparkles size={10} className="text-accent" /> You hold absolute authority over the primary timeline.
                         </li>
                         <li className="text-[10px] text-zinc-500 flex items-center gap-2">
                            <Sparkles size={10} className="text-accent" /> Collaborators may provide &apos;Objective Witness&apos; logs.
                         </li>
                      </ul>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="w-1/3 py-6 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:bg-white/5">Back</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting} 
                    className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group"
                  >
                    <Sparkles size={18} className={isSubmitting ? 'animate-spin' : ''} />
                    <span className="text-sm tracking-widest uppercase">{isSubmitting ? 'INITIATING...' : 'INITIATE HERITAGE'}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
