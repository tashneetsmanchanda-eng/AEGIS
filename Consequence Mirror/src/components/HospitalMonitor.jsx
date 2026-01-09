import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './HospitalMonitor.css'

/**
 * HospitalMonitor - Real-time hospital status visualization
 * Shows EKG-style pulse line that gets faster/irregular as readiness drops
 */
const HospitalMonitor = ({ hospitalMetrics, readinessScore, disasterType }) => {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const pulsePhaseRef = useRef(0)

  // Calculate pulse speed based on readiness score
  // Lower score = faster, more irregular pulse
  const getPulseSpeed = () => {
    if (readinessScore >= 80) return 0.02  // Slow, regular
    if (readinessScore >= 60) return 0.04  // Moderate
    if (readinessScore >= 40) return 0.06  // Fast
    return 0.1  // Very fast, irregular
  }

  const getIrregularity = () => {
    if (readinessScore >= 80) return 0.1  // Very regular
    if (readinessScore >= 60) return 0.2  // Slight irregularity
    if (readinessScore >= 40) return 0.4  // Moderate irregularity
    return 0.8  // Highly irregular (critical)
  }

  // Draw EKG-style pulse line
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    const speed = getPulseSpeed()
    const irregularity = getIrregularity()
    let phase = pulsePhaseRef.current

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = hospitalMetrics?.bed_occupancy >= 100 
        ? '#ff0000' 
        : hospitalMetrics?.bed_occupancy >= 80 
        ? '#ff8800' 
        : '#00ff00'
      ctx.lineWidth = 2
      ctx.beginPath()

      const centerY = height / 2
      const points = 200
      const step = width / points

      for (let i = 0; i <= points; i++) {
        const x = i * step
        const baseY = centerY
        
        // EKG pattern: baseline with spikes
        let y = baseY
        
        // Add irregularity based on readiness score
        const noise = (Math.random() - 0.5) * irregularity * 10
        
        // Create EKG spike pattern
        const spikePhase = (phase + i * 0.1) % (Math.PI * 2)
        if (spikePhase < 0.3) {
          // Spike up
          y = baseY - 20 - (spikePhase / 0.3) * 15 + noise
        } else if (spikePhase < 0.6) {
          // Spike down
          y = baseY + 10 + ((spikePhase - 0.3) / 0.3) * 5 + noise
        } else {
          // Baseline with slight variation
          y = baseY + noise
        }

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
      
      // Add glow effect
      ctx.shadowBlur = 10
      ctx.shadowColor = ctx.strokeStyle
      ctx.stroke()

      phase += speed
      pulsePhaseRef.current = phase

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [hospitalMetrics, readinessScore])

  const getStatusColor = () => {
    const occupancy = hospitalMetrics?.bed_occupancy || 0
    if (occupancy >= 100) return '#ff0000'
    if (occupancy >= 80) return '#ff8800'
    if (occupancy >= 60) return '#ffaa00'
    return '#00ff00'
  }

  const getIcon = () => {
    const level = hospitalMetrics?.triage_level || 'Standard'
    if (level === 'System Failure') return '🚨'
    if (level === 'Catastrophic') return '⚠️'
    if (level === 'Emergency') return '🏥'
    return '✅'
  }

  const isCritical = hospitalMetrics?.bed_occupancy >= 100

  return (
    <motion.div
      className={`hospital-monitor ${isCritical ? 'critical' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onAnimationComplete={() => {
        // Play digital ping sound when hospital metrics appear
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)
          
          oscillator.frequency.value = 800
          oscillator.type = 'sine'
          gainNode.gain.setValueAtTime(0, ctx.currentTime)
          gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01)
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
          
          oscillator.start()
          oscillator.stop(ctx.currentTime + 0.1)
        } catch (error) {
          // Silently fail if audio not available
        }
      }}
    >
      <div className="hospital-header">
        <div className="hospital-title">
          <span className="hospital-icon">{getIcon()}</span>
          <span>HOSPITAL STATUS</span>
        </div>
        <div className="hospital-specialty">
          {hospitalMetrics?.specialty || 'General Ward'}
        </div>
      </div>

      {/* EKG Pulse Line */}
      <div className="ekg-container">
        <canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="ekg-canvas"
        />
      </div>

      {/* Metrics Display */}
      <div className="hospital-metrics">
        <div className="metric-item">
          <div className="metric-label">
            <span className="medical-icon">🛏️</span> Bed Occupancy
          </div>
          <div className="metric-value" style={{ color: getStatusColor() }}>
            {hospitalMetrics?.bed_occupancy?.toFixed(1) || 0}%
          </div>
          <div className="metric-bar-container">
            <motion.div
              className="metric-bar"
              style={{ backgroundColor: getStatusColor() }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, hospitalMetrics?.bed_occupancy || 0)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">
            <span className="medical-icon">🚑</span> Critical Supplies
          </div>
          <div className="metric-value" style={{ color: getStatusColor() }}>
            {hospitalMetrics?.critical_supplies || 'Unknown'}
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">
            <span className="medical-icon">💨</span> Triage Level
          </div>
          <div className="metric-value" style={{ color: getStatusColor() }}>
            {hospitalMetrics?.triage_level || 'Standard'}
          </div>
        </div>

        {/* Disaster-specific metric */}
        {hospitalMetrics?.respiratory_ward_saturation && (
          <div className="metric-item specialty">
            <div className="metric-label">Respiratory Ward Saturation</div>
            <div className="metric-value" style={{ color: getStatusColor() }}>
              {hospitalMetrics.respiratory_ward_saturation.toFixed(1)}%
            </div>
          </div>
        )}

        {hospitalMetrics?.waterborne_disease_triage && (
          <div className="metric-item specialty">
            <div className="metric-label">Waterborne Disease Triage</div>
            <div className="metric-value" style={{ color: getStatusColor() }}>
              {hospitalMetrics.waterborne_disease_triage.toFixed(1)}%
            </div>
          </div>
        )}

        {hospitalMetrics?.trauma_unit_overflow && (
          <div className="metric-item specialty">
            <div className="metric-label">Trauma Unit Overflow</div>
            <div className="metric-value" style={{ color: getStatusColor() }}>
              {hospitalMetrics.trauma_unit_overflow.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default HospitalMonitor

