import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, ShieldAlert, Palette, Mail, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users & Audit', icon: Users },
  { href: '/admin/transparency', label: 'Transparency', icon: ShieldAlert },
  { href: '/admin/branding', label: 'Branding', icon: Palette },
  { href: '/admin/email', label: 'Email Service', icon: Mail },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 flex flex-col fixed top-0 left-0 h-full z-40">
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em]">Admin Console</span>
          </div>
          <h1 className="mt-2 text-lg font-display font-bold">1Hub Control</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all group"
            >
              <Icon size={16} className="group-hover:text-slate-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-600 hover:text-red-400 transition-all w-full">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
