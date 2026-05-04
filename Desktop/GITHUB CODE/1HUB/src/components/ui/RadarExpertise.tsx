'use client'

import React from 'react'

interface RadarProps {
  data: {
    label: string
    value: number // 0 to 100
  }[]
  size?: number
}

export const RadarExpertise: React.FC<RadarProps> = ({ data, size = 300 }) => {
  const center = size / 2
  const radius = (size / 2) * 0.8
  
  const angleStep = (Math.PI * 2) / data.length
  
  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2
    const x = center + radius * (d.value / 100) * Math.cos(angle)
    const y = center + radius * (d.value / 100) * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')

  const gridLevels = [25, 50, 75, 100]

  return (
    <div className="flex flex-col items-center gap-8">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid Circles */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={radius * (level / 100)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data Shape */}
        <polygon
          points={points}
          fill="rgba(212, 175, 55, 0.1)"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x = center + radius * (d.value / 100) * Math.cos(angle)
          const y = center + radius * (d.value / 100) * Math.sin(angle)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#D4AF37"
              className="shadow-[0_0_8px_#D4AF37]"
            />
          )
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2
          const labelRadius = radius + 30
          const x = center + labelRadius * Math.cos(angle)
          const y = center + labelRadius * Math.sin(angle)
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              className="uppercase tracking-widest"
            >
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
