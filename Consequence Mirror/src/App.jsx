import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard from './Dashboard'
import ConsequenceMirror from './components/ConsequenceMirror'
import ConnectionError from './components/ConnectionError'
// Butterfly Swarm removed to eliminate transition conflicts
import './App.css'

/**
 * Main App Component
 * Lifts state up to share risk_data between Dashboard and ConsequenceMirror
 */
function App() {
  // Lifted State - Shared between Dashboard and Mirror
  const [riskData, setRiskData] = useState(null)
  const [disasterType, setDisasterType] = useState(null)
  const [riskLevel, setRiskLevel] = useState(null)
  const [delayDays, setDelayDays] = useState(0)
  const [readinessScore, setReadinessScore] = useState(100)
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [connectionError, setConnectionError] = useState(null)

  // Refs for smooth scrolling
  const mirrorRef = useRef(null)
  const dashboardRef = useRef(null)

  // Fetch simulation data when disaster type or delay changes
  useEffect(() => {
    if (!disasterType) return

    const fetchSimulation = async () => {
      setLoading(true)
      try {
        const response = await axios.post('http://localhost:8000/simulate', {
          disaster_type: disasterType,
          delay_days: delayDays
        })
        setRiskData(response.data)
        setReadinessScore(response.data.readiness_score || 100)
      } catch (error) {
        console.error('Error fetching simulation:', error)
        // Check if it's a connection error
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || !error.response) {
          setConnectionError('Unable to connect to simulation server. Please ensure the backend is running on http://localhost:8000')
          setRiskData(null)
        } else {
          // Other errors - use fallback data
          setConnectionError(null)
          setRiskData({
            disaster_type: disasterType,
            delay_days: delayDays,
            readiness_score: 100 - delayDays * 10,
            timeline: []
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSimulation()
  }, [disasterType, delayDays])

  // Handle intervention delay change from Mirror - updates globally
  const handleInterventionChange = (newDelay) => {
    setDelayDays(newDelay)
    // Risk data and readiness score will update automatically via useEffect
  }

  // Analyze disaster using AEGIS Prediction Engine
  const handleAnalyzeDisaster = async () => {
    setLoading(true)
    setConnectionError(null)  // Clear any previous errors
    try {
      // Call /predict/combined endpoint for Butterfly Effect simulation
      const response = await axios.post('http://127.0.0.1:8000/predict/combined', {
        location: 'Coastal Region',
        risk_factors: {
          seismic_activity: 6.5,
          weather_patterns: 'unstable'
        },
        // Sensor inputs for weighted probability model
        magnitude: 7.8,  // For Tsunami/Earthquake
        wind_speed: null,  // For Cyclone
        water_level: null,  // For Flood
        precipitation: 120,  // For Flood (mm)
        soil_saturation: 85,  // For Flood (%)
        // AEGIS backend schema parameters (integer values)
        monsoon_intensity: 7,  // Monsoon intensity (integer scale)
        drainage_systems: 5   // Drainage system capacity (integer scale)
      })
      
      setAnalysisData(response.data)
      // Lock scope to Tsunami only for MVP stability
      setDisasterType('Tsunami')
      setRiskLevel(response.data.risk_level)
      
      // Check for medical mobilization plan (generated if hospital collapse predicted)
      if (response.data.medical_mobilization_plan) {
        console.log('Medical Mobilization Plan:', response.data.medical_mobilization_plan)
        // This could be displayed in the Dashboard or as an alert
      }
      
      // If confidence >= 85%, smooth scroll to Mirror after a brief delay
      // Non-blocking scroll that doesn't interfere with map rendering
      if (response.data.confidence >= 0.85) {
        // Use requestAnimationFrame for non-blocking scroll
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToMirror()
          }, 500)
        })
      }
      
      // Automatically fetch simulation for predicted disaster
      // This will trigger the useEffect above
    } catch (error) {
      console.error('Error analyzing disaster:', error)
      // TASK 3: Replace red Connection Error with 'Synchronizing Swarm Intelligence...' loading state
      if (error.response) {
        const status = error.response.status
        if (status === 500) {
          // TASK 3: Show "Synchronizing Swarm Intelligence..." message instead of red crash box
          setConnectionError('Synchronizing Swarm Intelligence... Please wait a moment and try again.')
        } else if (status === 404) {
          setConnectionError('Synchronizing Swarm Intelligence... Endpoint not found. Please ensure the backend is running.')
        } else {
          setConnectionError(`Synchronizing Swarm Intelligence... Request failed with status ${status}. Please try again.`)
        }
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || !error.response) {
        // TASK 3: Connection error - show "Synchronizing Swarm Intelligence..." loading state
        console.log('Synchronizing Swarm Intelligence...')
        // Only set connection error after a delay to allow for server startup
        setTimeout(() => {
          if (!analysisData) {
            setConnectionError('Synchronizing Swarm Intelligence... Please ensure the backend is running on http://127.0.0.1:8000')
          }
        }, 3000)
      } else {
        setConnectionError('Synchronizing Swarm Intelligence... Please check your connection and try again.')
      }
      // Reset state on error to prevent UI crash
      setAnalysisData(null)
      setDisasterType(null)
      setRiskLevel(null)
      setRiskData(null)
    } finally {
      setLoading(false)
    }
  }

  // Smooth scroll to Mirror section - Non-blocking, instant execution
  const scrollToMirror = () => {
    // Use requestAnimationFrame to ensure it doesn't block rendering
    requestAnimationFrame(() => {
      if (mirrorRef.current) {
        mirrorRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  }

  // Retry connection handler
  const handleRetryConnection = () => {
    setConnectionError(null)
    if (disasterType) {
      // Retry simulation fetch
      handleInterventionChange(delayDays)
    } else {
      // Retry analysis
      handleAnalyzeDisaster()
    }
  }

  return (
    <div className="App" ref={dashboardRef}>
      {/* Connection Error Display */}
      {connectionError && (
        <ConnectionError 
          message={connectionError}
          onRetry={handleRetryConnection}
        />
      )}
      
      {/* Dashboard Section (includes Mirror) */}
      <Dashboard
        riskData={riskData}
        disasterType={disasterType}
        riskLevel={riskLevel}
        readinessScore={readinessScore}
        loading={loading}
        analysisData={analysisData}
        onAnalyzeDisaster={handleAnalyzeDisaster}
        onScrollToMirror={scrollToMirror}
        onInterventionChange={handleInterventionChange}
        mirrorRef={mirrorRef}
      />
    </div>
  )
}

export default App
