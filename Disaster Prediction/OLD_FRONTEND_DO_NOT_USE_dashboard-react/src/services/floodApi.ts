/**
 * Flood API Service
 * Uses Open-Meteo Flood API which is powered by GloFAS (Global Flood Awareness System)
 * Real data from the European Commission's Copernicus Emergency Management Service
 * Historical data available from 1984
 */

export interface FloodData {
  date: string
  river_discharge: number  // m³/s - cubic meters per second
  river_discharge_mean: number
  river_discharge_max: number
  river_discharge_min: number
}

export interface FloodForecast {
  latitude: number
  longitude: number
  daily: {
    time: string[]
    river_discharge: number[]
    river_discharge_mean?: number[]
    river_discharge_max?: number[]
    river_discharge_min?: number[]
  }
}

/**
 * Fetch real flood data from Open-Meteo Flood API (GloFAS)
 * This is REAL data from the Global Flood Awareness System
 */
export async function fetchFloodData(lat: number, lon: number): Promise<FloodForecast | null> {
  try {
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min&forecast_days=7`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Flood API error:', response.status)
      return null
    }

    const data = await response.json()
    return data as FloodForecast
  } catch (error) {
    console.error('Flood API fetch error:', error)
    return null
  }
}

/**
 * Calculate flood risk based on river discharge data
 * Compares current discharge to historical mean to determine anomaly
 */
export function calculateFloodRisk(floodData: FloodForecast): {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'CRITICAL'
  probability: number
  currentDischarge: number
  meanDischarge: number
  percentageAboveMean: number
  forecast7Day: number[]
} {
  const daily = floodData.daily
  
  // Get today's values (first in the array)
  const currentDischarge = daily.river_discharge?.[0] || 0
  const meanDischarge = daily.river_discharge_mean?.[0] || currentDischarge || 1
  const maxDischarge = daily.river_discharge_max?.[0] || currentDischarge
  
  // Calculate how much above mean the current discharge is
  const percentageAboveMean = ((currentDischarge - meanDischarge) / meanDischarge) * 100
  
  // Calculate flood probability based on discharge anomaly
  // River discharge significantly above historical mean = higher flood risk
  let probability: number
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'CRITICAL'
  
  if (percentageAboveMean < -20) {
    // Well below mean - very low risk (possibly drought)
    probability = 0.05
    riskLevel = 'LOW'
  } else if (percentageAboveMean < 0) {
    // Below mean - low risk
    probability = 0.1
    riskLevel = 'LOW'
  } else if (percentageAboveMean < 50) {
    // Slightly above mean - moderate
    probability = 0.15 + (percentageAboveMean / 50) * 0.2
    riskLevel = probability > 0.3 ? 'MODERATE' : 'LOW'
  } else if (percentageAboveMean < 100) {
    // Significantly above mean - high risk
    probability = 0.35 + ((percentageAboveMean - 50) / 50) * 0.25
    riskLevel = 'HIGH'
  } else if (percentageAboveMean < 200) {
    // Very high above mean - very high risk
    probability = 0.6 + ((percentageAboveMean - 100) / 100) * 0.2
    riskLevel = 'VERY HIGH'
  } else {
    // Extreme discharge - critical
    probability = Math.min(0.95, 0.8 + (percentageAboveMean - 200) / 500 * 0.15)
    riskLevel = 'CRITICAL'
  }
  
  return {
    riskLevel,
    probability,
    currentDischarge,
    meanDischarge,
    percentageAboveMean,
    forecast7Day: daily.river_discharge || []
  }
}

/**
 * Get discharge level description
 */
export function getDischargeDescription(percentageAboveMean: number): string {
  if (percentageAboveMean < -20) return 'Well below average (dry conditions)'
  if (percentageAboveMean < 0) return 'Below average'
  if (percentageAboveMean < 25) return 'Near average'
  if (percentageAboveMean < 50) return 'Above average'
  if (percentageAboveMean < 100) return 'Significantly elevated'
  if (percentageAboveMean < 200) return 'Very high'
  return 'Extreme levels'
}
