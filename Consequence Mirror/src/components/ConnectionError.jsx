import React from 'react'
import { motion } from 'framer-motion'
import './ConnectionError.css'

/**
 * ConnectionError - Displays connection error message when backend is down
 * TASK 3: Replaced red error screen with 'Synchronizing Swarm Intelligence...' loading state
 */
const ConnectionError = ({ message = 'Synchronizing Swarm Intelligence...', onRetry = null }) => {
  // TASK 3: Show loading state instead of red error screen
  return (
    <motion.div
      className="connection-error-container loading-state"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="error-icon">🔄</div>
      <div className="error-title">SYNCHRONIZING SWARM INTELLIGENCE</div>
      <div className="error-message">{message}</div>
      {onRetry && (
        <button className="error-retry-button" onClick={onRetry}>
          Retry Connection
        </button>
      )}
    </motion.div>
  )
}

export default ConnectionError

