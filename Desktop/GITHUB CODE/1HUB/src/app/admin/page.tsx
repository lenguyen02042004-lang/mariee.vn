import React from 'react'
import { Users, Layers, TrendingUp, ShieldAlert, Activity } from 'lucide-react'

// Mock stats - to be replaced with real Supabase queries
const MOCK_STATS = [
  { label: 'Total Members', value: '1,284', delta: '+24 this week', icon: Users, trend: 'up' },
  { label: 'Active Projects', value: '342', delta: '+8 this week', icon: Layers, trend: 'up' },
  { label: 'Level-Up Events', value: '97', delta: 'past 30 days', icon: TrendingUp, trend: 'up' },
  { label: 'Dispute Flags', value: '5', delta: 'Require review', icon: ShieldAlert, trend: 'warn' },
]

const MOCK_RECENT_ACTIVITY = [
  { id: 1, event: 'Level Up', description: 'Marcus Vogt advanced from L4 → L3', time: '2 minutes ago', type: 'level' },
  { id: 2, event: 'Vote Cast', description: 'Sarah Chen (L2) voted on Aura Protocol Case Study', time: '8 minutes ago', type: 'vote' },
  { id: 3, event: 'Dispute Flag', description: 'Project "NexusPay" has conflicting contribution data', time: '1 hour ago', type: 'dispute' },
  { id: 4, event: 'Member Verified', description: 'Elena Belova verified as Core Member on Aura Protocol', time: '3 hours ago', type: 'verify' },
  { id: 5, event: 'Case Study Published', description: 'Alex Rivera published Heritage on ZK-Proof systems', time: '5 hours ago', type: 'publish' },
]

export default function AdminOverviewPage() {
  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-display font-bold">Ecosystem Overview</h2>
        <p className="text-sm text-zinc-500 mt-1">Real-time governance view of the 1Hub Master Network.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                <Icon size={16} className={stat.trend === 'warn' ? 'text-amber-500' : 'text-slate-400'} />
              </div>
              <div>
                <p className={`text-3xl font-display font-bold ${stat.trend === 'warn' ? 'text-amber-400' : 'text-zinc-100'}`}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">{stat.delta}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Activity Feed */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold">Live Activity Feed</h3>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />
        </div>
        <div className="divide-y divide-zinc-900">
          {MOCK_RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4">
              <div className="flex items-start gap-4">
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  item.type === 'dispute' ? 'bg-amber-500' :
                  item.type === 'level' ? 'bg-slate-400' :
                  item.type === 'vote' ? 'bg-emerald-500' : 'bg-zinc-600'
                }`} />
                <div>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">{item.event}</p>
                  <p className="text-sm text-zinc-300 mt-0.5">{item.description}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-700 whitespace-nowrap ml-8">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
