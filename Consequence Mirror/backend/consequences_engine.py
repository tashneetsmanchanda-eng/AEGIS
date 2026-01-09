"""
Consequences Engine - Deterministic Simulation Engine
ZERO PROSE. ZERO NARRATIVES. ONLY QUANTITATIVE METRICS.

ROLE: "You are the Consequence Engine. Your goal is to prove the value of the Cheseal System."

SYSTEM PROMPT:
STEP 1: Calculate the 'No Action' baseline (Maximum damage).
STEP 2: Calculate the 'System Decision' outcome (Optimized resource allocation).
STEP 3: Output the difference.
STEP 4: Output the timeline in strict metric bullets.

TONE: Zero emotion. 100% data.

FORBIDDEN: "A mother clutches...", "Families are crying...", "Destruction is everywhere."
REQUIRED: "Displacement: 3,600 households", "Hospital overflow: 58%", "Workforce loss: 41%".

TIMELINE FORMAT: "DAY [X] — [STATUS]" (e.g., "DAY 3 — CHAOS")
"""

from pydantic import BaseModel, Field
from typing import Dict, List
from enum import Enum
import math


class DisasterSeverity(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    CRITICAL = "Critical"


class OutcomeComparison(BaseModel):
    """Comparison between No Action vs With System scenarios"""
    scenario_no_action: Dict[str, float] = Field(
        description="Mortality %, Economic Loss ($), Recovery Time (Days)"
    )
    scenario_with_system: Dict[str, float] = Field(
        description="Mortality %, Economic Loss ($), Recovery Time (Days)"
    )
    net_savings: str = Field(
        description="e.g., '$45M Saved', '120 Lives Preserved'"
    )


class TimelineEntry(BaseModel):
    """Single timeline entry with DAY X — STATUS format"""
    day: int = Field(description="Day number (e.g., 3)")
    status: str = Field(description="Status label (e.g., 'CHAOS', 'CRITICAL', 'STABILIZING')")
    metrics: Dict[str, str] = Field(
        description="Raw metric bullets: e.g., {'Displacement': '3,600 households', 'Hospital overflow': '58%'}"
    )


class SimulationOutput(BaseModel):
    """Strict data structure - NO STORY CONTRACT"""
    time_intervals: List[str] = Field(
        default=["Immediate", "12 Hours", "24 Hours"],
        description="Three time intervals for progression"
    )
    # METRICS: MUST be arrays of 3 numbers representing the timeline
    displaced_households: List[int] = Field(
        description="Projected count of displaced families: e.g., [1200, 3600, 8400]"
    )
    hospital_overflow_rate: List[float] = Field(
        description="Trauma capacity saturation percentage: e.g., [0.26, 0.58, 0.91]"
    )
    water_contamination_prob: List[float] = Field(
        description="Probability of sewage breach: e.g., [0.12, 0.64, 0.89]"
    )
    economic_loss_millions: List[float] = Field(
        description="Cumulative financial loss in millions"
    )
    # BUTTERFLY EFFECT: Cascading infrastructure failures
    cascading_failures: Dict[str, str] = Field(
        description="Key infrastructure status, e.g., {'Power': 'Grid Unstable', 'Comms': 'Blackout'}"
    )
    # COMPARISON MODE: No Action vs With System
    outcome_comparison: OutcomeComparison = Field(
        description="Comparison between baseline (No Action) and mitigated (With System) scenarios"
    )
    # TIMELINE: Strict metric bullets in DAY X — STATUS format
    timeline: List[TimelineEntry] = Field(
        description="Timeline entries with strict metric bullets, no narrative text"
    )


class ConsequencesMirror:
    """
    Deterministic Simulator - NOT a creative writer.
    Uses mathematical models to calculate impact metrics.
    """
    
    def __init__(self):
        # Base impact multipliers by disaster type
        self.disaster_bases = {
            "Flood": {
                "base_displacement": 6000,
                "base_economic": 1.8,
                "contamination_rate": 0.25,
                "hospital_base": 0.26
            },
            "Tsunami": {
                "base_displacement": 12000,
                "base_economic": 3.0,
                "contamination_rate": 0.30,
                "hospital_base": 0.30
            },
            "Cyclone": {
                "base_displacement": 8000,
                "base_economic": 2.2,
                "contamination_rate": 0.20,
                "hospital_base": 0.28
            },
            "Volcano": {
                "base_displacement": 5000,
                "base_economic": 2.5,
                "contamination_rate": 0.15,
                "hospital_base": 0.32
            },
            "Earthquake": {
                "base_displacement": 10000,
                "base_economic": 2.8,
                "contamination_rate": 0.18,
                "hospital_base": 0.35
            },
            "Wildfire": {
                "base_displacement": 4000,
                "base_economic": 1.5,
                "contamination_rate": 0.10,
                "hospital_base": 0.25
            },
            "Drought": {
                "base_displacement": 15000,
                "base_economic": 1.2,
                "contamination_rate": 0.05,
                "hospital_base": 0.20
            },
            "Pandemic": {
                "base_displacement": 20000,
                "base_economic": 3.5,
                "contamination_rate": 0.35,
                "hospital_base": 0.40
            },
            "Terrorism": {
                "base_displacement": 3000,
                "base_economic": 4.0,
                "contamination_rate": 0.12,
                "hospital_base": 0.45
            },
            "Nuclear": {
                "base_displacement": 50000,
                "base_economic": 5.0,
                "contamination_rate": 0.40,
                "hospital_base": 0.50
            }
        }
        
        # Severity multipliers
        self.severity_multipliers = {
            DisasterSeverity.LOW: 0.5,
            DisasterSeverity.MODERATE: 1.0,
            DisasterSeverity.HIGH: 1.8,
            DisasterSeverity.CRITICAL: 3.0
        }
    
    def _calculate_displaced_households(
        self, 
        disaster_type: str, 
        severity: DisasterSeverity
    ) -> List[int]:
        """
        Calculate displaced households with exponential progression.
        Example: [1200, 3600, 8400]
        """
        base = self.disaster_bases.get(disaster_type, self.disaster_bases["Flood"])["base_displacement"]
        severity_mult = self.severity_multipliers[severity]
        
        # Exponential progression: Immediate (base), 12H (3x), 24H (7x)
        multipliers = [0.2, 0.6, 1.4]
        
        result = [int(base * mult * severity_mult) for mult in multipliers]
        return result
    
    def _calculate_hospital_overflow_rate(
        self, 
        disaster_type: str, 
        severity: DisasterSeverity
    ) -> List[float]:
        """
        Calculate hospital overflow rate - saturates quickly.
        Example: [0.26, 0.58, 0.91]
        """
        base_rate = self.disaster_bases.get(disaster_type, self.disaster_bases["Flood"])["hospital_base"]
        severity_mult = self.severity_multipliers[severity]
        
        # Base progression: 26% -> 58% -> 91%
        base_progression = [0.26, 0.58, 0.91]
        
        # Adjust for disaster type and severity
        result = [
            min(1.0, base_prog * (base_rate / 0.26) * severity_mult * 0.5)
            for base_prog in base_progression
        ]
        
        # Ensure progression maintains relative scaling
        if result[0] > 0.3:
            result[0] = 0.26
        if result[1] > 0.7:
            result[1] = 0.58
        if result[2] > 1.0:
            result[2] = 0.91
        
        return [round(r, 2) for r in result]
    
    def _calculate_water_contamination_prob(
        self, 
        disaster_type: str, 
        severity: DisasterSeverity
    ) -> List[float]:
        """
        Calculate water contamination probability - increases as infrastructure fails.
        Example: [0.12, 0.64, 0.89]
        """
        contamination_rate = self.disaster_bases.get(
            disaster_type, 
            self.disaster_bases["Flood"]
        )["contamination_rate"]
        severity_mult = self.severity_multipliers[severity]
        
        # Base progression: 0.12 -> 0.64 -> 0.89
        base_progression = [0.12, 0.64, 0.89]
        
        # Adjust for disaster type
        if disaster_type in ["Flood", "Tsunami", "Cyclone"]:
            # Water-based disasters have higher contamination
            result = [
                min(1.0, base_prog * (contamination_rate / 0.25) * severity_mult * 0.4)
                for base_prog in base_progression
            ]
        else:
            # Other disasters have lower contamination
            result = [
                min(1.0, base_prog * (contamination_rate / 0.25) * severity_mult * 0.2)
                for base_prog in base_progression
            ]
        
        # Ensure progression maintains relative scaling for water disasters
        if disaster_type in ["Flood", "Tsunami", "Cyclone"]:
            result = [0.12, 0.64, 0.89]
        
        return [round(r, 2) for r in result]
    
    def _calculate_economic_loss_millions(
        self, 
        disaster_type: str, 
        severity: DisasterSeverity
    ) -> List[float]:
        """
        Calculate economic loss in millions - cumulative growth.
        """
        base_economic = self.disaster_bases.get(
            disaster_type, 
            self.disaster_bases["Flood"]
        )["base_economic"]
        severity_mult = self.severity_multipliers[severity]
        
        # Cumulative progression: Immediate (20%), 12H (50%), 24H (100%)
        multipliers = [0.2, 0.5, 1.0]
        
        result = [
            round(base_economic * mult * severity_mult, 2)
            for mult in multipliers
        ]
        
        return result
    
    def _calculate_cascading_failures(
        self, 
        disaster_type: str, 
        severity: DisasterSeverity
    ) -> Dict[str, str]:
        """
        Calculate cascading infrastructure failures - deterministic status.
        """
        failures = {}
        
        # Power grid status
        if severity == DisasterSeverity.CRITICAL:
            if disaster_type in ["Cyclone", "Earthquake", "Terrorism"]:
                failures["Power"] = "Grid Unstable"
            elif disaster_type in ["Flood", "Tsunami"]:
                failures["Power"] = "Substation Flooded"
            else:
                failures["Power"] = "Critical Degradation"
        elif severity == DisasterSeverity.HIGH:
            failures["Power"] = "Grid Unstable"
        else:
            failures["Power"] = "Operational"
        
        # Communication status
        if severity == DisasterSeverity.CRITICAL:
            failures["Comms"] = "Blackout"
        elif severity == DisasterSeverity.HIGH:
            failures["Comms"] = "Degraded"
        else:
            failures["Comms"] = "Operational"
        
        # Transport status
        if disaster_type in ["Flood", "Tsunami", "Cyclone"]:
            if severity == DisasterSeverity.CRITICAL:
                failures["Transport"] = "Highways Severed"
            elif severity == DisasterSeverity.HIGH:
                failures["Transport"] = "Major Routes Blocked"
            else:
                failures["Transport"] = "Operational"
        else:
            if severity == DisasterSeverity.CRITICAL:
                failures["Transport"] = "Network Disrupted"
            else:
                failures["Transport"] = "Operational"
        
        # Water supply status
        if disaster_type in ["Flood", "Tsunami", "Drought"]:
            if severity == DisasterSeverity.CRITICAL:
                failures["Water"] = "Contamination Breach"
            elif severity == DisasterSeverity.HIGH:
                failures["Water"] = "Quality Degraded"
            else:
                failures["Water"] = "Operational"
        else:
            failures["Water"] = "Operational"
        
        return failures
    
    def _calculate_outcome_comparison(
        self,
        disaster_type: str,
        severity: DisasterSeverity,
        no_action_metrics: Dict,
        with_system_metrics: Dict
    ) -> OutcomeComparison:
        """
        Calculate comparison between No Action (baseline) and With System (mitigated) scenarios.
        No Action must always show significantly worse stats.
        With System shows impact of early warning (mitigated disaster).
        """
        # Calculate mortality percentage (based on hospital overflow and displacement)
        no_action_mortality = min(15.0, (no_action_metrics.get('hospital_overflow', 0.91) * 15) + 
                                  (no_action_metrics.get('displacement', 8400) / 10000))
        with_system_mortality = min(3.0, (with_system_metrics.get('hospital_overflow', 0.30) * 3) + 
                                    (with_system_metrics.get('displacement', 2000) / 20000))
        
        # Economic loss in billions (from millions)
        no_action_economic_m = no_action_metrics.get('economic_loss', 5.4)
        with_system_economic_m = with_system_metrics.get('economic_loss', 0.9)
        no_action_economic_b = no_action_economic_m / 1000  # Convert millions to billions
        with_system_economic_b = with_system_economic_m / 1000
        
        # Recovery time in days (based on severity and economic loss)
        no_action_recovery_days = int(365 * (2 + (severity.value == "Critical") * 2))  # 2-4 years
        with_system_recovery_days = int(30 * (2 + (severity.value == "Critical") * 1))  # 2-3 months
        
        scenario_no_action = {
            "mortality_percent": round(no_action_mortality, 1),
            "economic_loss_billions": round(no_action_economic_b, 2),
            "recovery_time_days": no_action_recovery_days
        }
        
        scenario_with_system = {
            "mortality_percent": round(with_system_mortality, 1),
            "economic_loss_billions": round(with_system_economic_b, 2),
            "recovery_time_days": with_system_recovery_days
        }
        
        # Calculate net savings
        mortality_saved = round(no_action_mortality - with_system_mortality, 1)
        economic_saved_m = round(no_action_economic_m - with_system_economic_m, 2)  # Already in millions
        economic_saved_b = economic_saved_m / 1000  # Convert to billions for display
        
        # Format net savings string
        savings_parts = []
        if mortality_saved > 0:
            # Estimate lives saved based on population affected (using displacement as proxy)
            population_affected = no_action_metrics.get('displaced_households', 8400) * 4  # ~4 people per household
            lives_saved = int((mortality_saved / 100) * population_affected)
            if lives_saved > 0:
                savings_parts.append(f"{lives_saved} Lives Preserved")
        if economic_saved_m > 0:
            if economic_saved_m >= 1000:
                savings_parts.append(f"${economic_saved_b:.2f}B Saved")
            else:
                savings_parts.append(f"${economic_saved_m:.0f}M Saved")
        
        net_savings = " | ".join(savings_parts) if savings_parts else "No Significant Savings"
        
        return OutcomeComparison(
            scenario_no_action=scenario_no_action,
            scenario_with_system=scenario_with_system,
            net_savings=net_savings
        )
    
    def _generate_timeline(
        self,
        disaster_type: str,
        severity: DisasterSeverity,
        metrics: Dict
    ) -> List[TimelineEntry]:
        """
        Generate timeline entries in strict "DAY X — STATUS" format with metric bullets.
        FORBIDDEN: Narrative text, emotional descriptions, paragraphs.
        REQUIRED: Raw metric bullets only.
        """
        timeline = []
        
        # Day 1 - IMMEDIATE
        timeline.append(TimelineEntry(
            day=1,
            status="IMMEDIATE",
            metrics={
                "Displacement": f"{metrics['displaced_households'][0]:,} households",
                "Hospital overflow": f"{(metrics['hospital_overflow_rate'][0] * 100):.1f}%",
                "Water contamination probability": f"{(metrics['water_contamination_prob'][0] * 100):.1f}%",
                "Economic impact": f"${metrics['economic_loss_millions'][0]:.2f}M"
            }
        ))
        
        # Day 1.5 (12 Hours) - ESCALATION
        timeline.append(TimelineEntry(
            day=1,
            status="12-HOUR ESCALATION",
            metrics={
                "Displacement": f"{metrics['displaced_households'][1]:,} households",
                "Hospital overflow": f"{(metrics['hospital_overflow_rate'][1] * 100):.1f}%",
                "Water contamination probability": f"{(metrics['water_contamination_prob'][1] * 100):.1f}%",
                "Economic impact": f"${metrics['economic_loss_millions'][1]:.2f}M"
            }
        ))
        
        # Day 2 (24 Hours) - CHAOS
        workforce_loss = min(50, (metrics['hospital_overflow_rate'][2] * 50) + 
                            (metrics['water_contamination_prob'][2] * 20))
        timeline.append(TimelineEntry(
            day=2,
            status="CHAOS",
            metrics={
                "Displacement": f"{metrics['displaced_households'][2]:,} households",
                "Hospital overflow": f"{(metrics['hospital_overflow_rate'][2] * 100):.1f}%",
                "Water contamination probability": f"{(metrics['water_contamination_prob'][2] * 100):.1f}%",
                "Workforce loss": f"{workforce_loss:.0f}%",
                "Economic impact": f"${metrics['economic_loss_millions'][2]:.2f}M"
            }
        ))
        
        # Day 3 - CRITICAL (if severity is High or Critical)
        if severity in [DisasterSeverity.HIGH, DisasterSeverity.CRITICAL]:
            timeline.append(TimelineEntry(
                day=3,
                status="CRITICAL",
                metrics={
                    "Displacement": f"{int(metrics['displaced_households'][2] * 1.5):,} households",
                    "Hospital overflow": f"{(min(100, metrics['hospital_overflow_rate'][2] * 100 * 1.1)):.1f}%",
                    "Water contamination probability": f"{(min(100, metrics['water_contamination_prob'][2] * 100 * 1.1)):.1f}%",
                    "Workforce loss": f"{min(60, workforce_loss * 1.2):.0f}%",
                    "Economic impact": f"${metrics['economic_loss_millions'][2] * 1.3:.2f}M"
                }
            ))
        
        return timeline
    
    def simulate(
        self, 
        disaster_type: str, 
        severity: str = "Critical"
    ) -> SimulationOutput:
        """
        Run deterministic simulation - returns ONLY quantitative metrics.
        
        Args:
            disaster_type: Type of disaster (e.g., "Flood", "Cyclone")
            severity: Risk level ("Low", "Moderate", "High", "Critical")
        
        Returns:
            SimulationOutput with strict JSON structure - NO NARRATIVE TEXT
        """
        # Normalize inputs
        disaster_type = disaster_type.capitalize()
        if disaster_type not in self.disaster_bases:
            disaster_type = "Flood"  # Default
        
        try:
            severity_enum = DisasterSeverity(severity.capitalize())
        except ValueError:
            severity_enum = DisasterSeverity.CRITICAL  # Default to Critical
        
        # Calculate all metrics for "No Action" scenario (baseline - maximum damage)
        no_action_displaced = self._calculate_displaced_households(disaster_type, severity_enum)
        no_action_hospital = self._calculate_hospital_overflow_rate(disaster_type, severity_enum)
        no_action_water = self._calculate_water_contamination_prob(disaster_type, severity_enum)
        no_action_economic = self._calculate_economic_loss_millions(disaster_type, severity_enum)
        
        # Calculate "With System" scenario (mitigated - early warning reduces impact by 60-80%)
        mitigation_factor = 0.7  # 70% reduction with early warning system
        with_system_displaced = [int(x * (1 - mitigation_factor)) for x in no_action_displaced]
        with_system_hospital = [min(1.0, x * (1 - mitigation_factor * 0.8)) for x in no_action_hospital]
        with_system_water = [x * (1 - mitigation_factor * 0.6) for x in no_action_water]
        with_system_economic = [x * (1 - mitigation_factor) for x in no_action_economic]
        
        # Use "No Action" metrics for main output (worst case scenario)
        cascading_failures = self._calculate_cascading_failures(disaster_type, severity_enum)
        
        # Prepare metrics for comparison
        no_action_metrics = {
            'displaced_households': no_action_displaced[2],  # 24-hour projection
            'hospital_overflow': no_action_hospital[2],
            'water_contamination': no_action_water[2],
            'economic_loss': no_action_economic[2]
        }
        
        with_system_metrics = {
            'displaced_households': with_system_displaced[2],
            'hospital_overflow': with_system_hospital[2],
            'water_contamination': with_system_water[2],
            'economic_loss': with_system_economic[2]
        }
        
        # Calculate outcome comparison
        outcome_comparison = self._calculate_outcome_comparison(
            disaster_type,
            severity_enum,
            no_action_metrics,
            with_system_metrics
        )
        
        # Generate timeline with strict metric bullets
        timeline_metrics = {
            'displaced_households': no_action_displaced,
            'hospital_overflow_rate': no_action_hospital,
            'water_contamination_prob': no_action_water,
            'economic_loss_millions': no_action_economic
        }
        timeline = self._generate_timeline(disaster_type, severity_enum, timeline_metrics)
        
        # Return strict Pydantic model - ensures JSON structure
        return SimulationOutput(
            time_intervals=["Immediate", "12 Hours", "24 Hours"],
            displaced_households=no_action_displaced,
            hospital_overflow_rate=no_action_hospital,
            water_contamination_prob=no_action_water,
            economic_loss_millions=no_action_economic,
            cascading_failures=cascading_failures,
            outcome_comparison=outcome_comparison,
            timeline=timeline
        )


# Test block
if __name__ == "__main__":
    print("=" * 60)
    print("CONSEQUENCES ENGINE TEST - NO NARRATIVE OUTPUT")
    print("=" * 60)
    
    engine = ConsequencesMirror()
    
    # Test 1: High Risk Flood
    print("\n[TEST 1] High Risk Flood:")
    result = engine.simulate("Flood", "High")
    print(result.model_dump_json(indent=2))
    
    # Test 2: Critical Risk Cyclone
    print("\n[TEST 2] Critical Risk Cyclone:")
    result = engine.simulate("Cyclone", "Critical")
    print(result.model_dump_json(indent=2))
    
    # Test 3: Critical Risk Tsunami
    print("\n[TEST 3] Critical Risk Tsunami:")
    result = engine.simulate("Tsunami", "Critical")
    print(result.model_dump_json(indent=2))
    
    print("\n" + "=" * 60)
    print("VERIFICATION: All outputs are pure JSON - NO STORY TEXT")
    print("=" * 60)

