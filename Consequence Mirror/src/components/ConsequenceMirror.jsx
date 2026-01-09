import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import ReadinessGauge from './ReadinessGauge'
import PulseAlert from './PulseAlert'
import HospitalMonitor from './HospitalMonitor'
import CostOfSilence from './CostOfSilence'
import LoadingSpinner from './LoadingSpinner'
import { playUrgencySound, playHeartbeatSound, stopHeartbeatSound } from '../utils/soundEffects'
import styles from './ConsequenceMirror.module.css'

/**
 * ConsequenceMirror - A controlled, reusable component for visualizing disaster consequences
 * 
 * @param {Object} props
 * @param {Object} props.currentRiskData - The current simulation data
 * @param {Function} props.onInterventionChange - Callback when intervention delay changes (delayDays: number) => void
 * @param {string} props.disasterType - The type of disaster (optional, will be extracted from currentRiskData if not provided)
 * @param {number} props.confidenceScore - Confidence score for the prediction (0-1)
 */
// Proper prop destructuring to prevent ReferenceError
// Fix the ReferenceError: disasterType is not defined by ensuring it is correctly destructured
const ConsequenceMirror = ({ 
  currentRiskData, 
  onInterventionChange, 
  confidenceScore, 
  disasterType 
}) => {
  const containerRef = useRef(null)
  const [isRewriting, setIsRewriting] = useState(false)
  const [previousDelay, setPreviousDelay] = useState(
    currentRiskData?.delay_days ?? 0
  )
  const [useHistoricalData, setUseHistoricalData] = useState(false)
  const [historicalData, setHistoricalData] = useState(null)

  // Safety check: Prevent infinite loading - if data is missing, tell user why
  if (!disasterType) {
    return <div className="error-box">Waiting for Disaster Data...</div>
  }
  
  const currentDisaster = disasterType || currentRiskData?.disaster_type || currentRiskData?.predicted_disaster || 'Tsunami'
  
  // Safety check: Ensure currentRiskData exists before rendering
  if (!currentRiskData) {
    return <LoadingSpinner message="Loading simulation data..." />
  }

  // Get disaster-specific theme colors
  const getDisasterTheme = (disasterType) => {
    const themes = {
      'Tsunami': { primary: '#003366', secondary: '#001a33', accent: '#004d99' }, // Deep Ocean Blue
      'Flood': { primary: '#003366', secondary: '#001a33', accent: '#004d99' }, // Deep Ocean Blue
      'Volcano': { primary: '#ff4500', secondary: '#cc3700', accent: '#ff6600' }, // Lava Red/Orange
      'Cyclone': { primary: '#4b0082', secondary: '#3d0066', accent: '#6600cc' }, // Storm Purple/Grey
      'Earthquake': { primary: '#ff8800', secondary: '#cc6600', accent: '#ffaa00' },
      'Wildfire': { primary: '#ff3300', secondary: '#cc2200', accent: '#ff5500' },
      'Drought': { primary: '#ffaa00', secondary: '#cc8800', accent: '#ffcc00' },
      'Pandemic': { primary: '#ff0066', secondary: '#cc0044', accent: '#ff0088' },
      'Terrorism': { primary: '#990000', secondary: '#770000', accent: '#bb0000' },
      'Nuclear': { primary: '#00ff00', secondary: '#00cc00', accent: '#00ff88' }
    }
    return themes[disasterType] || themes['Tsunami'] // Default to Deep Ocean Blue
  }

  // Fetch historical data when toggle is on
  useEffect(() => {
    if (useHistoricalData && currentDisaster) {
      const fetchHistoricalData = async () => {
        try {
          const response = await axios.post('http://localhost:8000/historical-data', {
            disaster_type: currentDisaster,
            location: 'Coastal Region'
          })
          if (response.data && response.data.records) {
            setHistoricalData(response.data.records)
          }
        } catch (error) {
          console.error('Error fetching historical data:', error)
        }
      }
      fetchHistoricalData()
    }
  }, [useHistoricalData, currentDisaster])
  
  // Fetch historical data when toggle is on
  useEffect(() => {
    if (useHistoricalData && currentDisaster) {
      const fetchHistoricalData = async () => {
        try {
          const response = await axios.post('http://localhost:8000/historical-data', {
            disaster_type: currentDisaster,
            location: 'Coastal Region'
          })
          if (response.data && response.data.records) {
            setHistoricalData(response.data.records)
          }
        } catch (error) {
          console.error('Error fetching historical data:', error)
        }
      }
      fetchHistoricalData()
    }
  }, [useHistoricalData, currentDisaster])
  
  // Detect when delay changes to trigger rewrite animation
  useEffect(() => {
    const currentDelay = currentRiskData?.delay_days ?? 0
    if (currentDelay !== previousDelay) {
      setIsRewriting(true)
      setPreviousDelay(currentDelay)
      // Reset rewrite animation after duration
      const timer = setTimeout(() => setIsRewriting(false), 600)
      return () => clearTimeout(timer)
    }
  }, [currentRiskData?.delay_days, previousDelay])

  const handleSliderChange = (e) => {
    const newDelay = parseInt(e.target.value)
    // Trigger rewrite animation immediately
    setIsRewriting(true)
    if (onInterventionChange) {
      onInterventionChange(newDelay)
    }
    // Reset animation after duration
    setTimeout(() => setIsRewriting(false), 800)
  }

  const getRiskLevel = (phase) => {
    if (!currentRiskData?.timeline) return 'low'
    const day = parseInt(phase.day)
    const delay = currentRiskData.delay_days ?? 0
    if (day >= 10 || delay >= 5) return 'critical'
    if (day >= 3 || delay >= 3) return 'high'
    return 'medium'
  }

  // Check if slider is in critical danger zone (readiness score < 40)
  const isCriticalDanger = currentRiskData?.readiness_score < 40

  // Sound and haptic feedback based on delay
  useEffect(() => {
    const delay = currentRiskData?.delay_days ?? 0
    const readinessScore = currentRiskData?.readiness_score ?? 100

    // Play urgency sound as delay increases
    if (delay >= 5) {
      // Heavy heartbeat for critical delays
      playHeartbeatSound(0.15 + (delay - 5) * 0.05) // Volume increases with delay
    } else if (delay >= 3) {
      // Alarm sound for moderate delays
      playUrgencySound(0.1 + (delay - 3) * 0.02)
    }

    // Haptic feedback (if supported)
    if (navigator.vibrate && delay >= 4) {
      const pattern = delay >= 6 
        ? [100, 50, 100, 50, 100] // Fast, urgent pattern
        : [200, 100, 200] // Moderate pattern
      navigator.vibrate(pattern)
    }
  }, [currentRiskData?.delay_days, currentRiskData?.readiness_score])

  // Framer Motion Variants for timeline cards
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
    glitch: {
      x: [0, -4, 4, -4, 4, 0],
      y: [0, 4, -4, 4, -4, 0],
      filter: ['blur(0px)', 'blur(2px)', 'blur(0px)', 'blur(2px)', 'blur(0px)'],
      transition: {
        duration: 0.15,
        repeat: Infinity,
        repeatDelay: 2,
        ease: 'linear',
      },
    },
    rewrite: {
      opacity: [1, 0.2, 0.2, 1],
      scale: [1, 0.97, 0.97, 1],
      x: [0, -2, 2, 0],
      filter: ['blur(0px)', 'blur(3px)', 'blur(3px)', 'blur(0px)'],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1],
      },
    },
  }

  // Variants for layer cards (staggered animation)
  const layerVariants = {
    hidden: {
      opacity: 0,
      x: -30,
    },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.15,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  }

  // Variants for rewrite animation on content - more dramatic
  const contentRewriteVariants = {
    normal: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
    },
    rewriting: {
      opacity: [1, 0.15, 0.15, 1],
      filter: ['blur(0px)', 'blur(5px)', 'blur(5px)', 'blur(0px)'],
      scale: [1, 0.98, 0.98, 1],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1],
      },
    },
  }

  // This check is now handled above, but keeping for safety
  if (!currentRiskData) {
    return <LoadingSpinner message="Loading simulation data..." />
  }

  const timeline = currentRiskData.timeline || []
  const delayDays = currentRiskData.delay_days ?? 0
  const readinessScore = currentRiskData.readiness_score ?? 100
  // currentDisaster already defined above from props or currentRiskData
  const showPulseAlert = readinessScore < 50
  
  // Get theme for current disaster
  const theme = getDisasterTheme(currentDisaster)

  return (
    <div 
      className={styles.container} 
      ref={containerRef}
      style={{
        '--disaster-primary': theme.primary,
        '--disaster-secondary': theme.secondary,
        '--disaster-accent': theme.accent,
      }}
    >
      {/* Pulse Alert System */}
      <PulseAlert
        readinessScore={readinessScore}
        disasterType={currentDisaster}
        isVisible={showPulseAlert}
      />
      
      {/* Data Synchronization Warning */}
      {confidenceScore !== undefined && confidenceScore < 0.85 && (
        <motion.div
          className={styles.syncWarning}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.warningIcon}>⏳</div>
          <div className={styles.warningText}>
            <strong>DATA STILL SYNCHRONIZING</strong>
            <span>Confidence: {(confidenceScore * 100).toFixed(1)}% - Additional sensor data recommended for full simulation reveal</span>
          </div>
        </motion.div>
      )}
      
      {/* Header with Readiness Gauge */}
      <div className={styles.header}>
        <h1 className={styles.title}>CONSEQUENCE MIRROR</h1>
        <p className={styles.subtitle}>Consequence Projection Engine</p>
        
        {/* Truthful Toggle: Historical Data vs Current/AI Data */}
        <div className={styles.truthfulToggle}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={useHistoricalData}
              onChange={(e) => setUseHistoricalData(e.target.checked)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSlider}></span>
            <span className={styles.toggleText}>
              {useHistoricalData ? 'Historical Data (CSV)' : 'Current/AI Data'}
            </span>
          </label>
        </div>
        
        {currentRiskData && (
        <ReadinessGauge
          score={readinessScore}
          delayDays={delayDays}
          disasterType={currentDisaster}
          hospitalMetrics={currentRiskData?.timeline?.[0]?.hospital_metrics}
        />
        )}
        
        {/* Cost of Silence Economic Counter */}
        {currentRiskData && (
          <CostOfSilence
            delayDays={delayDays}
            disasterType={currentDisaster}
            costOfDelay={currentRiskData.cost_of_delay}
          />
        )}
      </div>

      {/* Vertical Timeline */}
      <div className={styles.timeline}>
        {timeline.map((phase, index) => {
          const riskLevel = getRiskLevel(phase)
          const shouldGlitch = riskLevel === 'critical' || riskLevel === 'high'
          
          return (
            <motion.div
              key={`${phase.phase}-${index}`}
              className={`${styles.phaseCard} ${styles[`risk${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`]}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-100px' }}
              variants={cardVariants}
              animate={
                isRewriting
                  ? ['visible', 'rewrite']
                  : shouldGlitch
                  ? ['visible', 'glitch']
                  : 'visible'
              }
            >
              {/* Phase Header */}
              <div className={styles.phaseHeader}>
                <motion.div
                  className={styles.phaseDay}
                  variants={contentRewriteVariants}
                  animate={isRewriting ? 'rewriting' : 'normal'}
                >
                  {phase.day}
                </motion.div>
                <div className={styles.phaseTitle}>{phase.phase}</div>
                <motion.div
                  className={styles.phaseFamilies}
                  variants={contentRewriteVariants}
                  animate={isRewriting ? 'rewriting' : 'normal'}
                >
                  Displacement Rate: {((phase.displaced_families || 0) / 1000).toFixed(1)}K units
                </motion.div>
              </div>

              {/* Rewrite Indicator Overlay */}
              {isRewriting && (
                <motion.div
                  className={styles.rewriteOverlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className={styles.rewriteText}>REWRITING FUTURE...</div>
                </motion.div>
              )}

              {/* Layered Mirror - Three distinct layers */}
              <div className={styles.layersContainer}>
                {/* Human Layer */}
                <motion.div
                  className={`${styles.layerCard} ${styles.humanLayer}`}
                  custom={0}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false }}
                  variants={layerVariants}
                >
                  <div className={styles.layerIcon}>🏠</div>
                  <div className={styles.layerLabel}>HUMAN LAYER</div>
                  <motion.div
                    className={styles.layerScene}
                    variants={contentRewriteVariants}
                    animate={isRewriting ? 'rewriting' : 'normal'}
                  >
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Displaced Households:</span>
                      <span className={styles.metricValue}>{phase.displaced_households?.toLocaleString() || 0}</span>
                    </div>
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Trauma Capacity Load:</span>
                      <span className={styles.metricValue}>{phase.trauma_capacity_load || '0%'}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Infrastructure Layer */}
                <motion.div
                  className={`${styles.layerCard} ${styles.infrastructureLayer}`}
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false }}
                  variants={layerVariants}
                >
                  <div className={styles.layerIcon}>⚡</div>
                  <div className={styles.layerLabel}>INFRASTRUCTURE LAYER</div>
                  <motion.div
                    className={styles.layerScene}
                    variants={contentRewriteVariants}
                    animate={isRewriting ? 'rewriting' : 'normal'}
                  >
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Power Status:</span>
                      <span className={styles.metricValue}>{phase.critical_infrastructure_status?.Power || 'Unknown'}</span>
                    </div>
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Comms Status:</span>
                      <span className={styles.metricValue}>{phase.critical_infrastructure_status?.Comms || 'Unknown'}</span>
                    </div>
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Economic Loss:</span>
                      <span className={styles.metricValue}>₹{(phase.economic_loss_estimate || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Health Layer */}
                <motion.div
                  className={`${styles.layerCard} ${styles.healthLayer}`}
                  custom={2}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false }}
                  variants={layerVariants}
                >
                  <div className={styles.layerIcon}>🏥</div>
                  <div className={styles.layerLabel}>HEALTH LAYER</div>
                  <motion.div
                    className={styles.layerScene}
                    variants={contentRewriteVariants}
                    animate={isRewriting ? 'rewriting' : 'normal'}
                  >
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Hospital Overflow:</span>
                      <span className={styles.metricValue}>{phase.hospital_overflow_rate || '0%'}</span>
                    </div>
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Water Contamination:</span>
                      <span className={styles.metricValue}>{((phase.water_contamination_prob || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className={styles.metricRow}>
                      <span className={styles.metricLabel}>Disease Vector Risk:</span>
                      <span className={styles.metricValue}>{((phase.disease_vector_risk || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Hospital Monitor - Live Feed */}
              {phase.hospital_metrics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <HospitalMonitor
                    hospitalMetrics={phase.hospital_metrics}
                    readinessScore={readinessScore}
                    disasterType={currentDisaster}
                  />
                </motion.div>
              )}

              {/* Chain Reactions */}
              {phase.chain_reactions && phase.chain_reactions.length > 0 && (
                <div className={styles.chainReactions}>
                  <div className={styles.chainLabel}>CHAIN REACTIONS:</div>
                  <div className={styles.chainTags}>
                    {phase.chain_reactions.map((reaction, idx) => (
                      <span key={idx} className={styles.chainTag}>
                        {reaction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Sticky Intervention Slider at Bottom */}
      <motion.div
        className={styles.sliderContainer}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className={styles.sliderContent}>
          <label className={styles.sliderLabel}>
            INTERVENTION DELAY: <span className={styles.sliderValue}>{delayDays}</span> DAYS
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={delayDays}
            onChange={handleSliderChange}
            className={`${styles.slider} ${isCriticalDanger ? styles.sliderCritical : ''}`}
            aria-label="Intervention delay in days"
          />
          <div className={styles.sliderLabels}>
            <span>0</span>
            <span>30</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ConsequenceMirror
