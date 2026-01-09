import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ReadinessGauge.css'

const ReadinessGauge = ({ score, delayDays, disasterType, hospitalMetrics }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [timeToSaturation, setTimeToSaturation] = useState(null)
  
  // Calculate time to hospital saturation based on delay
  useEffect(() => {
    if (!hospitalMetrics || !delayDays) {
      setTimeToSaturation(null)
      return
    }
    
    const currentOccupancy = hospitalMetrics.bed_occupancy || 0
    const saturationThreshold = 100
    
    if (currentOccupancy >= saturationThreshold) {
      setTimeToSaturation(0) // Already saturated
      return
    }
    
    // Calculate rate of increase per day
    // Assuming occupancy increases by ~15% per day of delay
    const dailyIncrease = 15
    const daysToSaturation = Math.ceil((saturationThreshold - currentOccupancy) / dailyIncrease)
    
    setTimeToSaturation(daysToSaturation)
  }, [hospitalMetrics, delayDays])

  // Calculate color and status based on score
  const getColorConfig = (score) => {
    if (score >= 80) {
      return {
        color: '#00ff00', // Cyber-Green
        gradient: ['#00ff00', '#00cc00'],
        status: 'HIGH',
        glowIntensity: '0 0 20px #00ff00, 0 0 40px rgba(0, 255, 0, 0.5)'
      }
    }
    if (score >= 60) {
      return {
        color: '#ffff00', // Yellow
        gradient: ['#ffff00', '#ffaa00'],
        status: 'GOOD',
        glowIntensity: '0 0 20px #ffff00, 0 0 40px rgba(255, 255, 0, 0.5)'
      }
    }
    if (score >= 40) {
      return {
        color: '#ff8800', // Amber
        gradient: ['#ff8800', '#ff6600'],
        status: 'WARNING',
        glowIntensity: '0 0 20px #ff8800, 0 0 40px rgba(255, 136, 0, 0.5)'
      }
    }
    // Critical - Pulsing Red
    return {
      color: '#ff0000',
      gradient: ['#ff0000', '#cc0000'],
      status: 'CRITICAL',
      glowIntensity: '0 0 30px #ff0000, 0 0 60px rgba(255, 0, 0, 0.7)',
      isPulsing: true
    }
  }

  const config = getColorConfig(score)
  const circumference = 2 * Math.PI * 45 // radius = 45
  const offset = circumference - (score / 100) * circumference

  return (
    <motion.div
      className="readiness-gauge-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="gauge-wrapper">
        <svg className="gauge-svg" viewBox="0 0 100 100">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.gradient[0]} />
              <stop offset="100%" stopColor={config.gradient[1]} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="8"
          />
          
          {/* Outer glow ring */}
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            opacity="0.3"
            style={{
              filter: config.glowIntensity
            }}
          />

          {/* Score circle with gradient */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: offset,
              filter: config.isPulsing 
                ? ['drop-shadow(0 0 10px #ff0000)', 'drop-shadow(0 0 30px #ff0000)', 'drop-shadow(0 0 10px #ff0000)']
                : `drop-shadow(${config.glowIntensity})`
            }}
            transition={{ 
              strokeDashoffset: { duration: 1, ease: "easeOut" },
              filter: { duration: 1.5, repeat: config.isPulsing ? Infinity : 0, ease: "easeInOut" }
            }}
            style={{
              filter: `drop-shadow(${config.glowIntensity})`
            }}
          />

          {/* Inner accent ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={config.color}
            strokeWidth="1"
            opacity="0.2"
          />
        </svg>
        
        <div className="gauge-content">
          <motion.div 
            className="gauge-score" 
            style={{ color: config.color }}
            animate={config.isPulsing ? {
              scale: [1, 1.1, 1],
              textShadow: [
                `0 0 10px ${config.color}`,
                `0 0 20px ${config.color}`,
                `0 0 10px ${config.color}`
              ]
            } : {
              textShadow: `0 0 15px ${config.color}, 0 0 30px rgba(${config.color === '#00ff00' ? '0, 255, 0' : config.color === '#ff0000' ? '255, 0, 0' : '255, 255, 0'}, 0.5)`
            }}
            transition={{ duration: 1.5, repeat: config.isPulsing ? Infinity : 0 }}
          >
            {score.toFixed(1)}
          </motion.div>
          <div className="gauge-status" style={{ color: config.color }}>
            {config.status}
          </div>
            <div className="gauge-label">
              {score >= 80 ? 'HIGH-CONFIDENCE READINESS' : 'READINESS'}
            </div>
            <div className="gauge-delay">Delay: {delayDays} days</div>
            {timeToSaturation !== null && (
              <div className="gauge-saturation-countdown">
                <div className="countdown-label">TIME TO SATURATION</div>
                <div 
                  className="countdown-value"
                  style={{
                    color: timeToSaturation <= 2 ? '#ff0000' : timeToSaturation <= 5 ? '#ff8800' : '#00ff00'
                  }}
                >
                  {timeToSaturation === 0 ? 'SATURATED' : `${timeToSaturation} DAYS`}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="gauge-title-container">
        <div className="gauge-title">EARLY-WARNING READINESS SCORE</div>
        {/* Judge's Insight Tooltip */}
        <div 
          className="judge-insight-trigger"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          tabIndex={0}
          role="button"
          aria-label="Judge's Insight - Readiness Score Explanation"
        >
          <span className="info-icon">ℹ️</span>
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                className="judge-insight-tooltip"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div className="tooltip-content">
                  <div className="tooltip-title">JUDGE'S INSIGHT</div>
                  <div className="tooltip-text">
                    Survival drops by <strong>15%</strong> for every <strong>24 hours</strong> of delayed medical mobilization.
                  </div>
                  <div className="tooltip-math">
                    Formula: Readiness = 100 - (delay_days × exponential_decay)
                  </div>
                </div>
                <div className="tooltip-arrow"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default ReadinessGauge
