import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import ConsequenceMirror from './components/ConsequenceMirror'
import DisasterMap from './components/DisasterMap'
import AccuracyBadge from './components/AccuracyBadge'
import LoadingSpinner from './components/LoadingSpinner'
import DecisionBanner from './components/DecisionBanner'
import CostOfInaction from './components/CostOfInaction'
import WhyThisDecision from './components/WhyThisDecision'
import ImpactCards from './components/ImpactCards'
import TimelineView from './components/TimelineView'
import ButterflyEffect from './components/ButterflyEffect'
import CascadingFailures from './components/CascadingFailures'
import './Dashboard.css'

/**
 * Dashboard Component
 * Receives props from App.jsx (lifted state)
 */
function Dashboard({
  riskData,
  disasterType,
  riskLevel,
  readinessScore,
  loading,
  analysisData,
  onAnalyzeDisaster,
  onScrollToMirror,
  onInterventionChange,
  mirrorRef
}) {
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false)
  const [consequencesData, setConsequencesData] = useState(null)
  const [consequencesLoading, setConsequencesLoading] = useState(false)

  // Monitor readiness score for emergency alerts
  useEffect(() => {
    if (readinessScore < 40) {
      setShowEmergencyAlert(true)
      const timer = setTimeout(() => setShowEmergencyAlert(false), 5000)
      return () => clearTimeout(timer)
    } else {
      setShowEmergencyAlert(false)
    }
  }, [readinessScore])

  // Fetch consequences data when disaster type and risk level are available
  useEffect(() => {
    if (!disasterType || !riskLevel) return

    const fetchConsequences = async () => {
      setConsequencesLoading(true)
      try {
        // Map risk level to severity
        const severityMap = {
          'low': 'Low',
          'medium': 'Moderate',
          'high': 'High',
          'critical': 'Critical'
        }
        const severity = severityMap[riskLevel?.toLowerCase()] || 'Critical'

        const response = await axios.post('http://localhost:8000/consequences', {
          disaster_type: disasterType,
          severity: severity
        })
        setConsequencesData(response.data)
      } catch (error) {
        console.error('Error fetching consequences data:', error)
        setConsequencesData(null)
      } finally {
        setConsequencesLoading(false)
      }
    }

    fetchConsequences()
  }, [disasterType, riskLevel])

  return (
    <div className={`dashboard ${showEmergencyAlert ? 'emergency-alert' : ''}`}>
      {/* Main Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">CONSEQUENCE PROJECTION ENGINE</h1>
          <div className="header-actions">
            {/* Pulsing Button to View Mirror */}
            <motion.button
              className="mirror-button"
              onClick={onScrollToMirror}
              aria-label="View Future Consequence Mirror"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0px rgba(255, 255, 255, 0.3)',
                  '0 0 20px rgba(255, 255, 255, 0.5)',
                  '0 0 0px rgba(255, 255, 255, 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              whileHover={{
                scale: 1.1,
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.6)'
              }}
            >
              🔎 View Future Consequence Mirror
            </motion.button>
            <button
              className="analyze-button"
              onClick={onAnalyzeDisaster}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Disaster Risk'}
            </button>
          </div>
        </div>

        {/* Decision Banner - Dominant high-contrast banner */}
        {analysisData && disasterType && (
          <>
            <DecisionBanner
              recommendation={analysisData.recommendation}
              actionRequired={analysisData.action_required}
              confidence={analysisData.confidence}
              disasterType={disasterType}
              delayDays={riskData?.delay_days || 0}
            />
            <CostOfInaction
              delayDays={riskData?.delay_days || 0}
              confidence={analysisData.confidence}
              disasterType={disasterType}
              readinessScore={readinessScore}
              costOfDelay={analysisData.cost_of_delay}
            />
          </>
        )}

        {/* Azure Labels */}
        <div className="azure-labels">
          <span className="azure-label">Powered by Azure Machine Learning</span>
          <span className="azure-label">Decision Briefing: Azure OpenAI</span>
        </div>
      </header>

      {/* Geospatial Map Section */}
      {disasterType && riskData ? (
        <section className="map-section">
          <DisasterMap
            currentRiskData={riskData}
            hospitalMetrics={riskData.timeline?.[0]?.hospital_metrics}
            disasterType={disasterType}
            delayDays={riskData.delay_days}
            predictedLocation={analysisData?.predicted_location}
            isAnalyzeLoading={loading}
            useHistoricalData={false}
            riskMultiplier={riskData.delay_days > 0 ? Math.pow(1.5, riskData.delay_days / 24) : 1.0}
          />
        </section>
      ) : loading ? (
        <section className="map-section">
          <LoadingSpinner message="Simulating Cascading Effects..." />
        </section>
      ) : null}

      {/* Main Analytics Section */}
      <section className="analytics-section">
        <div className="analytics-content">
          <h2>Risk Analysis</h2>
          {disasterType ? (
            <div className="risk-display">
              <div className="risk-card">
                <div className="risk-card-header">
                  <h3>Predicted Disaster</h3>
                  {analysisData && (
                    <AccuracyBadge
                      confidence={analysisData.confidence}
                      confidenceLowerBound={analysisData.confidence_lower_bound}
                      confidenceUpperBound={analysisData.confidence_upper_bound}
                      disasterType={analysisData.disaster_type}
                      reasoning={analysisData.reasoning}
                      sensorData={analysisData.sensor_data}
                    />
                  )}
                </div>
                <p className="disaster-type">{disasterType}</p>
                <p className="risk-level">
                  Risk Level: <span className={`risk-${riskLevel}`}>{riskLevel}</span>
                </p>
                {analysisData && (
                  <div className="analysis-details">
                    <p className="confidence">
                      <strong>Confidence:</strong> {
                        analysisData.confidence_lower_bound !== undefined && analysisData.confidence_upper_bound !== undefined
                          ? `${(analysisData.confidence * 100).toFixed(1)}% ± ${((analysisData.confidence_upper_bound - analysisData.confidence) * 100).toFixed(1)}% (CI: ${(analysisData.confidence_lower_bound * 100).toFixed(1)}-${(analysisData.confidence_upper_bound * 100).toFixed(1)}%)`
                          : `${(analysisData.confidence * 100).toFixed(1)}% ± ${analysisData.confidence >= 0.85 ? '3' : analysisData.confidence >= 0.70 ? '5' : '8'}%`
                      }
                    </p>
                    <p className="reasoning">{analysisData.reasoning}</p>
                  </div>
                )}
              </div>
              <div className="risk-card">
                <h3>Current Readiness</h3>
                <p className="readiness-score">{readinessScore.toFixed(1)}%</p>
                <p className="readiness-status">
                  {readinessScore >= 80 ? '🟢 High-Confidence Readiness' :
                   readinessScore >= 60 ? '🟡 Moderate Readiness' :
                   readinessScore >= 40 ? '🟠 Low Readiness' : '🔴 Critical Readiness'}
                </p>
                {riskData && (
                  <div className="readiness-details">
                    <p>Intervention Delay: {riskData.delay_days || 0} days</p>
                    <p>Disaster Type: {riskData.disaster_type || 'Tsunami'}</p>
                    {riskData.timeline && riskData.timeline[0] && (
                      <>
                        <p>Structural Failure Delta: {((riskData.timeline[0].infrastructure_damage || 0) * 100).toFixed(1)}%</p>
                        <p>Resource Exhaustion Rate: {((riskData.timeline[0].hospital_metrics?.bed_occupancy || 0)).toFixed(1)}%</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Why This Decision Panel */}
              {analysisData && (
                <WhyThisDecision
                  riskDrivers={analysisData.risk_drivers}
                  sensorData={analysisData.sensor_data}
                  confidence={analysisData.confidence}
                  disasterType={disasterType}
                />
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Click "Analyze Disaster Risk" to begin analysis</p>
              <p className="empty-hint">The analysis will automatically trigger the Consequence Mirror simulation</p>
            </div>
          )}

          {/* Impact Cards - Visual Impact Metrics */}
          {consequencesLoading ? (
            <LoadingSpinner message="Loading impact metrics..." />
          ) : consequencesData ? (
            <>
              <ImpactCards consequencesData={consequencesData} />
              <TimelineView consequencesData={consequencesData} analysisData={analysisData} />
              <CascadingFailures 
                riskLevel={riskLevel} 
                delayDays={riskData?.delay_days || 0}
                analysisData={analysisData}
              />
              <ButterflyEffect consequencesData={consequencesData} analysisData={analysisData} />
            </>
          ) : null}
        </div>
      </section>

      {/* Consequence Mirror Section - Integrated into Dashboard */}
      {riskData && disasterType ? (
        <motion.section
          ref={mirrorRef}
          className="mirror-section-dashboard"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <ConsequenceMirror
              currentRiskData={riskData}
              onInterventionChange={onInterventionChange}
              disasterType={disasterType}
              confidenceScore={analysisData?.confidence}
            />
          </motion.div>
        </motion.section>
      ) : null}
    </div>
  )
}

export default Dashboard
