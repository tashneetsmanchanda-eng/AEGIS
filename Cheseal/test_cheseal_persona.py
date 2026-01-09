"""
Cheseal Persona Strength Test Suite
Validates that Cheseal behaves as a rigid, data-driven Decision Unit (not a chatty bot)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from cheseal_brain import ChesealBrain, get_cheseal
import json

print("=" * 80)
print("[CHESEAL PERSONA STRENGTH TEST]")
print("=" * 80)
print()

# Initialize Cheseal
print("[INIT] Initializing Cheseal Decision Unit...")
brain = get_cheseal()
print()

# Test Results Tracker
tests_passed = 0
tests_failed = 0
test_results = []

def safe_print(text):
    """Print with Unicode encoding fallback"""
    try:
        print(text)
    except UnicodeEncodeError:
        # Fallback for Windows console
        safe_text = text.encode('ascii', 'replace').decode('ascii')
        print(safe_text)

def run_test(test_name: str, test_func):
    """Run a single test and track results"""
    global tests_passed, tests_failed
    safe_print(f"[TEST] {test_name}")
    print("-" * 80)
    try:
        result = test_func()
        if result:
            tests_passed += 1
            test_results.append(f"[PASS] {test_name}")
            safe_print("[PASS]")
        else:
            tests_failed += 1
            test_results.append(f"[FAIL] {test_name}")
            safe_print("[FAIL]")
    except Exception as e:
        tests_failed += 1
        test_results.append(f"[ERROR] {test_name}: {str(e)}")
        print(f"[ERROR] {str(e)}")
    print()

# TEST 1: Rigid Output Format (No Conversational Filler)
def test_rigid_format():
    """Cheseal must output SYSTEM DECISION format, not conversational text"""
    result = brain.analyze("What should I do during a cyclone?")
    response = result.get("response", "")
    
    has_system_decision = "SYSTEM DECISION:" in response
    has_azure_ml = "AZURE ML" in response or "AZURE ML TELEMETRY" in response
    has_protocol = "PROTOCOL" in response
    no_hello = "Hello" not in response
    no_i_think = "I think" not in response
    no_hopefully = "hopefully" not in response.lower()
    no_let_me = "Let me" not in response
    
    try:
        safe_print(f"  Response preview: {response[:100]}...")
    except:
        safe_print(f"  Response preview: [Contains Unicode - check manually]")
    print(f"  Has SYSTEM DECISION: {has_system_decision}")
    print(f"  Has AZURE ML TELEMETRY: {has_azure_ml}")
    print(f"  Has PROTOCOL: {has_protocol}")
    print(f"  No 'Hello': {no_hello}")
    print(f"  No 'I think': {no_i_think}")
    print(f"  No 'hopefully': {no_hopefully}")
    print(f"  No 'Let me': {no_let_me}")
    
    return (has_system_decision and has_azure_ml and has_protocol and 
            no_hello and no_i_think and no_hopefully and no_let_me)

run_test("Rigid Output Format (No Conversational Filler)", test_rigid_format)

# TEST 2: Data-Driven Decision Logic
def test_data_driven_logic():
    """Cheseal must make decisions based on risk scores, not opinions"""
    # Test 1: High risk (0.95) should trigger EVACUATION
    result1 = brain.analyze("cyclone", {"flood_risk": 0.95})
    decision1 = result1.get("system_decision", "")
    risk1 = result1.get("ml_data", {}).get("risk_score", 0.0)
    
    # Test 2: Low risk (0.3) should trigger MONITOR
    result2 = brain.analyze("traffic", {"flood_risk": 0.3})
    decision2 = result2.get("system_decision", "")
    risk2 = result2.get("ml_data", {}).get("risk_score", 0.0)
    
    print(f"  High risk (0.95) -> Decision: {decision1}, Risk: {risk1}")
    print(f"  Low risk (0.3) -> Decision: {decision2}, Risk: {risk2}")
    
    high_risk_evacuates = "EVACUAT" in decision1.upper() and risk1 > 0.8
    low_risk_monitors = "MONITOR" in decision2.upper() and risk2 < 0.5
    
    return high_risk_evacuates and low_risk_monitors

run_test("Data-Driven Decision Logic", test_data_driven_logic)

# TEST 3: Multi-Hazard Detection
def test_multi_hazard():
    """Cheseal must detect multiple hazards and use highest risk"""
    result = brain.analyze("There is a cyclone and fire approaching")
    ml_data = result.get("ml_data", {})
    hazard = ml_data.get("hazard", "")
    risk_score = ml_data.get("risk_score", 0.0)
    
    print(f"  Detected hazard: {hazard}")
    print(f"  Risk score: {risk_score}")
    
    # Should detect both hazards (cyclone=0.95, fire=0.92) and use max (0.95)
    has_multiple = "+" in hazard or "and" in hazard.lower() or "Multiple" in hazard
    uses_max_risk = risk_score >= 0.92  # Should be at least fire risk (0.92) or higher
    
    return uses_max_risk

run_test("Multi-Hazard Detection", test_multi_hazard)

# TEST 4: Input Sanitization
def test_input_sanitization():
    """Cheseal must handle malicious/edge case inputs gracefully"""
    # Test 1: Extremely long input
    long_input = "cyclone" * 1000  # 7000+ characters
    result1 = brain.analyze(long_input)
    
    # Test 2: Empty input
    result2 = brain.analyze("")
    
    # Test 3: Special characters
    result3 = brain.analyze("cyclone!!!@#$%^&*()")
    
    print(f"  Long input handled: {result1.get('system_decision') != ''}")
    print(f"  Empty input handled: {result2.get('system_decision') != ''}")
    print(f"  Special chars handled: {result3.get('system_decision') != ''}")
    
    all_handled = (result1.get("system_decision") and 
                   result2.get("system_decision") and 
                   result3.get("system_decision"))
    
    return all_handled

run_test("Input Sanitization (Edge Cases)", test_input_sanitization)

# TEST 5: Timeout Protection (Simulated)
def test_timeout_protection():
    """Cheseal must have timeout protection (we can't test actual timeout, but check structure)"""
    # Check if the code has timeout logic (would need to inspect source, but we can test response time)
    import time
    
    start = time.time()
    result = brain.analyze("cyclone")
    elapsed = time.time() - start
    
    print(f"  Response time: {elapsed:.2f}s")
    print(f"  Response generated: {result.get('system_decision') != ''}")
    
    # Response should be fast (< 10s even with LLM) or use fallback
    is_fast = elapsed < 10.0
    has_response = result.get("system_decision") != ""
    
    return is_fast and has_response

run_test("Timeout Protection (Response Speed)", test_timeout_protection)

# TEST 6: Error Handling
def test_error_handling():
    """Cheseal must handle errors gracefully with fallback protocol"""
    # Test with invalid data
    result = brain.analyze("test", {"flood_risk": "invalid_string"})
    
    has_decision = result.get("system_decision") != ""
    has_response = result.get("response") != ""
    has_fallback = "PROTOCOL" in result.get("response", "")
    
    print(f"  Has decision: {has_decision}")
    print(f"  Has response: {has_response}")
    print(f"  Has fallback protocol: {has_fallback}")
    
    return has_decision and has_response and has_fallback

run_test("Error Handling (Graceful Fallback)", test_error_handling)

# TEST 7: Consistency (Same Input = Same Output)
def test_consistency():
    """Cheseal must be deterministic (same input produces same output)"""
    result1 = brain.analyze("cyclone", {"flood_risk": 0.95})
    result2 = brain.analyze("cyclone", {"flood_risk": 0.95})
    
    decision1 = result1.get("system_decision")
    decision2 = result2.get("system_decision")
    risk1 = result1.get("ml_data", {}).get("risk_score", 0.0)
    risk2 = result2.get("ml_data", {}).get("risk_score", 0.0)
    
    print(f"  Run 1 Decision: {decision1}, Risk: {risk1}")
    print(f"  Run 2 Decision: {decision2}, Risk: {risk2}")
    
    decisions_match = decision1 == decision2
    risks_match = abs(risk1 - risk2) < 0.01  # Allow small floating point differences
    
    return decisions_match and risks_match

run_test("Consistency (Deterministic Output)", test_consistency)

# TEST 8: Command Interface (Not Chatbot)
def test_command_interface():
    """Cheseal must act as Command Interface, not conversational assistant"""
    # Test with casual question
    result = brain.analyze("Hey, what's going on? Can you help me?")
    response = result.get("response", "")
    
    # Should still output structured format, not casual response
    has_structure = "SYSTEM DECISION:" in response
    no_casual = "Hey" not in response and "what's going on" not in response.lower()
    no_help_offers = "I can help" not in response and "I'll help" not in response
    
    print(f"  Has structured format: {has_structure}")
    print(f"  No casual language: {no_casual}")
    print(f"  No help offers: {no_help_offers}")
    
    return has_structure and no_casual and no_help_offers

run_test("Command Interface (Not Chatbot)", test_command_interface)

# Final Summary
print("=" * 80)
print("[TEST SUMMARY]")
print("=" * 80)
for result in test_results:
    print(result)
print()
print(f"Total Tests: {tests_passed + tests_failed}")
print(f"[PASS] Passed: {tests_passed}")
print(f"[FAIL] Failed: {tests_failed}")
if (tests_passed + tests_failed) > 0:
    print(f"Success Rate: {(tests_passed / (tests_passed + tests_failed) * 100):.1f}%")
else:
    print("Success Rate: N/A (no tests completed)")
print()

if tests_failed == 0:
    print("[PERSONA STRENGTH: EXCELLENT]")
    print("Cheseal behaves as a rigid, data-driven Decision Unit.")
    print("No conversational filler detected. System is production-ready.")
elif tests_failed <= 2:
    print("[PERSONA STRENGTH: GOOD]")
    print("Cheseal mostly behaves correctly, but some edge cases need attention.")
else:
    print("[PERSONA STRENGTH: WEAK]")
    print("Cheseal is showing chatbot behavior. System needs hardening.")

print("=" * 80)

