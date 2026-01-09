import './RealTimeInfo.css'

function RealTimeInfo() {
  return (
    <div className="realtime-info">
      <div className="info-header">
        <h2>📡 Real-Time Data Integration</h2>
        <span className="beta-badge">Coming Soon</span>
      </div>
      
      <div className="info-content">
        <p>
          Currently, predictions use manual input parameters. Here's how real-time data can be integrated:
        </p>
        
        <div className="integration-grid">
          <div className="integration-card">
            <div className="integration-icon">🌧️</div>
            <h4>Weather APIs</h4>
            <p>OpenWeatherMap, Tomorrow.io for real-time rainfall and forecasts</p>
            <code>GET /weather?lat=19.07&lon=72.87</code>
          </div>
          
          <div className="integration-card">
            <div className="integration-icon">🛰️</div>
            <h4>Satellite Data</h4>
            <p>NASA FIRMS, Copernicus for flood extent and water levels</p>
            <code>MODIS, Sentinel-1 SAR imagery</code>
          </div>
          
          <div className="integration-card">
            <div className="integration-icon">📊</div>
            <h4>Government APIs</h4>
            <p>India Water Resources, IMD for river levels and monsoon alerts</p>
            <code>india.gov.in/water-resources</code>
          </div>
          
          <div className="integration-card">
            <div className="integration-icon">🏥</div>
            <h4>Health Data</h4>
            <p>WHO DHIS2, local health dashboards for disease surveillance</p>
            <code>IDSP outbreak reports</code>
          </div>
        </div>

        <div className="implementation-steps">
          <h4>🔧 To integrate real-time data:</h4>
          <ol>
            <li>Create API adapters in <code>api/data_sources/</code></li>
            <li>Schedule data fetching with background tasks (Celery/APScheduler)</li>
            <li>Update model features with live data before prediction</li>
            <li>Cache results with Redis for performance</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default RealTimeInfo
