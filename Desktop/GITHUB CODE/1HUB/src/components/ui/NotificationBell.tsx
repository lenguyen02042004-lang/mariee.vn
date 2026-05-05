'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Handshake, Award, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }

      // Real-time subscription
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev].slice(0, 10))
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async () => {
    if (unreadCount === 0) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('profile_id', user.id)
    
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'synergy_proposal': return <Handshake size={14} className="text-accent" />
      case 'vote': return <Award size={14} className="text-amber-400" />
      case 'handshake_accepted': return <CheckCircle2 size={14} className="text-emerald-400" />
      default: return <Bell size={14} />
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!isOpen) markAsRead(); }}
        className="relative p-2 text-zinc-500 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 z-50 glass-card border-white/10 p-2 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Pulse Notifications</span>
                {unreadCount > 0 && <span className="text-[9px] font-mono text-accent">{unreadCount} New</span>}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                    The void is silent.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link 
                      key={n.id} 
                      href={n.link || '#'} 
                      onClick={() => setIsOpen(false)}
                      className={`block p-4 hover:bg-white/[0.03] transition-colors border-b border-white/[0.02] last:border-0 ${!n.is_read ? 'bg-accent/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="space-y-1">
                          <p className="text-xs text-white font-medium">{n.title}</p>
                          <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{n.message}</p>
                          <p className="text-[8px] font-mono text-zinc-700 uppercase">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <Link 
                href="/dashboard/notifications" 
                className="block py-3 text-center text-[9px] font-mono text-zinc-600 hover:text-white uppercase tracking-widest border-t border-white/5 transition-colors"
              >
                View All Records
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
