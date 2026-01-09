import React from 'react'
import { motion } from 'framer-motion'
import './TimelineView.css'

/**
 * TimelineView - Shows progression across 3 time steps
 * TASK 2: Day 0 (Immediate), Day 10 (Medium-term), Day 30 (Long-term)
 */
const TimelineView = ({ consequencesData, analysisData }) => {
  // TASK 2: Restore cascading timeline with Day 0, Day 10, Day 30 segmentation
  let time_intervals, displaced_households, hospital_overflow_rate, water_contamination_prob, economic_loss_millions
  
  try {
    // Check for impacts object in analysisData (from /predict/combined response)
    // TASK 3: Handle 'Day 0', 'Day 10', 'Day 30' keys structure
    if (analysisData?.impacts && typeof analysisData.impacts === 'object' && !Array.isArray(analysisData.impacts)) {
      const impacts = analysisData.impacts
      // TASK 3: Use Day 0, Day 10, Day 30 keys from backend response
      time_intervals = ["Day 0", "Day 10", "Day 30"]
      
      // TASK 3: Map impacts object to timeline metrics for cascading effects
      // Day 0: Immediate failures (Power, Comms)
      // Day 10: Secondary effects (Water supply, Hospital load)
      // Day 30: Long-term consequences (Economic loss, Infrastructure repair)
      const dayKeys = ["Day 0", "Day 10", "Day 30"]
      displaced_households = dayKeys.map(key => impacts[key]?.displaced_households || impacts[key]?.displaced || 0)
      hospital_overflow_rate = dayKeys.map(key => impacts[key]?.hospital_overflow || impacts[key]?.hospital_overflow_rate || 0)
      water_contamination_prob = dayKeys.map(key => impacts[key]?.water_contamination || impacts[key]?.water_contamination_prob || 0)
      economic_loss_millions = dayKeys.map(key => impacts[key]?.economic_loss_millions || impacts[key]?.economic_loss || 0)
    }
    // Fallback: Check for impacts array (legacy format)
    else if (analysisData?.impacts && Array.isArray(analysisData.impacts)) {
      const impacts = analysisData.impacts
      time_intervals = ["Day 0", "Day 10", "Day 30"]
      displaced_households = impacts.map(impact => impact?.displaced_households || impact?.displaced || 0)
      hospital_overflow_rate = impacts.map(impact => impact?.hospital_overflow || impact?.hospital_overflow_rate || 0)
      water_contamination_prob = impacts.map(impact => impact?.water_contamination || impact?.water_contamination_prob || 0)
      economic_loss_millions = impacts.map(impact => impact?.economic_loss_millions || impact?.economic_loss || 0)
    }
    // Fallback to consequencesData format
    else if (consequencesData?.metrics) {
      time_intervals = consequencesData.metrics.time_intervals
      displaced_households = consequencesData.metrics.displaced_households
      hospital_overflow_rate = consequencesData.metrics.hospital_overflow_rate
      water_contamination_prob = consequencesData.metrics.water_contamination_prob
      economic_loss_millions = consequencesData.metrics.economic_loss_millions
    }
    // Also check direct properties on consequencesData
    else if (consequencesData?.time_intervals) {
      time_intervals = consequencesData.time_intervals
      displaced_households = consequencesData.displaced_households
      hospital_overflow_rate = consequencesData.hospital_overflow_rate
      water_contamination_prob = consequencesData.water_contamination_prob
      economic_loss_millions = consequencesData.economic_loss_millions
    }
    
    if (!time_intervals || !displaced_households || !hospital_overflow_rate) {
      return null
    }
  } catch (error) {
    // TASK 3: Try/catch block to prevent red error screen if server is just waking up
    console.error('Error mapping timeline data:', error)
    return null
  }

  // TASK 4: Ensure animations trigger when data arrives
  const hasData = time_intervals && displaced_households && hospital_overflow_rate

  if (!hasData) {
    return null
  }

  return (
    <motion.div 
      className="timeline-view-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="timeline-title">Impact Progression Timeline</h3>
      <div className="timeline-table">
        {/* Header Row */}
        <div className="timeline-row timeline-header">
          <div className="timeline-metric">Metric</div>
          {time_intervals.map((interval, index) => (
            <div key={index} className="timeline-interval">
              {interval}
            </div>
          ))}
        </div>

        {/* Displaced Households Row */}
        <motion.div
          className="timeline-row"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="timeline-metric">Displaced Households</div>
          {displaced_households?.map((value, index) => (
            <div key={index} className="timeline-value">
              {value.toLocaleString('en-IN')}
            </div>
          ))}
        </motion.div>

        {/* Hospital Overflow Rate Row */}
        <motion.div
          className="timeline-row"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="timeline-metric">Hospital Overflow Rate</div>
          {hospital_overflow_rate?.map((value, index) => {
            const percentage = (value * 100).toFixed(1)
            return (
              <div key={index} className={`timeline-value ${value > 0.8 ? 'critical' : value > 0.5 ? 'warning' : 'normal'}`}>
                {percentage}%
              </div>
            )
          })}
        </motion.div>

        {/* Water Contamination Probability Row */}
        <motion.div
          className="timeline-row"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="timeline-metric">Water Contamination</div>
          {water_contamination_prob?.map((value, index) => {
            const percentage = (value * 100).toFixed(1)
            return (
              <div key={index} className={`timeline-value ${value > 0.5 ? 'critical' : value > 0.3 ? 'warning' : 'normal'}`}>
                {percentage}%
              </div>
            )
          })}
        </motion.div>

        {/* Economic Loss Row */}
        <motion.div
          className="timeline-row"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="timeline-metric">Economic Loss (Millions)</div>
          {economic_loss_millions?.map((value, index) => (
            <div key={index} className="timeline-value">
              ₹{value.toFixed(2)}M
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default TimelineView




