import React from 'react'
import { ShieldCheck, ChevronDown } from 'lucide-react'

const MOCK_USERS = [
  { id: 'u1', name: 'Alex Rivera', level: 2, score: 720, joinedAt: '2025-11-01', voteHistory: 18, levelHistory: ['L7 → L6', 'L6 → L4', 'L4 → L2'] },
  { id: 'u2', name: 'Sarah Chen', level: 2, score: 680, joinedAt: '2025-12-15', voteHistory: 22, levelHistory: ['L7 → L5', 'L5 → L2'] },
  { id: 'u3', name: 'Marcus Vogt', level: 3, score: 310, joinedAt: '2026-01-20', voteHistory: 9, levelHistory: ['L7 → L4', 'L4 → L3'] },
  { id: 'u4', name: 'Elena Belova', level: 5, score: 58, joinedAt: '2026-03-01', voteHistory: 3, levelHistory: ['L7 → L5'] },
]

export default function UsersAuditPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-display font-bold">Users & Audit Log</h2>
        <p className="text-sm text-zinc-500 mt-1">Full transparency on all reputation events. Every vote, every level change is permanent.</p>
      </header>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900">
                {['Member', 'Level', 'Score', 'Votes Cast', 'Level History', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0" />
                      <span className="text-zinc-200 font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                      L{user.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-300 text-xs">{user.score}</td>
                  <td className="px-6 py-4 font-mono text-zinc-400 text-xs">{user.voteHistory}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {user.levelHistory.map((h, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/30 border border-slate-800/30 text-slate-400 font-mono">
                          {h}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500 font-mono">{user.joinedAt}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-slate-400 uppercase font-mono tracking-tighter transition-colors">
                      <ShieldCheck size={12} />
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
