'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectCard } from "@/components/ui/ProjectCard"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from 'next/link'

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1565538810643-95bdb810003b?auto=format&fit=crop&q=80',
    concept: 'Heritage',
    title: 'THE MONUMENT.',
    meaning: 'Architecture & Eternity'
  },
  {
    image: 'https://images.unsplash.com/photo-1518005020250-68594f2146e2?auto=format&fit=crop&q=80',
    concept: 'Synergy',
    title: 'THE CONNECTION.',
    meaning: 'Nature & Tech Intersection'
  },
  {
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80',
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
      {/* 1. CINEMATIC HERO SLIDER */}
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

        {/* Slide Indicators */}
        <div className="absolute bottom-20 flex gap-12">
          {HERO_SLIDES.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="group relative"
            >
              <span className={`block w-12 h-px transition-all duration-700 ${currentSlide === i ? 'bg-white' : 'bg-white/20'}`} />
              <span className={`absolute -top-6 left-0 text-[8px] font-mono uppercase tracking-widest transition-opacity duration-700 ${currentSlide === i ? 'opacity-100 text-white' : 'opacity-0'}`}>
                Slide 0{i + 1}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. THE CURATOR'S GRID */}
      <section className="max-w-7xl mx-auto px-6 py-48 space-y-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-12"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-12 h-px bg-accent" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-[0.5em]">The Showcase</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl text-white leading-none">Professional <br/> Heritage.</h2>
            <p className="text-zinc-500 font-sans max-w-md italic text-lg">
              A curated masonry of verified multidisciplinary collaborations.
            </p>
          </div>
          <Link href="/projects" className="nav-link flex items-center gap-2 group border-b border-white/5 pb-2">
            Explore All Heritage <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {FEATURED_PROJECTS.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            >
              <ProjectCard {...project} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. PHILOSOPHY FOOTER */}
      <footer className="border-t border-white/5 pt-32 pb-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start pb-32">
            <div className="space-y-12">
              <h3 className="font-display text-4xl text-white">Join the Elite.</h3>
              <p className="text-zinc-500 font-serif italic text-xl leading-relaxed max-w-lg">
                "1Hub is not a stage for vanity, but a sanctuary for your legacy. In a world of fleeting noise, we build the immutable record of human excellence."
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em] block border-b border-white/5 pb-2">Navigation</span>
                <nav className="flex flex-col gap-4">
                  {['MANIFESTO', 'MASTERS', 'RULES', 'EXPORT'].map(item => (
                    <Link key={item} href={`/${item.toLowerCase()}`} className="text-xs font-sans font-medium tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
                      {item}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="space-y-6">
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em] block border-b border-white/5 pb-2">Connect</span>
                <nav className="flex flex-col gap-4 text-xs font-sans font-medium tracking-[0.2em] text-zinc-500">
                  <span className="cursor-pointer hover:text-white transition-colors">SECURE LINK</span>
                  <span className="cursor-pointer hover:text-white transition-colors">GLOBAL OFFICE</span>
                </nav>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-white/5">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
              © 2026 1HUB MASTER PROTOCOL.
            </p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
              BUILT FOR THE MULTIDISCIPLINARY ELITE.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

