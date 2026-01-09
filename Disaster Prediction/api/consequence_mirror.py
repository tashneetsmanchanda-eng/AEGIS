"""
Consequence Mirror - Downstream Consequence Projection Engine

This module provides deterministic consequence projection based on research data.
It operates as a pure projection engine (not a decision engine) and explains
downstream effects only.

CHESEAL remains the single source of truth for decisions.
Consequence Mirror explains what happens after decisions are made.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path
from typing import Dict, List, Optional, Any
import sys
import csv

# Add Consequence Mirror backend to path for imports
_consequence_mirror_path = Path(__file__).parent.parent.parent / "Consequence Mirror" / "backend"
if str(_consequence_mirror_path) not in sys.path:
    sys.path.insert(0, str(_consequence_mirror_path))

try:
    from consequences_engine import ConsequencesMirror, DisasterSeverity
except ImportError:
    # Fallback: ConsequencesMirror not available
    ConsequencesMirror = None
    DisasterSeverity = None


def _load_research_data() -> List[Dict[str, Any]]:
    """
    Load primary research data from CSV file.
    
    Returns:
        List of research data records
    """
    data_file = _consequence_mirror_path / "primary_research_data.csv"
    
    if not data_file.exists():
        return []
    
    records = []
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                records.append(row)
    except Exception as e:
        print(f"Warning: Could not load research data: {e}")
    
    return records


def _determine_disaster_type(context: Dict[str, Any]) -> str:
    """
    Determine disaster type from context.
    
    Args:
        context: Context dictionary containing risk vectors and decision data
        
    Returns:
        Disaster type string (e.g., "Flood", "Cyclone", "Tsunami")
    """
    # Check for explicit disaster type
    if "disaster_type" in context:
        return context["disaster_type"].capitalize()
    
    # Infer from risk vectors
    risk_vector = context.get("risk_vector", {})
    
    if risk_vector.get("flood_risk", 0) > 0.5:
        return "Flood"
    elif risk_vector.get("cyclone_risk", 0) > 0.5:
        return "Cyclone"
    elif risk_vector.get("tsunami_risk", 0) > 0.5:
        return "Tsunami"
    elif risk_vector.get("disease_risk", 0) > 0.5:
        return "Pandemic"
    
    # Default
    return "Flood"


def _map_risk_level_to_severity(risk_level: str) -> str:
    """
    Map CHESEAL risk level to Consequence Mirror severity.
    
    Args:
        risk_level: CHESEAL risk level (e.g., "CRITICAL", "HIGH ALERT", "ALERT")
        
    Returns:
        Severity string ("Critical", "High", "Moderate", "Low")
    """
    risk_upper = risk_level.upper()
    
    if "CRITICAL" in risk_upper or "ESCALATED" in risk_upper:
        return "Critical"
    elif "HIGH ALERT" in risk_upper or "HIGH" in risk_upper:
        return "High"
    elif "ALERT" in risk_upper or "MONITORING" in risk_upper:
        return "Moderate"
    else:
        return "Low"


def _format_impact_list(metrics: Dict[str, Any], horizon: str) -> List[str]:
    """
    Format metrics into a list of impact statements.
    
    Args:
        metrics: Dictionary of metric values
        horizon: Time horizon ("day_0", "day_10", "day_30")
        
    Returns:
        List of formatted impact strings
    """
    impacts = []
    
    # Day 0: Immediate impacts
    if horizon == "day_0":
        if "displaced_households" in metrics:
            impacts.append(f"Displacement: {metrics['displaced_households']:,} households")
        if "hospital_overflow_rate" in metrics:
            impacts.append(f"Hospital capacity: {(metrics['hospital_overflow_rate'] * 100):.1f}% saturation")
        if "water_contamination_prob" in metrics:
            impacts.append(f"Water contamination risk: {(metrics['water_contamination_prob'] * 100):.1f}%")
        if "economic_loss_millions" in metrics:
            impacts.append(f"Economic impact: ${metrics['economic_loss_millions']:.2f}M")
    
    # Day 10: Secondary effects
    elif horizon == "day_10":
        if "displaced_households" in metrics:
            impacts.append(f"Displacement escalates to {metrics['displaced_households']:,} households")
        if "hospital_overflow_rate" in metrics:
            impacts.append(f"Hospital overflow reaches {(metrics['hospital_overflow_rate'] * 100):.1f}%")
        if "water_contamination_prob" in metrics:
            impacts.append(f"Water contamination risk: {(metrics['water_contamination_prob'] * 100):.1f}%")
        if "workforce_loss" in metrics:
            impacts.append(f"Workforce loss: {metrics['workforce_loss']:.0f}%")
        if "economic_loss_millions" in metrics:
            impacts.append(f"Cumulative economic impact: ${metrics['economic_loss_millions']:.2f}M")
    
    # Day 30: Long-term consequences
    elif horizon == "day_30":
        if "displaced_households" in metrics:
            impacts.append(f"Long-term displacement: {metrics['displaced_households']:,} households")
        if "hospital_overflow_rate" in metrics:
            impacts.append(f"Hospital system strain: {(metrics['hospital_overflow_rate'] * 100):.1f}%")
        if "economic_loss_millions" in metrics:
            impacts.append(f"Total economic impact: ${metrics['economic_loss_millions']:.2f}M")
        if "recovery_time_days" in metrics:
            impacts.append(f"Estimated recovery time: {metrics['recovery_time_days']} days")
    
    return impacts


def _get_infrastructure_domains(metrics: Dict[str, Any], cascading_failures: Dict[str, str], horizon: str) -> Dict[str, str]:
    """
    Extract infrastructure domain statuses.
    
    Args:
        metrics: Dictionary of metric values
        cascading_failures: Dictionary of infrastructure failure statuses
        horizon: Time horizon
        
    Returns:
        Dictionary of infrastructure domain statuses
    """
    domains = {}
    
    # Health
    if "hospital_overflow_rate" in metrics:
        overflow = metrics["hospital_overflow_rate"]
        if overflow > 0.8:
            domains["health"] = "Critical"
        elif overflow > 0.5:
            domains["health"] = "Degraded"
        else:
            domains["health"] = "Operational"
    
    # Water
    if "water_contamination_prob" in metrics:
        contamination = metrics["water_contamination_prob"]
        if contamination > 0.7:
            domains["water"] = cascading_failures.get("Water", "Contamination Breach")
        elif contamination > 0.4:
            domains["water"] = "Quality Degraded"
        else:
            domains["water"] = "Operational"
    
    # Power
    domains["power"] = cascading_failures.get("Power", "Operational")
    
    # Transport
    domains["transport"] = cascading_failures.get("Transport", "Operational")
    
    # Economy
    if "economic_loss_millions" in metrics:
        loss = metrics["economic_loss_millions"]
        if loss > 5.0:
            domains["economy"] = "Severe Impact"
        elif loss > 2.0:
            domains["economy"] = "Moderate Impact"
        else:
            domains["economy"] = "Minimal Impact"
    
    return domains


def project_consequences(context: Dict[str, Any], language: Optional[str] = None) -> Dict[str, Any]:
    """
    Project downstream consequences for elevated risk states.
    
    This is a pure projection function - it does not make decisions.
    CHESEAL remains the single source of truth for decisions.
    
    All explanatory text (phases, impacts, infrastructure statuses) is generated
    in the specified language using deterministic translation templates.
    Numbers, dates, and metrics are preserved unchanged.
    
    Args:
        context: Context dictionary containing:
            - decision: CHESEAL decision string
            - risk_level: CHESEAL risk level (e.g., "CRITICAL", "HIGH ALERT", "ALERT")
            - risk_score: Risk score (0-1)
            - risk_vector: Risk vector dictionary
            - disaster_type: (optional) Explicit disaster type
        language: Optional language code (e.g., "en", "de", "hi") for multilingual output.
                  Defaults to "en" if not provided or unsupported.
            
    Returns:
        Dictionary with structure:
        {
            "day_0": {
                "phase": "Immediate" (translated),
                "impacts": [...] (translated, numbers preserved),
                "infrastructure_domains": {...} (translated)
            },
            "day_10": {
                "phase": "Secondary" (translated),
                "impacts": [...] (translated, numbers preserved),
                "infrastructure_domains": {...} (translated)
            },
            "day_30": {
                "phase": "Long-term" (translated),
                "impacts": [...] (translated, numbers preserved),
                "infrastructure_domains": {...} (translated)
            }
        }
        
    Returns empty dict if ConsequencesMirror is unavailable or context is invalid.
    """
    # Fail-safe: Return empty dict if ConsequencesMirror is not available
    if ConsequencesMirror is None:
        return {}
    
    try:
        # Extract context data
        risk_level = context.get("risk_level", "UNKNOWN")
        risk_vector = context.get("risk_vector", {})
        disaster_type = _determine_disaster_type(context)
        severity = _map_risk_level_to_severity(risk_level)
        
        # Initialize consequence engine
        engine = ConsequencesMirror()
        
        # Run simulation
        simulation = engine.simulate(disaster_type, severity)
        
        # Extract metrics
        simulation_dict = simulation.model_dump()
        
        # Calculate metrics for each horizon
        # Day 0: Use first time interval metrics (Immediate)
        day_0_metrics = {
            "displaced_households": simulation_dict["displaced_households"][0],
            "hospital_overflow_rate": simulation_dict["hospital_overflow_rate"][0],
            "water_contamination_prob": simulation_dict["water_contamination_prob"][0],
            "economic_loss_millions": simulation_dict["economic_loss_millions"][0]
        }
        
        # Day 10: Interpolate between first and second time interval
        day_10_metrics = {
            "displaced_households": int((simulation_dict["displaced_households"][0] + simulation_dict["displaced_households"][1]) * 0.6),
            "hospital_overflow_rate": (simulation_dict["hospital_overflow_rate"][0] + simulation_dict["hospital_overflow_rate"][1]) * 0.6,
            "water_contamination_prob": (simulation_dict["water_contamination_prob"][0] + simulation_dict["water_contamination_prob"][1]) * 0.6,
            "economic_loss_millions": (simulation_dict["economic_loss_millions"][0] + simulation_dict["economic_loss_millions"][1]) * 0.6,
            "workforce_loss": min(50, (simulation_dict["hospital_overflow_rate"][1] * 50) + (simulation_dict["water_contamination_prob"][1] * 20))
        }
        
        # Day 30: Use second time interval metrics (24 Hours) scaled up for long-term
        recovery_days = simulation_dict.get("outcome_comparison", {}).get("scenario_no_action", {}).get("recovery_time_days", 90)
        day_30_metrics = {
            "displaced_households": int(simulation_dict["displaced_households"][2] * 1.2),
            "hospital_overflow_rate": min(1.0, simulation_dict["hospital_overflow_rate"][2] * 1.1),
            "water_contamination_prob": min(1.0, simulation_dict["water_contamination_prob"][2] * 1.1),
            "economic_loss_millions": simulation_dict["economic_loss_millions"][2] * 1.3,
            "recovery_time_days": recovery_days
        }
        
        # Get cascading failures
        cascading_failures = simulation_dict.get("cascading_failures", {})
        
        # Import language support
        from api.language_support import get_language_code
        
        # Normalize language code
        language_code = get_language_code(language)
        
        # Import translation functions
        from api.consequence_translations import (
            translate_phase, translate_impact_statement, translate_infrastructure_status
        )
        
        # Format impacts with language support
        day_0_impacts_en = _format_impact_list(day_0_metrics, "day_0")
        day_10_impacts_en = _format_impact_list(day_10_metrics, "day_10")
        day_30_impacts_en = _format_impact_list(day_30_metrics, "day_30")
        
        # Translate impacts (preserving numbers)
        day_0_impacts = [translate_impact_statement(impact, language_code) for impact in day_0_impacts_en]
        day_10_impacts = [translate_impact_statement(impact, language_code) for impact in day_10_impacts_en]
        day_30_impacts = [translate_impact_statement(impact, language_code) for impact in day_30_impacts_en]
        
        # Get infrastructure domains
        day_0_domains_en = _get_infrastructure_domains(day_0_metrics, cascading_failures, "day_0")
        day_10_domains_en = _get_infrastructure_domains(day_10_metrics, cascading_failures, "day_10")
        day_30_domains_en = _get_infrastructure_domains(day_30_metrics, cascading_failures, "day_30")
        
        # Translate infrastructure statuses
        day_0_domains = {
            domain: translate_infrastructure_status(status, language_code)
            for domain, status in day_0_domains_en.items()
        }
        day_10_domains = {
            domain: translate_infrastructure_status(status, language_code)
            for domain, status in day_10_domains_en.items()
        }
        day_30_domains = {
            domain: translate_infrastructure_status(status, language_code)
            for domain, status in day_30_domains_en.items()
        }
        
        # Build response structure with translated content
        return {
            "day_0": {
                "phase": translate_phase("Immediate", language_code),
                "impacts": day_0_impacts,
                "infrastructure_domains": day_0_domains
            },
            "day_10": {
                "phase": translate_phase("Secondary", language_code),
                "impacts": day_10_impacts,
                "infrastructure_domains": day_10_domains
            },
            "day_30": {
                "phase": translate_phase("Long-term", language_code),
                "impacts": day_30_impacts,
                "infrastructure_domains": day_30_domains
            }
        }
        
    except Exception as e:
        # Fail-safe: Return empty dict on error
        print(f"Warning: Consequence projection failed: {e}")
        return {}


# FastAPI Router for Consequence Mirror API
router = APIRouter(tags=["Consequence Mirror"])


class ConsequenceInput(BaseModel):
    """Input schema for consequence projection endpoint."""
    risk_score: float = Field(..., ge=0, le=1, description="Risk score (0-1)")
    risk_level: str = Field(..., description="Risk level (e.g., CRITICAL, HIGH ALERT, ALERT)")
    hazard: Optional[str] = Field(None, description="Hazard/disaster type (e.g., Flood, Cyclone)")
    location: Optional[str] = Field(None, description="Location identifier")
    risk_vector: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Risk vector dictionary")


class ConsequenceProjectionResponse(BaseModel):
    """Response schema for consequence projection."""
    day_0: Dict[str, Any] = Field(..., description="Immediate consequences (Day 0)")
    day_10: Dict[str, Any] = Field(..., description="Secondary effects (Day 10)")
    day_30: Dict[str, Any] = Field(..., description="Long-term consequences (Day 30)")


@router.post("/consequence/project", response_model=ConsequenceProjectionResponse)
def project_consequences_endpoint(payload: ConsequenceInput):
    """
    Project downstream consequences for elevated risk states.
    
    This endpoint provides deterministic consequence projections based on research data.
    It operates as a pure projection engine (not a decision engine) and explains
    downstream effects only.
    
    CHESEAL remains the single source of truth for decisions.
    Consequence Mirror explains what happens after decisions are made.
    
    **Input**:
    - `risk_score`: Risk score (0-1)
    - `risk_level`: Risk level category
    - `hazard`: (optional) Hazard/disaster type
    - `location`: (optional) Location identifier
    - `risk_vector`: (optional) Risk vector dictionary
    
    **Response**:
    - `day_0`: Immediate consequences
    - `day_10`: Secondary effects
    - `day_30`: Long-term consequences
    """
    # Build context for projection
    context = {
        "risk_level": payload.risk_level,
        "risk_score": payload.risk_score,
        "risk_vector": payload.risk_vector or {},
        "disaster_type": payload.hazard
    }
    
    # Only project for elevated risk states
    risk_level_upper = payload.risk_level.upper()
    if not any(elevated in risk_level_upper for elevated in ["ALERT", "HIGH ALERT", "ESCALATED", "CRITICAL"]):
        raise HTTPException(
            status_code=400,
            detail="Consequence projection only available for elevated risk states (ALERT, HIGH ALERT, ESCALATED, CRITICAL)"
        )
    
    # Project consequences with language support
    language = payload.language or "en"
    result = project_consequences(context, language=language)
    
    if not result:
        raise HTTPException(
            status_code=503,
            detail="Consequence projection engine unavailable"
        )
    
    return ConsequenceProjectionResponse(
        day_0=result["day_0"],
        day_10=result["day_10"],
        day_30=result["day_30"]
    )

