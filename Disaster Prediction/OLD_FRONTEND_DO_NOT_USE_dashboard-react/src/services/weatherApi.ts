/**
 * Weather API Service
 * Uses Open-Meteo (free, no API key required) for real weather data
 */

export interface WeatherData {
  temperature: number        // Celsius
  humidity: number          // Percentage
  rainfall: number          // mm
  description: string
  windSpeed: number         // m/s
  cloudiness: number        // Percentage
  pressure: number          // hPa
  visibility: number        // meters
}

export interface WeatherPredictorInput {
  monsoonIntensity: number
  climateChange: number
  drainageStress: number
  temperatureRisk: number
}

/**
 * Fetch current weather from Open-Meteo (FREE, no API key needed)
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Open-Meteo API - completely free, no key required
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure,cloud_cover&timezone=auto`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    const current = data.current
    
    // Map weather code to description
    const weatherDescription = getWeatherDescription(current.weather_code)
    
    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      rainfall: current.precipitation || 0,
      description: weatherDescription,
      windSpeed: current.wind_speed_10m / 3.6, // Convert km/h to m/s
      cloudiness: current.cloud_cover || 0,
      pressure: current.surface_pressure || 1013,
      visibility: 10000 // Open-Meteo doesn't provide visibility
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}

/**
 * Convert WMO weather code to description
 */
function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  }
  return descriptions[code] || 'Unknown'
}

/**
 * Convert weather data to prediction input parameters
 */
export function weatherToParameters(weather: WeatherData): WeatherPredictorInput {
  // Map rainfall to monsoon intensity (0-50mm -> 1-10)
  const monsoonIntensity = Math.min(10, Math.max(1, Math.round(1 + (weather.rainfall / 5) * 9)))
  
  // High humidity + temp = more disease risk
  const climateChange = Math.min(10, Math.max(1, Math.round(
    (weather.temperature > 30 ? 7 : weather.temperature > 25 ? 5 : 3) +
    (weather.humidity > 80 ? 2 : weather.humidity > 60 ? 1 : 0)
  )))
  
  // Heavy rain stresses drainage
  const drainageStress = Math.min(10, Math.max(1, Math.round(
    1 + (weather.rainfall / 10) * 5 + (weather.humidity > 85 ? 2 : 0)
  )))
  
  // Temperature affects disease vectors
  const temperatureRisk = weather.temperature > 28 ? 8 : weather.temperature > 24 ? 6 : 4

  return {
    monsoonIntensity,
    climateChange,
    drainageStress,
    temperatureRisk
  }
}

/**
 * Get weather emoji based on conditions
 */
export function getWeatherEmoji(weather: WeatherData): string {
  if (weather.rainfall > 10) return '🌧️'
  if (weather.rainfall > 2) return '🌦️'
  if (weather.description.toLowerCase().includes('thunder')) return '⛈️'
  if (weather.description.toLowerCase().includes('rain')) return '🌧️'
  if (weather.cloudiness > 70) return '☁️'
  if (weather.cloudiness > 30) return '⛅'
  return '☀️'
}
