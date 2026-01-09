import React from 'react'
import { motion } from 'framer-motion'
import './LoadingSpinner.css'

/**
 * LoadingSpinner - Reusable loading component for conditional rendering
 * Prevents rendering crashes when data is missing
 */
const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <motion.div
      className="loading-spinner-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <div className="spinner-message">{message}</div>
      </div>
    </motion.div>
  )
}

export default LoadingSpinner

