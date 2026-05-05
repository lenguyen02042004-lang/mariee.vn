'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectCard } from "@/components/ui/ProjectCard"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from 'next/link'

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
    concept: 'Heritage',
    title: 'THE MONUMENT.',
    meaning: 'Architecture & Eternity'
  },
  {
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
    concept: 'Synergy',
    title: 'THE CONNECTION.',
    meaning: 'Global Tech & Network Intersection'
  },
  {
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
    concept: 'Insight',
    title: 'THE MANUSCRIPT.',
    meaning: 'Digital Intellectual Assets'
  }
]

const FEATURED_PROJECTS = [
  {
    id: 'vertical-forest',
    title: 'The Vertical Forest: Urban Biophilia',
    industry: 'Architecture / Sustainability',
    coverImage: 'https://images.unsplash.com/photo-1518005020250-68594f2146e2?auto=format&fit=crop&q=80',
    synergyScore: 98,
    isLarge: true
  },
  {
    id: 'global-esg-2026',
    title: 'Global ESG Framework 2026',
    industry: 'Finance / ESG Strategy',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
    synergyScore: 94,
    isLarge: false
  },
  {
    id: 'metabolic-sculpture',
    title: 'Metabolic Sculpture: Kinetic Art',
    industry: 'Art / Engineering',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80',
    synergyScore: 92,
    isLarge: false
  },
  {
    id: 'decentralized-trust',
    title: 'Decentralized Trust Protocol',
    industry: 'Tech / Cryptography',
    coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80',
    synergyScore: 96,
    isLarge: true
  }
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-background selection:bg-accent/30 selection:text-white">
      {/* CHAPTER 1: THE SANCTUARY GATE */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={HERO_SLIDES[currentSlide].image} 
              alt={HERO_SLIDES[currentSlide].concept} 
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center space-y-8 max-w-5xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl"
          >
            <Sparkles size={12} className="text-accent animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em]">{HERO_SLIDES[currentSlide].meaning}</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="editorial-title text-white flex flex-col"
            >
              <span className="text-zinc-600 text-sm md:text-base font-mono uppercase tracking-[0.8em] mb-4">Beyond Profiles. Building Heritage.</span>
              1HUB.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs md:text-sm font-mono text-slate-500 uppercase tracking-[0.5em]"
            >
              The Synergy Protocol for Global Excellence.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-8"
          >
            <Link href="/onboarding" className="premium-button">
              Enter The Sanctuary
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[8px] font-mono uppercase tracking-[0.4em]">Scroll to Begin</span>
          <div className="w-px h-12 bg-white/40" />
        </motion.div>

        {/* Slide Indicators */}
        <div className="absolute bottom-20 flex gap-12">
          {HERO_SLIDES.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="group relative"
            >
              <span className={`block w-12 h-px transition-all duration-700 ${currentSlide === i ? 'bg-white' : 'bg-white/20'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* CHAPTER 2: THE MANIFESTO */}
      <section className="max-w-4xl mx-auto px-6 py-48 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/30 text-[10px] font-mono text-zinc-500 uppercase tracking-widest"
        >
          Founding Philosophy
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-display font-bold text-white leading-tight"
        >
          Conventional Networks are Noise. <br/>
          <span className="text-zinc-600">1HUB. is Heritage.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-zinc-400 font-serif italic leading-relaxed"
        >
          "In an era of fleeting digital noise, professional truth is being diluted. We don't build profiles; we preserve heritages. Here, your work is your only currency, verified by the masters who built the world alongside you."
        </motion.p>
      </section>

      {/* CHAPTER 3: THE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 py-32 space-y-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-12"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-12 h-px bg-accent" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-[0.5em]">The Showcase</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl text-white leading-none">Living <br/> Evidence.</h2>
          </div>
          <div className="flex gap-8 border-b border-white/5 pb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            {['All', 'Architecture', 'Finance', 'Art', 'Tech'].map(cat => (
              <span key={cat} className="cursor-pointer hover:text-white transition-colors">{cat}</span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {FEATURED_PROJECTS.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="relative group"
            >
              <ProjectCard {...project} />
              {/* Synergy Graph Hint */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">Active Synergy Graph</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CHAPTER 4: THE MASTERY PROTOCOL */}
      <section className="bg-zinc-900/30 border-y border-white/5 py-48">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-24">
          {[
            { step: '01', title: 'Verified by Execution', desc: 'Case studies are locked by technical evidence and peer-audited by fellow masters.' },
            { step: '02', title: 'Identified by Reputation', desc: 'Your weight in the network is a dynamic function of verified cross-industry impact.' },
            { step: '03', title: 'Preserved as Heritage', desc: 'We bridge the gap between temporary gigs and permanent professional legacy.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-6"
            >
              <span className="font-mono text-accent text-sm tracking-widest">{item.step}</span>
              <h3 className="font-display text-2xl text-white uppercase tracking-tight">{item.title}</h3>
              <p className="text-zinc-500 font-sans leading-relaxed">{item.desc}</p>
              {i === 2 && (
                <div className="pt-4">
                  <Link href="/knowledge" className="text-[9px] font-mono text-accent/60 hover:text-accent transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group">
                    Understand the Protocol <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CHAPTER 5: THE GLOBAL FOOTER */}
      <footer className="pt-48 pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 pb-48 border-b border-white/5">
            {/* Newsletter "The Insight" */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="font-display text-4xl text-white">The Insight.</h3>
                <p className="text-zinc-500 max-w-sm">Curation of verified multidisciplinary breakthroughs, delivered monthly to the elite.</p>
              </div>
              <div className="flex gap-4 max-w-md">
                <input 
                  type="email" 
                  placeholder="master@sanctuary.io" 
                  className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-3 text-sm font-mono focus:border-slate-500 outline-none transition-colors"
                />
                <button className="premium-button px-6">Subscribe</button>
              </div>
            </div>
            
            {/* Links & Trust */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-8">
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em] block border-b border-white/5 pb-2">Philosophy</span>
                <nav className="flex flex-col gap-4">
                  {['MANIFESTO', 'KNOWLEDGE', 'MASTERS', 'RULES'].map(item => (
                    <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
                      {item}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="space-y-8">
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em] block border-b border-white/5 pb-2">Governance</span>
                <nav className="flex flex-col gap-4 text-[10px] font-mono tracking-[0.2em] text-zinc-500">
                  <Link href="/legal" className="hover:text-white transition-colors uppercase">Legal & Ethics</Link>
                  <Link href="/privacy" className="hover:text-white transition-colors uppercase">Privacy Protocol</Link>
                  <Link href="/export" className="hover:text-white transition-colors uppercase">Heritage Export</Link>
                </nav>
              </div>
              <div className="space-y-8 col-span-2 md:col-span-1">
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em] block border-b border-white/5 pb-2">Trust Badges</span>
                <div className="flex flex-col gap-6 opacity-40 grayscale">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[8px] font-mono">ZK</div>
                    <span className="text-[8px] font-mono uppercase tracking-widest">Zero-Knowledge Proofs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[8px] font-mono">ISO</div>
                    <span className="text-[8px] font-mono uppercase tracking-widest">ISO 27001 Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12">
            <div className="flex items-center gap-8">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">© 2026 1HUB MASTER PROTOCOL.</p>
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">BUILT FOR THE MULTIDISCIPLINARY ELITE.</p>
            </div>
            <div className="flex gap-12 text-zinc-800 font-mono text-[9px] uppercase tracking-widest">
              <span>GDPR/CCPA COMPLIANT</span>
              <span>END-TO-END ENCRYPTED</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

