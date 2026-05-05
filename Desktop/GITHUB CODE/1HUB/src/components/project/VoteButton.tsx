'use client'

import React, { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface VoteButtonProps {
  voterLevel: number
  voterWeight: number
  caseStudyId: string
}

export const VoteButton: React.FC<VoteButtonProps> = ({ voterLevel, voterWeight, caseStudyId }) => {
  const [hasVoted, setHasVoted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleVote = async () => {
    try {
      const { castVote } = await import('@/services/votes')
      await castVote(caseStudyId)
      setHasVoted(true)
    } catch (err: any) {
      alert(err.message || 'Verification failed.')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 group">
      <button
        onClick={handleVote}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={hasVoted}
        className={cn(
          "relative overflow-hidden px-12 py-5 rounded-xl font-display font-bold text-lg transition-all duration-500",
          "border border-zinc-800 backdrop-blur-xl",
          hasVoted 
            ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" 
            : "bg-zinc-900/40 text-zinc-100 hover:border-slate-400/50 hover:bg-zinc-800/60 active:scale-95 shadow-2xl"
        )}
      >
        <AnimatePresence mode="wait">
          {hasVoted ? (
            <motion.div
              key="voted"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <Check size={20} strokeWidth={3} />
              <span>Heritage Verified</span>
            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <ShieldCheck size={20} />
              <span>Verify Contribution</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow Effect */}
        {!hasVoted && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>
        )}
      </button>

      {/* Transparency Note */}
      <div className="flex flex-col items-center gap-1">
        <p className={cn(
          "text-[10px] font-mono uppercase tracking-[0.2em] transition-colors duration-300",
          hasVoted ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400"
        )}>
          {hasVoted 
            ? "Vote Recorded Successfully" 
            : `You are voting with Weight: [${voterWeight}]`}
        </p>
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-tighter">
          Based on your Level {voterLevel} Status
        </p>
      </div>
    </div>
  )
}
