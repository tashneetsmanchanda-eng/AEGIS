    def analyze(self, user_question: str, context_data: Dict[str, Any] = None, 
                risk_vector: Dict[str, float] = None, dashboard_state: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Serverless Entry Point: Accepts JSON payload, returns JSON response.
        FIXED: Merges API risk_vector correctly and deduplicates actions.
        """
        # --- 0. SAFE SCOPE INITIALIZATION ---
        risk_score = 0.0
        decision = "HOLD"
        risk_level = "MONITORING"
        status = "MONITORING"
        
        # Backward compatibility: Split dashboard_state if needed
        if dashboard_state and (context_data is None or risk_vector is None):
            if context_data is None:
                context_data = dashboard_state
            if risk_vector is None:
                # Extract numeric keys only
                risk_vector = {}
                for k, v in dashboard_state.items():
                    if k in ["flood_risk", "hospital_capacity", "confidence", "time_to_impact"]:
                        try:
                            risk_vector[k] = float(v)
                        except:
                            pass

        if risk_vector is None:
            risk_vector = {}

        try:
            # --- 1. DATA MERGE (THE FIX) ---
            # Parse text signals
            text_signals = self.parse_prompt_to_signals(user_question)
            
            # Merge: API risk_vector takes priority over text signals, but text can fill gaps
            final_vector = text_signals.copy()
            final_vector.update(risk_vector) 

            # Check verification status
            is_verified = False
            if context_data:
                is_verified = context_data.get("is_verified", False)
            
            prev_state = None
            if context_data:
                prev_state = context_data.get("previous_state")

            print(f"[BRAIN] ANALYZE | Vector: {final_vector} | Verified: {is_verified}")

            # --- 2. CALCULATE RISK ---
            calc_result = self.calculate_risk(
                risk_vector=final_vector,
                is_verified=is_verified,
                previous_state=prev_state
            )
            
            risk_score = calc_result["risk_score"]
            decision = calc_result["decision"]
            status = calc_result["risk_state"]

            # --- 3. DETERMINE ACTIONS (DEDUPLICATED) ---
            raw_actions = []
            
            # A. Protocol Actions
            if decision == "INITIATE EVACUATION" or decision == "EVACUATE":
                raw_actions = PROTOCOLS["EVACUATE"]
            elif decision == "SHELTER":
                raw_actions = PROTOCOLS["SHELTER"]
            else:
                raw_actions = PROTOCOLS["HOLD_MONITOR"]

            # B. Context Actions (e.g., Asthma)
            user_lower = user_question.lower()
            if "asthma" in user_lower or "respiratory" in user_lower:
                raw_actions.insert(0, "Secure respiratory medication (Asthma Vector)")
            
            # C. Deduplicate (The Fix)
            # Use dict.fromkeys to preserve order while removing duplicates
            unique_actions = list(dict.fromkeys(raw_actions))
            
            # --- 4. FORMAT RESPONSE ---
            return {
                "response": f"""SYSTEM DECISION: {decision}
RISK STATE: {status}

WHY THIS DECISION:
• Risk Score: {risk_score} (Threshold: 0.80)
• Input Source: {'Verified' if is_verified else 'Unverified/Default'}

IMMEDIATE ACTIONS:
1. {unique_actions[0] if len(unique_actions) > 0 else 'Monitor'}
2. {unique_actions[1] if len(unique_actions) > 1 else 'Await Instructions'}
3. {unique_actions[2] if len(unique_actions) > 2 else 'Check Protocols'}
""",
                "risk_level": status,
                "risk_score": risk_score,
                "decision": decision,
                "action_items": unique_actions[:3]
            }

        except Exception as e:
            import traceback
            print(f"[SYSTEM ERROR] {e}")
            print(traceback.format_exc())
            return {
                "response": "SYSTEM FAULT - MANUAL REVIEW",
                "risk_level": "MANUAL_REVIEW", 
                "risk_score": 0.0,
                "decision": "MANUAL_REVIEW"
            }


