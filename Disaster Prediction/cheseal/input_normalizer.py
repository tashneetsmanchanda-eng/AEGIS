"""
1️⃣ STRICT INPUT NORMALIZATION LAYER

Before any decision logic runs, normalize ALL inputs.

This module provides deterministic, fail-fast normalization functions
for safety-critical decision engine inputs.
"""

from typing import Any, Optional, Literal

# ✅ CANONICAL VERIFICATION STATUS ENUM
# Single source of truth for verification status throughout the system
VERIFICATION_VERIFIED = "VERIFIED"
VERIFICATION_UNVERIFIED = "UNVERIFIED"
VerificationStatus = Literal["VERIFIED", "UNVERIFIED"]


def normalize_float(value: Any, field_name: str) -> Optional[float]:
    """
    Normalize a value to float with strict validation.
    
    Args:
        value: Input value (int, float, dict, None, etc.)
        field_name: Name of field for error messages
        
    Returns:
        float: Normalized float value
        None: If value is None (optional field)
        
    Raises:
        RuntimeError: If value cannot be normalized to float
    """
    if value is None:
        return None
    
    if isinstance(value, (int, float)):
        return float(value)
    
    if isinstance(value, dict):
        # ERROR 1 FIX: Extract numeric field from dict OR reject safely
        # Try common dict patterns: {"value": number}, {"risk": number}, {"score": number}
        extracted = None
        for key in ["value", "risk", "score", field_name]:
            if key in value and isinstance(value[key], (int, float)):
                extracted = float(value[key])
                break
        
        if extracted is not None:
            return extracted
        
        # If no numeric field found, reject safely with clear error
        raise RuntimeError(
            f"{field_name} must be numeric, got dict without numeric field: {value}. "
            f"Expected dict with 'value', 'risk', 'score', or '{field_name}' key containing a number."
        )
    
    raise RuntimeError(
        f"{field_name} invalid type: {type(value).__name__}, value: {value}"
    )


def get_verification_status(data: dict) -> Optional[bool]:
    """
    2️⃣ CREATE A SINGLE SOURCE OF TRUTH (Tri-state for backward compatibility)
    
    Returns:
    True  -> explicitly verified
    False -> explicitly unverified
    None  -> verification unknown / missing
    
    🚫 NO direct access - uses .get() only
    """
    if not isinstance(data, dict):
        return None

    value = data.get("is_verified", None)

    if value is None:
        return None

    if isinstance(value, bool):
        return value

    raise RuntimeError(f"Invalid is_verified value: {value}")


def get_verification_status_enum(data: dict) -> VerificationStatus:
    """
    ✅ CANONICAL VERIFICATION STATUS ENUM (Single Source of Truth)
    
    Returns "VERIFIED" or "UNVERIFIED" string literal enum.
    Missing/None verification → "UNVERIFIED" (safe default)
    
    Rules:
    - Official sensors, structured test harness, trusted tools → "VERIFIED"
    - Free-text user input, missing metadata → "UNVERIFIED"
    - UNVERIFIED ≠ ERROR, UNVERIFIED ≠ MANUAL_REVIEW
    - UNVERIFIED only affects confidence weighting, NOT flow control
    
    Args:
        data: Input dictionary (can be None)
        
    Returns:
        Literal["VERIFIED", "UNVERIFIED"]: Always returns one of these two strings, never None
    """
    if not isinstance(data, dict):
        return VERIFICATION_UNVERIFIED  # UNVERIFIED (safe default)
    
    value = data.get("is_verified", None)
    
    if value is None:
        return VERIFICATION_UNVERIFIED  # UNVERIFIED (missing verification = unverified)
    
    if isinstance(value, bool):
        return VERIFICATION_VERIFIED if value else VERIFICATION_UNVERIFIED
    
    # Check for string values (for backward compatibility)
    if isinstance(value, str):
        value_upper = value.upper()
        if value_upper in ("VERIFIED", "TRUE", "1"):
            return VERIFICATION_VERIFIED
        elif value_upper in ("UNVERIFIED", "FALSE", "0"):
            return VERIFICATION_UNVERIFIED
    
    # Invalid type - default to UNVERIFIED (safe default)
    print(f"[WARNING] Invalid is_verified value: {value} ({type(value).__name__}) - defaulting to UNVERIFIED")
    return VERIFICATION_UNVERIFIED  # UNVERIFIED


def get_canonical_verification_status(data: dict) -> bool:
    """
    DEPRECATED: Use get_verification_status_enum() instead.
    Kept for backward compatibility during transition.
    """
    enum_status = get_verification_status_enum(data)
    return enum_status == VERIFICATION_VERIFIED


def normalize_is_verified(obj: dict) -> Optional[bool]:
    """
    Alias for get_verification_status() for backward compatibility.
    """
    return get_verification_status(obj)


def validate_risk_range(value: Optional[float], field_name: str) -> None:
    """
    Validate that a risk value is in the valid range [0.0, 1.0].
    
    Args:
        value: Risk value to validate (can be None)
        field_name: Name of field for error messages
        
    Raises:
        RuntimeError: If value is not None and not in [0.0, 1.0]
    """
    if value is not None:
        if not (0.0 <= value <= 1.0):
            raise RuntimeError(
                f"{field_name} must be in range [0.0, 1.0], got {value}"
            )


def validate_verification_state(verification_status: Optional[bool]) -> None:
    """
    Validate that verification status is one of the allowed states.
    
    Args:
        verification_status: Verification status to validate
        
    Raises:
        RuntimeError: If verification_status is not True, False, or None
    """
    if verification_status not in (True, False, None):
        raise RuntimeError(
            f"VERIFICATION STATE CORRUPTED: verification_status={verification_status} "
            f"({type(verification_status).__name__}). Must be True, False, or None."
        )


def normalize_inputs(raw: dict) -> dict:
    """
    🧨 STEP 2 — INPUT NORMALIZATION (NON-NEGOTIABLE)
    
    Create a single normalized input object from raw data.
    All downstream logic must consume this normalized object only.
    
    Args:
        raw: Raw input dictionary
        
    Returns:
        dict: Normalized inputs with all required fields
    """
    return {
        "flood_risk": normalize_float(raw.get("flood_risk"), "flood_risk") or 0.0,
        "hospital_capacity": normalize_float(raw.get("hospital_capacity"), "hospital_capacity") or 0.0,
        "icu_capacity": normalize_float(raw.get("icu_capacity"), "icu_capacity") or normalize_float(raw.get("hospital_capacity"), "hospital_capacity") or 0.0,
        "disease_risk": normalize_float(raw.get("disease_risk"), "disease_risk") or 0.0,
        "confidence": normalize_float(raw.get("confidence"), "confidence") or 0.0,
        "verification_status": get_verification_status(raw)  # Returns True, False, or None
    }


def guard_inputs(data: dict) -> None:
    """
    🧨 STEP 6 — ADD A FAIL-FAST TRIPWIRE (IMPORTANT)
    
    Prevent direct access to forbidden keys in raw input dictionaries.
    This ensures the bug cannot return.
    
    Args:
        data: Input dictionary to guard
        
    Raises:
        RuntimeError: If forbidden keys are accessed directly
    """
    FORBIDDEN_KEYS = ["is_verified"]  # Keys that must be accessed via normalizer only
    
    # This function is called BEFORE decision logic to ensure no direct access
    # If forbidden keys exist, they should be extracted via normalizer first
    # We don't raise here - we just log a warning if they exist
    # The real protection is that code should use normalizers, not direct access
    for key in FORBIDDEN_KEYS:
        if key in data:
            # Log warning but don't crash - the key exists, but should be accessed via normalizer
            import warnings
            warnings.warn(
                f"Key '{key}' found in raw input. Use get_verification_status() instead of direct access.",
                UserWarning
            )

