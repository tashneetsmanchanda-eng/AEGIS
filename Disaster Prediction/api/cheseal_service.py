"""
CHESEAL Service Layer for AEGIS Backend

Safely integrates CHESEAL decision intelligence engine as an internal module.
Provides singleton pattern with lazy initialization and fail-safe error handling.
"""

import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Singleton instance
_cheseal_brain = None
_cheseal_available = False
_initialization_error = None

def _ensure_cheseal_path():
    """Add C:\\AEGIS\\Cheseal to sys.path if not already present."""
    cheseal_path = Path("C:\\AEGIS\\Cheseal")
    cheseal_path_str = str(cheseal_path.absolute())
    
    if cheseal_path_str not in sys.path:
        sys.path.insert(0, cheseal_path_str)
        logger.debug(f"Added CHESEAL path to sys.path: {cheseal_path_str}")


def _initialize_cheseal() -> bool:
    """
    Initialize CHESEAL brain singleton.
    
    Returns:
        bool: True if initialization successful, False otherwise
    """
    global _cheseal_brain, _cheseal_available, _initialization_error
    
    if _cheseal_brain is not None:
        return _cheseal_available
    
    try:
        # Ensure CHESEAL path is in sys.path
        _ensure_cheseal_path()
        
        # Import CHESEAL modules
        from cheseal_brain import get_cheseal, ChesealBrain
        
        # Get singleton instance (lazy initialization)
        _cheseal_brain = get_cheseal()
        _cheseal_available = True
        _initialization_error = None
        logger.info("CHESEAL Brain initialized successfully")
        return True
        
    except ImportError as e:
        _initialization_error = f"CHESEAL import failed: {str(e)}"
        logger.warning(_initialization_error)
        _cheseal_available = False
        return False
    except Exception as e:
        _initialization_error = f"CHESEAL initialization failed: {str(e)}"
        logger.error(_initialization_error, exc_info=True)
        _cheseal_available = False
        return False


def analyze_decision(question: str, risk_vector: Dict[str, Any], language: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze a decision using CHESEAL reasoning engine.
    
    Args:
        question: Question or scenario description for analysis
        risk_vector: Dictionary containing risk signals (e.g., flood_risk, confidence, disease_risk)
        language: Optional language code for multilingual output (defaults to "en")
    
    Returns:
        dict: Decision analysis result with structure:
            - decision (str): The decision/recommendation
            - risk_level (str): Risk level category
            - risk_score (float): Calculated risk score (0-1)
            - explanation (str): Detailed explanation
            - validation (str): Validation status (OK, FAIL_SAFE, etc.)
    
    Fail-Safe Behavior:
        If CHESEAL is unavailable, returns a safe fallback response with validation="FAIL_SAFE".
    """
    # Import language support
    from api.language_support import normalize_language, build_language_instruction
    # Lazy initialization (only when first called)
    if not _initialize_cheseal():
        logger.warning("CHESEAL not available, returning fail-safe response")
        return {
            "decision": "INSUFFICIENT DATA",
            "risk_level": "UNKNOWN",
            "risk_score": 0.0,
            "explanation": f"CHESEAL unavailable: {_initialization_error or 'Initialization failed'}",
            "validation": "FAIL_SAFE"
        }
    
    try:
        # Normalize language and build STRONG system-level instruction
        language_name = normalize_language(language)
        language_code = language.lower().strip() if language else "en"
        
        # Build explicit system instruction with HARD language enforcement
        from api.language_support import LANGUAGE_INSTRUCTIONS
        
        if language_name != "English":
            explicit_instruction = LANGUAGE_INSTRUCTIONS.get(language_code, LANGUAGE_INSTRUCTIONS["en"])
            system_language_instruction = (
                f"You are CHESEAL, an AI Crisis Co-Pilot for cascading disasters.\n"
                f"{explicit_instruction}\n\n"
                f"Rules:\n"
                f"- Generate natively in the target language\n"
                f"- Do not translate from English\n"
                f"- Do not mix languages\n"
                f"- Use professional, public-sector tone\n"
                f"- Explain decisions, actions, and consequences clearly in {language_name}.\n\n"
            )
        else:
            system_language_instruction = ""
        
        # Prepend system instruction to question
        # This ensures language control at the reasoning layer
        enhanced_question = system_language_instruction + question
        
        # Call CHESEAL's analyze method
        # CHESEAL expects: analyze(user_question, context_data=None, risk_vector=None, dashboard_state=None)
        result = _cheseal_brain.analyze(
            user_question=enhanced_question,
            context_data=None,
            risk_vector=None,  # Pass via dashboard_state instead
            dashboard_state=risk_vector  # CHESEAL extracts from dashboard_state
        )
        
        # Transform CHESEAL response to AEGIS format
        return {
            "decision": result.get("decision", result.get("response", "INSUFFICIENT DATA")),
            "risk_level": result.get("risk_level", "UNKNOWN"),
            "risk_score": float(result.get("risk_score", 0.0)),
            "explanation": result.get("response", result.get("reasoning", "No explanation available")),
            "validation": "OK" if result.get("system_status") == "OPTIMAL" else "DEGRADED",
            "actions": result.get("action_items", [])
        }
        
    except Exception as e:
        logger.error(f"CHESEAL analysis error: {e}", exc_info=True)
        # Fail-safe: Return safe default response
        return {
            "decision": "INSUFFICIENT DATA",
            "risk_level": "UNKNOWN",
            "risk_score": 0.0,
            "explanation": f"CHESEAL analysis failed: {str(e)}",
            "validation": "FAIL_SAFE"
        }


def is_cheseal_available() -> bool:
    """Check if CHESEAL is available without initializing it."""
    return _cheseal_available or _cheseal_brain is not None

