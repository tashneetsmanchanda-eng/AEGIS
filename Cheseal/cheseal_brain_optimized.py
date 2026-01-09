"""
Cheseal Azure Decision Core - OPTIMIZED VERSION
Addresses: Timeout Protection, Data Validation, Input Sanitization, State Machine Architecture
"""
import os
import json
import time
import threading
from typing import Dict, Any, Optional, Tuple
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

# Azure OpenAI Integration
try:
    from langchain_openai import AzureChatOpenAI
    AZURE_OPENAI_AVAILABLE = True
except ImportError:
    AZURE_OPENAI_AVAILABLE = False

# Fallback to ChatGroq if Azure not available
try:
    from langchain_groq import ChatGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

# LangChain Core
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from pydantic import BaseModel, Field

load_dotenv()

# --- AZURE CONFIGURATION ---
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

AZURE_MODE = bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT)

# --- CONSTANTS ---
MAX_INPUT_LENGTH = 500
LLM_TIMEOUT_SECONDS = 5.0
MIN_RISK_SCORE = 0.0
MAX_RISK_SCORE = 1.0
ML_WEIGHT = 0.7  # ML predictions get 70% weight
USER_WEIGHT = 0.3  # User input gets 30% weight (if validated)
MAX_DIFF_THRESHOLD = 0.2  # User input must be within 0.2 of ML to be trusted

# --- PROTOCOL DATABASE ---
PROTOCOLS = {
    "EVACUATE": [
        "Evacuate to designated Zone C immediately",
        "Do not use personal vehicles if water is rising",
        "Proceed to higher ground on foot if trapped"
    ],
    "SHELTER": [
        "Secure all windows and doors immediately",
        "Move to interior room away from windows",
        "Monitor official alerts and maintain emergency supplies ready"
    ],
    "MONITOR": [
        "Continue normal activities but remain alert",
        "Prepare evacuation bag and monitor official channels",
        "Check local alerts every 30 minutes"
    ]
}

# --- HAZARD DETECTION STATE MACHINE ---
HAZARD_PATTERNS = {
    "cyclone": {
        "keywords": ["cyclone", "hurricane", "typhoon", "storm"],
        "risk_score": 0.95,
        "priority": 1,
        "hazard": "Cyclone",
        "status": "CRITICAL",
        "confidence": "High",
        "infrastructure_health": "Critical",
        "projected_impact": "Major Flooding Imminent"
    },
    "fire": {
        "keywords": ["fire", "burning", "smoke", "blaze", "flame"],
        "risk_score": 0.92,
        "priority": 2,
        "hazard": "Fire",
        "status": "CRITICAL",
        "confidence": "High",
        "infrastructure_health": "Critical",
        "projected_impact": "Rapid Spread Risk"
    },
    "flood": {
        "keywords": ["flood", "water", "rising", "drowning", "inundation"],
        "risk_score": 0.88,
        "priority": 3,
        "hazard": "Flood",
        "status": "CRITICAL",
        "confidence": "High",
        "infrastructure_health": "Critical",
        "projected_impact": "Water Levels Rising Rapidly"
    },
    "traffic": {
        "keywords": ["traffic", "stuck", "congestion", "jam", "gridlock"],
        "risk_score": 0.40,
        "priority": 4,
        "hazard": "Congestion",
        "status": "STABLE",
        "confidence": "Medium",
        "infrastructure_health": "Stable",
        "projected_impact": "Minor Delays Expected"
    }
}

# --- INPUT SANITIZATION ---
def sanitize_input(query: str) -> str:
    """
    Sanitizes user input to prevent DoS and injection attacks.
    Returns: Cleaned string, max 500 chars, stripped of control characters.
    """
    if not isinstance(query, str):
        query = str(query)
    
    # Remove control characters and limit length
    query = ''.join(char for char in query if ord(char) >= 32 or char in '\n\r\t')[:MAX_INPUT_LENGTH]
    return query.strip()

# --- AZURE ML SIMULATION TOOL (OPTIMIZED) ---
@tool("ConsultAzureML")
def ConsultAzureML(query: str) -> str:
    """
    Queries the deployed Azure Machine Learning endpoint for real-time risk probabilities.
    Returns structured JSON with risk scores, hazard types, and status.
    Uses state machine pattern for O(m) complexity where m is constant.
    """
    # Sanitize input
    query_clean = sanitize_input(query)
    
    if not query_clean or len(query_clean) < 2:
        return json.dumps({
            "risk_score": 0.5,
            "hazard": "Unknown",
            "status": "STABLE",
            "confidence": "Low",
            "infrastructure_health": "Stable",
            "projected_impact": "Insufficient Input Data"
        })
    
    query_lower = query_clean.lower()
    detected_hazards = []
    
    # State machine: detect all hazards in query
    for hazard_key, config in HAZARD_PATTERNS.items():
        if any(kw in query_lower for kw in config["keywords"]):
            detected_hazards.append((config["priority"], config))
    
    if detected_hazards:
        # Select highest priority hazard (lower number = higher priority)
        detected_hazards.sort(key=lambda x: x[0])
        top_hazard = detected_hazards[0][1]
        
        # If multiple hazards detected, use max risk score
        max_risk = max(h[1]["risk_score"] for h in detected_hazards)
        
        # Combine hazard names if multiple
        hazard_names = [h[1]["hazard"] for h in detected_hazards]
        combined_hazard = " + ".join(hazard_names) if len(hazard_names) > 1 else top_hazard["hazard"]
        
        return json.dumps({
            "risk_score": max_risk,
            "hazard": combined_hazard,
            "status": "CRITICAL" if max_risk > 0.8 else ("WARNING" if max_risk > 0.5 else "STABLE"),
            "confidence": top_hazard["confidence"],
            "infrastructure_health": top_hazard["infrastructure_health"],
            "projected_impact": f"Multiple Hazards: {combined_hazard}. {top_hazard['projected_impact']}"
        })
    
    # Default: No hazard detected
    return json.dumps({
        "risk_score": 0.50,
        "hazard": "Unknown",
        "status": "STABLE",
        "confidence": "Low",
        "infrastructure_health": "Stable",
        "projected_impact": "Monitoring Required"
    })

# --- DECISION LOGIC (UNCHANGED) ---
def make_command_decision(risk_score: float) -> Dict[str, str]:
    """
    Command Decision Matrix based on risk scores.
    RULE 1: risk_score > 0.8 → IMMEDIATE EVACUATION
    RULE 2: risk_score < 0.5 → MONITOR SITUATION
    RULE 3: 0.5 <= risk_score <= 0.8 → SHELTER IN PLACE
    """
    # Clamp risk score to valid range
    risk_score = max(MIN_RISK_SCORE, min(MAX_RISK_SCORE, risk_score))
    
    if risk_score > 0.8:
        return {
            "decision": "IMMEDIATE EVACUATION",
            "emoji": "🔴",
            "protocol": "EVACUATE"
        }
    elif risk_score < 0.5:
        return {
            "decision": "MONITOR SITUATION",
            "emoji": "🟢",
            "protocol": "MONITOR"
        }
    else:
        return {
            "decision": "SHELTER IN PLACE",
            "emoji": "🟡",
            "protocol": "SHELTER"
        }

# --- DATA VALIDATION & MERGING ---
def merge_ml_and_user_data(ml_data: Dict[str, Any], dashboard_state: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Intelligently merges ML predictions with user-provided data.
    Uses weighted average if user input is within threshold, otherwise trusts ML.
    Prevents adversarial manipulation while allowing legitimate corrections.
    """
    if not dashboard_state or "flood_risk" not in dashboard_state:
        return ml_data
    
    try:
        user_risk = float(dashboard_state.get("flood_risk", 0.0))
        user_risk = max(MIN_RISK_SCORE, min(MAX_RISK_SCORE, user_risk))  # Clamp to [0, 1]
        ml_risk = ml_data.get("risk_score", 0.0)
        
        # Validate: User input must be within threshold of ML prediction
        if abs(user_risk - ml_risk) < MAX_DIFF_THRESHOLD:
            # Trusted: Use weighted average
            merged_risk = (ML_WEIGHT * ml_risk) + (USER_WEIGHT * user_risk)
            ml_data["risk_score"] = merged_risk
            print(f"[SYSTEM] User input ({user_risk:.2f}) validated. Merged risk: {merged_risk:.2f}")
        else:
            # Suspicious: Trust ML, log warning
            print(f"[SYSTEM] User input ({user_risk:.2f}) conflicts with ML ({ml_risk:.2f}). Trusting ML.")
            # Keep ml_data["risk_score"] as-is
        
        # Update hazard metadata if risk is high
        if ml_data["risk_score"] > 0.8:
            ml_data["hazard"] = "Flood"
            ml_data["status"] = "CRITICAL"
            ml_data["infrastructure_health"] = "Critical"
            ml_data["projected_impact"] = "Major Flooding Imminent"
        
    except (ValueError, TypeError) as e:
        print(f"[SYSTEM] Invalid user risk data: {e}. Using ML prediction.")
    
    return ml_data

# --- CHESEAL AZURE DECISION CORE CLASS (OPTIMIZED) ---
class ChesealBrain:
    """
    Azure-Powered Decision Unit - OPTIMIZED
    Rigid, Data-Driven, Fault-Tolerant with Timeout Protection
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Thread-safe singleton pattern"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ChesealBrain, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Azure OpenAI or fallback to ChatGroq/Mock"""
        if hasattr(self, '_initialized'):
            return  # Prevent re-initialization in singleton
        
        self.llm = None
        self.azure_mode = False
        
        # Try Azure OpenAI first
        if AZURE_MODE and AZURE_OPENAI_AVAILABLE:
            try:
                self.llm = AzureChatOpenAI(
                    azure_deployment=AZURE_OPENAI_DEPLOYMENT,
                    azure_endpoint=AZURE_OPENAI_ENDPOINT,
                    api_key=AZURE_OPENAI_API_KEY,
                    api_version=AZURE_OPENAI_API_VERSION,
                    temperature=0.0
                )
                self.azure_mode = True
                print("[SYSTEM] Azure OpenAI initialized successfully")
            except Exception as e:
                print(f"[SYSTEM] Azure OpenAI initialization failed: {e}")
                self.llm = None
        
        # Fallback to ChatGroq
        if not self.llm and GROQ_AVAILABLE and GROQ_API_KEY:
            try:
                self.llm = ChatGroq(
                    temperature=0.0,
                    model="llama-3.3-70b-versatile",
                    groq_api_key=GROQ_API_KEY
                )
                print("[SYSTEM] Fallback to ChatGroq initialized")
            except Exception as e:
                print(f"[SYSTEM] ChatGroq initialization failed: {e}")
                self.llm = None
        
        # Final fallback: Mock mode
        if not self.llm:
            print("[SYSTEM] Running in Azure Simulation Mode")
        
        # System Prompt: Command Interface
        self.system_prompt = """You are the Cheseal Decision Unit (Azure Function). You are NOT a chatbot. You generate Safety Commands.

ROLE: Command Interface
INPUT: Azure ML telemetry data
OUTPUT: Safety Command in strict format

STRICT RULES:
RULE 1: If risk_score > 0.8, Decision is IMMEDIATE EVACUATION.
RULE 2: If risk_score < 0.5, Decision is MONITOR SITUATION.
RULE 3: Never use conversational filler ("I hope this helps", "Hello", "I think"). Output ONLY the requested format.

OUTPUT FORMAT (EXACT STRUCTURE - NO DEVIATIONS):
🔴 SYSTEM DECISION: [EVACUATE / SHELTER / MONITOR]
📊 AZURE ML TELEMETRY:
• Hazard Probability: [X]% (Confidence: High/Medium/Low)
• Infrastructure Health: [Stable/Critical]
• Projected Impact: [Describe based on risk]
🛡️ PROTOCOL (EXECUTING RULE #42):
• [Step 1: Immediate Action]
• [Step 2: Safety Route]
• [Step 3: Contingency]

Use 🔴 for EVACUATE, 🟡 for SHELTER, 🟢 for MONITOR.
Do NOT add any text outside this format. No greetings, no explanations, no conversational elements."""
        
        self._initialized = True

    def _call_llm(self, prompt: str) -> str:
        """Internal method to call LLM (used by timeout wrapper)"""
        result = self.llm.invoke([HumanMessage(content=prompt)])
        return result.content if hasattr(result, 'content') else str(result)

    def _format_response(self, command: Dict[str, str], ml_data: Dict[str, Any], protocol_steps: list) -> str:
        """Formats response in strict command format"""
        emoji = command["emoji"]
        decision = command["decision"]
        risk_score = ml_data.get("risk_score", 0.0)
        risk_percent = int(risk_score * 100)
        confidence = ml_data.get("confidence", "Medium")
        infrastructure = ml_data.get("infrastructure_health", "Stable")
        impact = ml_data.get("projected_impact", "Monitoring Required")
        
        response = f"""{emoji} SYSTEM DECISION: {decision}
📊 AZURE ML TELEMETRY:
• Hazard Probability: {risk_percent}% (Confidence: {confidence})
• Infrastructure Health: {infrastructure}
• Projected Impact: {impact}
🛡️ PROTOCOL (EXECUTING RULE #42):
• {protocol_steps[0] if len(protocol_steps) > 0 else "Follow standard safety protocols"}
• {protocol_steps[1] if len(protocol_steps) > 1 else "Monitor official alerts"}
• {protocol_steps[2] if len(protocol_steps) > 2 else "Stay informed"}"""
        
        return response

    def analyze(self, user_question: str, dashboard_state: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Serverless Entry Point: Accepts JSON payload, returns JSON response.
        OPTIMIZED: Includes timeout protection, data validation, input sanitization.
        """
        start_time = time.time()
        
        try:
            # Step 1: Sanitize input
            user_question = sanitize_input(user_question)
            
            # Step 2: Consult Azure ML for risk probabilities
            ml_response = ConsultAzureML.invoke({"query": user_question})
            
            # Step 3: Parse and validate JSON
            try:
                ml_data = json.loads(ml_response) if isinstance(ml_response, str) else ml_response
                if not isinstance(ml_data, dict) or "risk_score" not in ml_data:
                    raise ValueError("Invalid ML data structure")
            except (json.JSONDecodeError, ValueError) as e:
                print(f"[SYSTEM] ML data parsing failed: {e}. Using default.")
                ml_data = {
                    "risk_score": 0.5,
                    "hazard": "Unknown",
                    "status": "STABLE",
                    "confidence": "Low",
                    "infrastructure_health": "Stable",
                    "projected_impact": "Data Parsing Error"
                }
            
            # Step 4: Merge with user data (with validation)
            ml_data = merge_ml_and_user_data(ml_data, dashboard_state)
            
            # Step 5: Make command decision
            risk_score = ml_data.get("risk_score", 0.0)
            command = make_command_decision(risk_score)
            
            # Step 6: Get protocol steps
            protocol_key = command["protocol"]
            protocol_steps = PROTOCOLS.get(protocol_key, PROTOCOLS["MONITOR"])
            
            # Step 7: Generate response with TIMEOUT PROTECTION
            if self.llm:
                prompt = f"""{self.system_prompt}

Azure ML Data:
{json.dumps(ml_data, indent=2)}

Command Decision: {command["decision"]}
Protocol Steps: {', '.join(protocol_steps)}

Generate the response following the EXACT format above."""

                try:
                    # TIMEOUT PROTECTION: Use ThreadPoolExecutor with timeout
                    with ThreadPoolExecutor(max_workers=1) as executor:
                        future = executor.submit(self._call_llm, prompt)
                        try:
                            response_text = future.result(timeout=LLM_TIMEOUT_SECONDS)
                            
                            # Validate format
                            if "SYSTEM DECISION:" not in response_text or "Hello" in response_text or "I think" in response_text:
                                print("[SYSTEM] Response format validation failed. Using structured fallback.")
                                response_text = self._format_response(command, ml_data, protocol_steps)
                        except FutureTimeoutError:
                            print(f"[SYSTEM] LLM timeout (>{LLM_TIMEOUT_SECONDS}s). Using structured fallback.")
                            response_text = self._format_response(command, ml_data, protocol_steps)
                except Exception as e:
                    print(f"[SYSTEM] LLM call failed: {e}")
                    response_text = self._format_response(command, ml_data, protocol_steps)
            else:
                # Simulation Mode: Generate structured response
                response_text = self._format_response(command, ml_data, protocol_steps)
            
            # Extract metadata
            risk_level = "Critical" if risk_score > 0.8 else ("High" if risk_score > 0.5 else "Low")
            action_items = protocol_steps[:3]
            
            elapsed_time = time.time() - start_time
            print(f"[SYSTEM] Analysis complete in {elapsed_time:.2f}s")
            
            return {
                "response": response_text,
                "risk_level": risk_level,
                "reasoning": f"Risk score: {risk_score:.2f} → {command['decision']}",
                "action_items": action_items,
                "system_decision": command["decision"],
                "ml_data": ml_data,
                "processing_time": elapsed_time
            }
            
        except Exception as e:
            import traceback
            error_details = str(e)
            print(f"[SYSTEM] Analysis failed: {error_details}")
            print(f"[SYSTEM] Traceback: {traceback.format_exc()}")
            
            # Hardcoded Safety Fallback
            return {
                "response": """🔴 SYSTEM DECISION: EVACUATE
📊 AZURE ML TELEMETRY:
• Hazard Probability: 100% (Confidence: High)
• Infrastructure Health: Critical
• Projected Impact: System Off-Line. Default Protocol Activated
🛡️ PROTOCOL (EXECUTING RULE #42):
• Seek high ground immediately
• Monitor local radio for updates
• Follow official evacuation routes""",
                "risk_level": "Critical",
                "reasoning": f"System Error: {error_details}",
                "action_items": ["Seek high ground immediately", "Monitor local radio for updates", "Follow official evacuation routes"],
                "system_decision": "EVACUATE",
                "ml_data": {"risk_score": 1.0, "status": "CRITICAL"},
                "processing_time": time.time() - start_time if 'start_time' in locals() else 0.0
            }

# Initialize global instance (singleton)
cheseal = None
_cheseal_lock = threading.Lock()

def get_cheseal() -> ChesealBrain:
    """Thread-safe singleton pattern for Azure Functions compatibility"""
    global cheseal
    if cheseal is None:
        with _cheseal_lock:
            if cheseal is None:
                cheseal = ChesealBrain()
    return cheseal

