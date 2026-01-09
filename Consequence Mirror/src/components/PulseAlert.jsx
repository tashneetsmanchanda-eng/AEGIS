import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PulseAlert.css'

/**
 * Pulse Alert System - Critical Action Required Overlay
 * Triggers when readiness score drops below 50
 */
const PulseAlert = ({ readinessScore, disasterType, isVisible }) => {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })

  // Get action items based on disaster type
  const getActionItems = (disasterType) => {
    const actions = {
      'Volcano': 'EVACUATE IMMEDIATELY - ASH FALL IMMINENT',
      'Cyclone': 'SEEK SHELTER NOW - HIGH WINDS APPROACHING',
      'Tsunami': 'MOVE TO HIGH GROUND - WAVE IMPACT EXPECTED',
      'Earthquake': 'DROP, COVER, HOLD - SEISMIC ACTIVITY DETECTED',
      'Flood': 'EVACUATE TO HIGHER GROUND - WATER LEVELS RISING',
      'Wildfire': 'EVACUATE IMMEDIATELY - FIRE APPROACHING',
      'Drought': 'CONSERVE WATER - SUPPLY CRITICAL',
      'Pandemic': 'ISOLATE IMMEDIATELY - CONTAGION RISK HIGH',
      'Terrorism': 'AVOID AREA - SECURITY THREAT ACTIVE',
      'Nuclear': 'EVACUATE ZONE - RADIATION DETECTED'
    }
    return actions[disasterType] || 'TAKE IMMEDIATE PROTECTIVE ACTION'
  }

  // Glitch animation effect
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setGlitchOffset({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      })
      setTimeout(() => {
        setGlitchOffset({ x: 0, y: 0 })
      }, 100)
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible])

  const actionText = getActionItems(disasterType)

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Screen-wide overlay */}
          <motion.div
            className="pulse-alert-overlay"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              backgroundColor: ['rgba(255, 0, 0, 0.1)', 'rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 0.1)']
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Critical Action Banner */}
          <motion.div
            className="pulse-alert-banner"
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0,
              opacity: 1,
              x: glitchOffset.x,
              filter: glitchOffset.x !== 0 ? 'blur(1px)' : 'blur(0px)'
            }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ 
              y: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
          >
            <div className="pulse-alert-content">
              {/* Alert Icon */}
              <motion.div
                className="pulse-alert-icon"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                ⚠️
              </motion.div>

              {/* Main Alert Text */}
              <div className="pulse-alert-main">
                <motion.h1
                  className="pulse-alert-title"
                  animate={{
                    textShadow: [
                      '0 0 20px #ff0000, 0 0 40px #ff0000',
                      '0 0 30px #ff0000, 0 0 60px #ff0000',
                      '0 0 20px #ff0000, 0 0 40px #ff0000'
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  CRITICAL ACTION REQUIRED
                </motion.h1>

                {/* Action Item */}
                <motion.div
                  className="pulse-alert-action"
                  animate={{
                    x: glitchOffset.x,
                    opacity: [1, 0.9, 1]
                  }}
                  transition={{
                    x: { duration: 0.1 },
                    opacity: { duration: 0.5, repeat: Infinity }
                  }}
                >
                  {actionText}
                </motion.div>

                {/* Readiness Score Display */}
                <div className="pulse-alert-score">
                  READINESS: {readinessScore.toFixed(1)}% - CRITICAL LEVEL
                </div>
              </div>

              {/* Pulsing Border */}
              <motion.div
                className="pulse-alert-border"
                animate={{
                  boxShadow: [
                    '0 0 20px #ff0000, inset 0 0 20px rgba(255, 0, 0, 0.3)',
                    '0 0 40px #ff0000, inset 0 0 40px rgba(255, 0, 0, 0.5)',
                    '0 0 20px #ff0000, inset 0 0 20px rgba(255, 0, 0, 0.3)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PulseAlert

