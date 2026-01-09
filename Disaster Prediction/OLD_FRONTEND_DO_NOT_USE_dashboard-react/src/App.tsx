import { useState, useEffect, useRef } from 'react'
import './App.css'
import type { PredictionResult } from './types'
import { fetchWeather, weatherToParameters, getWeatherEmoji, type WeatherData } from './services/weatherApi'
import { fetchFloodData, calculateFloodRisk, getDischargeDescription, type FloodForecast } from './services/floodApi'
import { getFloodStats } from './services/historicalFloodData'
import { INDIAN_STATES, INTERNATIONAL_LOCATIONS, type State, type City } from './data/locations'

interface AssessmentStep {
  label: string
  value: number | string
  icon: string
  status: 'pending' | 'loading' | 'done'
  unit?: string
}

type TabType = 'states' | 'international' | 'custom'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('states')
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [floodData, setFloodData] = useState<FloodForecast | null>(null)
  const [steps, setSteps] = useState<AssessmentStep[]>([])
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [customName, setCustomName] = useState('')
  const [dataSource, setDataSource] = useState<'real' | 'estimated'>('estimated')
  const [historicalStats, setHistoricalStats] = useState<ReturnType<typeof getFloodStats> | null>(null)
  const hasInitialized = useRef(false)

  // Auto-detect and load user location on mount
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const userLocation: City = {
            name: 'Your Location',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
          await handleCitySelect(userLocation)
        },
        async () => {
          // Fallback to Mumbai if geolocation denied
          const mumbai = INDIAN_STATES[0].cities[0]
          await handleCitySelect(mumbai)
        },
        { timeout: 3000 }
      )
    } else {
      // No geolocation - use Mumbai
      const mumbai = INDIAN_STATES[0].cities[0]
      handleCitySelect(mumbai)
    }
  }, [])

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city)
    setIsLoading(true)
    setResult(null)
    setSteps([])
    
    // Fetch weather and flood data in parallel
    const [weatherData, floodDataResult] = await Promise.all([
      fetchWeather(city.lat, city.lng),
      fetchFloodData(city.lat, city.lng)
    ])
    
    setWeather(weatherData)
    setFloodData(floodDataResult)
    
    // Get historical flood stats for this location (EMDAT real data)
    const histStats = getFloodStats(city.lat, city.lng, 150)
    setHistoricalStats(histStats)
    
    // Check if we have real flood data
    const hasRealFloodData = floodDataResult && floodDataResult.daily?.river_discharge?.length > 0
    setDataSource(hasRealFloodData ? 'real' : 'estimated')
    
    if (weatherData) {
      const params = weatherToParameters(weatherData)
      await runAssessment(params, floodDataResult)
    }
    setIsLoading(false)
  }

  const handleCustomSubmit = async () => {
    const lat = parseFloat(customLat)
    const lng = parseFloat(customLng)
    if (isNaN(lat) || isNaN(lng)) return

    await handleCitySelect({
      name: customName || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      lat, lng
    })
  }

  const runAssessment = async (params: ReturnType<typeof weatherToParameters>, floodDataResult: FloodForecast | null) => {
    // Calculate real flood risk if data available
    const realFloodRisk = floodDataResult ? calculateFloodRisk(floodDataResult) : null
    
    // Build assessment steps - using REAL data where available
    const assessmentSteps: AssessmentStep[] = []
    
    // Step 1: River Discharge (REAL DATA from GloFAS)
    if (realFloodRisk && realFloodRisk.currentDischarge > 0) {
      assessmentSteps.push({
        label: 'River Discharge (Live)',
        value: `${realFloodRisk.currentDischarge.toFixed(0)} m³/s`,
        icon: '🌊',
        status: 'pending',
        unit: 'm³/s'
      })
    }
    
    // Step 2: Discharge vs Average (REAL DATA)
    if (realFloodRisk) {
      const status = getDischargeDescription(realFloodRisk.percentageAboveMean)
      assessmentSteps.push({
        label: 'vs Historical Average',
        value: `${realFloodRisk.percentageAboveMean > 0 ? '+' : ''}${realFloodRisk.percentageAboveMean.toFixed(0)}%`,
        icon: realFloodRisk.percentageAboveMean > 50 ? '⚠️' : '📊',
        status: 'pending'
      })
    }
    
    // Step 3: Weather conditions (REAL DATA)
    assessmentSteps.push({
      label: 'Rainfall',
      value: params.monsoonIntensity,
      icon: '🌧️',
      status: 'pending'
    })
    
    // Step 4: Temperature/Climate
    assessmentSteps.push({
      label: 'Climate Stress',
      value: params.climateChange,
      icon: '🌡️',
      status: 'pending'
    })
    
    // Step 5: Local factors
    const locRisk = getLocationRiskFactor(selectedCity)
    assessmentSteps.push({
      label: 'Local Infrastructure',
      value: 10 - locRisk.drainageIssue,
      icon: '🏗️',
      status: 'pending'
    })
    
    setSteps(assessmentSteps)
    
    // Animate steps
    for (let i = 0; i < assessmentSteps.length; i++) {
      await new Promise(r => setTimeout(r, 200))
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'loading' } : s))
      await new Promise(r => setTimeout(r, 150))
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s))
    }
    
    await new Promise(r => setTimeout(r, 200))
    
    // Calculate flood probability - use REAL data if available, otherwise estimate
    let floodProb: number
    let floodRiskLevel: string
    
    if (realFloodRisk && realFloodRisk.currentDischarge > 0) {
      // USE REAL DATA from GloFAS!
      floodProb = realFloodRisk.probability
      floodRiskLevel = realFloodRisk.riskLevel
    } else {
      // Fallback to estimation
      const monsoon = params.monsoonIntensity / 10
      const drainage = params.drainageStress / 10
      floodProb = Math.min(0.95, Math.max(0.08, 0.1 + monsoon * 0.25 + drainage * 0.2 + locRisk.historicalRisk * 0.2))
      floodRiskLevel = floodProb < 0.2 ? 'LOW' : floodProb < 0.4 ? 'MODERATE' : floodProb < 0.6 ? 'HIGH' : floodProb < 0.8 ? 'VERY HIGH' : 'CRITICAL'
    }
    
    // Disease risks based on flood probability and weather
    const humidity = params.climateChange / 10
    const malariaRisk = Math.min(0.9, floodProb * 0.5 + humidity * 0.2 + Math.random() * 0.05)
    const choleraRisk = Math.min(0.85, floodProb * 0.45 + humidity * 0.15)
    const leptoRisk = Math.min(0.7, floodProb * 0.4)
    const hepatitisRisk = Math.min(0.6, floodProb * 0.3)
    const overallRisk = (malariaRisk + choleraRisk + leptoRisk + hepatitisRisk) / 4

    const getDiseaseRiskLevel = (p: number) => {
      if (p < 0.2) return 'LOW'
      if (p < 0.4) return 'MODERATE'
      if (p < 0.6) return 'HIGH'
      if (p < 0.8) return 'VERY HIGH'
      return 'CRITICAL'
    }

    setResult({
      flood_probability: floodProb,
      flood_risk_level: floodRiskLevel,
      disease_risks: { malaria: malariaRisk, cholera: choleraRisk, leptospirosis: leptoRisk, hepatitis: hepatitisRisk },
      overall_disease_risk: overallRisk,
      disease_risk_level: getDiseaseRiskLevel(overallRisk),
      recommendations: floodProb > 0.5 
        ? ['⚠️ High flood risk - activate emergency protocols', '🦟 Deploy mosquito control measures', '💧 Stock water purification supplies', '🏥 Alert healthcare facilities']
        : floodProb > 0.3
        ? ['📋 Moderate risk - increase monitoring', '🦟 Prepare mosquito control', '💧 Check water quality systems']
        : ['✅ Risk within normal range', '📋 Maintain standard monitoring']
    })
  }

  // Location-specific risk factors
  const getLocationRiskFactor = (city: City | null) => {
    if (!city) return { monsoonBase: 3, drainageIssue: 2, coastalRisk: 3, preparedness: 5, historicalRisk: 0.3 }
    
    const name = city.name.toLowerCase()
    const lat = city.lat
    
    // Check if this is a custom/unknown location (not a named city we know)
    const isCustomLocation = name.includes('your location') || 
                             name.includes('°') || 
                             !INDIAN_STATES.some(s => s.cities.some(c => c.name.toLowerCase() === name)) &&
                             !INTERNATIONAL_LOCATIONS.some(c => c.name.toLowerCase() === name)
    
    if (isCustomLocation) {
      // Estimate based on latitude and current weather
      const isTropical = Math.abs(lat) < 25
      const isMonsoonZone = lat > 5 && lat < 35 && city.lng > 60 && city.lng < 120
      const isCoastal = false // Can't determine from coords alone
      
      // Use weather data more heavily for custom locations
      const monsoonBase = isTropical ? 6 : isMonsoonZone ? 5 : 3
      const drainageIssue = 3 // Unknown, assume average
      const coastalRisk = 3 // Unknown, assume average
      const preparedness = 5 // Unknown, assume average
      const historicalRisk = isTropical && isMonsoonZone ? 0.5 : 0.3
      
      return { monsoonBase, drainageIssue, coastalRisk, preparedness, historicalRisk }
    }
    
    // High-risk flood cities (based on historical data)
    if (name.includes('mumbai') || name.includes('chennai')) {
      return { monsoonBase: 7, drainageIssue: 4, coastalRisk: 8, preparedness: 6, historicalRisk: 0.7 }
    }
    if (name.includes('kolkata') || name.includes('dhaka') || name.includes('patna')) {
      return { monsoonBase: 8, drainageIssue: 5, coastalRisk: 5, preparedness: 4, historicalRisk: 0.75 }
    }
    if (name.includes('guwahati') || name.includes('dibrugarh') || name.includes('silchar')) {
      return { monsoonBase: 9, drainageIssue: 4, coastalRisk: 3, preparedness: 4, historicalRisk: 0.8 }
    }
    if (name.includes('hyderabad') || name.includes('bangalore') || name.includes('bengaluru')) {
      return { monsoonBase: 5, drainageIssue: 5, coastalRisk: 2, preparedness: 7, historicalRisk: 0.4 }
    }
    if (name.includes('jakarta')) {
      return { monsoonBase: 8, drainageIssue: 6, coastalRisk: 9, preparedness: 5, historicalRisk: 0.85 }
    }
    if (name.includes('kochi') || name.includes('mangaluru') || name.includes('visakhapatnam')) {
      return { monsoonBase: 7, drainageIssue: 3, coastalRisk: 7, preparedness: 6, historicalRisk: 0.55 }
    }
    
    // Moderate risk cities
    if (name.includes('pune') || name.includes('nagpur') || name.includes('indore')) {
      return { monsoonBase: 5, drainageIssue: 3, coastalRisk: 1, preparedness: 6, historicalRisk: 0.35 }
    }
    
    // Lower risk (inland, good infrastructure)
    if (name.includes('jaipur') || name.includes('delhi') || name.includes('chandigarh')) {
      return { monsoonBase: 4, drainageIssue: 3, coastalRisk: 1, preparedness: 7, historicalRisk: 0.25 }
    }
    
    // Default moderate risk
    return { monsoonBase: 5, drainageIssue: 3, coastalRisk: 3, preparedness: 5, historicalRisk: 0.4 }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return '#10b981'
      case 'MODERATE': return '#eab308'
      case 'HIGH': return '#f97316'
      case 'VERY HIGH': return '#ef4444'
      case 'CRITICAL': return '#dc2626'
      default: return '#a855f7'
    }
  }

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="bg-effects">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-glow">🌊</div>
          <div>
            <h1>Disaster <span className="gradient-text">Prediction</span></h1>
            <span className="tagline">AI-Powered Risk Assessment</span>
          </div>
        </div>
        <div className="header-stats">
          {selectedCity && (
            <>
              <div className="header-stat">
                <span className="stat-icon">📍</span>
                <span className="stat-value">{selectedCity.name}</span>
              </div>
              {weather && (
                <div className="header-stat">
                  <span className="stat-icon">{getWeatherEmoji(weather)}</span>
                  <span className="stat-value">{Math.round(weather.temperature)}°C</span>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <main className="main">
        {/* Left Sidebar - Location Selector */}
        <aside className="sidebar glass">
          {/* Always-visible My Location Button */}
          <button className="my-location-btn" onClick={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  await handleCitySelect({
                    name: 'Your Location',
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                  })
                },
                () => alert('Please enable location access')
              )
            }
          }}>
            <span className="pulse-dot"></span>
            <span>📍 My Location</span>
          </button>

          {/* Tabs */}
          <div className="tabs">
            {[
              { id: 'states' as TabType, icon: '🇮🇳', label: 'States' },
              { id: 'international' as TabType, icon: '🌏', label: 'World' },
              { id: 'custom' as TabType, icon: '📍', label: 'Custom' },
            ].map(tab => (
              <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setSelectedState(null) }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-content">
            {/* States Tab - Dropdown Selects */}
            {activeTab === 'states' && (
              <div className="dropdown-section">
                <div className="form-group">
                  <label>Select State</label>
                  <select 
                    className="dropdown"
                    value={selectedState?.code || ''}
                    onChange={(e) => {
                      const state = INDIAN_STATES.find(s => s.code === e.target.value)
                      setSelectedState(state || null)
                    }}
                  >
                    <option value="">-- Choose State --</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>

                {selectedState && (
                  <div className="form-group">
                    <label>Select City</label>
                    <select 
                      className="dropdown"
                      defaultValue=""
                      onChange={(e) => {
                        const city = selectedState.cities.find(c => c.name === e.target.value)
                        if (city) handleCitySelect(city)
                      }}
                    >
                      <option value="">-- Choose City --</option>
                      {selectedState.cities.map(city => (
                        <option key={city.name} value={city.name}>
                          {city.name} {city.isCapital ? '★' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* International */}
            {activeTab === 'international' && (
              <>
                <h3 className="sidebar-label">International</h3>
                <div className="cities-scroll">
                  {INTERNATIONAL_LOCATIONS.map(city => (
                    <button key={city.name} className={`city-item ${selectedCity?.name === city.name ? 'active' : ''}`} onClick={() => handleCitySelect(city)}>
                      <span className="city-name">{city.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Custom */}
            {activeTab === 'custom' && (
              <div className="custom-form">
                <h3 className="sidebar-label">Custom Coordinates</h3>
                <input type="text" placeholder="Name (optional)" value={customName} onChange={e => setCustomName(e.target.value)} />
                <div className="coord-row">
                  <input type="number" placeholder="Latitude" value={customLat} onChange={e => setCustomLat(e.target.value)} step="0.001" />
                  <input type="number" placeholder="Longitude" value={customLng} onChange={e => setCustomLng(e.target.value)} step="0.001" />
                </div>
                <button className="analyze-btn" onClick={handleCustomSubmit}>
                  🔍 Analyze
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <div className="dashboard">
          {/* Top Row - Key Metrics */}
          <div className="metrics-row">
            {/* Weather Card */}
            <div className="metric-card glass weather-metric">
              <div className="metric-header">
                <span className="metric-icon">{weather ? getWeatherEmoji(weather) : '🌤️'}</span>
                <span className="metric-title">Current Weather</span>
              </div>
              {weather ? (
                <div className="weather-content">
                  <span className="big-temp">{Math.round(weather.temperature)}°</span>
                  <div className="weather-details">
                    <span>{weather.description}</span>
                    <span>💧 {weather.humidity}% humidity</span>
                    <span>🌧️ {weather.rainfall.toFixed(1)}mm rainfall</span>
                  </div>
                </div>
              ) : (
                <div className="loading-pulse">Loading...</div>
              )}
            </div>

            {/* Flood Risk Card */}
            <div className="metric-card glass flood-metric">
              <div className="metric-header">
                <span className="metric-icon">🌊</span>
                <span className="metric-title">Flood Risk</span>
                {dataSource === 'real' && <span className="data-badge">📡 GloFAS Live</span>}
                {result && <span className="risk-tag" style={{ background: getRiskColor(result.flood_risk_level) }}>{result.flood_risk_level}</span>}
              </div>
              {result ? (
                <div className="flood-content">
                  <div className="flood-gauge">
                    <svg viewBox="0 0 120 60">
                      <defs>
                        <linearGradient id="floodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981"/>
                          <stop offset="40%" stopColor="#eab308"/>
                          <stop offset="70%" stopColor="#f97316"/>
                          <stop offset="100%" stopColor="#ef4444"/>
                        </linearGradient>
                      </defs>
                      <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round"/>
                      <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="url(#floodGrad)" strokeWidth="10" strokeLinecap="round" 
                        strokeDasharray={`${result.flood_probability * 157} 157`}/>
                    </svg>
                    <span className="flood-pct">{Math.round(result.flood_probability * 100)}%</span>
                  </div>
                </div>
              ) : (
                <div className="loading-pulse">Calculating...</div>
              )}
            </div>

            {/* Disease Risk Card */}
            <div className="metric-card glass disease-metric">
              <div className="metric-header">
                <span className="metric-icon">🦠</span>
                <span className="metric-title">Disease Risk</span>
                {result && <span className="risk-tag" style={{ background: getRiskColor(result.disease_risk_level) }}>{result.disease_risk_level}</span>}
              </div>
              {result ? (
                <div className="disease-content">
                  <span className="disease-pct">{Math.round(result.overall_disease_risk * 100)}%</span>
                  <span className="disease-label">Overall outbreak probability</span>
                </div>
              ) : (
                <div className="loading-pulse">Analyzing...</div>
              )}
            </div>
          </div>

          {/* Middle Row - Assessment & Diseases */}
          <div className="details-row">
            {/* Assessment Progress */}
            <div className="detail-card glass">
              <h3>📊 Environmental Analysis</h3>
              <div className="steps-list">
                {steps.map((step, i) => (
                  <div key={i} className={`step-row ${step.status}`}>
                    <span className="s-icon">{step.icon}</span>
                    <span className="s-name">{step.label}</span>
                    <div className="s-bar">
                      <div className="s-fill" style={{ 
                        width: step.status === 'done' 
                          ? (typeof step.value === 'number' ? `${step.value * 10}%` : '100%') 
                          : '0%' 
                      }}></div>
                    </div>
                    <span className="s-val">
                      {step.status === 'done' 
                        ? (typeof step.value === 'number' ? `${step.value}/10` : step.value) 
                        : '...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disease Breakdown */}
            <div className="detail-card glass">
              <h3>🦠 Disease Breakdown</h3>
              {result && (
                <div className="disease-grid">
                  {[
                    { name: 'Malaria', icon: '🦟', val: result.disease_risks.malaria, color: '#ef4444' },
                    { name: 'Cholera', icon: '💧', val: result.disease_risks.cholera, color: '#3b82f6' },
                    { name: 'Leptospirosis', icon: '🐀', val: result.disease_risks.leptospirosis, color: '#f59e0b' },
                    { name: 'Hepatitis', icon: '🧬', val: result.disease_risks.hepatitis, color: '#a855f7' },
                  ].map(d => (
                    <div key={d.name} className="d-item">
                      <div className="d-top">
                        <span>{d.icon} {d.name}</span>
                        <span className="d-pct">{Math.round(d.val * 100)}%</span>
                      </div>
                      <div className="d-bar"><div className="d-fill" style={{ width: `${d.val * 100}%`, background: d.color }}></div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row - Recommendations */}
          {result && (
            <div className="recs-card glass">
              <h3>📋 Recommendations</h3>
              <div className="recs-grid">
                {result.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="rec-item">{rec}</div>
                ))}
              </div>
            </div>
          )}

          {/* Historical Flood Data (EMDAT) */}
          {historicalStats && historicalStats.totalFloods > 0 && (
            <div className="historical-card glass">
              <h3>
                📚 Historical Flood Records
                <span className="data-badge">🔬 EMDAT Data</span>
              </h3>
              <div className="historical-grid">
                <div className="hist-stat">
                  <span className="hist-value">{historicalStats.totalFloods}</span>
                  <span className="hist-label">Floods (150km radius)</span>
                </div>
                <div className="hist-stat">
                  <span className="hist-value">{historicalStats.totalDeaths.toLocaleString()}</span>
                  <span className="hist-label">Total Deaths</span>
                </div>
                <div className="hist-stat">
                  <span className="hist-value">{(historicalStats.totalDisplaced / 1000000).toFixed(1)}M</span>
                  <span className="hist-label">Displaced</span>
                </div>
                <div className="hist-stat">
                  <span className="hist-value">{historicalStats.avgSeverity.toFixed(1)}</span>
                  <span className="hist-label">Avg Severity</span>
                </div>
              </div>
              {historicalStats.mostRecent && (
                <div className="most-recent">
                  <span className="recent-label">Most Recent:</span>
                  <span className="recent-value">{historicalStats.mostRecent.Began.slice(0,10)} - {historicalStats.mostRecent.MainCause}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <span>Created by <strong>Nishant Prakash</strong> - Woxsen University</span>
      </footer>
    </div>
  )
}

export default App
