import type { PredictionResult, Location } from '../types'
import './ResultsPanel.css'

interface Props {
  result: PredictionResult | null
  location: Location | null
}

function ResultsPanel({ result, location }: Props) {
  if (!result) {
    return (
      <div className="results-empty">
        <div className="empty-icon">📊</div>
        <h3>Prediction Results</h3>
        <p>Select a location and adjust parameters, then click "Generate Prediction" to see risk analysis.</p>
      </div>
    )
  }

  const floodPercent = Math.round(result.flood_probability * 100)
  const overallDiseasePercent = Math.round(result.overall_disease_risk * 100)

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'LOW': return '#10b981'
      case 'MODERATE': return '#f59e0b'
      case 'HIGH': return '#f97316'
      case 'VERY HIGH': return '#ef4444'
      case 'CRITICAL': return '#dc2626'
      default: return '#64748b'
    }
  }

  const diseases = [
    { key: 'malaria', name: 'Malaria', icon: '🦟', value: result.disease_risks.malaria, description: 'Mosquito-borne' },
    { key: 'cholera', name: 'Cholera', icon: '💧', value: result.disease_risks.cholera, description: 'Waterborne' },
    { key: 'leptospirosis', name: 'Leptospirosis', icon: '🐀', value: result.disease_risks.leptospirosis, description: 'Flood water contact' },
    { key: 'hepatitis', name: 'Hepatitis A/E', icon: '🧬', value: result.disease_risks.hepatitis, description: 'Sanitation failure' },
  ]

  return (
    <div className="results-panel">
      {/* Location Context Banner */}
      {location && (
        <div className="location-banner">
          <span className="banner-icon">📍</span>
          <span className="banner-text">
            Risk Assessment for <strong>{location.name}</strong>, {location.country}
          </span>
        </div>
      )}

      {/* Flood Risk Card */}
      <div className="result-card flood-card">
        <div className="card-header">
          <h3>🌊 Flood Risk</h3>
          <span 
            className="risk-badge"
            style={{ backgroundColor: getRiskColor(result.flood_risk_level) + '20', color: getRiskColor(result.flood_risk_level) }}
          >
            {result.flood_risk_level}
          </span>
        </div>
        
        <div className="gauge-container">
          <svg viewBox="0 0 200 120" className="gauge-svg">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="40%" stopColor="#f59e0b"/>
                <stop offset="70%" stopColor="#f97316"/>
                <stop offset="100%" stopColor="#ef4444"/>
              </linearGradient>
            </defs>
            <path 
              d="M 20 100 A 80 80 0 0 1 180 100" 
              fill="none" 
              stroke="rgba(71, 85, 105, 0.3)" 
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path 
              d="M 20 100 A 80 80 0 0 1 180 100" 
              fill="none" 
              stroke="url(#gaugeGradient)" 
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${251.2 * result.flood_probability} 251.2`}
              className="gauge-fill"
            />
          </svg>
          <div className="gauge-value">{floodPercent}%</div>
          <div className="gauge-sublabel">probability of flooding</div>
        </div>
      </div>

      {/* Disease Risks Card */}
      <div className="result-card disease-card">
        <div className="card-header">
          <h3>🦠 Disease Outbreak Risks</h3>
          <span 
            className="risk-badge"
            style={{ backgroundColor: getRiskColor(result.disease_risk_level) + '20', color: getRiskColor(result.disease_risk_level) }}
          >
            {result.disease_risk_level}
          </span>
        </div>

        <div className="disease-grid">
          {diseases.map(disease => (
            <div key={disease.key} className="disease-item">
              <div className="disease-header">
                <span className="disease-icon">{disease.icon}</span>
                <div className="disease-info">
                  <span className="disease-name">{disease.name}</span>
                  <span className="disease-desc">{disease.description}</span>
                </div>
                <span className="disease-value">{Math.round(disease.value * 100)}%</span>
              </div>
              <div className="disease-bar">
                <div 
                  className="disease-bar-fill"
                  style={{ 
                    width: `${disease.value * 100}%`,
                    background: disease.value > 0.4 
                      ? 'linear-gradient(90deg, #f97316, #ef4444)' 
                      : disease.value > 0.2 
                        ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                        : 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="overall-disease">
          <span className="overall-label">Overall Disease Outbreak Risk</span>
          <div className="overall-stats">
            <span className="overall-value">{overallDiseasePercent}%</span>
            <span 
              className="overall-badge"
              style={{ backgroundColor: getRiskColor(result.disease_risk_level) + '20', color: getRiskColor(result.disease_risk_level) }}
            >
              {result.disease_risk_level}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="result-card recommendations-card">
        <div className="card-header">
          <h3>📋 Recommended Actions</h3>
        </div>
        <ul className="recommendations-list">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ResultsPanel
