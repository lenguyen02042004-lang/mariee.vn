'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface Node {
  id: string
  name: string
  role: string
  x: number
  y: number
  level: number
}

interface Edge {
  from: string
  to: string
}

const NODES: Node[] = [
  { id: 'center', name: 'You', role: 'Master', x: 200, y: 200, level: 7 },
  { id: 'n1', name: 'Thorne', role: 'Arch', x: 100, y: 100, level: 5 },
  { id: 'n2', name: 'Elena', role: 'Art', x: 300, y: 80, level: 6 },
  { id: 'n3', name: 'Kenji', role: 'Tech', x: 350, y: 250, level: 4 },
  { id: 'n4', name: 'Sarah', role: 'ESG', x: 120, y: 320, level: 5 },
  { id: 'n5', name: 'Marcus', role: 'Legal', x: 280, y: 350, level: 3 },
]

const EDGES: Edge[] = [
  { from: 'center', to: 'n1' },
  { from: 'center', to: 'n2' },
  { from: 'center', to: 'n3' },
  { from: 'center', to: 'n4' },
  { from: 'center', to: 'n5' },
  { from: 'n1', to: 'n2' },
  { from: 'n3', to: 'n5' },
]

export const SynergyGraph: React.FC = () => {
  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto group">
      <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
        {/* Connection Lines (Edges) */}
        {EDGES.map((edge, i) => {
          const fromNode = NODES.find(n => n.id === edge.from)!
          const toNode = NODES.find(n => n.id === edge.to)!
          return (
            <motion.line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="white"
              strokeWidth="0.5"
              strokeOpacity="0.1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.1 }}
              transition={{ duration: 2, delay: i * 0.2 }}
            />
          )
        })}

        {/* Nodes */}
        {NODES.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: i * 0.1 }}
          >
            {/* Outer Glow */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.id === 'center' ? 12 : 8}
              fill={node.id === 'center' ? 'white' : 'currentColor'}
              className={node.id === 'center' ? 'text-white' : 'text-zinc-600'}
              fillOpacity="0.05"
            />
            {/* Core Node */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.id === 'center' ? 4 : 3}
              fill={node.id === 'center' ? 'white' : 'currentColor'}
              className={`${node.id === 'center' ? 'text-white shadow-[0_0_10px_white]' : 'text-zinc-700'} transition-colors duration-500`}
            />
            
            {/* Label */}
            <text
              x={node.x}
              y={node.y + (node.id === 'center' ? 25 : 20)}
              textAnchor="middle"
              className="text-[8px] font-mono uppercase tracking-widest fill-zinc-500"
              style={{ pointerEvents: 'none' }}
            >
              {node.name}
            </text>
          </motion.g>
        ))}
      </svg>
      
      {/* Center Label Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] mt-[340px]">
            Connection Network
         </div>
      </div>
    </div>
  )
}
