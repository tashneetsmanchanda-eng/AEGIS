import { useState } from 'react';
import { motion } from 'motion/react';
import { Droplets, Wind, Waves, Activity, Droplet, Zap, AlertCircle, Bug } from 'lucide-react';
import type { SystemType, LocationData } from '../App';

interface FateWheelProps {
  onSystemClick: (system: SystemType) => void;
  location: LocationData;
}

const SYSTEMS = [
  { id: 'flood' as SystemType, label: 'Flood', icon: Droplets, color: '#00a8ff' }, // Electric Blue
  { id: 'cyclone' as SystemType, label: 'Cyclone', icon: Wind, color: '#00d9ff' }, // Cyan/Teal
  { id: 'tsunami' as SystemType, label: 'Tsunami', icon: Waves, color: '#0066cc' }, // Deep Ocean Blue
  { id: 'respiratory' as SystemType, label: 'Respiratory', icon: Activity, color: '#00ffcc' }, // Cool Mint
  { id: 'diarrhea' as SystemType, label: 'Diarrhea', icon: Droplet, color: '#ffaa00' }, // Amber
  { id: 'cholera' as SystemType, label: 'Cholera', icon: Zap, color: '#00ff41' }, // Acid Green
  { id: 'hepatitis' as SystemType, label: 'Hepatitis', icon: AlertCircle, color: '#ffcc00' }, // Warm Gold
  { id: 'leptospirosis' as SystemType, label: 'Leptospirosis', icon: Bug, color: '#aa55ff' }, // Violet
];

export function FateWheel({ onSystemClick, location }: FateWheelProps) {
  // Single source of truth for hover state - ALL nodes use this
  const [hoveredSystem, setHoveredSystem] = useState<SystemType | null>(null);

  const radius = 252; // Reduced from 280 (10% reduction: 280 * 0.9 = 252)
  const centerX = 360; // Scaled proportionally: 400 * 0.9 = 360
  const centerY = 270; // Scaled proportionally: 300 * 0.9 = 270

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Scale Wrapper - 12.5% reduction for visual balance */}
      <div style={{ transform: 'scale(0.875)', transformOrigin: 'center center' }}>
        {/* Rotating Container */}
        <motion.div
          className="relative"
          style={{ width: centerX * 2, height: centerY * 2 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 100,
            ease: 'linear',
            repeat: Infinity
          }}
        >
        {/* System Nodes */}
        {SYSTEMS.map((system, index) => {
          const angle = (index * 360) / SYSTEMS.length - 90;
          const radian = (angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(radian);
          const y = centerY + radius * Math.sin(radian);

          const Icon = system.icon;
          // Compute hover state from single source of truth - NO per-node logic
          const isHovered = hoveredSystem === system.id;

          return (
            <div key={system.id}>
              {/* Radial Line */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${centerX * 2} ${centerY * 2}`}
              >
                <defs>
                  {/* Linear gradient - ALL systems use identical hover behavior */}
                  <linearGradient 
                    id={`line-gradient-${system.id}`} 
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    gradientUnits="userSpaceOnUse"
                  >
                    {/* Hovered: Bright glow (0.85, 0.80, 0.50, 0) - IDENTICAL for ALL systems */}
                    <stop 
                      offset="0%" 
                      stopColor={isHovered ? system.color : 'rgba(148, 163, 184, 0.75)'} 
                      stopOpacity={isHovered ? 0.85 : 0.75} 
                    />
                    <stop 
                      offset="15%" 
                      stopColor={isHovered ? system.color : 'rgba(148, 163, 184, 0.70)'} 
                      stopOpacity={isHovered ? 0.80 : 0.70} 
                    />
                    <stop 
                      offset="70%" 
                      stopColor={isHovered ? system.color : 'rgba(148, 163, 184, 0.30)'} 
                      stopOpacity={isHovered ? 0.50 : 0.30} 
                    />
                    <stop 
                      offset="100%" 
                      stopColor={isHovered ? system.color : 'rgba(148, 163, 184, 0)'} 
                      stopOpacity="0" 
                    />
                  </linearGradient>
                  
                  {/* Glow filter - IDENTICAL for ALL hovered lines */}
                  <filter id={`glow-${system.id}`}>
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Radial line - brightness depends ONLY on isHovered (from hoveredSystem state) */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={`url(#line-gradient-${system.id})`}
                  strokeWidth={isHovered ? '2' : '1'}
                  filter={isHovered ? `url(#glow-${system.id})` : 'none'}
                  style={{
                    transition: 'stroke-width 175ms ease-in-out, filter 175ms ease-in-out'
                  }}
                />
                
                {/* Energy Particles on Hover - Alternating brightness with smooth deceleration */}
                {isHovered && (
                  <>
                    {/* Bright Pulse - Alternates with soft pulse */}
                    <motion.circle
                      r="4"
                      fill={system.color}
                      initial={{ 
                        cx: centerX, 
                        cy: centerY,
                        opacity: 0.875, // Bright: 87.5% opacity (within 85-90% range)
                      }}
                      animate={{
                        cx: x,
                        cy: y,
                        opacity: [0.875, 0.875, 0], // Fade out near the end
                      }}
                      transition={{
                        duration: 1.0, // 1000ms total travel time (within 900-1100ms range)
                        ease: [0, 0, 0.17, 1], // Ease-out for smooth deceleration (starts fast, slows near node)
                        repeat: Infinity,
                        repeatDelay: 1.0, // Wait one cycle (allows soft pulse in between)
                        times: [0, 0.85, 1], // Fade starts at 85% of travel
                      }}
                      style={{
                        filter: `drop-shadow(0 0 10px ${system.color})`, // +25% glow radius (8px -> 10px)
                      }}
                    />
                    {/* Soft Pulse - Alternates with bright pulse */}
                    <motion.circle
                      r="4"
                      fill={system.color}
                      initial={{ 
                        cx: centerX, 
                        cy: centerY,
                        opacity: 0.575, // Soft: 57.5% opacity (within 55-60% range)
                      }}
                      animate={{
                        cx: x,
                        cy: y,
                        opacity: [0.575, 0.575, 0], // Fade out near the end
                      }}
                      transition={{
                        duration: 1.0, // 1000ms total travel time
                        ease: [0, 0, 0.17, 1], // Ease-out for smooth deceleration
                        repeat: Infinity,
                        repeatDelay: 1.0, // Wait one cycle (allows bright pulse in between)
                        delay: 1.0, // Starts after bright pulse completes (perfect alternation: bright, soft, bright, soft...)
                        times: [0, 0.85, 1], // Fade starts at 85% of travel
                      }}
                      style={{
                        filter: `drop-shadow(0 0 8px ${system.color})`, // Baseline glow
                      }}
                    />
                  </>
                )}
              </svg>

              {/* Node - Further reduced for calmer feel */}
              <motion.button
                className="absolute rounded-full backdrop-blur-sm border-2 transition-all cursor-pointer"
                style={{
                  padding: '20px', // Further reduced from 22px by ~9% (total ~17% from original)
                  left: x - 32, // Adjusted for new button size: (20*2 + 24) / 2 = 32
                  top: y - 32,
                  minWidth: '64px', // Ensures hitbox stays ≥44px (64px > 44px)
                  minHeight: '64px',
                  borderColor: isHovered ? system.color : 'rgba(148, 163, 184, 0.3)',
                  backgroundColor: 'transparent',
                  boxShadow: isHovered 
                    ? `0 0 30px ${system.color}60, 0 0 60px ${system.color}30` 
                    : 'none',
                }}
                onMouseEnter={() => setHoveredSystem(system.id)}
                onMouseLeave={() => setHoveredSystem(null)}
                onClick={() => onSystemClick(system.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: -360 }}
                transition={{
                  rotate: {
                    duration: 100,
                    ease: 'linear',
                    repeat: Infinity
                  }
                }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ 
                    color: system.color,
                    filter: isHovered ? `drop-shadow(0 0 12px ${system.color})` : 'none'
                  }}
                />
              </motion.button>

              {/* Label */}
              <motion.div
                className="absolute text-sm font-medium pointer-events-none transition-opacity duration-300"
                style={{
                  left: x + (Math.cos(radian) * 60) - 40,
                  top: y + (Math.sin(radian) * 60) - 10,
                  color: '#94a3b8',
                  textAlign: 'center',
                  width: '80px',
                  opacity: isHovered ? 1 : 0.7
                }}
                animate={{ rotate: -360 }}
                transition={{
                  duration: 100,
                  ease: 'linear',
                  repeat: Infinity
                }}
              >
                {system.label}
              </motion.div>
            </div>
          );
        })}

        {/* Center Point */}
        <div 
          className="absolute rounded-full bg-slate-800 border-2 border-slate-600"
          style={{
            left: centerX - 8,
            top: centerY - 8,
            width: 16,
            height: 16,
          }}
        />
      </motion.div>
      </div>
    </div>
  );
}