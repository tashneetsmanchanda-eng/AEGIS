import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import './WhyThisDecision.css'

/**
 * WhyThisDecision - Collapsible panel listing top 3 Primary Risk Drivers
 * Explainable AI panel for decision transparency
 * Re-triggers Azure OpenAI when slider moves >2 days
 */
const WhyThisDecision = ({ riskDrivers, sensorData, confidence, disasterType, delayDays, location }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentRiskDrivers, setCurrentRiskDrivers] = useState(riskDrivers)
  const [isLoading, setIsLoading] = useState(false)
  const previousDelayRef = useRef(delayDays || 0)
  
  // Re-trigger Azure OpenAI when slider moves >2 days
  useEffect(() => {
    const currentDelay = delayDays || 0
    const previousDelay = previousDelayRef.current
    
    // Check if delay changed by more than 2 days
    if (Math.abs(currentDelay - previousDelay) > 2 && currentDelay > 2) {
      setIsLoading(true)
      const fetchRiskDrivers = async () => {
        try {
          const response = await axios.post('http://localhost:8000/risk-drivers', {
            disaster_type: disasterType,
            sensor_data: sensorData,
            location: location || 'Coastal Region'
          })
          if (response.data && response.data.risk_drivers) {
            setCurrentRiskDrivers(response.data.risk_drivers)
          }
        } catch (error) {
          console.error('Error fetching risk drivers:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchRiskDrivers()
      previousDelayRef.current = currentDelay
    } else {
      previousDelayRef.current = currentDelay
    }
  }, [delayDays, disasterType, sensorData, location])
  
  // Update risk drivers when prop changes
  useEffect(() => {
    if (riskDrivers) {
      setCurrentRiskDrivers(riskDrivers)
    }
  }, [riskDrivers])

  // Extract top 3 risk drivers from backend or use defaults
  const getRiskDrivers = () => {
    // Use currentRiskDrivers (from state) if available
    if (currentRiskDrivers && Array.isArray(currentRiskDrivers) && currentRiskDrivers.length > 0) {
      return currentRiskDrivers.slice(0, 3)
    }
    // Fallback to riskDrivers prop
    if (riskDrivers && Array.isArray(riskDrivers) && riskDrivers.length > 0) {
      return riskDrivers.slice(0, 3)
    }

    // Auto-generate based on sensor data and disaster type
    const drivers = []

    if (disasterType === 'Tsunami') {
      if (sensorData?.magnitude) {
        drivers.push({
          name: 'Water Level Peak',
          value: `${sensorData.magnitude.toFixed(1)} Magnitude`,
          impact: sensorData.magnitude > 7.5 ? 'High' : 'Moderate'
        })
      }
      if (sensorData?.water_level) {
        drivers.push({
          name: 'Coastal Water Level',
          value: `${sensorData.water_level.toFixed(2)}m`,
          impact: sensorData.water_level > 0.5 ? 'High' : 'Moderate'
        })
      }
      drivers.push({
        name: 'Population Density',
        value: 'Coastal Region',
        impact: 'High'
      })
    } else if (disasterType === 'Flood') {
      if (sensorData?.precipitation) {
        drivers.push({
          name: 'Precipitation Rate',
          value: `${sensorData.precipitation}mm`,
          impact: sensorData.precipitation > 100 ? 'High' : 'Moderate'
        })
      }
      if (sensorData?.soil_saturation) {
        drivers.push({
          name: 'Ground Saturation',
          value: `${sensorData.soil_saturation}%`,
          impact: sensorData.soil_saturation > 80 ? 'High' : 'Moderate'
        })
      }
      drivers.push({
        name: 'Drainage Capacity',
        value: 'Urban Area',
        impact: 'Moderate'
      })
    } else {
      // Default drivers
      drivers.push(
        { name: 'Sensor Data Anomaly', value: 'Detected', impact: 'High' },
        { name: 'Historical Pattern Match', value: '85% Match', impact: 'Moderate' },
        { name: 'Geographic Risk Factor', value: 'Elevated', impact: 'Moderate' }
      )
    }

    return drivers.slice(0, 3)
  }

  const drivers = getRiskDrivers()

  const getImpactColor = (impact) => {
    if (impact === 'High') return '#ff0000'
    if (impact === 'Moderate') return '#ffaa00'
    return '#ffff00'
  }

  return (
    <motion.div
      className="why-decision-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="why-decision-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="why-decision-title">
          <span className="why-decision-icon">🤖</span>
          <span>Why This Decision?</span>
          <span className="why-decision-subtitle">Explainable AI Panel</span>
        </div>
        <motion.div
          className="why-decision-arrow"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="why-decision-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="why-decision-drivers">
              <div className="drivers-label">PRIMARY RISK DRIVERS</div>
              {drivers.map((driver, index) => (
                <motion.div
                  key={index}
                  className="risk-driver-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="driver-number">{index + 1}</div>
                  <div className="driver-details">
                    <div className="driver-name">{driver.name}</div>
                    <div className="driver-value">{driver.value}</div>
                  </div>
                  <div
                    className="driver-impact"
                    style={{ color: getImpactColor(driver.impact) }}
                  >
                    {driver.impact}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="why-decision-footer">
              <span className="azure-label">Powered by Azure Machine Learning</span>
              <span className="azure-label">Decision Briefing: Azure OpenAI</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default WhyThisDecision

