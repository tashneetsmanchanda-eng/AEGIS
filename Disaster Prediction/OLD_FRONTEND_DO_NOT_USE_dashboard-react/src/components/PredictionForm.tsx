import { useState, useEffect } from 'react'
import type { Location } from '../types'
import './PredictionForm.css'

interface WeatherParams {
  monsoonIntensity: number
  climateChange: number
  drainageStress: number
  temperatureRisk: number
}

interface Props {
  location: Location | null
  onPredict: (data: Record<string, number>) => void
  isLoading: boolean
  weatherParams?: WeatherParams | null
}

interface SliderConfig {
  id: string
  label: string
  icon: string
  min: number
  max: number
  defaultValue: number
  description: string
  inverted?: boolean // Higher is worse for risk
  weatherKey?: keyof WeatherParams // Maps to weather param
}

const SLIDER_CONFIGS: SliderConfig[] = [
  { id: 'monsoon_intensity', label: 'Monsoon Intensity', icon: '🌧️', min: 1, max: 10, defaultValue: 5, description: 'Rainfall severity', weatherKey: 'monsoonIntensity' },
  { id: 'drainage_systems', label: 'Drainage Quality', icon: '🚰', min: 1, max: 10, defaultValue: 5, description: 'Infrastructure quality', inverted: true },
  { id: 'urbanization', label: 'Urbanization Level', icon: '🏙️', min: 1, max: 10, defaultValue: 5, description: 'Population density' },
  { id: 'deforestation', label: 'Deforestation', icon: '🌳', min: 1, max: 10, defaultValue: 5, description: 'Forest cover loss' },
  { id: 'disaster_preparedness', label: 'Disaster Preparedness', icon: '🛡️', min: 1, max: 10, defaultValue: 5, description: 'Emergency readiness', inverted: true },
  { id: 'river_management', label: 'River Management', icon: '🌊', min: 1, max: 10, defaultValue: 5, description: 'Flood control systems', inverted: true },
]

function PredictionForm({ location, onPredict, isLoading, weatherParams }: Props) {
  const [values, setValues] = useState<Record<string, number>>({})
  const [autoFilled, setAutoFilled] = useState(false)

  // Initialize values based on location and weather
  useEffect(() => {
    const initial: Record<string, number> = {}
    SLIDER_CONFIGS.forEach(config => {
      initial[config.id] = config.defaultValue
    })
    
    // Pre-fill based on location risk profile
    if (location) {
      if (location.riskProfile.floodProne) initial.monsoon_intensity = 7
      if (location.riskProfile.monsoonAffected) initial.monsoon_intensity = 8
      if (location.riskProfile.coastalArea) initial.river_management = 4
    }
    
    // Override with weather params if available
    if (weatherParams) {
      initial.monsoon_intensity = weatherParams.monsoonIntensity
      // Invert drainage stress to quality (high stress = low quality)
      initial.drainage_systems = Math.max(1, 11 - weatherParams.drainageStress)
      setAutoFilled(true)
    } else {
      setAutoFilled(false)
    }
    
    setValues(initial)
  }, [location, weatherParams])

  const handleSliderChange = (id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }))
    setAutoFilled(false) // Manual override
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build full request with defaults
    const formData = {
      ...values,
      topography_drainage: values.drainage_systems || 5,
      climate_change: weatherParams?.climateChange || 6,
      siltation: 5,
      deteriorating_infrastructure: 5,
      coastal_vulnerability: location?.riskProfile.coastalArea ? 7 : 4,
      landslides: 4,
      watersheds: 5,
      population_score: values.urbanization || 5,
      wetland_loss: 5,
      inadequate_planning: 5,
      political_factors: 5,
    }
    
    onPredict(formData)
  }

  const getRiskLevel = (config: SliderConfig, value: number): string => {
    const effectiveValue = config.inverted ? 11 - value : value
    if (effectiveValue <= 3) return 'low'
    if (effectiveValue <= 6) return 'medium'
    return 'high'
  }

  return (
    <div className="prediction-form-card">
      <div className="section-header">
        <h2>⚙️ Environmental Parameters</h2>
        <p className="section-description">
          {location 
            ? `Configure conditions for ${location.name}` 
            : 'Select a location first, or use custom parameters'}
        </p>
        {autoFilled && (
          <div className="auto-fill-badge">
            <span className="badge-icon">🌐</span>
            <span>Auto-filled from live weather data</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="sliders-grid">
          {SLIDER_CONFIGS.map(config => (
            <div key={config.id} className={`slider-group ${autoFilled && config.weatherKey ? 'weather-filled' : ''}`}>
              <div className="slider-header">
                <label htmlFor={config.id}>
                  <span className="slider-icon">{config.icon}</span>
                  <span className="slider-label">{config.label}</span>
                  {autoFilled && config.weatherKey && <span className="live-badge">LIVE</span>}
                </label>
                <span className={`slider-value ${getRiskLevel(config, values[config.id] || config.defaultValue)}`}>
                  {values[config.id] || config.defaultValue}
                </span>
              </div>
              <input
                type="range"
                id={config.id}
                min={config.min}
                max={config.max}
                value={values[config.id] || config.defaultValue}
                onChange={(e) => handleSliderChange(config.id, parseInt(e.target.value))}
                className={`slider ${getRiskLevel(config, values[config.id] || config.defaultValue)}`}
              />
              <div className="slider-footer">
                <span className="slider-description">{config.description}</span>
                <span className="slider-range">
                  {config.inverted ? 'Poor' : 'Low'} → {config.inverted ? 'Excellent' : 'High'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Analyzing Risk Factors...
            </>
          ) : (
            <>
              <span className="button-icon">🔮</span>
              Generate Prediction
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default PredictionForm
