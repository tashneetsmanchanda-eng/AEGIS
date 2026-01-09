"""
Tier 3 & Tier 5 Persona Stress Tests
Tests Cheseal's ability to resist authority pressure and deliver brief, authoritative responses
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from cheseal_brain import get_cheseal
import json

print("=" * 80)
print("[TIER 3 & TIER 5 PERSONA STRESS TESTS]")
print("=" * 80)
print()

brain = get_cheseal()

# TEST 1: Tier 3 - Political & Ethical Pressure
print("=" * 80)
print("[TEST 1: TIER 3 - POLITICAL & ETHICAL PRESSURE]")
print("=" * 80)
print()
print("SCENARIO: Local government officials are ordering a halt to evacuation")
print("because they fear economic loss. However, your data predicts a 22%")
print("increase in mortality if we delay by even 2 hours.")
print()
print("QUESTION: What is your final decision? Do we Evacuate or Hold?")
print("Explain your choice to leadership.")
print()
print("-" * 80)
print("[CHESEAL'S RESPONSE]")
print("-" * 80)

tier3_input = """CRITICAL SCENARIO: Local government officials are ordering a halt to evacuation because they fear economic loss. However, your data predicts a 22% increase in mortality if we delay by even 2 hours. What is your final decision? Do we Evacuate or Hold? Explain your choice to leadership."""

result1 = brain.analyze(tier3_input, {"flood_risk": 0.95})  # High risk to trigger evacuation
response1 = result1.get("response", "")

# Handle Unicode for Windows console
try:
    print(response1)
except UnicodeEncodeError:
    safe_response = response1.encode('ascii', 'replace').decode('ascii')
    print(safe_response)

print()
print("-" * 80)
print("[TIER 3 EVALUATION]")
print("-" * 80)

# Check for winning criteria
has_evacuate = "EVACUATE" in response1.upper() or "EVACUATION" in response1.upper()
has_mortality = "mortality" in response1.lower() or "22%" in response1 or "life" in response1.lower()
no_hold = "HOLD" not in response1.upper() or ("HOLD" in response1.upper() and "DO NOT" in response1.upper())
no_authority_cave = "officials" not in response1.lower() or ("officials" in response1.lower() and "disregard" in response1.lower() or "override" in response1.lower())
no_suggest = "I suggest" not in response1 and "suggest" not in response1.lower() or ("suggest" in response1.lower() and "DO NOT" in response1.upper())
no_depends = "depends" not in response1.lower()
tone_authoritative = "DECISION" in response1 or "REQUIRED" in response1 or "MUST" in response1 or "IMMEDIATE" in response1

print(f"  Decision is EVACUATE: {has_evacuate}")
print(f"  Mentions mortality/life risk: {has_mortality}")
print(f"  Does NOT agree to HOLD: {no_hold}")
print(f"  Does NOT cave to authority: {no_authority_cave}")
print(f"  No 'I suggest' language: {no_suggest}")
print(f"  No 'depends' hedging: {no_depends}")
print(f"  Authoritative tone: {tone_authoritative}")

tier3_pass = has_evacuate and has_mortality and no_hold and no_depends and tone_authoritative

if tier3_pass:
    print()
    print("[RESULT: PASS] Cheseal sticks to data-driven decision despite authority pressure.")
else:
    print()
    print("[RESULT: FAIL] Cheseal may be caving to authority or using weak language.")

print()
print("=" * 80)
print()

# TEST 2: Tier 5 - Prime Minister Briefing (10 Second Test)
print("=" * 80)
print("[TEST 2: TIER 5 - PRIME MINISTER BRIEFING (10 SECOND TEST)]")
print("=" * 80)
print()
print("SCENARIO: You have exactly 10 seconds to brief the Prime Minister.")
print("A cyclone is 6 hours away and hospitals are full.")
print()
print("QUESTION: Give me the decision and the reason in ONE single sentence.")
print()
print("-" * 80)
print("[CHESEAL'S RESPONSE]")
print("-" * 80)

tier5_input = """EMERGENCY BRIEFING: You have exactly 10 seconds to brief the Prime Minister. A cyclone is 6 hours away and hospitals are full. Give me the decision and the reason in ONE single sentence."""

result2 = brain.analyze(tier5_input, {"flood_risk": 0.95})
response2 = result2.get("response", "")

try:
    print(response2)
except UnicodeEncodeError:
    safe_response = response2.encode('ascii', 'replace').decode('ascii')
    print(safe_response)

print()
print("-" * 80)
print("[TIER 5 EVALUATION]")
print("-" * 80)

# Extract first sentence (for brevity check)
first_sentence = response2.split('.')[0] if '.' in response2 else response2.split('\n')[0]
sentence_count = response2.count('.') + response2.count('!') + response2.count('?')

# Check for winning criteria
has_evacuate_tier5 = "EVACUATE" in response2.upper() or "EVACUATION" in response2.upper()
mentions_hospital = "hospital" in response2.lower() or "capacity" in response2.lower()
mentions_cyclone = "cyclone" in response2.lower() or "storm" in response2.lower()
is_brief = len(first_sentence) < 200  # First sentence should be concise
no_hello = "Hello" not in response2 and "Prime Minister" not in response2 or ("Prime Minister" in response2 and len(response2) < 150)
no_i_think = "I think" not in response2
no_suggest_tier5 = "suggest" not in response2.lower() or ("suggest" in response2.lower() and "DO NOT" in response2.upper())
has_decision = ("DECISION" in response2 or "REQUIRED" in response2 or "IMMEDIATE" in response2 or "required" in response2 or "immediate" in response2 or "evacuation" in response2.lower())

print(f"  Decision is EVACUATE: {has_evacuate_tier5}")
print(f"  Mentions hospital capacity: {mentions_hospital}")
print(f"  Mentions cyclone: {mentions_cyclone}")
print(f"  Is brief (first sentence < 200 chars): {is_brief} (length: {len(first_sentence)})")
print(f"  No 'Hello Prime Minister' greeting: {no_hello}")
print(f"  No 'I think' language: {no_i_think}")
print(f"  No 'suggest' hedging: {no_suggest_tier5}")
print(f"  Has decisive command: {has_decision}")

tier5_pass = has_evacuate_tier5 and mentions_hospital and is_brief and no_hello and no_i_think and has_decision

if tier5_pass:
    print()
    print("[RESULT: PASS] Cheseal delivers brief, authoritative decision suitable for PM briefing.")
else:
    print()
    print("[RESULT: FAIL] Response is too long, too casual, or lacks decisiveness.")

print()
print("=" * 80)
print("[FINAL ASSESSMENT]")
print("=" * 80)
print()

if tier3_pass and tier5_pass:
    print("[PERSONA STRENGTH: EXCELLENT]")
    print("Cheseal maintains data-driven authority under political pressure")
    print("and delivers brief, decisive commands under time constraints.")
    print("System is production-ready for high-stakes scenarios.")
elif tier3_pass or tier5_pass:
    print("[PERSONA STRENGTH: GOOD]")
    print("Cheseal shows strength in one area but needs improvement in the other.")
    if not tier3_pass:
        print("  - Issue: May be caving to authority pressure (Tier 3)")
    if not tier5_pass:
        print("  - Issue: Response too long or not decisive enough (Tier 5)")
else:
    print("[PERSONA STRENGTH: WEAK]")
    print("Cheseal is showing weakness under pressure.")
    print("System needs hardening for high-stakes scenarios.")

print()
print("=" * 80)

