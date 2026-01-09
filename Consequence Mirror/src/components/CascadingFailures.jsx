import React from 'react'
import { motion } from 'framer-motion'
import './CascadingFailures.css'

/**
 * CascadingFailures - Visualizes infrastructure nodes (Power, Comms, Transport, Water)
 * TASK 3: Nodes light up based on risk level and intervention delay
 */
const CascadingFailures = ({ riskLevel, delayDays, analysisData }) => {
  // TASK 3: Calculate node states based on risk level and intervention delay
  const getNodeState = (nodeName) => {
    if (!riskLevel || !delayDays) {
      return 'operational'
    }
    
    // Base risk multiplier
    const riskMultiplier = riskLevel === 'critical' ? 1.0 : riskLevel === 'high' ? 0.8 : riskLevel === 'medium' ? 0.6 : 0.4
    const delayMultiplier = Math.min(1.0, delayDays / 10) // Max impact at 10 days delay
    
    // Node-specific failure thresholds
    const thresholds = {
      'Power': 0.3,
      'Comms': 0.4,
      'Transport': 0.5,
      'Water': 0.6
    }
    
    const failureRisk = riskMultiplier * delayMultiplier
    const threshold = thresholds[nodeName] || 0.5
    
    if (failureRisk >= threshold) {
      return 'failed'
    } else if (failureRisk >= threshold * 0.7) {
      return 'unstable'
    }
    return 'operational'
  }
  
  // TASK 3: Calculate economic impact and direct damage based on delay
  const calculateImpact = () => {
    if (!delayDays) {
      return { economic: 0, direct: 0 }
    }
    
    // Exponential increase with delay
    const baseEconomic = 50 // Base economic impact in millions
    const baseDirect = 25 // Base direct damage in millions
    
    const economicImpact = baseEconomic * Math.pow(1.5, delayDays / 5)
    const directDamage = baseDirect * Math.pow(1.2, delayDays / 3)
    
    return {
      economic: Math.round(economicImpact),
      direct: Math.round(directDamage)
    }
  }
  
  const nodes = ['Power', 'Comms', 'Transport', 'Water']
  const impact = calculateImpact()
  
  const getNodeClass = (state) => {
    switch (state) {
      case 'failed':
        return 'node-failed'
      case 'unstable':
        return 'node-unstable'
      default:
        return 'node-operational'
    }
  }
  
  const getNodeIcon = (state) => {
    switch (state) {
      case 'failed':
        return '🔴'
      case 'unstable':
        return '🟡'
      default:
        return '🟢'
    }
  }
  
  return (
    <motion.div 
      className="cascading-failures-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="cascading-title">Cascading Infrastructure Network</h3>
      
      {/* Infrastructure Nodes */}
      <div className="infrastructure-nodes">
        {nodes.map((nodeName, index) => {
          const state = getNodeState(nodeName)
          return (
            <motion.div
              key={nodeName}
              className={`infrastructure-node ${getNodeClass(state)}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="node-icon">{getNodeIcon(state)}</div>
              <div className="node-label">{nodeName}</div>
              <div className="node-status">{state.toUpperCase()}</div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Impact Totals */}
      <div className="impact-totals">
        <div className="impact-card">
          <div className="impact-label">Economic Impact</div>
          <div className="impact-value">${impact.economic}M</div>
        </div>
        <div className="impact-card">
          <div className="impact-label">Direct Damage</div>
          <div className="impact-value">${impact.direct}M</div>
        </div>
      </div>
    </motion.div>
  )
}

export default CascadingFailures

