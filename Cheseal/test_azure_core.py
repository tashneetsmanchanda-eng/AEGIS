"""
Stress Test for Azure Decision Core
Tests the rigid, data-driven command interface
"""
import requests
import json

# Force a Critical Scenario
payload = {
    "question": "I am in the red zone during the cyclone, what do I do?",
    "flood_risk": 0.95,  # High risk
    "city": "Miami"
}

print("⚡ TESTING AZURE DECISION CORE...")
try:
    # Adjust port if needed (8000 or 8001)
    response = requests.post("http://localhost:8001/ask", json=payload, timeout=30)
    result = response.json()['response']
    
    print("\n" + "="*50)
    print(result)
    print("="*50 + "\n")
    
    if "SYSTEM DECISION" in result and "AZURE ML" in result:
        print("✅ PASS: System Output is Structured.")
    else:
        print("❌ FAIL: Output is conversational (Weak).")

except Exception as e:
    print(f"❌ ERROR: {e}")

