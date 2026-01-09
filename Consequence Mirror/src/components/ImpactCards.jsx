import React from 'react'
import { motion } from 'framer-motion'
import './ImpactCards.css'

/**
 * ImpactCards - Visual Impact Cards showing key metrics
 * Card 1: Displacement (24-Hour projection)
 * Card 2: Trauma Load (Progress Bar)
 * Card 3: Water Safety (Warning icon if probability > 0.5)
 */
const ImpactCards = ({ consequencesData }) => {
  if (!consequencesData || !consequencesData.metrics) {
    return null
  }

  const { displaced_households, hospital_overflow_rate, water_contamination_prob } = consequencesData.metrics
  
  // Get 24-hour projections (index 2)
  const displacement24h = displaced_households?.[2] || 0
  const traumaLoad24h = (hospital_overflow_rate?.[2] || 0) * 100 // Convert to percentage
  const waterContamination24h = (water_contamination_prob?.[2] || 0) * 100 // Convert to percentage
  
  const isWaterUnsafe = waterContamination24h > 50

  return (
    <div className="impact-cards-container">
      {/* Card 1: Displacement */}
      <motion.div
        className="impact-card displacement-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="impact-card-icon">👥</div>
        <div className="impact-card-label">Displacement</div>
        <div className="impact-card-value">
          {displacement24h.toLocaleString('en-IN')}
        </div>
        <div className="impact-card-subtitle">24-Hour Projection</div>
      </motion.div>

      {/* Card 2: Trauma Load */}
      <motion.div
        className="impact-card trauma-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="impact-card-icon">🏥</div>
        <div className="impact-card-label">Trauma Load</div>
        <div className="trauma-progress-container">
          <div className="trauma-progress-bar">
            <motion.div
              className="trauma-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, traumaLoad24h)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                backgroundColor: traumaLoad24h > 80 ? '#ff0000' : traumaLoad24h > 50 ? '#ffaa00' : '#00ff00'
              }}
            />
          </div>
          <div className="trauma-progress-value">
            {traumaLoad24h.toFixed(1)}% Capacity
          </div>
        </div>
      </motion.div>

      {/* Card 3: Water Safety */}
      <motion.div
        className={`impact-card water-card ${isWaterUnsafe ? 'unsafe' : 'safe'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="impact-card-icon">
          {isWaterUnsafe ? '⚠️' : '✅'}
        </div>
        <div className="impact-card-label">Water Safety</div>
        <div className="water-probability">
          {waterContamination24h.toFixed(1)}% Contamination Risk
        </div>
        {isWaterUnsafe && (
          <div className="water-warning">⚠️ Unsafe for Consumption</div>
        )}
      </motion.div>
    </div>
  )
}

export default ImpactCards




