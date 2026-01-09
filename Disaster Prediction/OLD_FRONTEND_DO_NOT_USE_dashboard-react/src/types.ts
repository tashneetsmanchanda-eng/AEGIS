export interface Location {
  id: string
  name: string
  region: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  riskProfile: {
    floodProne: boolean
    monsoonAffected: boolean
    coastalArea: boolean
  }
}

export interface DiseaseRisks {
  malaria: number
  cholera: number
  leptospirosis: number
  hepatitis: number
}

export interface PredictionResult {
  flood_probability: number
  flood_risk_level: string
  disease_risks: DiseaseRisks
  overall_disease_risk: number
  disease_risk_level: string
  recommendations: string[]
}

export interface PredictionFormData {
  monsoon_intensity: number
  topography_drainage: number
  river_management: number
  deforestation: number
  urbanization: number
  climate_change: number
  drainage_systems: number
  disaster_preparedness: number
  siltation: number
  deteriorating_infrastructure: number
  coastal_vulnerability: number
  landslides: number
  watersheds: number
  population_score: number
  wetland_loss: number
  inadequate_planning: number
  political_factors: number
}
