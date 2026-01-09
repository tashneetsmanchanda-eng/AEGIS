import React from 'react'
import { motion } from 'framer-motion'
import './ButterflyEffect.css'

/**
 * ButterflyEffect - Visualizes cascading_failures as Status Badges
 * Power: Failed (Red Badge), Comms: Unstable (Yellow Badge), etc.
 * TASK 2: Updated to extract cascading failures from analysisData.impacts (Day 0, Day 10, Day 30)
 */
const ButterflyEffect = ({ consequencesData, analysisData }) => {
  // TASK 2: Extract cascading failures from analysisData.impacts if available
  let cascading_failures = null
  
  if (analysisData?.impacts && typeof analysisData.impacts === 'object') {
    const impacts = analysisData.impacts
    // Extract status information from Day 0 (immediate failures)
    const day0 = impacts["Day 0"]
    if (day0) {
      cascading_failures = {}
      if (day0.power_status) cascading_failures["Power"] = day0.power_status
      if (day0.comms_status) cascading_failures["Comms"] = day0.comms_status
      
      // Extract from Day 10 (secondary effects)
      const day10 = impacts["Day 10"]
      if (day10) {
        if (day10.water_supply) cascading_failures["Water"] = day10.water_supply
        if (day10.hospital_load) cascading_failures["Hospital"] = day10.hospital_load
      }
      
      // Extract from Day 30 (long-term)
      const day30 = impacts["Day 30"]
      if (day30) {
        if (day30.infrastructure_repair) cascading_failures["Infrastructure"] = day30.infrastructure_repair
        if (day30.economic_loss) cascading_failures["Economy"] = day30.economic_loss
      }
    }
  }
  
  // Fallback to consequencesData format
  if (!cascading_failures && consequencesData?.cascading_failures) {
    cascading_failures = consequencesData.cascading_failures
  }
  
  if (!cascading_failures || Object.keys(cascading_failures).length === 0) {
    return null
  }

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('failed') || statusLower.includes('blackout') || statusLower.includes('breach') || statusLower.includes('severed')) {
      return 'status-failed'
    } else if (statusLower.includes('unstable') || statusLower.includes('degraded') || statusLower.includes('blocked')) {
      return 'status-unstable'
    } else if (statusLower.includes('operational') || statusLower.includes('stable')) {
      return 'status-operational'
    }
    return 'status-unknown'
  }

  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('failed') || statusLower.includes('blackout') || statusLower.includes('breach') || statusLower.includes('severed')) {
      return '🔴'
    } else if (statusLower.includes('unstable') || statusLower.includes('degraded') || statusLower.includes('blocked')) {
      return '🟡'
    } else if (statusLower.includes('operational') || statusLower.includes('stable')) {
      return '🟢'
    }
    return '⚪'
  }

  return (
    <div className="butterfly-effect-container">
      <h3 className="butterfly-title">Cascading Infrastructure Failures</h3>
      <div className="butterfly-badges">
        {Object.entries(cascading_failures).map(([key, value], index) => (
          <motion.div
            key={key}
            className={`status-badge ${getStatusBadgeClass(value)}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="status-icon">{getStatusIcon(value)}</div>
            <div className="status-label">{key}</div>
            <div className="status-value">{value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ButterflyEffect




