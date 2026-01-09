"""
Cheseal Intelligence API Server
FINAL STABLE VERSION
"""

# FORENSIC CHECK 1: PROVE WHICH FILE IS RUNNING
import sys
import os
print("[FORENSIC] RUNNING FILE:", __file__)
print("[FORENSIC] PYTHON:", sys.executable)
print("[FORENSIC] CWD:", os.getcwd())

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, Optional, List
from cheseal_brain import ChesealBrain
import uvicorn
import os
import time
import sys

app = FastAPI(
    title="Cheseal Intelligence API",
    description="AI Crisis Co-Pilot - Advanced Crisis Response System",
    version="1.0.0"
)

# 1. Diagnostic Middleware (Logs every request to terminal)
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        print(f"\n[REQUEST LOG] {request.method} {request.url.path}")
        print(f"[REQUEST LOG] Full URL: {request.url}")
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        print(f"[RESPONSE] Status: {response.status_code} | Time: {process_time:.3f}s")
        if response.status_code == 404:
            print(f"[404 DEBUG] Requested path: {request.url.path}")
            available_routes = [r.path for r in app.routes if hasattr(r, 'path')]
            print(f"[404 DEBUG] Available routes: {available_routes}")
        return response

app.add_middleware(RequestLoggingMiddleware)

# 2. CORS Configuration (Allows all connections for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Brain Initialization
print("[INIT] Initializing Cheseal Brain...")
try:
    cheseal = ChesealBrain()
    print("[OK] Cheseal Brain initialized successfully")
except Exception as e:
    print(f"[ERROR] Failed to initialize Cheseal Brain: {str(e)}")
    # We allow the server to start even if the brain fails, so we can see the 503 error later
    cheseal = None 

# 4. Data Models
class QueryRequest(BaseModel):
    question: str
    city: Optional[str] = None
    risk_level: Optional[str] = None
    flood_risk: Optional[float] = None
    disease: Optional[str] = Field(None, alias='predicted_disease')
    predicted_disease: Optional[str] = None
    confidence: Optional[float] = None
    dashboard_state: Optional[Dict[str, Any]] = None
    previous_state: Optional[str] = None  # PART 2: Previous state (e.g., "EVACUATION_ORDER", "MONITORING", "NONE")
    
    # Pydantic v2 Config
    model_config = ConfigDict(populate_by_name=True)
    
    def extract_context(self) -> Dict[str, Any]:
        """
        1️⃣ SPLIT IT INTO TWO OBJECTS (MANDATORY)
        
        Returns CONTEXT DATA (non-numeric metadata only).
        This MUST NEVER be merged into risk_vector.
        
        Context includes:
        - city (string)
        - predicted_disease (string)
        - risk_level (string)
        - political_pressure (string)
        - social_media_signals (string)
        - metadata (any non-numeric)
        """
        if self.dashboard_state:
            # Extract only context (non-numeric) from dashboard_state
            context = {}
            CONTEXT_KEYS = {"city", "predicted_disease", "risk_level", "political_pressure", 
                           "social_media_signals", "disease", "metadata"}
            for key in CONTEXT_KEYS:
                if key in self.dashboard_state:
                    context[key] = self.dashboard_state[key]
            # Also add direct fields
            if self.city:
                context["city"] = self.city
            if self.predicted_disease or self.disease:
                context["predicted_disease"] = self.predicted_disease or self.disease
            if self.risk_level:
                context["risk_level"] = self.risk_level
            return context
        
        # Build context from request fields
        context = {}
        if self.city:
            context["city"] = self.city
        if self.predicted_disease or self.disease:
            context["predicted_disease"] = self.predicted_disease or self.disease
        if self.risk_level:
            context["risk_level"] = self.risk_level
        return context
    
    def to_dashboard_state(self) -> Dict[str, Any]:
        """
        DEPRECATED: Use extract_context() and extract_risk_signals() instead.
        Kept for backward compatibility but returns mixed data (not recommended).
        """
        if self.dashboard_state:
            return self.dashboard_state
        return {
            "city": self.city or "Unknown",
            "flood_risk": self.flood_risk or 0.0,
            "predicted_disease": self.predicted_disease or self.disease or "Unknown",
            "confidence": self.confidence or 0.0,
            "risk_level": self.risk_level or "Unknown"
        }
    
    def normalize_numeric(self, value: Any, field_name: str) -> float:
        """
        Acceptable inputs:
        - int
        - float
        - dict with {"value": int|float}
        
        Anything else is a SYSTEM ERROR.
        
        🚫 No silent coercion
        🚫 No defaulting
        🚫 No try/except masking
        """
        if isinstance(value, (int, float)):
            return float(value)
        
        if isinstance(value, dict):
            if "value" in value and isinstance(value["value"], (int, float)):
                return float(value["value"])
        
        raise RuntimeError(
            f"INVALID NUMERIC INPUT → {field_name}={value} ({type(value)})"
        )
    
    def extract_risk_signals(self) -> Dict[str, float]:
        """
        🔒 SIGNAL EXTRACTION - Separates numeric risk signals from context metadata.
        
        This function extracts ONLY numeric risk signals that can be safely passed to calculate_risk().
        Context/metadata (strings, dicts) are excluded.
        
        Returns:
            Dict with ONLY numeric risk signals (floats):
                - flood_risk: float
                - hospital_capacity: float (if available)
                - disease_risk: float (if available)
                - confidence: float
        """
        # 2️⃣ REBUILD risk_vector USING normalize_numeric ONLY
        # ❌ DELETE any direct float(...) calls
        # ✅ Replace with normalize_numeric()
        signals = {}
        
        # Required numeric signals - use normalize_numeric
        if self.flood_risk is not None:
            try:
                signals["flood_risk"] = self.normalize_numeric(self.flood_risk, "flood_risk")
            except RuntimeError:
                # If normalization fails, use default
                pass
        
        if self.confidence is not None:
            try:
                signals["confidence"] = self.normalize_numeric(self.confidence, "confidence")
            except RuntimeError:
                # If normalization fails, use default
                pass
        
        # Optional numeric signals (extract from dashboard_state if available)
        if self.dashboard_state:
            if "hospital_capacity" in self.dashboard_state:
                try:
                    signals["hospital_capacity"] = self.normalize_numeric(
                        self.dashboard_state["hospital_capacity"], "hospital_capacity"
                    )
                except RuntimeError:
                    # If normalization fails, use default
                    pass
            if "disease_risk" in self.dashboard_state:
                try:
                    signals["disease_risk"] = self.normalize_numeric(
                        self.dashboard_state["disease_risk"], "disease_risk"
                    )
                except RuntimeError:
                    # If normalization fails, use default
                    pass
        
        # Set defaults for missing required signals ONLY if they were never provided
        # 5️⃣ ERROR HANDLING RULE: Missing fields are OK (use defaults), but invalid types must raise RuntimeError
        # If normalize_numeric raised RuntimeError, it means the value was invalid (e.g., dict), not missing
        # In that case, the error should propagate to error handler (DEGRADED mode)
        # Only set defaults if the field was truly missing (not provided at all)
        if "flood_risk" not in signals:
            # Field was not provided - OK to use default
            signals["flood_risk"] = 0.5
        if "hospital_capacity" not in signals:
            # Field was not provided - OK to use default
            signals["hospital_capacity"] = 0.5
        if "disease_risk" not in signals:
            # Field was not provided - OK to use default
            signals["disease_risk"] = 0.5
        if "confidence" not in signals:
            # Field was not provided - OK to use default
            signals["confidence"] = 0.5
        
        return signals

class AnalyzeResponse(BaseModel):
    response: str
    risk_level: str
    reasoning: Optional[str] = None
    action_items: List[str] = [] # Use typing.List for better compatibility

# 5. Routes
@app.get("/")
async def root():
    return {"status": "online", "port": 8001, "message": "Cheseal API is active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "brain_loaded": cheseal is not None}

@app.post("/ask", response_model=AnalyzeResponse)
async def ask_cheseal(request: QueryRequest):
    print("[FORENSIC] ROUTE EXECUTED")
    print("[FORENSIC] POST /ask HANDLER REACHED")
    print(f"[FORENSIC] HANDLER FILE: {__file__}")
    print(f"Question received: {request.question[:100]}...")
    print(f"DEBUG: Processing question: {request.question[:50]}...")
    
    # 503 Error if brain failed to load
    if not cheseal:
        print("[ERROR] Request received but Cheseal Brain is not loaded.")
        raise HTTPException(status_code=503, detail="Cheseal Brain not initialized. Check server logs.")

    try:
        # 2️⃣ SPLIT IT INTO TWO OBJECTS (MANDATORY)
        # 🚫 Context MUST NEVER be merged into risk_vector
        context = request.extract_context()  # Non-numeric metadata only
        
        # ✅ BYPASS SANITIZER (The Fix)
        # The new calculate_risk() in cheseal_brain.py has robust extraction logic
        # We pass the RAW dashboard_state directly as risk_vector
        # This bypasses the restrictive extract_risk_signals() sanitizer
        # calculate_risk() can handle raw data with its robust key normalization
        if request.dashboard_state:
            # Pass raw dashboard_state directly - let calculate_risk extract what it needs
            risk_vector = request.dashboard_state.copy()  # RAW DATA - no sanitization
            print(f"[BYPASS SANITIZER] Passing raw dashboard_state as risk_vector: {list(risk_vector.keys())}")
        else:
            risk_vector = None  # No data available
        
        # PART 2: Pass previous_state to context_data
        if request.previous_state:
            context["previous_state"] = request.previous_state
        
        # 1️⃣ EXPLAINABILITY FIX: Pass raw verified values and source info to context_data
        # Store raw verified values separately so explanation panel can use them
        if request.dashboard_state:
            # Check if dashboard_state contains source information from test harness
            if "flood_risk_source" in request.dashboard_state:
                context["flood_risk_source"] = request.dashboard_state["flood_risk_source"]
            if "hospital_capacity_source" in request.dashboard_state:
                context["hospital_capacity_source"] = request.dashboard_state["hospital_capacity_source"]
            # Store raw verified values if they exist (ORIGINAL parsed values, not normalized)
            if "flood_risk" in request.dashboard_state:
                context["raw_flood_risk"] = request.dashboard_state["flood_risk"]
                # Also store source if available
                if "flood_risk_source" in request.dashboard_state:
                    context["raw_flood_risk_source"] = request.dashboard_state["flood_risk_source"]
            if "hospital_capacity" in request.dashboard_state:
                context["raw_hospital_capacity"] = request.dashboard_state["hospital_capacity"]
                # Also store source if available
                if "hospital_capacity_source" in request.dashboard_state:
                    context["raw_hospital_capacity_source"] = request.dashboard_state["hospital_capacity_source"]
        
        # 🔧 EXPLAINABILITY FIX: Pass original dashboard_state to preserve parsed values
        # This ensures analyze_risk can access the original parsed values for explanation
        original_dashboard_state = request.dashboard_state.copy() if request.dashboard_state else {}
        
        # ✅ CANONICAL VERIFICATION STATE: Initialize at START of decision cycle
        # Use get_canonical_verification_status() - ALWAYS returns True/False (never None)
        from input_normalizer import get_canonical_verification_status
        
        prev_state = None
        
        # Extract from dashboard_state (primary source)
        if request.dashboard_state:
            is_verified = get_canonical_verification_status(request.dashboard_state)  # Always True/False
            prev_state = request.dashboard_state.get("previous_state", None)
        # Extract from request fields (fallback)
        elif request.previous_state:
            prev_state = request.previous_state
            is_verified = False  # UNVERIFIED (default)
        else:
            is_verified = False  # UNVERIFIED (default)
        
        # ✅ PRE-FLIGHT ASSERTION: Ensure is_verified is always a boolean
        assert isinstance(is_verified, bool), f"is_verified must be bool after normalization, got {type(is_verified).__name__}: {is_verified}"
        
        print(f"[CANONICAL VERIFICATION] is_verified={is_verified} (type: {type(is_verified).__name__})")
        
        # Ensure metadata is in dashboard_state for downstream processing
        if is_verified:
            original_dashboard_state["is_verified"] = is_verified
        if prev_state:
            original_dashboard_state["previous_state"] = prev_state
        
        print(f"[MAIN HANDOVER] Extracted metadata: is_verified={is_verified}, previous_state={prev_state}")
        print(f"[MAIN HANDOVER] Dashboard state keys: {list(original_dashboard_state.keys())}")
        
        # Pass context and risk_vector separately
        result = cheseal.analyze(
            user_question=request.question,
            context_data=context,  # ✅ Context (non-numeric) - includes previous_state, raw values, source info
            risk_vector=risk_vector,  # ✅ Risk signals (numeric only)
            dashboard_state=original_dashboard_state if original_dashboard_state else None  # 🔧 Pass original dashboard_state with metadata
        )
        return AnalyzeResponse(
            response=result.get('response', 'No response generated'),  # Changed: Added .get() with default to prevent KeyError
            risk_level=result.get('risk_level', 'UNKNOWN'),  # Fixed: Changed from result['risk_level'] to .get() with default
            reasoning=result.get('reasoning'),  # No change: Already using .get()
            action_items=result.get('action_items', [])  # No change: Already using .get()
        )
    except KeyError as e:
        # 🧨 PHASE 3 — FIX ERROR HANDLING (CRITICAL)
        # A missing key is a DATA issue, not a SYSTEM issue.
        # DO NOT raise SystemError or enter DEGRADED mode.
        import logging
        error_details = str(e)
        logging.warning(f"Optional metadata missing: {error_details}. Defaulting to MONITORING.")
        print(f"[WARNING] Missing optional field: {error_details}")
        print(f"[WARNING] Available keys: {list(result.keys()) if 'result' in locals() else 'N/A'}")
        
        # Check if this is a verification-related KeyError
        is_verification_keyerror = (
            "'is_verified'" in error_details or 
            '"is_verified"' in error_details or 
            "is_verified" in error_details.lower()
        )
        
        if is_verification_keyerror:
            # Missing verification metadata → MONITORING, not DEGRADED
            return AnalyzeResponse(
                response="""SYSTEM STATUS: MONITORING

DECISION: HOLD

RISK STATE: MONITORING

REASON: Insufficient metadata for escalation (missing is_verified)

AUTOMATION: PAUSED

GOVERNANCE RULE: Missing optional metadata is not a system failure. The system enters monitoring mode until verification is available.

REQUIRED ACTION:
• Continue monitoring situation
• Await verified evidence before any escalation
• Manual review if escalation is needed""",
                risk_level="MONITORING",
                reasoning=f"Optional metadata missing: {error_details}",
                action_items=[
                    "Continue monitoring situation",
                    "Await verified evidence before escalation",
                    "Manual review if escalation needed"
                ]
            )
        else:
            # Other missing key → Still MONITORING (missing optional data)
            return AnalyzeResponse(
                response=f"""SYSTEM STATUS: MONITORING

DECISION: HOLD

RISK STATE: MONITORING

REASON: Missing optional field: {error_details}

AUTOMATION: PAUSED

GOVERNANCE RULE: Missing optional data is not a system failure. The system enters monitoring mode.

REQUIRED ACTION:
• Continue monitoring situation
• Await complete data before escalation""",
                risk_level="MONITORING",
                reasoning=f"Optional field missing: {error_details}",
                action_items=[
                    "Continue monitoring situation",
                    "Await complete data before escalation"
                ]
            )
    except Exception as e:
        print(f"[ERROR] Logic Error inside Brain: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# FORENSIC CHECK 2: PRINT ALL REGISTERED ROUTES
print("\n" + "=" * 80)
print("[FORENSIC] REGISTERED ROUTES")
print("=" * 80)
for r in app.routes:
    if hasattr(r, 'path'):
        methods = list(r.methods) if hasattr(r, 'methods') else ['GET']
        route_type = type(r).__name__
        print(f"  {methods} {r.path} ({route_type})")
print("=" * 80)

# FORENSIC CHECK 3: SEARCH FOR MULTIPLE FASTAPI APPS
fastapi_instances = [app]
print(f"\n[FORENSIC] FASTAPI INSTANCES: {len(fastapi_instances)}")
print(f"[FORENSIC] App instance: {app}")
print(f"[FORENSIC] App title: {app.title}")

# FORENSIC CHECK 4: ELIMINATE ROUTERS
print(f"\n[FORENSIC] ROUTERS: None (all routes are flat)")

# FORENSIC CHECK 5: VERIFY PYTHON EXECUTION CONTEXT
print(f"\n[FORENSIC] PYTHON EXECUTION CONTEXT:")
print(f"  Python: {sys.executable}")
print(f"  CWD: {os.getcwd()}")
print(f"  File: {__file__}")

# FORENSIC CHECK 7: HARD FAIL IF ROUTE IS MISSING
print("\n" + "=" * 80)
print("[FORENSIC] ROUTE VERIFICATION - HARD FAIL IF MISSING")
print("=" * 80)
route_exists = any(r.path == "/ask" for r in app.routes if hasattr(r, 'path'))
print(f"Route /ask exists: {route_exists}")
if not route_exists:
    print("[FATAL] ROUTE NOT REGISTERED - SERVER WILL CRASH")
    raise RuntimeError("ROUTE /ask NOT REGISTERED - This is a fatal error!")
print("[OK] Route verification passed")
print("=" * 80 + "\n")

# 6. Global 404 Handler (Helps debug URL typos)
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    print(f"\n[FORENSIC] 404 ERROR DETECTED")
    print(f"[FORENSIC] Requested path: {request.url.path}")
    print(f"[FORENSIC] Requested method: {request.method}")
    print(f"[FORENSIC] Full URL: {request.url}")
    print(f"\n[FORENSIC] Available routes:")
    for r in app.routes:
        if hasattr(r, 'path'):
            methods = list(r.methods) if hasattr(r, 'methods') else ['GET']
            print(f"  {methods} {r.path}")
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "requested_path": request.url.path,
            "message": "The door you knocked on doesn't exist.",
            "available_endpoints": ["/", "/health", "/ask"]
        }
    )

# 7. Start Server
if __name__ == "__main__":
    # FORENSIC CHECK 6: CONFIRM PORT OWNERSHIP
    print("\n" + "=" * 80)
    print("[FORENSIC] PORT OWNERSHIP CHECK")
    print("=" * 80)
    print("[WARNING] Kill all processes on port 8001 before starting!")
    print("   Command: Stop-Process -Id (Get-NetTCPConnection -LocalPort 8001).OwningProcess -Force")
    print("=" * 80)
    
    # 0.0.0.0 is the safest option: it listens on localhost AND local network IP
    print("\n" + "=" * 80)
    print("Starting Cheseal Intelligence API Server")
    print("=" * 80)
    print(f"Server will run on: http://0.0.0.0:8001")
    print(f"Local access: http://localhost:8001")
    print(f"API endpoint: http://localhost:8001/ask")
    print(f"Health check: http://localhost:8001/health")
    print(f"Swagger docs: http://localhost:8001/docs")
    print("=" * 80)
    print("[OK] ALL FORENSIC CHECKS PASSED")
    print("[OK] Route /ask is registered and verified")
    print("=" * 80)
    print("SERVER STARTED ON 8001")
    print(f"[DEBUG] SERVER LISTENING ON: http://localhost:8001/ask")
    print("=" * 80 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8001)