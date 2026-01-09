"""
CHESEAL Service Wrapper for AEGIS Backend Integration

This module provides a singleton service wrapper around CHESEAL Brain,
ensuring safe initialization and fail-safe error handling.
"""

from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Singleton instance
_cheseal_brain = None


def get_cheseal_brain():
    """
    Get or initialize the CHESEAL Brain singleton instance.
    
    Returns:
        ChesealBrain: The initialized CHESEAL brain instance
        None: If initialization fails (fail-safe)
    """
    global _cheseal_brain
    
    if _cheseal_brain is None:
        try:
            from .cheseal_brain import ChesealBrain
            _cheseal_brain = ChesealBrain()
            logger.info("CHESEAL Brain initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize CHESEAL Brain: {e}", exc_info=True)
            # Fail-safe: Return None instead of crashing
            _cheseal_brain = None
    
    return _cheseal_brain


def analyze_decision(risk_vector: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze a risk vector using CHESEAL and return a decision.
    
    This function wraps CHESEAL's analyze method with fail-safe error handling.
    If CHESEAL fails, returns a safe default response instead of crashing.
    
    Args:
        risk_vector: Dictionary containing risk data:
            - flood_risk (float, optional): Flood risk score (0-1)
            - confidence (float, optional): Prediction confidence (0-1)
            - disease_risk (float, optional): Disease risk score (0-1)
            - Additional optional fields as needed
    
    Returns:
        dict: Decision response with structure:
            - decision (str): The decision/recommendation
            - risk_level (str): Risk level category
            - risk_score (float): Calculated risk score (0-1)
            - explanation (str): Explanation of the decision
            - validation (str): Validation status ("OK", "FAIL", etc.)
    
    Fail-Safe Behavior:
        If CHESEAL is unavailable or errors occur, returns:
        {
            "decision": "INSUFFICIENT DATA",
            "risk_level": "UNKNOWN",
            "risk_score": 0.0,
            "explanation": "CHESEAL unavailable",
            "validation": "FAIL"
        }
    """
    brain = get_cheseal_brain()
    
    if brain is None:
        logger.warning("CHESEAL Brain not available, returning fail-safe response")
        return {
            "decision": "INSUFFICIENT DATA",
            "risk_level": "UNKNOWN",
            "risk_score": 0.0,
            "explanation": "CHESEAL unavailable - decision engine not initialized",
            "validation": "FAIL"
        }
    
    try:
        # Construct a user question from risk vector
        # CHESEAL expects a user_question string, so we create one from the risk data
        user_question_parts = []
        if risk_vector.get("flood_risk") is not None:
            user_question_parts.append(f"Flood risk: {risk_vector['flood_risk']}")
        if risk_vector.get("disease_risk") is not None:
            user_question_parts.append(f"Disease risk: {risk_vector['disease_risk']}")
        if risk_vector.get("confidence") is not None:
            user_question_parts.append(f"Confidence: {risk_vector['confidence']}")
        
        user_question = ". ".join(user_question_parts) if user_question_parts else "Analyze current risk situation"
        
        # Prepare context data from risk_vector
        context_data = {
            k: v for k, v in risk_vector.items()
            if k not in ["flood_risk", "disease_risk", "confidence"] or isinstance(v, str)
        }
        
        # Prepare dashboard_state with risk signals
        dashboard_state = {
            "flood_risk": risk_vector.get("flood_risk"),
            "disease_risk": risk_vector.get("disease_risk"),
            "confidence": risk_vector.get("confidence"),
            **context_data
        }
        
        # Call CHESEAL's analyze method
        result = brain.analyze(
            user_question=user_question,
            context_data=context_data if context_data else None,
            risk_vector=None,  # Let CHESEAL extract from dashboard_state
            dashboard_state=dashboard_state
        )
        
        # Transform CHESEAL response to AEGIS format
        return {
            "decision": result.get("decision", result.get("response", "INSUFFICIENT DATA")),
            "risk_level": result.get("risk_level", "UNKNOWN"),
            "risk_score": float(result.get("risk_score", 0.0)),
            "explanation": result.get("response", result.get("reasoning", "No explanation available")),
            "validation": "OK" if result.get("system_status") == "OPTIMAL" else "DEGRADED"
        }
        
    except Exception as e:
        logger.error(f"CHESEAL analysis failed: {e}", exc_info=True)
        # Fail-safe: Return safe default response
        return {
            "decision": "INSUFFICIENT DATA",
            "risk_level": "UNKNOWN",
            "risk_score": 0.0,
            "explanation": f"CHESEAL unavailable: {str(e)}",
            "validation": "FAIL"
        }

