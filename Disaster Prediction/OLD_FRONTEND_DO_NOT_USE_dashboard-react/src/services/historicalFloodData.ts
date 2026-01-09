/**
 * Historical Flood Data Service
 * Uses real EMDAT/FloodArchive data for India (1985-present)
 * 263 documented flood events with coordinates, casualties, displaced people
 */

import floodHistory from '../data/indiaFloodHistory.json'

export interface HistoricalFlood {
  Began: string
  Ended: string
  long: number
  lat: number
  Dead: number | null
  Displaced: number | null
  MainCause: string
  Severity: number
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Find historical floods near a given location
 * @param lat Latitude
 * @param lon Longitude
 * @param radiusKm Search radius in kilometers (default 100km)
 * @returns Array of nearby historical floods sorted by distance
 */
export function findNearbyFloods(lat: number, lon: number, radiusKm: number = 100): (HistoricalFlood & { distance: number })[] {
  const floods = floodHistory as HistoricalFlood[]
  
  const nearby = floods
    .map(flood => ({
      ...flood,
      distance: getDistance(lat, lon, flood.lat, flood.long)
    }))
    .filter(flood => flood.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
  
  return nearby
}

/**
 * Get flood statistics for a location
 */
export function getFloodStats(lat: number, lon: number, radiusKm: number = 150): {
  totalFloods: number
  totalDeaths: number
  totalDisplaced: number
  avgSeverity: number
  mostRecent: HistoricalFlood | null
  mostSevere: HistoricalFlood | null
  mainCauses: { cause: string; count: number }[]
} {
  const nearby = findNearbyFloods(lat, lon, radiusKm)
  
  if (nearby.length === 0) {
    return {
      totalFloods: 0,
      totalDeaths: 0,
      totalDisplaced: 0,
      avgSeverity: 0,
      mostRecent: null,
      mostSevere: null,
      mainCauses: []
    }
  }
  
  const totalDeaths = nearby.reduce((sum, f) => sum + (f.Dead || 0), 0)
  const totalDisplaced = nearby.reduce((sum, f) => sum + (f.Displaced || 0), 0)
  const avgSeverity = nearby.reduce((sum, f) => sum + (f.Severity || 0), 0) / nearby.length
  
  // Most recent and severe
  const mostRecent = nearby.sort((a, b) => new Date(b.Began).getTime() - new Date(a.Began).getTime())[0]
  const mostSevere = nearby.sort((a, b) => (b.Severity || 0) - (a.Severity || 0))[0]
  
  // Count causes
  const causeCounts: Record<string, number> = {}
  nearby.forEach(f => {
    const cause = f.MainCause || 'Unknown'
    causeCounts[cause] = (causeCounts[cause] || 0) + 1
  })
  const mainCauses = Object.entries(causeCounts)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
  
  return {
    totalFloods: nearby.length,
    totalDeaths,
    totalDisplaced,
    avgSeverity,
    mostRecent,
    mostSevere,
    mainCauses
  }
}

/**
 * Calculate historical flood risk factor based on past events
 */
export function calculateHistoricalRiskFactor(lat: number, lon: number): number {
  const stats = getFloodStats(lat, lon, 150)
  
  if (stats.totalFloods === 0) return 0.2 // No history = moderate baseline
  
  // Risk based on frequency and severity
  const frequencyScore = Math.min(1, stats.totalFloods / 20) // 20+ = max
  const severityScore = stats.avgSeverity / 2 // Severity is 0-2 scale
  const recentScore = stats.mostRecent 
    ? Math.max(0, 1 - (new Date().getFullYear() - new Date(stats.mostRecent.Began).getFullYear()) / 10)
    : 0
  
  return Math.min(1, (frequencyScore * 0.4 + severityScore * 0.4 + recentScore * 0.2))
}
