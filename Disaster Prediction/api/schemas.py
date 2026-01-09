"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional, Any


class FloodPredictionRequest(BaseModel):
    """Request schema for flood prediction."""
    
    monsoon_intensity: float = Field(..., ge=1, le=10, description="Monsoon intensity (1-10)")
    topography_drainage: float = Field(5, ge=1, le=10, description="Topography drainage (1-10)")
    river_management: float = Field(5, ge=1, le=10, description="River management quality (1-10)")
    deforestation: float = Field(5, ge=1, le=10, description="Deforestation level (1-10)")
    urbanization: float = Field(5, ge=1, le=10, description="Urbanization level (1-10)")
    climate_change: float = Field(5, ge=1, le=10, description="Climate change impact (1-10)")
    drainage_systems: float = Field(5, ge=1, le=10, description="Drainage systems quality (1-10)")
    coastal_vulnerability: float = Field(5, ge=1, le=10, description="Coastal vulnerability (1-10)")
    landslides: float = Field(5, ge=1, le=10, description="Landslide risk (1-10)")
    watersheds: float = Field(5, ge=1, le=10, description="Watershed health (1-10)")
    deteriorating_infrastructure: float = Field(5, ge=1, le=10, description="Infrastructure deterioration (1-10)")
    population_score: float = Field(5, ge=1, le=10, description="Population density score (1-10)")
    wetland_loss: float = Field(5, ge=1, le=10, description="Wetland loss (1-10)")
    inadequate_planning: float = Field(5, ge=1, le=10, description="Inadequate planning (1-10)")
    political_factors: float = Field(5, ge=1, le=10, description="Political factors (1-10)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "monsoon_intensity": 7,
                "topography_drainage": 4,
                "river_management": 5,
                "deforestation": 6,
                "urbanization": 7,
                "climate_change": 6,
                "drainage_systems": 4,
                "coastal_vulnerability": 5,
                "landslides": 3,
                "watersheds": 5,
                "deteriorating_infrastructure": 6,
                "population_score": 7,
                "wetland_loss": 5,
                "inadequate_planning": 6,
                "political_factors": 5
            }
        }


class FloodPredictionResponse(BaseModel):
    """Response schema for flood prediction."""
    
    flood_probability: float = Field(..., ge=0, le=1, description="Flood probability (0-1)")
    risk_level: str = Field(..., description="Risk level category")
    confidence: float = Field(0.85, ge=0, le=1, description="Prediction confidence")


class DiseasePredictionRequest(BaseModel):
    """Request schema for disease prediction."""
    
    monsoon_intensity: float = Field(..., ge=1, le=10)
    flood_probability: float = Field(..., ge=0, le=1)
    drainage_score: float = Field(5, ge=1, le=10)
    urbanization_score: float = Field(5, ge=1, le=10)
    deforestation_score: float = Field(5, ge=1, le=10)
    preparedness_score: float = Field(5, ge=1, le=10)
    
    class Config:
        json_schema_extra = {
            "example": {
                "monsoon_intensity": 7,
                "flood_probability": 0.65,
                "drainage_score": 4,
                "urbanization_score": 7,
                "deforestation_score": 6,
                "preparedness_score": 5
            }
        }


class DiseaseRisks(BaseModel):
    """Disease risk breakdown."""
    
    malaria: float = Field(..., ge=0, le=1)
    cholera: float = Field(..., ge=0, le=1)
    leptospirosis: float = Field(..., ge=0, le=1)
    hepatitis: float = Field(..., ge=0, le=1)


class DiseasePredictionResponse(BaseModel):
    """Response schema for disease prediction."""
    
    disease_risks: DiseaseRisks
    overall_risk: float = Field(..., ge=0, le=1)
    risk_level: str


class CombinedPredictionRequest(BaseModel):
    """Request schema for combined disaster-disease prediction."""
    
    monsoon_intensity: float = Field(..., ge=1, le=10, description="Monsoon intensity (1-10)")
    topography_drainage: float = Field(5, ge=1, le=10)
    river_management: float = Field(5, ge=1, le=10)
    deforestation: float = Field(5, ge=1, le=10)
    urbanization: float = Field(5, ge=1, le=10)
    drainage_systems: float = Field(5, ge=1, le=10)
    disaster_preparedness: float = Field(5, ge=1, le=10, description="Disaster preparedness (1-10, higher=better)")
    siltation: float = Field(5, ge=1, le=10)
    
    # Optional additional fields
    climate_change: float = Field(5, ge=1, le=10)
    coastal_vulnerability: float = Field(5, ge=1, le=10)
    landslides: float = Field(5, ge=1, le=10)
    watersheds: float = Field(5, ge=1, le=10)
    deteriorating_infrastructure: float = Field(5, ge=1, le=10)
    population_score: float = Field(5, ge=1, le=10)
    wetland_loss: float = Field(5, ge=1, le=10)
    inadequate_planning: float = Field(5, ge=1, le=10)
    political_factors: float = Field(5, ge=1, le=10)
    demo_scenario: Optional[str] = Field(None, description="Demo scenario: LOW, MEDIUM, or HIGH (for deterministic demo runs)")
    language: Optional[str] = Field("en", description="Language code for multilingual output (e.g., 'en', 'de', 'hi', 'es')")
    
    @field_validator('demo_scenario')
    @classmethod
    def validate_demo_scenario(cls, v):
        if v is not None and v.upper() not in ['LOW', 'MEDIUM', 'HIGH']:
            raise ValueError('demo_scenario must be LOW, MEDIUM, or HIGH')
        return v.upper() if v is not None else None
    
    class Config:
        json_schema_extra = {
            "example": {
                "monsoon_intensity": 8,
                "topography_drainage": 3,
                "river_management": 4,
                "deforestation": 7,
                "urbanization": 6,
                "drainage_systems": 3,
                "disaster_preparedness": 4,
                "siltation": 5
            }
        }


class CombinedPredictionResponse(BaseModel):
    """Response schema for combined prediction."""
    
    flood_probability: float
    flood_risk_level: str
    disease_risks: DiseaseRisks
    overall_disease_risk: float
    disease_risk_level: str
    recommendations: List[str]
    consequence_projection: Optional["ConsequenceProjection"] = Field(
        default=None,
        description="Downstream consequence projections (only present when risk >= threshold)"
    )


class BatchPredictionRequest(BaseModel):
    """Request schema for batch prediction."""
    
    predictions: List[CombinedPredictionRequest]
    
    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {"monsoon_intensity": 8, "drainage_systems": 3, "urbanization": 7},
                    {"monsoon_intensity": 5, "drainage_systems": 7, "urbanization": 4}
                ]
            }
        }


class BatchPredictionResponse(BaseModel):
    """Response schema for batch prediction."""
    
    results: List[CombinedPredictionResponse]
    total_processed: int


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str = "healthy"
    models_loaded: bool = True
    version: str = "1.0.0"


class DecisionAnalysisRequest(BaseModel):
    """
    Request schema for CHESEAL decision analysis.
    
    CHESEAL (Decision Explanation & Scenario Analyst) is the explainable AI (XAI)
    core of the AEGIS Public Risk System. It uses a ReAct (Reasoning + Acting)
    framework to provide transparent, auditable decision recommendations.
    """
    
    question: str = Field(..., description="Question or scenario description for CHESEAL analysis")
    language: Optional[str] = Field("en", description="Language code for multilingual output (e.g., 'en', 'de', 'hi', 'es')")
    risk_vector: Dict[str, Any] = Field(
        ...,
        description="Risk data dictionary containing numeric risk signals",
        json_schema_extra={
            "example": {
                "flood_risk": 0.75,
                "confidence": 0.85,
                "disease_risk": 0.60
            }
        }
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "Flood risk is now low. What should we do?",
                "risk_vector": {
                    "flood_risk": 0.34,
                    "confidence": 0.82
                }
            }
        }


class ConsequenceHorizon(BaseModel):
    """Consequence projection for a single time horizon."""
    
    phase: str = Field(..., description="Phase name (e.g., 'Immediate', 'Secondary', 'Long-term')")
    impacts: List[str] = Field(..., description="List of impact statements")
    infrastructure_domains: Dict[str, str] = Field(
        default_factory=dict,
        description="Infrastructure domain statuses (health, water, power, transport, economy)"
    )


class ConsequenceProjection(BaseModel):
    """Consequence projection across three time horizons."""
    
    day_0: ConsequenceHorizon = Field(..., description="Immediate consequences (Day 0)")
    day_10: ConsequenceHorizon = Field(..., description="Secondary effects (Day 10)")
    day_30: ConsequenceHorizon = Field(..., description="Long-term consequences (Day 30)")


# Update forward references
CombinedPredictionResponse.model_rebuild()


class DecisionAnalysisResponse(BaseModel):
    """
    Response schema for CHESEAL decision analysis.
    
    Contains the decision recommendation, risk assessment, explanation,
    validation status from CHESEAL's reasoning engine, and optional
    consequence projections from the Consequence Mirror module.
    """
    
    decision: str = Field(..., description="The decision/recommendation from CHESEAL")
    risk_level: str = Field(..., description="Risk level category (e.g., CRITICAL, HIGH ALERT, MONITORING)")
    risk_score: float = Field(..., ge=0, le=1, description="Calculated risk score (0-1)")
    explanation: str = Field(..., description="Detailed explanation of the decision")
    validation: str = Field(..., description="Validation status (OK, FAIL, DEGRADED, FAIL_SAFE)")
    actions: List[str] = Field(default_factory=list, description="List of actionable recommendations")
    consequences: Optional[ConsequenceProjection] = Field(
        default=None,
        description="Downstream consequence projections (only present for elevated risk states: ALERT, HIGH ALERT, ESCALATED)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "decision": "INITIATE EVACUATION",
                "risk_level": "CRITICAL",
                "risk_score": 0.85,
                "explanation": "SYSTEM DECISION: INITIATE EVACUATION\nRISK STATE: CRITICAL\n...",
                "validation": "OK",
                "consequences": {
                    "day_0": {
                        "phase": "Immediate",
                        "impacts": ["Displacement: 1,200 households", "Hospital capacity: 26.0% saturation"],
                        "infrastructure_domains": {"health": "Operational", "water": "Operational"}
                    }
                }
            }
        }