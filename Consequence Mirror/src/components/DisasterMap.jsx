// MANDATORY: Leaflet CSS must be imported FIRST before any other imports
import 'leaflet/dist/leaflet.css'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import L from 'leaflet'
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3'
import './DisasterMap.css'
import { getVulnerabilityData } from '../utils/vulnerabilityData'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

/**
 * MapController - Controls zoom level and flies to coordinates based on disaster type
 */
const MapController = ({ disasterType, center, targetCoordinates }) => {
  const map = useMap()
  
  useEffect(() => {
    // Safety check: Prevent ReferenceError if disasterType is undefined
    const currentType = disasterType || 'Tsunami'
    
    // Zoom levels based on disaster type
    const zoomLevels = {
      'Tsunami': 11,      // Zoom in for coastal focus
      'Flood': 10,        // Moderate zoom for river/coastal areas
      'Volcano': 9,       // Zoom out for wider volcanic region
      'Cyclone': 8,       // Zoom out for storm coverage
      'Earthquake': 10,
      'Wildfire': 9,
      'Drought': 8,
      'Pandemic': 7,
      'Terrorism': 12,
      'Nuclear': 9
    }
    
    const zoom = zoomLevels[currentType] || 10
    
    // If target coordinates are provided (from AI Agent), fly to them
    if (targetCoordinates && Array.isArray(targetCoordinates) && targetCoordinates.length === 2) {
      const [lat, lon] = targetCoordinates
      if (typeof lat === 'number' && typeof lon === 'number' && 
          -90 <= lat && lat <= 90 && -180 <= lon && lon <= 180) {
        map.flyTo([lat, lon], zoom, { 
          animate: true, 
          duration: 2.0  // Smooth 2-second flight
        })
        return
      }
    }
    
    // Otherwise, use provided center
    map.setView(center, zoom, { animate: true, duration: 1.5 })
  }, [disasterType, center, targetCoordinates, map]) // Note: disasterType is checked above as currentType
  
  return null
}

/**
 * MapResizer - Forces Leaflet to recalculate container size to fix black/white screen
 * The 'Jiggle' Fix: This "nudges" the map to draw the tiles correctly instead of staying white
 */
const MapResizer = () => {
  const map = useMap()
  
  useEffect(() => {
    // Force map redraw: Trigger invalidateSize() 500ms after component mounts
    // This forces Leaflet to recalculate container size and draw tiles
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 500)
    
    // Cleanup function to clear timeout if component unmounts
    return () => clearTimeout(timer)
  }, [map])
  
  return null
}

/**
 * RadarSweep - Animated radar sweep overlay
 */
const RadarSweep = ({ center }) => {
  const sweepRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360)
    }, 50) // Smooth rotation
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div
      ref={sweepRef}
      className="radar-sweep"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: '50% 50%'
      }}
    />
  )
}

/**
 * DisasterMap - Geospatial visualization with danger zones and hospital pins
 */
const DisasterMap = ({ currentRiskData, hospitalMetrics, disasterType, delayDays, predictedLocation, isAnalyzeLoading, useHistoricalData, riskMultiplier }) => {
  // Safety check: Prevent ReferenceError if disasterType is undefined
  const currentDisasterType = disasterType || currentRiskData?.disaster_type || 'Tsunami'
  
  const [userLocation, setUserLocation] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [hospitalStatus, setHospitalStatus] = useState(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [mapCenter, setMapCenter] = useState([35.6762, 139.6503]) // Default to Tokyo
  const mapRef = useRef(null)
  
  // Generate vulnerability data for heatmap
  const vulnerabilityData = useMemo(() => {
    return getVulnerabilityData(predictedLocation || mapCenter)
  }, [predictedLocation, mapCenter])
  
  // Calculate heatmap intensity based on intervention delay
  // If useHistoricalData is true, use raw CSV data (no AI modification)
  // If useHistoricalData is false, apply risk_multiplier based on intervention_delay
  const getHeatmapIntensity = () => {
    if (useHistoricalData) {
      // Historical Data: Use base intensity from CSV (no modification)
      return 0.5 // Base intensity for historical data
    }
    
    // Current/AI Data: Apply risk_multiplier based on intervention_delay
    const currentDelay = delayDays !== undefined ? delayDays : (currentRiskData?.delay_days || 0)
    const multiplier = riskMultiplier || 1.0
    // Normalize delay to 0-1 range (0-30 days) and apply multiplier
    const normalizedDelay = Math.min(1.0, currentDelay / 30)
    // Intensity: 0.3 (Green) to 1.0 (Red) with multiplier
    const baseIntensity = 0.3 + (normalizedDelay * 0.7)
    return Math.min(1.0, baseIntensity * multiplier)
  }
  
  // Get heatmap gradient colors based on delay
  const getHeatmapGradient = () => {
    const intensity = getHeatmapIntensity()
    // Green (low) -> Yellow (medium) -> Red (high)
    if (intensity < 0.5) {
      return {
        0.0: 'rgba(0, 255, 0, 0)',      // Green - Safe
        0.5: 'rgba(255, 255, 0, 0.3)',  // Yellow - Warning
        1.0: 'rgba(255, 165, 0, 0.5)'   // Orange - Caution
      }
    } else if (intensity < 0.75) {
      return {
        0.0: 'rgba(255, 255, 0, 0)',    // Yellow - Warning
        0.5: 'rgba(255, 165, 0, 0.4)',  // Orange - Caution
        1.0: 'rgba(255, 0, 0, 0.6)'     // Red - Immediate Triage
      }
    } else {
      return {
        0.0: 'rgba(255, 165, 0, 0)',    // Orange - Caution
        0.5: 'rgba(255, 0, 0, 0.5)',   // Red - Immediate Triage
        1.0: 'rgba(139, 0, 0, 0.8)'    // Dark Red - Extreme Risk
      }
    }
  }
  
  // Check if hospital is in red heatmap zone
  const isHospitalInRedZone = (hospital) => {
    const intensity = getHeatmapIntensity()
    // If intensity > 0.75, consider it a red zone
    if (intensity < 0.75) return false
    
    // Check if hospital is within high-density vulnerability area
    const hospitalLat = hospital.position[0]
    const hospitalLng = hospital.position[1]
    
    // Find nearby vulnerability points
    const nearbyPoints = vulnerabilityData.filter(point => {
      const distance = Math.sqrt(
        Math.pow(point.lat - hospitalLat, 2) + 
        Math.pow(point.lng - hospitalLng, 2)
      )
      return distance < 0.02 // ~2km radius
    })
    
    // If hospital is near high-density vulnerability points, it's in red zone
    const avgDensity = nearbyPoints.length > 0
      ? nearbyPoints.reduce((sum, p) => sum + p.density, 0) / nearbyPoints.length
      : 0
    
    return avgDensity > 0.6 // High vulnerability threshold
  }
  
  // Update map center when predicted location changes (from AI Agent)
  useEffect(() => {
    if (predictedLocation && Array.isArray(predictedLocation) && predictedLocation.length === 2) {
      const [lat, lon] = predictedLocation
      if (typeof lat === 'number' && typeof lon === 'number' && 
          -90 <= lat && lat <= 90 && -180 <= lon && lon <= 180) {
        setMapCenter(predictedLocation)
      }
    }
  }, [predictedLocation])
  
  // Use user location if available, otherwise use predicted location, otherwise default
  const center = userLocation || mapCenter
  
  // Get Impact Radius (expands with intervention slider)
  const getImpactRadius = () => {
    if (!currentRiskData) return 5000 // Default 5km
    
    const riskLevel = currentRiskData.risk_level || 'medium'
    const currentDelay = delayDays !== undefined ? delayDays : (currentRiskData.delay_days || 0)
    
    // Base radius by risk level
    const baseRadius = {
      'low': 3000,
      'medium': 5000,
      'high': 10000,
      'critical': 20000
    }[riskLevel] || 5000
    
    // Impact radius expands exponentially with delay (simulating spread)
    // At delay 0: base radius
    // At delay 7: 3x base radius (catastrophic spread)
    const expansionFactor = 1 + (currentDelay * 0.3)
    return baseRadius * expansionFactor
  }
  
  // Get danger zone color based on disaster type and risk (synchronized with Readiness Gauge)
  const getDangerZoneColor = () => {
    if (!currentRiskData) return '#ff0000'
    
    const riskLevel = currentRiskData.risk_level || 'medium'
    const readinessScore = currentRiskData.readiness_score || 100
    
    // Disaster-specific base colors
    const disasterColors = {
      'Tsunami': '#003366',      // Deep Ocean Blue
      'Flood': '#003366',         // Deep Ocean Blue
      'Volcano': '#ff4500',       // Lava Red/Orange
      'Cyclone': '#4b0082',       // Storm Purple/Grey
      'Earthquake': '#ff8800',    // Orange
      'Wildfire': '#ff3300',      // Fire Red
      'Drought': '#ffaa00',       // Amber
      'Pandemic': '#ff0066',      // Pink/Red
      'Terrorism': '#990000',     // Dark Red
      'Nuclear': '#00ff00'        // Toxic Green
    }
    
    const baseColor = disasterColors[currentDisasterType] || '#ff0000'
    
    // Override with readiness-based colors when critical
    if (readinessScore < 40) return '#ff0000' // Critical - Red (matches gauge)
    if (readinessScore < 60) return '#ff8800' // Warning - Orange (matches gauge)
    if (readinessScore < 80) return '#ffaa00' // Amber (matches gauge)
    
    // Use disaster-specific color for normal/high readiness
    return baseColor
  }
  
  // Check if in critical delay state (synchronized with gauge)
  const isCriticalDelay = () => {
    if (!currentRiskData) return false
    const readinessScore = currentRiskData.readiness_score || 100
    return readinessScore < 40 // Same threshold as gauge critical state
  }
  
  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        () => {
          // Fallback to map center if geolocation fails
          setUserLocation(mapCenter)
        }
      )
    } else {
      setUserLocation(mapCenter)
    }
  }, [mapCenter])
  
  // Fetch hospital status from API and generate hospital data
  useEffect(() => {
    if (!center) return
    
    const fetchAndGenerateHospitals = async () => {
      // Use hospital status from API if available, otherwise use metrics
      const baseOccupancy = hospitalStatus?.bed_occupancy || hospitalMetrics?.bed_occupancy || 50
      const baseSupplies = hospitalStatus?.critical_supplies || hospitalMetrics?.critical_supplies || 'Sufficient'
      const baseTriage = hospitalStatus?.triage_level || hospitalMetrics?.triage_level || 'Standard'
      const baseOxygen = hospitalStatus?.oxygen_levels || 85
      
      // Check if we're at Day 10 with high delay (for popup status change)
      const currentDelay = delayDays !== undefined ? delayDays : (currentRiskData?.delay_days || 0)
      const isDay10HighDelay = currentDelay >= 5 // High delay threshold (Day 10 scenario)
      
      // Generate hospitals around the center point
      const mockHospitals = []
      const hospitalCount = 8
      
      for (let i = 0; i < hospitalCount; i++) {
        const angle = (i / hospitalCount) * Math.PI * 2
        const distance = 5000 + Math.random() * 10000 // 5-15km from center
        const latOffset = (distance / 111000) * Math.cos(angle) // ~111km per degree
        const lngOffset = (distance / 111000) * Math.sin(angle)
        
        // Vary occupancy slightly per hospital (simulate regional differences)
        const occupancyVariation = (Math.random() - 0.5) * 15 // ±7.5%
        const hospitalOccupancy = Math.max(0, Math.min(150, baseOccupancy + occupancyVariation))
        
        // Determine operational status based on Day 10 + high delay
        let operationalStatus = 'Normal Operations'
        if (isDay10HighDelay && hospitalOccupancy >= 100) {
          operationalStatus = 'Critical: No Beds Available'
        } else if (isDay10HighDelay && hospitalOccupancy >= 90) {
          operationalStatus = 'Warning: Near Capacity'
        } else if (hospitalOccupancy >= 100) {
          operationalStatus = 'Critical: No Beds Available'
        } else if (hospitalOccupancy >= 90) {
          operationalStatus = 'Warning: Near Capacity'
        }
        
        mockHospitals.push({
          id: i,
          name: `Hospital ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
          position: [center[0] + latOffset, center[1] + lngOffset],
          bedOccupancy: hospitalOccupancy,
          criticalSupplies: baseSupplies,
          triageLevel: baseTriage,
          oxygenLevels: baseOxygen,
          operationalStatus: operationalStatus,
          isCritical: hospitalOccupancy >= 100
        })
      }
      
      setHospitals(mockHospitals)
    }
    
    fetchAndGenerateHospitals()
  }, [center, hospitalMetrics, hospitalStatus, delayDays, currentRiskData])
  
  // Get hospital icon color and status based on metrics
  // If delay_days > 5, force red pulsing to signal medical saturation
  const getHospitalIconConfig = (hospital) => {
    const occupancy = hospital.bedOccupancy
    const currentDelay = delayDays !== undefined ? delayDays : (currentRiskData?.delay_days || 0)
    const isHighDelay = currentDelay > 5 // Medical saturation threshold
    
    // If delay > 5 days, force red pulsing regardless of occupancy (medical saturation)
    if (isHighDelay && occupancy >= 70) {
      return { color: '#ff0000', status: 'Critical', shouldPulse: true }
    }
    
    if (occupancy >= 100) {
      return { color: '#ff0000', status: 'Critical', shouldPulse: true } // Pulsing Red - 100% Capacity
    }
    if (occupancy >= 90) {
      return { color: '#ff8800', status: 'Warning', shouldPulse: false } // Orange - Near Capacity
    }
    if (occupancy >= 70) {
      return { color: '#ffaa00', status: 'Warning', shouldPulse: false } // Yellow - Warning
    }
    return { color: '#00ff00', status: 'Safe', shouldPulse: false } // Green - Operational
  }
  
  // Create custom hospital icon with pulsing animation for critical
  // Uses L.icon for proper Leaflet icon definition
  const createHospitalIcon = (color, shouldPulse = false, status = 'Safe') => {
    const pulseClass = shouldPulse ? 'hospital-marker-pulse' : ''
    const pulseStyle = shouldPulse 
      ? 'animation: hospitalPulse 2s ease-in-out infinite;' 
      : ''
    
    // Use hospital emoji for visual clarity
    const iconEmoji = status === 'Critical' ? '🚨' : '🏥'
    
    return L.divIcon({
      className: `hospital-marker ${pulseClass}`,
      html: `<div style="
        width: 28px;
        height: 28px;
        background-color: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        ${pulseStyle}
      ">${iconEmoji}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
  }
  
  // Handle map load event
  const handleMapReady = () => {
    setIsMapLoaded(true)
    setMapError(null)
  }

  // Handle map errors
  useEffect(() => {
    const handleError = (error) => {
      console.error('Map error:', error)
      setMapError('Failed to load map. Please try again.')
      setIsMapLoaded(false)
    }

    // Set up error handler
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Loading state
  if (!center) {
    return (
      <div className="disaster-map-container">
        <div className="map-loading">Loading map...</div>
      </div>
    )
  }

  // Error state
  if (mapError) {
    return (
      <div className="disaster-map-container">
        <div className="map-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{mapError}</div>
          <button 
            className="error-retry" 
            onClick={() => {
              setMapError(null)
              setIsMapLoaded(false)
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Stop the Loading Hang: Check if analysis is still loading
  if (isAnalyzeLoading) {
    return (
      <div className="disaster-map-container">
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <div>Loading Geospatial Intelligence...</div>
        </div>
      </div>
    )
  }

  // Not loaded yet (but analysis is complete)
  if (!isMapLoaded) {
    return (
      <div className="disaster-map-container">
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <div>Initializing map...</div>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      className="disaster-map-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="map-header">
        <h3>GEOSPATIAL INTELLIGENCE</h3>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getDangerZoneColor() }}></div>
            <span>Danger Zone</span>
          </div>
          <div className="legend-item">
            <div className="legend-color hospital-green"></div>
            <span>Hospital (Operational)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color hospital-red"></div>
            <span>Hospital (Critical)</span>
          </div>
        </div>
      </div>
      
      {/* Heatmap Vulnerability Legend */}
      {currentRiskData && (
        <div className="heatmap-legend">
          <div className="heatmap-legend-title">VULNERABILITY LAYER</div>
          <div className="heatmap-legend-items">
            <div className="heatmap-legend-item">
              <div className="heatmap-legend-color" style={{ background: 'linear-gradient(to right, rgba(0, 255, 0, 0.3), rgba(0, 255, 0, 0.5))' }}></div>
              <span>Green = Safe</span>
            </div>
            <div className="heatmap-legend-item">
              <div className="heatmap-legend-color" style={{ background: 'linear-gradient(to right, rgba(255, 255, 0, 0.4), rgba(255, 165, 0, 0.5))' }}></div>
              <span>Yellow = Warning</span>
            </div>
            <div className="heatmap-legend-item">
              <div className="heatmap-legend-color" style={{ background: 'linear-gradient(to right, rgba(255, 0, 0, 0.6), rgba(139, 0, 0, 0.8))' }}></div>
              <span>Red = Immediate Triage Required</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Map wrapper with explicit dimensions */}
      <div className="map-wrapper" style={{ height: '500px', width: '100%' }}>
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenReady={handleMapReady}
        >
          {/* OpenStreetMap Tile Layer - Free, Open-Source, No API Key Required */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            errorTileUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect fill='%23000' width='256' height='256'/%3E%3Ctext fill='%23fff' font-family='monospace' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ELoading...%3C/text%3E%3C/svg%3E"
          />
          
          {/* Map Controller for zoom synchronization and coordinate flying */}
          <MapController 
            disasterType={currentDisasterType} 
            center={center}
            targetCoordinates={predictedLocation}
          />
          
          {/* Map Resizer - Fixes white screen by forcing size recalculation */}
          <MapResizer />
          
          {/* Multi-Sector Triage Heatmap Layer - Shows social vulnerability */}
          {currentRiskData && vulnerabilityData.length > 0 && (
            <HeatmapLayer
              points={vulnerabilityData.map(point => ({
                lat: point.lat,
                lng: point.lng,
                intensity: point.density * getHeatmapIntensity()
              }))}
              longitudeExtractor={point => point.lng}
              latitudeExtractor={point => point.lat}
              intensityExtractor={point => point.intensity}
              gradient={getHeatmapGradient()}
              radius={30}
              maxZoom={18}
              minOpacity={0.2}
              max={1.0}
            />
          )}
          
          {/* Dynamic Influence Zone (Impact Radius) - Expands with slider */}
          {currentRiskData && (
            <Circle
              center={center}
              radius={getImpactRadius()}
              pathOptions={{
                color: getDangerZoneColor(),
                fillColor: getDangerZoneColor(),
                fillOpacity: isCriticalDelay() ? 0.25 : 0.15, // More opaque when critical
                weight: isCriticalDelay() ? 4 : 2, // Thicker border when critical
                dashArray: isCriticalDelay() ? '10, 5' : undefined // Dashed when critical
              }}
            />
          )}
          
          {/* Hospital Markers with Color Coding */}
          {hospitals.map((hospital) => {
            // Check if hospital is in red heatmap zone
            const inRedZone = isHospitalInRedZone(hospital)
            const iconConfig = getHospitalIconConfig(hospital)
            // Override icon config if in red zone
            const finalIconConfig = inRedZone && iconConfig.status !== 'Critical'
              ? { color: '#ff0000', status: 'Critical', shouldPulse: true }
              : iconConfig
            const icon = createHospitalIcon(finalIconConfig.color, finalIconConfig.shouldPulse, finalIconConfig.status)
            
            return (
              <Marker
                key={hospital.id}
                position={hospital.position}
                icon={icon}
              >
                <Popup>
                  <div className="hospital-popup">
                    <h4>{hospital.name}</h4>
                    {(() => {
                      const currentDelay = delayDays !== undefined ? delayDays : (currentRiskData?.delay_days || 0)
                      const isCriticalDelay = currentDelay > 5
                      
                      return (
                        <div className={`popup-status ${hospital.isCritical || isCriticalDelay ? 'status-critical' : hospital.bedOccupancy >= 90 ? 'status-warning' : 'status-normal'}`}>
                          <strong>STATUS:</strong> {isCriticalDelay ? 'CRITICAL (NO BEDS)' : (hospital.operationalStatus || 'Normal Operations')}
                        </div>
                      )
                    })()}
                    <div className="popup-metric">
                      <strong>Beds:</strong> <span style={{ color: hospital.bedOccupancy >= 100 ? '#ff0000' : hospital.bedOccupancy >= 90 ? '#ff8800' : '#00ff00' }}>{hospital.bedOccupancy.toFixed(1)}%</span>
                    </div>
                    <div className="popup-metric">
                      <strong>Oxygen:</strong> {hospital.oxygenLevels?.toFixed(1) || 'N/A'}%
                    </div>
                    {iconConfig.shouldPulse && (
                      <div className="popup-warning">
                        ⚠️ MEDICAL SATURATION - Critical capacity exceeded
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
        
        {/* Radar Sweep Overlay */}
        <RadarSweep center={center} />
      </div>
    </motion.div>
  )
}

export default DisasterMap

