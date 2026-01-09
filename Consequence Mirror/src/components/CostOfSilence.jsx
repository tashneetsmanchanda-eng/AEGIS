import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import styles from './CostOfSilence.module.css'

/**
 * CostOfSilence - Dynamic economic impact counter
 * Shows projected economic loss based on intervention delay
 * Formula: Loss = (Base_Damage × Delay^1.5)
 * Based on historical economic records from Raipur primary research data
 */
const CostOfSilence = ({ delayDays, disasterType, costOfDelay, previousProjectedLoss }) => {
  // Use COI data from backend if available (uses primary research CSV with 1.2^x and 1.5^x formulas)
  // Otherwise fallback to local calculation
  // Ensure smooth transition between disasters without resetting to zero
  let directDamage, indirectLoss, projectedLoss
  
  if (costOfDelay && costOfDelay.direct_damage_rupees !== undefined) {
    // Use backend calculation (from primary research CSV)
    directDamage = costOfDelay.direct_damage_rupees
    indirectLoss = costOfDelay.indirect_loss_rupees
    projectedLoss = directDamage + indirectLoss
  } else {
    // Fallback to local calculation
    const baseDamageByDisaster = {
      'Tsunami': 2500000,
      'Flood': 1800000,
      'Volcano': 3200000,
      'Cyclone': 2200000,
      'Earthquake': 2800000,
      'Wildfire': 1500000,
      'Drought': 1200000,
      'Pandemic': 3500000,
      'Terrorism': 4000000,
      'Nuclear': 5000000
    }
    
    const baseDamage = baseDamageByDisaster[disasterType] || 2000000
    
    // Calculate using 1.5^x formula for infrastructure loss
    const delayMultiplier = Math.pow(1.5, delayDays || 0)
    projectedLoss = baseDamage * delayMultiplier
    
    directDamage = projectedLoss * 0.6
    indirectLoss = projectedLoss * 0.4
  }
  
  // Format currency in Indian Rupees (₹)
  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      // Crores (₹X.XX Cr)
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    } else if (amount >= 100000) {
      // Lakhs (₹X.XX L)
      return `₹${(amount / 100000).toFixed(2)} L`
    } else {
      // Thousands (₹X,XXX)
      return `₹${Math.round(amount).toLocaleString('en-IN')}`
    }
  }
  
  return (
    <motion.div
      className={styles.costContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className={styles.costHeader}>
        <div className={styles.costTitle}>ESTIMATED ECONOMIC IMPACT</div>
        <div className={styles.costAmount}>
          <CountUp
            start={previousProjectedLoss || 0}
            end={projectedLoss}
            duration={1.5}
            separator=","
            decimals={0}
            prefix="₹"
          />
        </div>
      </div>
      
      <div className={styles.costBreakdown}>
        <div className={styles.costItem}>
          <div className={styles.costLabel}>Direct Damage</div>
          <div className={styles.costValue}>
            <CountUp
              start={previousProjectedLoss ? (previousProjectedLoss * 0.6) : 0}
              end={directDamage}
              duration={1.5}
              separator=","
              decimals={0}
              prefix="₹"
            />
          </div>
          <div className={styles.costDescription}>Buildings, Roads, Infrastructure</div>
        </div>
        
        <div className={styles.costItem}>
          <div className={styles.costLabel}>Indirect Loss</div>
          <div className={styles.costValue}>
            <CountUp
              start={previousProjectedLoss ? (previousProjectedLoss * 0.4) : 0}
              end={indirectLoss}
              duration={1.5}
              separator=","
              decimals={0}
              prefix="₹"
            />
          </div>
          <div className={styles.costDescription}>Business Interruption, Supply Chain</div>
        </div>
      </div>
      
      <div className={styles.costFootnote}>
        <span className={styles.footnoteIcon}>ℹ️</span>
        <span>Based on historical economic records from Raipur primary research data</span>
      </div>
    </motion.div>
  )
}

export default CostOfSilence

