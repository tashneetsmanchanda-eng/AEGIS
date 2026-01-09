"""
FastAPI Backend for Disaster & Disease Prediction System
Provides real-time and batch prediction endpoints.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys

from api.schemas import (
    FloodPredictionRequest, FloodPredictionResponse,
    DiseasePredictionRequest, DiseasePredictionResponse,
    CombinedPredictionRequest, CombinedPredictionResponse,
    BatchPredictionRequest, BatchPredictionResponse,
    HealthResponse, DiseaseRisks,
    DecisionAnalysisRequest, DecisionAnalysisResponse
)

# FastAPI app
app = FastAPI(
    title="Disaster & Disease Prediction API",
    description="""
    🌊 **Predict flood probability and post-disaster disease outbreaks**
    
    This API provides:
    - **Flood Prediction**: Estimate flood risk based on environmental factors
    - **Disease Prediction**: Predict outbreak risks for malaria, cholera, leptospirosis, and hepatitis
    - **Combined Prediction**: End-to-end disaster → disease risk assessment
    - **Batch Processing**: Process multiple locations at once
    - **CHESEAL Decision Analysis**: Explainable AI decision engine for risk assessment
    
    Based on ML models trained on epidemiological correlations between 
    natural disasters and disease outbreaks.
    
    Integrated with CHESEAL (Decision Explanation & Scenario Analyst) for
    transparent, auditable decision recommendations.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for web dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from api.consequence_mirror import router as consequence_router
app.include_router(consequence_router)

# Global model reference
_models = None

# CHESEAL service (lazy initialization)
_cheseal_initialized = False


def get_models():
    """Lazy load models to avoid startup delay."""
    global _models
    if _models is None:
        try:
            # Add parent directory to path for models import (external dependency)
            parent_dir = str(Path(__file__).parent.parent)
            if parent_dir not in sys.path:
                sys.path.insert(0, parent_dir)
            from models.combined_predictor import CombinedPredictor
            models_dir = Path(__file__).parent.parent / "models" / "saved"
            _models = CombinedPredictor.from_saved_models(models_dir)
            print("✓ Models loaded successfully")
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise HTTPException(status_code=500, detail=f"Model loading failed: {str(e)}")
    return _models


def convert_request_to_model_input(request: CombinedPredictionRequest) -> dict:
    """Convert API request to model input format."""
    return {
        'MonsoonIntensity': request.monsoon_intensity,
        'TopographyDrainage': request.topography_drainage,
        'RiverManagement': request.river_management,
        'Deforestation': request.deforestation,
        'Urbanization': request.urbanization,
        'ClimateChange': request.climate_change,
        'DrainageSystems': request.drainage_systems,
        'CoastalVulnerability': request.coastal_vulnerability,
        'Landslides': request.landslides,
        'Watersheds': request.watersheds,
        'DeterioratingInfrastructure': request.deteriorating_infrastructure,
        'PopulationScore': request.population_score,
        'WetlandLoss': request.wetland_loss,
        'InadequatePlanning': request.inadequate_planning,
        'PoliticalFactors': request.political_factors,
        'Siltation': request.siltation,
        'IneffectiveDisasterPreparedness': 10 - request.disaster_preparedness,  # Invert
        'DrainageScore': request.drainage_systems,
        'UrbanizationScore': request.urbanization,
        'DeforestationScore': request.deforestation,
        'PreparednessScore': request.disaster_preparedness
    }


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - API health check."""
    return HealthResponse(status="healthy", models_loaded=_models is not None)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "AEGIS backend",
        "version": "1.0"
    }


@app.post("/predict/flood", response_model=FloodPredictionResponse)
async def predict_flood(request: FloodPredictionRequest):
    """
    Predict flood probability from environmental conditions.
    
    Returns flood probability (0-1) and risk level.
    """
    models = get_models()
    
    # Build input for flood model
    input_data = {
        'MonsoonIntensity': request.monsoon_intensity,
        'TopographyDrainage': request.topography_drainage,
        'RiverManagement': request.river_management,
        'Deforestation': request.deforestation,
        'Urbanization': request.urbanization,
        'ClimateChange': request.climate_change,
        'DrainageSystems': request.drainage_systems,
        'CoastalVulnerability': request.coastal_vulnerability,
        'Landslides': request.landslides,
        'Watersheds': request.watersheds,
        'DeterioratingInfrastructure': request.deteriorating_infrastructure,
        'PopulationScore': request.population_score,
        'WetlandLoss': request.wetland_loss,
        'InadequatePlanning': request.inadequate_planning,
        'PoliticalFactors': request.political_factors
    }
    
    import pandas as pd
    flood_features = pd.DataFrame([input_data])
    
    # Ensure all required features
    for col in models.flood_pipeline.feature_columns:
        if col not in flood_features.columns:
            flood_features[col] = 5
    
    flood_features = flood_features[models.flood_pipeline.feature_columns]
    X = models.flood_pipeline.scaler.transform(flood_features.values)
    flood_prob = float(models.flood_model.predict(X)[0])
    
    # Determine risk level
    if flood_prob < 0.2:
        risk = "LOW"
    elif flood_prob < 0.4:
        risk = "MODERATE"
    elif flood_prob < 0.6:
        risk = "HIGH"
    elif flood_prob < 0.8:
        risk = "VERY HIGH"
    else:
        risk = "CRITICAL"
    
    return FloodPredictionResponse(
        flood_probability=flood_prob,
        risk_level=risk,
        confidence=0.85
    )


@app.post("/predict/disease", response_model=DiseasePredictionResponse)
async def predict_disease(request: DiseasePredictionRequest):
    """
    Predict disease outbreak risks given conditions.
    
    Returns individual disease risks and overall risk level.
    """
    models = get_models()
    
    import pandas as pd
    disease_input = {
        'MonsoonIntensity': request.monsoon_intensity,
        'FloodProbability': request.flood_probability,
        'DrainageScore': request.drainage_score,
        'UrbanizationScore': request.urbanization_score,
        'DeforestationScore': request.deforestation_score,
        'PreparednessScore': request.preparedness_score
    }
    
    disease_features = pd.DataFrame([disease_input])
    disease_features = disease_features[models.disease_pipeline.feature_columns]
    X = models.disease_pipeline.scaler.transform(disease_features.values)
    
    predictions = models.disease_model.predict(X)[0]
    overall = float(sum(predictions) / len(predictions))
    
    if overall < 0.2:
        risk = "LOW"
    elif overall < 0.4:
        risk = "MODERATE"
    elif overall < 0.6:
        risk = "HIGH"
    else:
        risk = "VERY HIGH"
    
    return DiseasePredictionResponse(
        disease_risks=DiseaseRisks(
            malaria=float(predictions[0]),
            cholera=float(predictions[1]),
            leptospirosis=float(predictions[2]),
            hepatitis=float(predictions[3])
        ),
        overall_risk=overall,
        risk_level=risk
    )


@app.post("/predict/combined", response_model=CombinedPredictionResponse)
async def predict_combined(request: CombinedPredictionRequest):
    """
    Full disaster → disease prediction pipeline.
    
    Takes environmental conditions, predicts flood risk,
    then predicts disease outbreak risks based on flood severity.
    Includes actionable recommendations.
    
    When risk is elevated (HIGH, VERY HIGH, CRITICAL), automatically
    includes downstream consequence projections from Consequence Mirror.
    
    Supports demo scenarios via optional demo_scenario parameter (LOW, MEDIUM, HIGH).
    """
    # Import translation function
    from api.backend_translations import translate_recommendations_list
    
    # Check for demo scenario
    if request.demo_scenario:
        # Demo mode: deterministic values, skip ML inference
        demo_scenario = request.demo_scenario.upper()
        
        if demo_scenario == "LOW":
            overall_risk = 0.25
            risk_level = "LOW"
            flood_probability = 0.20
            flood_risk_level = "LOW"
            consequence_projection = None
        elif demo_scenario == "MEDIUM":
            overall_risk = 0.55
            risk_level = "MEDIUM"
            flood_probability = 0.50
            flood_risk_level = "MODERATE"
            consequence_projection = None
        elif demo_scenario == "HIGH":
            overall_risk = 0.87
            risk_level = "HIGH"
            flood_probability = 0.85
            flood_risk_level = "HIGH"
            # For HIGH scenario, generate consequence projection
            try:
                from api.consequence_mirror import project_consequences
                context = {
                    "risk_level": risk_level,
                    "risk_score": overall_risk,
                    "risk_vector": {
                        "flood_risk": flood_probability,
                        "disease_risk": overall_risk,
                        "disaster_type": "Flood"
                    },
                    "disaster_type": "Flood"
                }
                # Extract language from request for multilingual CASCADE generation
                language = getattr(request, 'language', 'en')
                consequence_dict = project_consequences(context, language=language)
                if consequence_dict:
                    consequence_projection = ConsequenceProjection(
                        day_0=ConsequenceHorizon(**consequence_dict["day_0"]),
                        day_10=ConsequenceHorizon(**consequence_dict["day_10"]),
                        day_30=ConsequenceHorizon(**consequence_dict["day_30"])
                    )
                else:
                    consequence_projection = None
            except Exception as e:
                print(f"Warning: Consequence projection failed: {e}")
                consequence_projection = None
        else:
            # Fallback to real prediction if invalid demo_scenario
            demo_scenario = None
        
        if demo_scenario:  # If we're in demo mode, return deterministic response
            return CombinedPredictionResponse(
                flood_probability=flood_probability,
                flood_risk_level=flood_risk_level,
                disease_risks=DiseaseRisks(
                    malaria=overall_risk * 0.8,
                    cholera=overall_risk * 0.9,
                    leptospirosis=overall_risk * 0.7,
                    hepatitis=overall_risk * 0.6
                ),
                overall_disease_risk=overall_risk,
                disease_risk_level=risk_level,
                recommendations=translate_recommendations_list(
                    ["Monitor conditions", "Maintain preparedness"],
                    getattr(request, 'language', 'en')
                ),
                consequence_projection=consequence_projection
            )
    
    # Real prediction mode: execute existing logic unchanged
    models = get_models()
    input_data = convert_request_to_model_input(request)
    result = models.predict(input_data)
    
    # Determine if consequence projection should be included (risk >= threshold)
    risk_level = result['disease_risk_level'].upper()
    overall_risk = result['overall_disease_risk']
    consequence_projection = None
    
    # Include consequences for elevated risk states (HIGH, VERY HIGH, CRITICAL, or risk_score >= 0.6)
    if any(elevated in risk_level for elevated in ["HIGH", "CRITICAL"]) or overall_risk >= 0.6:
        try:
            from api.consequence_mirror import project_consequences
            
            # Build context for consequence projection
            context = {
                "risk_level": result['disease_risk_level'],
                "risk_score": overall_risk,
                "risk_vector": {
                    "flood_risk": result['flood_probability'],
                    "disease_risk": overall_risk,
                    "disaster_type": "Flood"  # Combined prediction is flood-focused
                },
                "disaster_type": "Flood"
            }
            
            # Project consequences (fail-safe: returns empty dict on error)
            # Extract language from request for multilingual CASCADE generation
            language = getattr(request, 'language', 'en')
            consequence_dict = project_consequences(context, language=language)
            
            # Only include consequences if projection succeeded
            if consequence_dict:
                consequence_projection = ConsequenceProjection(
                    day_0=ConsequenceHorizon(**consequence_dict["day_0"]),
                    day_10=ConsequenceHorizon(**consequence_dict["day_10"]),
                    day_30=ConsequenceHorizon(**consequence_dict["day_30"])
                )
        except Exception as e:
            # Fail-safe: Consequence projection errors do not break the response
            print(f"Warning: Consequence projection failed: {e}")
            consequence_projection = None
    
    # Translate recommendations if language is provided
    language = getattr(request, 'language', 'en')
    translated_recommendations = translate_recommendations_list(
        result['recommendations'],
        language
    )
    
    return CombinedPredictionResponse(
        flood_probability=result['flood_probability'],
        flood_risk_level=result['flood_risk_level'],
        disease_risks=DiseaseRisks(**result['disease_risks']),
        overall_disease_risk=result['overall_disease_risk'],
        disease_risk_level=result['disease_risk_level'],
        recommendations=translated_recommendations,
        consequence_projection=consequence_projection
    )


@app.post("/batch/predict", response_model=BatchPredictionResponse)
async def batch_predict(request: BatchPredictionRequest):
    """
    Batch prediction for multiple locations.
    
    Process multiple prediction requests at once.
    """
    models = get_models()
    results = []
    
    # Import translation function
    from api.backend_translations import translate_recommendations_list
    
    for pred_request in request.predictions:
        input_data = convert_request_to_model_input(pred_request)
        result = models.predict(input_data)
        
        # Translate recommendations for each request
        language = getattr(pred_request, 'language', 'en')
        translated_recommendations = translate_recommendations_list(
            result['recommendations'],
            language
        )
        
        results.append(CombinedPredictionResponse(
            flood_probability=result['flood_probability'],
            flood_risk_level=result['flood_risk_level'],
            disease_risks=DiseaseRisks(**result['disease_risks']),
            overall_disease_risk=result['overall_disease_risk'],
            disease_risk_level=result['disease_risk_level'],
            recommendations=translated_recommendations
        ))
    
    return BatchPredictionResponse(
        results=results,
        total_processed=len(results)
    )


@app.post("/analyze/decision", response_model=DecisionAnalysisResponse)
async def analyze_decision(request: DecisionAnalysisRequest):
    """
    CHESEAL Decision Analysis Endpoint
    
    Analyzes risk data using CHESEAL (Decision Explanation & Scenario Analyst),
    the explainable AI (XAI) core of the AEGIS Public Risk System.
    
    CHESEAL uses a ReAct (Reasoning + Acting) framework to provide transparent,
    auditable decision recommendations with threshold gating and safety guardrails.
    
    **Fail-Safe Guarantee**: If CHESEAL is unavailable, returns a safe default response
    instead of crashing the API.
    
    **Request Body**:
    - `question`: Question or scenario description for analysis
    - `risk_vector`: Dictionary containing risk signals (e.g., flood_risk, disease_risk, confidence)
    
    **Response**:
    - `decision`: The decision/recommendation
    - `risk_level`: Risk level category
    - `risk_score`: Calculated risk score (0-1)
    - `explanation`: Detailed explanation of the decision
    - `validation`: Validation status (OK, FAIL_SAFE, DEGRADED)
    """
    # Lazy import to avoid startup issues if CHESEAL has dependency problems
    # CHESEAL is NOT initialized during /health - only when this endpoint is called
    try:
        from api.cheseal_service import analyze_decision as cheseal_analyze
    except ImportError as e:
        # Return fail-safe response
        return DecisionAnalysisResponse(
            decision="INSUFFICIENT DATA",
            risk_level="UNKNOWN",
            risk_score=0.0,
            explanation="CHESEAL unavailable - decision engine module not found",
            validation="FAIL_SAFE",
            actions=[]
        )
    
    try:
        # Call CHESEAL service with fail-safe handling
        # This is async-safe: CHESEAL runs in the same event loop
        # Pass language parameter (defaults to "en" if not provided)
        language = getattr(request, 'language', 'en')
        result = cheseal_analyze(request.question, request.risk_vector, language=language)
        
        # Extract decision data
        decision = result.get("decision", "INSUFFICIENT DATA")
        risk_level = result.get("risk_level", "UNKNOWN")
        risk_score = result.get("risk_score", 0.0)
        explanation = result.get("explanation", "No explanation available")
        validation = result.get("validation", "FAIL_SAFE")
        actions = result.get("actions", [])
        
        # Conditionally project consequences for elevated risk states
        consequences = None
        risk_level_upper = risk_level.upper()
        if any(elevated in risk_level_upper for elevated in ["ALERT", "HIGH ALERT", "ESCALATED", "CRITICAL"]):
            try:
                from api.consequence_mirror import project_consequences
                
                # Build context for consequence projection
                context = {
                    "decision": decision,
                    "risk_level": risk_level,
                    "risk_score": risk_score,
                    "risk_vector": request.risk_vector,
                    "disaster_type": request.risk_vector.get("disaster_type")  # Optional explicit type
                }
                
                # Project consequences (fail-safe: returns empty dict on error)
                # Pass language for multilingual output
                consequence_dict = project_consequences(context, language=language)
                
                # Only include consequences if projection succeeded
                if consequence_dict:
                    from api.schemas import ConsequenceProjection, ConsequenceHorizon
                    consequences = ConsequenceProjection(
                        day_0=ConsequenceHorizon(**consequence_dict["day_0"]),
                        day_10=ConsequenceHorizon(**consequence_dict["day_10"]),
                        day_30=ConsequenceHorizon(**consequence_dict["day_30"])
                    )
            except Exception as e:
                # Fail-safe: Consequence projection errors do not break the response
                print(f"Warning: Consequence projection failed: {e}")
                consequences = None
        
        return DecisionAnalysisResponse(
            decision=decision,
            risk_level=risk_level,
            risk_score=risk_score,
            explanation=explanation,
            validation=validation,
            actions=actions,
            consequences=consequences
        )
    except Exception as e:
        # Fail-safe: Return safe default response instead of crashing
        return DecisionAnalysisResponse(
            decision="INSUFFICIENT DATA",
            risk_level="UNKNOWN",
            risk_score=0.0,
            explanation=f"CHESEAL unavailable: {str(e)}",
            validation="FAIL_SAFE",
            actions=[]
        )
