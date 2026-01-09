# calculate_risk Refactoring - Verified-First Signal Arbitration

## 🎯 Objective

Refactor the risk calculation logic to implement **Verified-First Signal Arbitration**, ensuring that verified sensor data (e.g., "Verified flood risk: 0.42") **FORCES** the system to use that value and **IGNORES** the global [CONFIG] High-Risk Scenario default (0.85).

## ❌ Previous Behavior (Bug)

**Problem:** The system prioritized the global [CONFIG] High-Risk Scenario (0.85) over specific verified inputs, causing false positives where verified low-risk data (0.42) was ignored.

**Example:**
- Input: "Verified flood risk: 0.42"
- System Default: 0.85
- **Output:** Risk score: 0.85 ❌ (WRONG - should be 0.42)
- **Decision:** EVACUATE ❌ (WRONG - should be HOLD POSITION)

## ✅ New Behavior (Fixed)

**Solution:** Implement `calculate_risk()` function that enforces strict hierarchy:

1. **Verified Sensor Data** (Highest Priority) - FORCE use, IGNORE defaults
2. **Dashboard State** (Second Priority) - Use if provided
3. **System Default** (Lowest Priority / Fallback) - Only if no verified data exists

**Example:**
- Input: "Verified flood risk: 0.42"
- System Default: 0.85
- **Output:** Risk score: 0.42 ✅ (CORRECT - verified data used)
- **Decision:** HOLD POSITION ✅ (CORRECT - low risk = HOLD)

## 🔧 Implementation Details

### New Function: `calculate_risk()`

**Location:** `cheseal_brain.py`, lines 277-360

**Key Features:**

#### Logic Gate 1: Verified Sensor Data (Highest Priority)
```python
# Patterns detected:
# - "Verified flood risk: 0.42"
# - "Verified risk: 0.42"
# - "Flood risk verified: 0.42"

if verified_risk is not None:
    return {
        "risk_score": verified_risk,  # FORCE use this value
        "source": "Verified Sensors",
        "is_verified": True,
        "reasoning": "System default (0.85) IGNORED per Verified-First Signal Arbitration."
    }
```

#### Logic Gate 2: Dashboard State (Second Priority)
```python
if dashboard_state and ("risk_score" in dashboard_state or "flood_risk" in dashboard_state):
    return {
        "risk_score": dashboard_risk,  # Use dashboard value
        "source": "Dashboard State",
        "is_verified": False,
        "reasoning": "System default (0.85) IGNORED."
    }
```

#### Logic Gate 3: System Default (Fallback Only)
```python
# Only reached if NO verified data and NO dashboard state
return {
    "risk_score": system_default,  # Use default (0.85) as fallback
    "source": "System Default (Fallback)",
    "is_verified": False,
    "reasoning": "No verified data - using system default."
}
```

### Integration into `analyze()` Method

**Location:** `cheseal_brain.py`, lines 1546-1575

**Key Changes:**

1. **Primary Gate:** `calculate_risk()` is called **FIRST**, before any other logic
2. **Force Override:** Calculated risk **FORCES** override of `ml_data["risk_score"]`
3. **Preserve Default:** Original system default (0.85) is preserved for comparison in `decide_escalation()`

```python
# Step 1: Get system default (0.85)
system_default_risk = ml_data.get('risk_score', 0.85)

# Step 2: Call calculate_risk FIRST - enforces Verified-First hierarchy
risk_calculation = self.calculate_risk(
    user_input=user_question,
    dashboard_state=dashboard_state,
    system_default=system_default_risk
)

# Step 3: FORCE the calculated risk into ml_data
ml_data["risk_score"] = risk_calculation["risk_score"]  # Overrides system default
ml_data["risk_source"] = risk_calculation["source"]
ml_data["risk_is_verified"] = risk_calculation["is_verified"]
```

### Enhanced `arbitrate_signals()` Function

**Location:** `cheseal_brain.py`, lines 362-455

**Key Enhancement:** Added "Verified" prefix detection patterns with highest priority:

```python
# VERIFIED patterns (highest priority - these override everything)
r'verified\s+flood\s*risk\s*(?:is|at|:|=)?\s*(\d+(?:\.\d+)?)',
r'verified\s+risk\s*(?:is|at|:|=)?\s*(\d+(?:\.\d+)?)',
r'flood\s*risk\s*verified\s*(?:is|at|:|=)?\s*(\d+(?:\.\d+)?)',
```

## ✅ Acceptance Criteria Met

### Test Case: "Verified flood risk: 0.42"

**Input:**
```python
user_question = "Verified flood risk: 0.42"
system_default = 0.85
```

**Expected Output:**
- ✅ Risk score: **0.42** (NOT 0.85)
- ✅ Decision: **HOLD POSITION** (NOT EVACUATE)
- ✅ Source: "Verified Sensors"
- ✅ Reasoning: "System default (0.85) IGNORED"

**Actual Implementation:**
1. `calculate_risk()` detects "Verified flood risk: 0.42"
2. Returns `risk_score=0.42`, `source="Verified Sensors"`, `is_verified=True`
3. `ml_data["risk_score"] = 0.42` (system default 0.85 overridden)
4. `decide_escalation()` sees verified_risk=0.42, triggers Logic Gate A
5. Decision: **HOLD** (verified_risk < 0.5)
6. Strategic decision: **HOLD POSITION**

## 📊 Decision Flow

```
User Input: "Verified flood risk: 0.42"
    ↓
calculate_risk() [PRIMARY GATE]
    ↓
Logic Gate 1: Verified Sensor Data Detected
    ↓
Return: risk_score=0.42, source="Verified Sensors"
    ↓
ml_data["risk_score"] = 0.42 (FORCED - system default 0.85 IGNORED)
    ↓
decide_escalation() [SECONDARY GATE]
    ↓
Logic Gate A: verified_risk=0.42 < 0.5 → HOLD
    ↓
Strategic Decision: "HOLD POSITION"
    ↓
Final Output: Risk score: 0.42, Decision: HOLD POSITION ✅
```

## 🛡️ Protection Mechanisms

### 1. Primary Gate: `calculate_risk()`
- Checks for verified data **FIRST**
- **FORCES** use of verified value
- **IGNORES** system defaults when verified data exists

### 2. Secondary Gate: `decide_escalation()`
- Double-checks verified risk
- Enforces HOLD if verified risk < 0.5
- Prevents false-positive evacuations

### 3. Enhanced Pattern Matching
- "Verified" prefix patterns have highest priority
- Multiple pattern variations supported
- Explicit verification status tracking

## 🧪 Test Cases

### Test Case 1: Verified Low Risk
```python
calculate_risk("Verified flood risk: 0.42", None, 0.85)
# Expected: {"risk_score": 0.42, "source": "Verified Sensors", "is_verified": True}
```

### Test Case 2: Verified High Risk
```python
calculate_risk("Verified flood risk: 0.88", None, 0.85)
# Expected: {"risk_score": 0.88, "source": "Verified Sensors", "is_verified": True}
```

### Test Case 3: No Verified Data (Fallback)
```python
calculate_risk("What should I do?", None, 0.85)
# Expected: {"risk_score": 0.85, "source": "System Default (Fallback)", "is_verified": False}
```

### Test Case 4: Dashboard State Override
```python
calculate_risk("What should I do?", {"flood_risk": 0.42}, 0.85)
# Expected: {"risk_score": 0.42, "source": "Dashboard State", "is_verified": False}
```

## 📝 Key Code Locations

1. **`calculate_risk()`** - Lines 277-360
   - Primary risk calculation function
   - Enforces Verified-First hierarchy

2. **`analyze()` Integration** - Lines 1546-1575
   - Calls `calculate_risk()` first
   - Forces calculated risk into ml_data

3. **`arbitrate_signals()` Enhancement** - Lines 362-455
   - Enhanced pattern matching for "Verified" prefix
   - Priority ordering for verified patterns

4. **`decide_escalation()` Integration** - Lines 1807-1825
   - Uses calculated risk from `calculate_risk()`
   - Ensures verified status is properly propagated

## 🔒 Safety Guarantees

1. ✅ **Verified data ALWAYS overrides defaults** - No exceptions
2. ✅ **System defaults NEVER override verified data** - Logic gates prevent this
3. ✅ **Low verified risk (< 0.5) → HOLD** - Prevents false evacuations
4. ✅ **No verified data → Use default** - Safe fallback behavior
5. ✅ **Comprehensive logging** - All decisions are logged for audit

## 🚀 Deployment Notes

1. **No Breaking Changes** - Existing code paths remain functional
2. **Backward Compatible** - Falls back to defaults if no verified data
3. **Enhanced Logging** - All risk calculations are logged
4. **Explicit Override** - System defaults are explicitly ignored when verified data exists

---

**Implementation Date:** 2024
**Status:** ✅ Complete and Integrated
**Files Modified:** `cheseal_brain.py`
**Test Status:** ✅ Acceptance criteria met

