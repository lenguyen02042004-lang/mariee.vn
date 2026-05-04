import React from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'

const EMAIL_TEMPLATES = [
  { id: 'verify', name: 'Account Verification', description: 'Sent when a new member registers via Magic Link.', active: true },
  { id: 'level_up', name: 'Level Up Notification', description: 'Sent automatically when a member advances to a new level.', active: true },
  { id: 'weekly', name: 'Weekly Heritage Report', description: 'Sent every Monday with ecosystem metrics and new Case Studies.', active: false },
  { id: 'vote_received', name: 'Vote Received Alert', description: 'Notifies a member when their Case Study receives a vote.', active: true },
]

export default function EmailServicePage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-display font-bold">Email Service</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Automated email pipelines powered by Resend. All transactional emails are queued and logged.
        </p>
      </header>

      {/* Resend Connection Status */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-slate-400" />
          <div>
            <p className="text-sm font-medium text-zinc-100">Resend API</p>
            <p className="text-[10px] font-mono text-zinc-500">RESEND_API_KEY configured via environment variable</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-900/40">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase">Connected</span>
        </div>
      </div>

      {/* Email Templates */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-900">
          <h3 className="text-sm font-semibold">Automated Email Pipelines</h3>
        </div>
        <div className="divide-y divide-zinc-900">
          {EMAIL_TEMPLATES.map((template) => (
            <div key={template.id} className="px-6 py-5 flex items-center justify-between hover:bg-zinc-900/20 transition-colors">
              <div className="space-y-1">
                <p className="text-sm text-zinc-200 font-medium">{template.name}</p>
                <p className="text-[11px] text-zinc-500">{template.description}</p>
              </div>
              <div className="flex items-center gap-4 ml-8">
                <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-tighter ${
                  template.active ? 'text-emerald-400' : 'text-zinc-600'
                }`}>
                  <CheckCircle2 size={12} />
                  {template.active ? 'Active' : 'Inactive'}
                </span>
                <button className="text-[10px] text-zinc-600 hover:text-slate-400 font-mono uppercase transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Note for setup */}
      <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">📋 Setup Note</p>
        <p className="text-xs text-zinc-500">
          Add <code className="text-slate-300 bg-zinc-900 px-1 py-0.5 rounded">RESEND_API_KEY=re_xxxx</code> and{' '}
          <code className="text-slate-300 bg-zinc-900 px-1 py-0.5 rounded">FROM_EMAIL=noreply@1hub.app</code> to your{' '}
          <code className="text-slate-300 bg-zinc-900 px-1 py-0.5 rounded">.env.local</code> file to activate email delivery.
        </p>
      </div>
    </div>
  )
}
