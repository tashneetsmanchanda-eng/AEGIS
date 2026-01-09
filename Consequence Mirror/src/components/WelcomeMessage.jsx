import React from 'react'
import { motion } from 'framer-motion'
import './WelcomeMessage.css'

/**
 * Welcome Message Component
 * Appears after Butterfly Swarm fades out
 * Smoothly transitions user focus to Mission Control dashboard
 */
const WelcomeMessage = ({ onComplete }) => {
  return (
    <motion.div
      className="welcome-message"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      onAnimationComplete={() => {
        // Fade out after 3 seconds
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 3000)
      }}
    >
      <motion.div
        className="welcome-content"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.h1
          className="welcome-title"
          animate={{
            textShadow: [
              '0 0 20px rgba(102, 126, 234, 0.5)',
              '0 0 30px rgba(102, 126, 234, 0.8)',
              '0 0 20px rgba(102, 126, 234, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          WELCOME TO MISSION CONTROL
        </motion.h1>
        <motion.p
          className="welcome-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Disaster Risk Analysis & Consequence Simulation
        </motion.p>
        <motion.div
          className="welcome-indicator"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="pulse-dot"></div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default WelcomeMessage

