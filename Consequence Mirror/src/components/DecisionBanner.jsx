import React from 'react'
import { motion } from 'framer-motion'
import './DecisionBanner.css'

/**
 * DecisionBanner - Dominant high-contrast banner showing system recommendation
 * Displays: "SYSTEM RECOMMENDATION: [ACTION]"
 * Color shifts instantly (Green → Yellow → Red) when slider moves
 */
const DecisionBanner = ({ recommendation, actionRequired, confidence, disasterType, delayDays }) => {
  // Dynamic Decision Thresholds: Change state based on intervention slider
  // If intervention_delay is 0, show 'OPTIMAL: PREVENTATIVE MONITORING'
  // If delay > 2 days, shift to 'CRITICAL: EMERGENCY MOBILIZATION REQUIRED'
  const getAction = () => {
    const delay = delayDays || 0
    
    // Dynamic thresholds based on intervention delay
    if (delay === 0) {
      return 'OPTIMAL: PREVENTATIVE MONITORING'
    } else if (delay > 2) {
      return 'CRITICAL: EMERGENCY MOBILIZATION REQUIRED'
    } else if (delay > 1) {
      return 'WARNING: PREPARE FOR EVACUATION'
    }
    
    // Use action_required from backend if available
    if (actionRequired) {
      return actionRequired
    }
    if (recommendation) {
      return recommendation
    }
    // Auto-generate based on confidence
    if (confidence >= 0.85) {
      return 'IMMEDIATE EVACUATION REQUIRED'
    } else if (confidence >= 0.70) {
      return 'PREPARE FOR EVACUATION'
    } else if (confidence >= 0.50) {
      return 'MONITOR CLOSELY'
    } else {
      return 'ALL CLEAR - NO IMMEDIATE ACTION'
    }
  }

  const action = getAction()
  const delay = delayDays || 0
  
  // Color shifts instantly based on intervention delay thresholds: Green → Yellow → Red
  // Red for critical (delay > 2 days or IMMEDIATE/MANDATORY), Yellow for warning, Green for optimal (delay = 0)
  const isCritical = delay > 2 || confidence >= 0.85 || action.includes('IMMEDIATE') || action.includes('REQUIRED') || action.includes('MANDATORY') || action.includes('CRITICAL')
  const isOptimal = delay === 0 || action.includes('OPTIMAL') || action.includes('PREVENTATIVE')
  const isMonitor = action.includes('MONITOR') || (confidence >= 0.50 && confidence < 0.70 && delay <= 1)
  const isWarning = action.includes('PREPARE') || action.includes('WARNING') || (confidence >= 0.70 && confidence < 0.85) || (delay > 1 && delay <= 2)
  const isAllClear = action.includes('ALL CLEAR') || action.includes('NO IMMEDIATE ACTION')
  
  // Determine color class: critical (red) > warning (yellow) > monitor (orange) > optimal/all-clear (green)
  const getColorClass = () => {
    if (isCritical) return 'critical'
    if (isWarning) return 'warning'
    if (isOptimal) return 'optimal'
    if (isMonitor) return 'monitor'
    if (isAllClear) return 'all-clear'
    return 'warning' // Default
  }

  return (
    <motion.div
      key={`${action}-${delayDays || 0}`} // Force re-render when delayDays changes for instant color shift
      className={`decision-banner ${getColorClass()}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }} // Faster transition for instant color shift
    >
      <div className="decision-banner-content">
        <div className="decision-label">SYSTEM RECOMMENDATION:</div>
        <motion.div
          className="decision-action"
          animate={isCritical ? {
            textShadow: [
              '0 0 20px #ff0000, 0 0 40px #ff0000',
              '0 0 30px #ff0000, 0 0 60px #ff0000',
              '0 0 20px #ff0000, 0 0 40px #ff0000'
            ]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isCritical ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          {action}
        </motion.div>
        {confidence !== undefined && (
          <div className="decision-confidence">
            Confidence: {(confidence * 100).toFixed(0)}%
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DecisionBanner
