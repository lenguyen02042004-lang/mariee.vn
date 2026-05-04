import React from 'react'
import { AlertTriangle, Eye } from 'lucide-react'

const DISPUTED_PROJECTS = [
  {
    id: 'p1',
    title: 'NexusPay Gateway',
    flag: 'Parallel Data Streams',
    owner: 'Jordan Kim',
    members: [
      { name: 'Taylor Reyes', ownerClaim: '20%', memberClaim: '65%' },
      { name: 'Sam Okafor', ownerClaim: '10%', memberClaim: '10%' },
    ],
  },
  {
    id: 'p2',
    title: 'VaultChain Auth',
    flag: 'Dispute Note',
    owner: 'Priya Nair',
    members: [
      { name: 'Alex Morrow', ownerClaim: '40%', memberClaim: '40%' },
      { name: 'Chris Volta', ownerClaim: '5%', memberClaim: '30%' },
    ],
  },
]

export default function TransparencyPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-display font-bold">Transparency Monitor</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Projects with conflicting contribution data. 1Hub is the Witness — not the Judge. All data is recorded transparently.
        </p>
      </header>

      <div className="space-y-4">
        {DISPUTED_PROJECTS.map((project) => (
          <div key={project.id} className="glass-card p-6 space-y-6 border-l-2 border-amber-700/50">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{project.title}</h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                    Owner: {project.owner} &nbsp;·&nbsp; Flag: {project.flag}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-slate-400 uppercase tracking-widest transition-colors">
                <Eye size={12} />
                View Project
              </button>
            </div>

            {/* Parallel Data Streams — The Record-Only Philosophy */}
            <div className="space-y-3">
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Contribution Claims (Parallel Record)</p>
              {project.members.map((m) => (
                <div key={m.name} className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <span className="text-sm text-zinc-300">{m.name}</span>
                  <div className="text-center">
                    <p className="text-[9px] font-mono text-zinc-600 uppercase">Owner's Record</p>
                    <p className="text-sm font-mono text-zinc-300 mt-0.5">{m.ownerClaim}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-mono text-zinc-600 uppercase">Member's Record</p>
                    <p className={`text-sm font-mono mt-0.5 ${m.ownerClaim !== m.memberClaim ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {m.memberClaim}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
