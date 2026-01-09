import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import './CostOfInaction.css'

/**
 * CostOfInaction - Quantifies the Cost of Delay
 * Displays: "Delaying 12hrs = +15% Casualty Risk / +$2.4M Infrastructure Loss"
 */
const CostOfInaction = ({ delayHours, delayDays, confidence, disasterType, readinessScore, costOfDelay }) => {
  // Use cost_of_delay from backend if available, otherwise calculate locally
  const delayHrs = delayHours || (delayDays || 0) * 24
  
  let casualtyRiskIncrease, infrastructureLoss, cumulativeDamagePercent
  
  if (costOfDelay && costOfDelay.casualty_risk_increase_percent !== undefined) {
    // Use backend calculation (cumulative)
    casualtyRiskIncrease = costOfDelay.casualty_risk_increase_percent.toFixed(1)
    infrastructureLoss = costOfDelay.infrastructure_loss_rupees
    cumulativeDamagePercent = costOfDelay.cumulative_damage_percentage
  } else {
    // Fallback to local calculation using exponential formulas: 1.5^x for casualty risk per day
    const delayDaysCalc = delayHrs / 24.0
    const baseCasualtyRisk = 5.0  // Base 5% casualty risk
    // Formula: casualty risk increases 1.5^x per day of delay
    const casualtyRiskMultiplier = Math.pow(1.5, delayDaysCalc)
    casualtyRiskIncrease = (baseCasualtyRisk * casualtyRiskMultiplier).toFixed(1)
    
    const baseLossPerHour = {
      'Tsunami': 200000,
      'Flood': 150000,
      'Volcano': 250000,
      'Cyclone': 180000,
      'Earthquake': 220000,
      'Wildfire': 120000,
      'Drought': 100000,
      'Pandemic': 300000,
      'Terrorism': 350000,
      'Nuclear': 400000
    }
    const hourlyRate = baseLossPerHour[disasterType] || 200000
    // Apply exponential multiplier: 1.5^x for infrastructure loss per day
    const infrastructureMultiplier = Math.pow(1.5, delayDaysCalc)
    infrastructureLoss = hourlyRate * delayHrs * infrastructureMultiplier
    cumulativeDamagePercent = (baseCasualtyRisk * casualtyRiskMultiplier).toFixed(1)
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`
    } else {
      return `₹${Math.round(amount).toLocaleString('en-IN')}`
    }
  }

  // Determine if critical
  const isCritical = delayHrs >= 12 || readinessScore < 40

  return (
    <motion.div
      className={`cost-of-inaction ${isCritical ? 'critical' : ''}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="coi-label">COST OF INACTION (COI)</div>
      <div className="coi-content">
        <span className="coi-delay">Delaying {delayHrs}hrs</span>
        <span className="coi-separator">=</span>
        <span className="coi-risk">+{casualtyRiskIncrease}% Casualty Risk</span>
        <span className="coi-separator">/</span>
        <span className="coi-damage">+{cumulativeDamagePercent || '0.0'}% Cumulative Damage</span>
        <span className="coi-separator">/</span>
        <span className="coi-loss">+{formatCurrency(infrastructureLoss)} Infrastructure Loss</span>
      </div>
    </motion.div>
  )
}

export default CostOfInaction

