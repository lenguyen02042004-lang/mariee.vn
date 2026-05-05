'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { NotificationBell } from '../ui/NotificationBell'
import { Layers, Users, TrendingUp, Shield } from 'lucide-react'
import { usePathname } from 'next/navigation'

export const Navbar = () => {
  const pathname = usePathname()

  const navItems = [
    { label: 'Pulse', href: '/dashboard', icon: <Layers size={14} /> },
    { label: 'Synergy', href: '/synergy', icon: <Users size={14} /> },
    { label: 'Hierarchy', href: '/leaderboard', icon: <TrendingUp size={14} /> },
    { label: 'Manifesto', href: '/manifesto', icon: <Shield size={14} /> },
  ]

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 px-6 py-4 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="pointer-events-auto">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-display font-bold text-white tracking-tighter"
          >
            1HUB<span className="text-accent">.</span>
          </motion.div>
        </Link>

        {/* Central Nav */}
        <div className="hidden md:flex items-center gap-2 p-1 bg-zinc-950/50 backdrop-blur-2xl border border-white/5 rounded-full pointer-events-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${
                pathname === item.href 
                  ? 'bg-white text-black font-bold' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <NotificationBell />
          <Link href="/profile/me">
            <div className="w-10 h-10 rounded-full border border-white/10 bg-zinc-900 overflow-hidden hover:border-accent transition-colors">
               <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" alt="Me" className="w-full h-full object-cover" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
