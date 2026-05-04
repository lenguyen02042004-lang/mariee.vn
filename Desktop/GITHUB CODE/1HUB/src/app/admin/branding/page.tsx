'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'

export default function BrandingPage() {
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    appName: '1Hub',
    tagline: 'The Synergy Network',
    accentColor: '#94a3b8', // slate-400
    logoUrl: '',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h2 className="text-2xl font-display font-bold">Branding Configuration</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Customize the visual identity of the 1Hub platform. Changes apply globally.
        </p>
      </header>

      <div className="glass-card p-8 space-y-8">
        {/* App Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Application Name</label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => setConfig({ ...config, appName: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-3 text-zinc-100 font-display font-bold text-lg focus:border-slate-500/50 outline-none transition-colors"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Tagline / Slogan</label>
          <input
            type="text"
            value={config.tagline}
            onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-3 text-zinc-300 focus:border-slate-500/50 outline-none transition-colors text-sm"
          />
        </div>

        {/* Accent Color */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
            Primary Accent Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
              className="w-12 h-12 rounded-lg border border-zinc-800 bg-transparent cursor-pointer"
            />
            <div className="space-y-1">
              <p className="text-sm font-mono text-zinc-300">{config.accentColor.toUpperCase()}</p>
              <p className="text-[10px] text-zinc-600">Used for highlights, badges, and Rescuer indicators.</p>
            </div>
          </div>
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Logo URL</label>
          <input
            type="url"
            value={config.logoUrl}
            onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
            placeholder="https://cdn.1hub.app/logo.svg"
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-3 text-zinc-400 placeholder:text-zinc-700 focus:border-slate-500/50 outline-none transition-colors text-sm font-mono"
          />
        </div>

        {/* Save */}
        <div className="pt-4 border-t border-zinc-900 flex justify-end">
          <button
            onClick={handleSave}
            className="premium-button px-8 py-3 flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check size={16} />
                <span>Saved</span>
              </>
            ) : (
              <span>Apply Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
