import React from 'react'
import { SEED_PROJECTS } from '@/lib/mock-data'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Search } from 'lucide-react'

export default function ProjectsListingPage() {
  const projects = Object.values(SEED_PROJECTS)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-slate-400/30">
      <nav className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Back to Hub</span>
          </Link>
          <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
             <input 
              type="text" 
              placeholder="Filter by tech, impact, or master..."
              className="bg-zinc-900 border border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 w-64 transition-all"
             />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-display font-bold tracking-tight">Verified Heritage.</h1>
          <p className="text-zinc-500 max-w-2xl">
            Khám phá các di sản thi công đã được xác thực bởi cộng đồng chuyên gia 1Hub. Mỗi dự án là một minh chứng cho năng lực thực tế.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className="group block glass-card p-8 space-y-6 hover:border-slate-500/30 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{project.industry}</span>
                  <span className={`w-2 h-2 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                </div>
                <h3 className="text-xl font-bold group-hover:text-slate-400 transition-colors leading-tight">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-zinc-600 uppercase">Impact Score</p>
                  <p className="text-lg font-display font-bold text-zinc-300">{project.impactPoints}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                  <ChevronRight size={14} className="text-zinc-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
