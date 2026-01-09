"""
Test Script for Cheseal Intelligence
Sends a critical flood scenario to verify Cheseal's reasoning
"""

import requests
import json
from mock_engine import get_current_risk


def test_cheseal_agent():
    """Test Cheseal with a critical flood scenario"""
    
    # Get mock risk data
    risk_data = get_current_risk()
    
    # Prepare the request
    url = "http://localhost:8000/analyze"
    
    payload = {
        "question": "We have a critical flood situation in Miami with high risk of Cholera outbreak. What should we do immediately?",
        "dashboard_state": risk_data
    }
    
    print("=" * 80)
    print("🧠 CHESEAL INTELLIGENCE - CRISIS ANALYSIS TEST")
    print("=" * 80)
    print("\n📊 Current Dashboard State:")
    print(json.dumps(risk_data, indent=2))
    print("\n❓ User Question:")
    print(payload["question"])
    print("\n" + "=" * 80)
    print("🤖 CHESEAL'S RESPONSE:")
    print("=" * 80 + "\n")
    
    try:
        # Send POST request
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        # Parse response
        result = response.json()
        
        print(f"🚨 Risk Level: {result['risk_level']}")
        print(f"\n💭 Reasoning: {result.get('reasoning', 'N/A')}")
        print(f"\n📝 Response:\n{result['response']}")
        
        print("\n" + "=" * 80)
        print("✅ Test completed successfully!")
        print("=" * 80)
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to the API server.")
        print("   Make sure the server is running: python main.py")
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    test_cheseal_agent()

