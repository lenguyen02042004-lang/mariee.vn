'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ProjectCard } from "@/components/ui/ProjectCard"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from 'next/link'

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
  return (
    <main className="min-h-screen bg-background">
      {/* 1. FULL-BLEED HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-5xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl"
          >
            <Sparkles size={12} className="text-accent animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em]">The Heritage Network v1.0</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="editorial-title text-white"
          >
            1HUB. <br />
            <span className="text-zinc-600">SYNERGY PROTOCOL.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed italic"
          >
            A global sanctuary for multidisciplinary excellence. <br />
            Verified by execution, preserved as heritage.
          </motion.p>

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
          <span className="text-[9px] font-mono uppercase tracking-[0.3em]">Curation Below</span>
          <div className="w-px h-12 bg-white/40" />
        </motion.div>
      </section>

      {/* 2. THE CURATOR'S GRID */}
      <section className="max-w-7xl mx-auto px-6 py-32 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h2 className="font-display text-4xl md:text-5xl text-white">The Global Showcase</h2>
            <p className="text-zinc-500 font-sans max-w-md">
              A curated masonry of verified cross-industry collaborations. Each card represents a legacy built through synergy.
            </p>
          </div>
          <Link href="/projects" className="nav-link flex items-center gap-2 group">
            Explore All Heritage <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURED_PROJECTS.map((project, idx) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </section>

      {/* 3. PHILOSOPHY FOOTER */}
      <footer className="border-t border-white/5 py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h3 className="font-display text-3xl text-white">Join the Elite</h3>
            <p className="text-zinc-500 font-serif italic text-lg leading-relaxed">
              "1Hub is not a stage for vanity, but a sanctuary for your legacy. In a world of fleeting noise, we build the immutable record of human excellence."
            </p>
            <div className="flex gap-8">
              {['Manifesto', 'Masters', 'Rules', 'Export'].map(item => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="nav-link">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-end items-end space-y-2">
            <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">© 2026 1Hub Master Protocol</p>
            <p className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Built for the multidisciplinary elite.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

