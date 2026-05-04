'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CaseStudyEditorProps {
  isVerified: boolean
  projectName: string
}

export const CaseStudyEditor: React.FC<CaseStudyEditorProps> = ({ isVerified, projectName }) => {
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const MIN_WORDS = 300

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [content])

  if (!isVerified) {
    return (
      <div className="glass-card p-12 text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
          <AlertCircle size={32} className="text-zinc-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Access Restricted</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Only verified members of **{projectName}** can publish a Case Study. 
            Please wait for the project owner or a Master to verify your contribution first.
          </p>
        </div>
        <button disabled className="premium-button opacity-50 cursor-not-allowed">
          Request Verification
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-display font-bold">Documenting your Heritage</h2>
        <p className="text-sm text-zinc-500">Share the strategic logic and execution details behind your work.</p>
      </header>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your strategic impact... (Minimum 300 words required)"
          className="w-full min-h-[500px] bg-zinc-950 border border-zinc-900 rounded-xl p-8 text-zinc-300 font-sans leading-relaxed focus:border-slate-500/50 outline-none transition-all resize-none"
        />
        
        {/* Real-time Status Bar */}
        <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-zinc-950/80 backdrop-blur px-4 py-2 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-mono uppercase tracking-widest",
              wordCount >= MIN_WORDS ? "text-emerald-500" : "text-zinc-500"
            )}>
              {wordCount} / {MIN_WORDS} Words
            </span>
            {wordCount >= MIN_WORDS ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <Info size={16} className="text-zinc-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs text-zinc-400 font-medium">Why 300 words?</p>
          <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tight">
            1Hub values tri thức over noise. Short updates belong on social networks. 
            Heritage requires depth, logic, and proof of execution.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button
          disabled={wordCount < MIN_WORDS}
          className={cn(
            "premium-button px-10 py-3",
            wordCount < MIN_WORDS && "opacity-20 grayscale pointer-events-none"
          )}
        >
          Publish to Heritage
        </button>
      </div>
    </div>
  )
}
