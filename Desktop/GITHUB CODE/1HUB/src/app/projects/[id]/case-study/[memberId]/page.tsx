import React from 'react'
import { ArrowLeft, Clock, ShieldCheck, Award } from 'lucide-react'
import Link from 'next/link'
import { VoteButton } from '@/components/project/VoteButton'

// Mock Data for Case Study Visualization
const MOCK_CASE_STUDY = {
  id: 'cs_1',
  projectId: 'p_1',
  projectTitle: "Aura: Decentralized Design Protocol",
  authorName: "Marcus Vogt",
  authorRole: "Rescuer",
  authorLevel: 3,
  publishedAt: "2026-04-12",
  wordCount: 1240,
  content: `
    ## The Problem: The "Final_Final_v2" Nightmare
    In traditional design workflows, versioning is a mess of naming conventions and centralized servers. For Aura, we needed a way to prove that a specific design asset existed at a specific point in time without relying on a single corporate entity.
    
    ## The Solution: ZK-Proofs for Pixels
    My core contribution was the implementation of a Zero-Knowledge Proof (ZKP) generator that hashes pixel data directly into a Merkle tree. This allows designers to prove ownership and version integrity without revealing the actual design until it's ready for handover.
    
    ## Technical Implementation
    The generator was built using Rust and compiled to WebAssembly (Wasm) for high-performance browser execution. I optimized the hashing algorithm to handle large 4K Figma exports in under 200ms...
    
    [... This content would be 1000+ words in a real scenario ...]
  `
}

export default function CaseStudyPage({ params }: { params: { id: string, memberId: string } }) {
  // Logic: In a real app, we'd fetch data here
  const { authorLevel } = MOCK_CASE_STUDY;
  
  // Current user mock (e.g., viewing as an L1 Master)
  const currentUser = {
    level: 1,
    weight: 10
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-slate-400/30">
      <nav className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/projects/${params.id}`} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Project Heritage</span>
          </Link>
          <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-slate-400" />
             <span className="text-[10px] font-mono text-zinc-500 uppercase">Identity Verified</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        {/* Meta Header */}
        <header className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">Case Study: {MOCK_CASE_STUDY.authorRole} Impact</h4>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-[1.1] tracking-tight">
              Scaling Decentralized Hashing for Aura Protocol
            </h1>
          </div>

          <div className="flex items-center justify-between border-y border-zinc-900 py-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <Award size={20} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{MOCK_CASE_STUDY.authorName}</p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Level {MOCK_CASE_STUDY.authorLevel} Professional</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-zinc-500 font-mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{MOCK_CASE_STUDY.publishedAt}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">{MOCK_CASE_STUDY.wordCount}</span>
                <span>Words</span>
              </div>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="prose prose-invert prose-zinc max-w-none space-y-8">
          <div className="text-zinc-300 text-lg leading-relaxed font-sans space-y-6">
            {/* Real content would be parsed from MD or JSON */}
            <h2 className="text-2xl font-display font-semibold text-white pt-4">The Challenge</h2>
            <p>
              In traditional design workflows, versioning is a mess of naming conventions and centralized servers. For Aura, we needed a way to prove that a specific design asset existed at a specific point in time without relying on a single corporate entity.
            </p>
            
            <h2 className="text-2xl font-display font-semibold text-white pt-4">The Strategic Solution</h2>
            <p>
              My core contribution was the implementation of a Zero-Knowledge Proof (ZKP) generator that hashes pixel data directly into a Merkle tree. This allows designers to prove ownership and version integrity without revealing the actual design until it's ready for handover.
            </p>
            
            <blockquote className="border-l-2 border-slate-400 pl-6 my-8 italic text-zinc-400">
              "Verification over Decoration. We build for the long term, ensuring every pixel has a provable heritage."
            </blockquote>

            <p>
              The generator was built using Rust and compiled to WebAssembly (Wasm) for high-performance browser execution. I optimized the hashing algorithm to handle large 4K Figma exports in under 200ms...
            </p>
          </div>
        </article>

        {/* Voting Action Section */}
        <section className="pt-20 border-t border-zinc-900 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Verify this contribution</h3>
            <p className="text-sm text-zinc-500">As an L{currentUser.level} Master, your vote holds significant weight.</p>
          </div>
          
          <div className="flex justify-center">
            <VoteButton 
              voterLevel={currentUser.level} 
              voterWeight={currentUser.weight} 
              caseStudyId={MOCK_CASE_STUDY.id}
            />
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-20 border-t border-zinc-900 opacity-30 text-[10px] font-mono uppercase tracking-[0.3em]">
        End of Case Study. Heritage Verified by 1Hub.
      </footer>
    </div>
  )
}
