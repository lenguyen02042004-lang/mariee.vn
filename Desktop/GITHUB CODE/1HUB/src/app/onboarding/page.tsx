'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Shield } from 'lucide-react'

import { completeOnboarding } from '@/services/onboarding'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMockWarning, setShowMockWarning] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    major: 'Software Engineering',
    specialization: '',
    bio: ''
  })

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  async function handleSubmit() {
    setIsSubmitting(true)
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT_ID');
    if (isMock) setShowMockWarning(true)

    const finalData = new FormData()
    Object.entries(formData).forEach(([k, v]) => finalData.append(k, v))

    try {
      await completeOnboarding(finalData)
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
         {/* Fine grain overlay */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      
      <div className="relative z-10 max-w-xl w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="glass-card p-12 md:p-16 space-y-12 border-white/5 bg-zinc-900/20 backdrop-blur-3xl"
          >
            {/* Ritual Step Indicator */}
            <div className="flex justify-center gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative h-1 w-12 bg-zinc-900 rounded-full overflow-hidden">
                  {step >= i && (
                    <motion.div 
                      layoutId="step-bar"
                      className="absolute inset-0 bg-white shadow-[0_0_10px_white]"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Identity & The Ritual of Access */}
            {step === 1 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">The First Mark.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    "Every heritage begins with a name. <br/> Your access is secured via Magic Link protocol."
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] ml-1">Professional Identity / Pseudonym</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    type="text" 
                    placeholder="e.g. Master Aris"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-xl text-white focus:border-white/20 focus:bg-white/[0.04] outline-none transition-all placeholder:text-zinc-800 font-serif"
                  />
                </div>
                <button onClick={nextStep} disabled={!formData.name} className="premium-button w-full py-6 flex items-center justify-center gap-4 group">
                  <span className="text-sm tracking-widest">CONTINUE TO DOMAIN</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Step 2: The Domain of Impact */}
            {step === 2 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">The Domain.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    "Define the territory where your <br/> professional excellence resonates."
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] ml-1">Heritage Field</label>
                    <div className="relative group">
                      <select 
                        value={formData.major}
                        onChange={e => setFormData({...formData, major: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-lg text-white outline-none appearance-none cursor-pointer focus:border-white/20 transition-all font-serif"
                      >
                        <option value="Architecture" className="bg-zinc-900 text-white">Architecture & Urbanism</option>
                        <option value="Fine Arts" className="bg-zinc-900 text-white">Fine Arts & Curation</option>
                        <option value="ESG" className="bg-zinc-900 text-white">Sustainability & ESG Strategy</option>
                        <option value="Finance" className="bg-zinc-900 text-white">Global Finance & Analytics</option>
                        <option value="Software" className="bg-zinc-900 text-white">Software Engineering & AI</option>
                        <option value="Legal" className="bg-zinc-900 text-white">Legal Strategy & IP</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] ml-1">Specialization</label>
                    <input 
                      value={formData.specialization}
                      onChange={e => setFormData({...formData, specialization: e.target.value})}
                      type="text" 
                      placeholder="e.g. Biophilic Systems"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-lg text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-800 font-serif"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={prevStep} className="w-1/3 py-6 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:bg-white/5 transition-colors">Back</button>
                   <button onClick={nextStep} disabled={!formData.specialization} className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group">
                      <span className="text-sm tracking-widest">REFINE IMPACT</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            )}

            {/* Step 3: The Ritual of Purpose */}
            {step === 3 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">The Legacy.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    "Seal your professional purpose <br/> within the immutable repository."
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] ml-1">Philosophical Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Describe your execution logic and the legacy you wish to build..."
                    rows={6}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-sm text-zinc-300 focus:border-white/20 outline-none transition-all resize-none placeholder:text-zinc-800 font-serif leading-relaxed"
                  />
                </div>
                
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <button onClick={prevStep} className="w-1/3 py-6 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:bg-white/5 transition-colors">Back</button>
                      <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || formData.bio.length < 50} 
                        className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group relative overflow-hidden"
                      >
                         <AnimatePresence>
                           {isSubmitting && (
                             <motion.div 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               className="absolute inset-0 bg-white/10 animate-pulse" 
                             />
                           )}
                         </AnimatePresence>
                         <Sparkles size={18} className={isSubmitting ? 'animate-spin' : ''} />
                         <span className="text-sm tracking-widest">{isSubmitting ? 'INITIALIZING...' : 'SEAL MY HERITAGE'}</span>
                      </button>
                   </div>
                   
                   {showMockWarning && (
                     <motion.p 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }} 
                       className="text-[10px] font-mono text-slate-400 text-center uppercase tracking-[0.3em] animate-pulse"
                     >
                        Initiating Heritage Protocol...
                     </motion.p>
                   )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
