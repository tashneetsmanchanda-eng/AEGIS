import { useState } from 'react'
import type { Location } from '../types'
import { fetchWeather, getWeatherEmoji, type WeatherData } from '../services/weatherApi'
import './LocationSelector.css'

interface Props {
  selectedLocation: Location | null
  onLocationSelect: (location: Location | null) => void
  onWeatherFetched?: (weather: WeatherData) => void
}

// Sample locations with risk profiles
const PRESET_LOCATIONS: Location[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    coordinates: { lat: 19.076, lng: 72.8777 },
    riskProfile: { floodProne: true, monsoonAffected: true, coastalArea: true }
  },
  {
    id: 'chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    riskProfile: { floodProne: true, monsoonAffected: true, coastalArea: true }
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    region: 'West Bengal',
    country: 'India',
    coordinates: { lat: 22.5726, lng: 88.3639 },
    riskProfile: { floodProne: true, monsoonAffected: true, coastalArea: false }
  },
  {
    id: 'dhaka',
    name: 'Dhaka',
    region: 'Dhaka Division',
    country: 'Bangladesh',
    coordinates: { lat: 23.8103, lng: 90.4125 },
    riskProfile: { floodProne: true, monsoonAffected: true, coastalArea: false }
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    region: 'Java',
    country: 'Indonesia',
    coordinates: { lat: -6.2088, lng: 106.8456 },
    riskProfile: { floodProne: true, monsoonAffected: true, coastalArea: true }
  }
]

function LocationSelector({ selectedLocation, onLocationSelect, onWeatherFetched }: Props) {
  const [showCustom, setShowCustom] = useState(false)
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [customName, setCustomName] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(false)

  const handleLocationSelect = async (location: Location) => {
    onLocationSelect(location)
    setShowCustom(false)
    
    // Fetch weather for the location
    setLoadingWeather(true)
    const weatherData = await fetchWeather(location.coordinates.lat, location.coordinates.lng)
    setWeather(weatherData)
    setLoadingWeather(false)
    
    if (weatherData && onWeatherFetched) {
      onWeatherFetched(weatherData)
    }
  }

  const handleCustomSubmit = async () => {
    const lat = parseFloat(customLat)
    const lng = parseFloat(customLng)
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (Lat: -90 to 90, Lng: -180 to 180)')
      return
    }

    const customLocation: Location = {
      id: 'custom',
      name: customName || 'Custom Location',
      region: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      country: 'Custom',
      coordinates: { lat, lng },
      riskProfile: { 
        floodProne: lat > 0 && lat < 30,  // Tropical zone
        monsoonAffected: lat > 5 && lat < 35,
        coastalArea: false  // Unknown
      }
    }

    await handleLocationSelect(customLocation)
  }

  return (
    <div className="location-selector">
      <div className="section-header">
        <h2>📍 Select Location</h2>
        <p className="section-description">
          Choose a preset location or enter custom coordinates for real-time weather data.
        </p>
      </div>
      
      {/* Preset Locations */}
      <div className="location-grid">
        {PRESET_LOCATIONS.map(location => (
          <button
            key={location.id}
            className={`location-card ${selectedLocation?.id === location.id ? 'selected' : ''}`}
            onClick={() => handleLocationSelect(location)}
          >
            <div className="location-header">
              <span className="location-name">{location.name}</span>
              {location.riskProfile.floodProne && <span className="risk-badge">🌊</span>}
            </div>
            <div className="location-details">
              <span className="location-region">{location.region}, {location.country}</span>
            </div>
            <div className="risk-tags">
              {location.riskProfile.monsoonAffected && <span className="tag monsoon">Monsoon</span>}
              {location.riskProfile.coastalArea && <span className="tag coastal">Coastal</span>}
            </div>
          </button>
        ))}
        
        {/* Custom Location Button */}
        <button
          className={`location-card custom-card ${showCustom ? 'selected' : ''}`}
          onClick={() => setShowCustom(!showCustom)}
        >
          <div className="location-header">
            <span className="location-name">📌 Custom</span>
          </div>
          <div className="location-details">
            <span className="location-region">Enter coordinates</span>
          </div>
          <div className="risk-tags">
            <span className="tag custom">GPS</span>
          </div>
        </button>
      </div>

      {/* Custom Location Input */}
      {showCustom && (
        <div className="custom-location-form">
          <h4>Enter Custom Coordinates</h4>
          <div className="coord-inputs">
            <div className="coord-group">
              <label htmlFor="custom-name">Location Name (optional)</label>
              <input
                type="text"
                id="custom-name"
                placeholder="My Location"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div className="coord-row">
              <div className="coord-group">
                <label htmlFor="custom-lat">Latitude</label>
                <input
                  type="number"
                  id="custom-lat"
                  placeholder="e.g., 19.076"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  min="-90"
                  max="90"
                  step="0.0001"
                />
              </div>
              <div className="coord-group">
                <label htmlFor="custom-lng">Longitude</label>
                <input
                  type="number"
                  id="custom-lng"
                  placeholder="e.g., 72.877"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  min="-180"
                  max="180"
                  step="0.0001"
                />
              </div>
            </div>
          </div>
          <button className="fetch-weather-btn" onClick={handleCustomSubmit}>
            🌐 Fetch Weather & Set Location
          </button>
        </div>
      )}

      {/* Selected Location Info with Weather */}
      {selectedLocation && (
        <div className="selected-info">
          <div className="info-main">
            <div className="info-icon">✓</div>
            <div className="info-text">
              <strong>{selectedLocation.name}</strong>
              <span className="coords">
                ({selectedLocation.coordinates.lat.toFixed(4)}°, {selectedLocation.coordinates.lng.toFixed(4)}°)
              </span>
            </div>
          </div>
          
          {/* Weather Display */}
          {loadingWeather ? (
            <div className="weather-loading">
              <span className="spinner-small"></span>
              Fetching weather...
            </div>
          ) : weather && (
            <div className="weather-display">
              <div className="weather-main">
                <span className="weather-emoji">{getWeatherEmoji(weather)}</span>
                <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
                <span className="weather-desc">{weather.description}</span>
              </div>
              <div className="weather-details">
                <span>💧 {weather.humidity}% humidity</span>
                <span>🌧️ {weather.rainfall.toFixed(1)}mm rain</span>
                <span>💨 {weather.windSpeed.toFixed(1)} m/s</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LocationSelector
