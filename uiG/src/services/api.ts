/**
 * API Service for AEGIS Backend
 * Base URL: Uses VITE_API_BASE_URL environment variable, falls back to localhost for development
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface FloodPredictionRequest {
  monsoon_intensity: number;
  topography_drainage?: number;
  river_management?: number;
  deforestation?: number;
  urbanization?: number;
  climate_change?: number;
  drainage_systems?: number;
  coastal_vulnerability?: number;
  landslides?: number;
  watersheds?: number;
  deteriorating_infrastructure?: number;
  population_score?: number;
  wetland_loss?: number;
  inadequate_planning?: number;
  political_factors?: number;
}

export interface FloodPredictionResponse {
  flood_probability: number;
  risk_level: string;
  confidence: number;
}

export interface DiseasePredictionRequest {
  monsoon_intensity: number;
  flood_probability: number;
  drainage_score?: number;
  urbanization_score?: number;
  deforestation_score?: number;
  preparedness_score?: number;
}

export interface DiseaseRisks {
  malaria: number;
  cholera: number;
  leptospirosis: number;
  hepatitis: number;
}

export interface DiseasePredictionResponse {
  disease_risks: DiseaseRisks;
  overall_risk: number;
  risk_level: string;
}

export interface CombinedPredictionRequest {
  monsoon_intensity: number;
  topography_drainage?: number;
  river_management?: number;
  deforestation?: number;
  urbanization?: number;
  drainage_systems?: number;
  disaster_preparedness?: number;
  siltation?: number;
  climate_change?: number;
  coastal_vulnerability?: number;
  landslides?: number;
  watersheds?: number;
  deteriorating_infrastructure?: number;
  population_score?: number;
  wetland_loss?: number;
  inadequate_planning?: number;
  political_factors?: number;
}

export interface CombinedPredictionResponse {
  flood_probability: number;
  flood_risk_level: string;
  disease_risks: DiseaseRisks;
  overall_disease_risk: number;
  disease_risk_level: string;
  recommendations: string[];
  consequence_projection?: {
    day_0: Record<string, any>;
    day_10: Record<string, any>;
    day_30: Record<string, any>;
  };
}

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    // Return a fallback response if backend is offline
    // UI must render even if backend is offline
    console.warn('Backend health check failed:', error);
    return {
      status: 'offline',
      service: 'AEGIS backend',
      version: '1.0'
    };
  }
}

/**
 * Predict flood probability
 */
export async function predictFlood(request: FloodPredictionRequest): Promise<FloodPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict/flood`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Flood prediction failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Predict disease outbreak risks
 */
export async function predictDisease(request: DiseasePredictionRequest): Promise<DiseasePredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict/disease`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Disease prediction failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Combined disaster → disease prediction
 */
export async function predictCombined(request: CombinedPredictionRequest): Promise<CombinedPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict/combined`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Combined prediction failed: ${response.statusText}`);
  }

  return await response.json();
}

export interface DecisionAnalysisRequest {
  question: string;
  language?: string; // Language code for multilingual output (e.g., 'en', 'de', 'hi', 'es')
  risk_vector: {
    flood_risk?: number;
    confidence?: number;
    disease_risk?: number;
    [key: string]: any;
  };
}

export interface ConsequenceHorizon {
  phase: string;
  impacts: string[];
  infrastructure_domains: {
    health?: string;
    water?: string;
    power?: string;
    transport?: string;
    economy?: string;
    [key: string]: string | undefined;
  };
}

export interface ConsequenceProjection {
  day_0: ConsequenceHorizon;
  day_10: ConsequenceHorizon;
  day_30: ConsequenceHorizon;
}

export interface DecisionAnalysisResponse {
  decision: string;
  risk_level: string;
  risk_score: number;
  explanation: string;
  validation: string;
  actions: string[];
  consequences?: ConsequenceProjection; // Only present for elevated risk states
}

/**
 * Analyze decision using CHESEAL reasoning engine
 */
export async function analyzeDecision(request: DecisionAnalysisRequest): Promise<DecisionAnalysisResponse> {
  console.log('[CHESEAL API] Request payload:', JSON.stringify(request, null, 2));
  console.log('[CHESEAL API] Calling:', `${API_BASE_URL}/analyze/decision`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('[CHESEAL API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CHESEAL API] Error response:', errorText);
      throw new Error(`CHESEAL analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[CHESEAL API] Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('[CHESEAL API] Error:', error);
    // Re-throw with user-friendly message for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('CHESEAL temporarily unavailable. Please check your connection and try again.');
    }
    throw error;
  }
}

