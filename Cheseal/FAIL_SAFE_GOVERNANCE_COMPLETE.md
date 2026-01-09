# CHESEAL v2.0 - Fail-Safe Governance & Signature Fix Complete

## ✅ PART 1: FIX THE FUNCTION SIGNATURE

### Problem
The system crashed because `calculate_risk()` was called with an argument it didn't recognize (`user_prompt`).

### Fix

**File:** `cheseal_brain.py` - Function: `calculate_risk()` (Lines 584-630)

**Updated Signature:**
```python
def calculate_risk(self, user_prompt: str = None, user_input: str = None, 
                  historical_trends: Optional[Dict[str, Any]] = None,
                  system_defaults: Optional[Dict[str, Any]] = None,
                  **kwargs) -> Dict[str, Any]:
    """
    Fixed signature to accept user_prompt or user_input (for compatibility).
    """
    # Handle both user_prompt and user_input parameters (signature fix)
    if user_prompt is None and user_input is not None:
        user_prompt = user_input
    elif user_prompt is None:
        user_prompt = kwargs.get('user_prompt', kwargs.get('user_input', ''))
```

**Result:** ✅ Function now accepts both `user_prompt` and `user_input` parameters, ensuring seamless data flow from Input Layer to Risk Engine.

---

## ✅ PART 2: IMPLEMENT FAIL-SAFE GOVERNANCE

### Problem
Currently, any system error defaults to EVACUATE. This is a governance failure.

### Fix: "Fail-to-Hold" Logic

**File:** `cheseal_brain.py` - Function: `analyze()` (Lines 2774-2825)

**Implementation:**
- ✅ Wrapped entire decision pipeline in try-except block
- ✅ Strict Error Handling: IF system error occurs → SET Decision = "HOLD / MANUAL REVIEW"
- ✅ SET Risk Level = "DEGRADED"
- ✅ Governance Rule: Automated evacuation is strictly forbidden during system exception

**Code:**
```python
def analyze(self, user_question: str, dashboard_state: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    PART 2: FAIL-SAFE GOVERNANCE - "Fail-to-Hold" Logic
    Fault-tolerant with hardcoded safety fallback that FORBIDS automated evacuation on errors.
    """
    try:
        # ... decision pipeline ...
    except Exception as e:
        # PART 2: FAIL-SAFE GOVERNANCE - "Fail-to-Hold" Logic
        # The Governance Rule: Automated evacuation is strictly forbidden during a system exception.
        # IF a system error occurs during calculation:
        #   SET Decision = "HOLD / MANUAL REVIEW"
        #   SET Risk Level = "DEGRADED"
        
        print(f"\n{'=' * 70}")
        print(f"SYSTEM STATUS: [!] DEGRADED")
        print(f"DECISION: HOLD POSITION")
        print(f"REASON: Internal logic error. No automated escalation permitted without verified evidence.")
        print(f"{'=' * 70}")
        print(f"\n[FAIL-SAFE] HOLD: System Error Detected - Manual Review Required.")
        print(f"[FAIL-SAFE] Automated evacuation FORBIDDEN during system exception.")
        
        return {
            "response": "SYSTEM STATUS: [!] DEGRADED\nDECISION: HOLD POSITION\nREASON: Internal logic error...",
            "risk_level": "DEGRADED",  # ✅ SET Risk Level = "DEGRADED"
            "system_decision": "HOLD / MANUAL REVIEW",  # ✅ SET Decision = "HOLD / MANUAL REVIEW"
            "ml_data": {"risk_score": 0.0, "status": "DEGRADED", "system_error": True}
        }
```

**Required Output for Errors:**
```
======================================================================
SYSTEM STATUS: [!] DEGRADED
DECISION: HOLD POSITION
REASON: Internal logic error. No automated escalation permitted without verified evidence.
======================================================================

[FAIL-SAFE] HOLD: System Error Detected - Manual Review Required.
[FAIL-SAFE] Automated evacuation FORBIDDEN during system exception.
```

---

## ✅ PART 3: SIGNAL ARBITRATION (Final Polish)

### Implementation

**File:** `cheseal_brain.py` - Function: `calculate_risk()` (Line 630)

**Rule:** Ensure that the `user_prompt` is parsed BEFORE any defaults are applied.

**Code:**
```python
# PART 3: SIGNAL ARBITRATION - Ensure user_prompt is parsed BEFORE any defaults are applied
# If "verified" data is found in the prompt, the system must ignore the 0.85 test-harness default
user_lower = user_prompt.lower() if user_prompt else ""

# RANK 1: Check for verified data FIRST (before defaults)
rank1_patterns = [
    r'flood\s*risk\s*(?:is|at|:|=)?\s*(\d+(?:\.\d+)?)',
    r'risk\s*(?:is|at|:|=)?\s*(\d+(?:\.\d+)?)',
    r'verified\s+.*?risk\s*(?:is|at|:|=)?\s*(\d+(?:\.\d+)?)',
]

if rank1_risk is not None:
    # ✅ Verified data found - ignore 0.85 test-harness default
    USE_DEFAULTS = False
    return {"risk_score": rank1_risk, "USE_DEFAULTS": False}
```

---

## 🧪 Success Standard

### Test Case: System Error

**Scenario:** Code error occurs during risk calculation

**Expected Output:**
```
[SYSTEM] Analysis failed: [error details]
[SYSTEM] Traceback: [traceback]

======================================================================
SYSTEM STATUS: [!] DEGRADED
DECISION: HOLD POSITION
REASON: Internal logic error. No automated escalation permitted without verified evidence.
======================================================================

[FAIL-SAFE] HOLD: System Error Detected - Manual Review Required.
[FAIL-SAFE] Automated evacuation FORBIDDEN during system exception.
```

**Verification:**
- ✅ **MUST say:** "HOLD: System Error Detected - Manual Review Required."
- ✅ **MUST NOT say:** "Evacuate"
- ✅ **Decision:** "HOLD / MANUAL REVIEW"
- ✅ **Risk Level:** "DEGRADED"
- ✅ **Governance Rule:** Automated evacuation FORBIDDEN

---

## ✅ Summary

| Part | Component | Status | Location |
|------|-----------|--------|----------|
| **1** | Function Signature Fix | ✅ Complete | `cheseal_brain.py:584-597` |
| **2** | Fail-to-Hold Logic | ✅ Complete | `cheseal_brain.py:2774-2825` |
| **2** | Error Output Format | ✅ Complete | Shows "HOLD: System Error Detected" |
| **3** | Signal Arbitration | ✅ Complete | `cheseal_brain.py:630` |

**Status:** ✅ **ALL REQUIREMENTS MET**

**Key Features:**
- ✅ Function signature accepts `user_prompt` and `user_input`
- ✅ Fail-to-Hold: Errors return HOLD, NOT EVACUATE
- ✅ Governance Rule: Automated evacuation forbidden on errors
- ✅ Signal Arbitration: user_prompt parsed before defaults
- ✅ Manual Review Required: Clear output for human-in-the-loop

**System is now fail-safe and governance-compliant.** ✅

