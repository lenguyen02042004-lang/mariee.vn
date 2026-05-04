'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface ProjectCardProps {
  id: string
  title: string
  industry: string
  coverImage: string
  synergyScore: number
  isLarge?: boolean
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  id, 
  title, 
  industry, 
  coverImage, 
  synergyScore,
  isLarge = false
}) => {
  return (
    <Link href={`/projects/${id}`}>
      <motion.div 
        className={`group relative overflow-hidden rounded-2xl glass-card parallax-hover ${isLarge ? 'h-[600px]' : 'h-[400px]'}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Background Image with Parallax effect */}
        <div className="absolute inset-0 z-0 scale-110 group-hover:scale-100 transition-transform duration-1000 ease-out">
          <Image 
            src={coverImage} 
            alt={title}
            fill
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Content Layer */}
        <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end space-y-4">
          <div className="space-y-1">
            <motion.p 
              className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {industry}
            </motion.p>
            <h3 className="font-display text-3xl md:text-4xl text-white leading-tight">
              {title}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Synergy Score</span>
              <span className="text-xl font-display text-luxury-gold">{synergyScore}%</span>
            </div>
            
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent transition-colors duration-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-accent transition-colors">
                <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
