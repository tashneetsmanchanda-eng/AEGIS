"""
Consequence Mirror - Simulation Engine
Outputs ONLY structured, quantifiable metrics. ZERO PROSE. ZERO NARRATIVES.

STRICT PROTOCOL:
FORBIDDEN: Do not use first-person perspective ("I felt..."). 
           Do not use emotional adjectives ("devastating", "heartbreaking"). 
           Do not write paragraphs or scenarios.

REQUIRED: Output ONLY measurable data points showing progression over 3 distinct time steps 
          (Immediate, +12 Hours, +24 Hours).

TONE: Cold, clinical, statistical, and objective.

RULE 1: ZERO PROSE. Do not write sentences. Do not write paragraphs. Output ONLY structured data.
RULE 2: QUANTIFIABLE METRICS. Every output must be a number, percentage, or rate.
RULE 3: CASCADING TIME-STEPS. Show progression over 3 stages (Immediate, 12-Hour, 24-Hour).
RULE 4: EXPONENTIAL PROGRESSION. Displacement scales exponentially (1200 -> 3600 -> 8400).
RULE 5: SATURATION LOGIC. Hospital load saturates quickly (26% -> 58% -> 91%).
RULE 6: INFRASTRUCTURE FAILURE. Contamination increases as infrastructure fails (0.12 -> 0.64 -> 0.89).
"""

from typing import Dict, List, Tuple
from enum import Enum
from dataclasses import dataclass, field
import math


class DisasterType(Enum):
    VOLCANO = "Volcano"
    CYCLONE = "Cyclone"
    TSUNAMI = "Tsunami"
    EARTHQUAKE = "Earthquake"
    FLOOD = "Flood"
    WILDFIRE = "Wildfire"
    DROUGHT = "Drought"
    PANDEMIC = "Pandemic"
    TERRORISM = "Terrorism"
    NUCLEAR = "Nuclear"


class Phase(Enum):
    IMMEDIATE = "1 Hour"
    HOUR_12 = "12 Hours"
    HOUR_24 = "24 Hours"


@dataclass
class PhaseState:
    """State of the simulation at a specific phase - ONLY quantifiable metrics"""
    phase: Phase
    displaced_households: int = 0
    hospital_overflow_rate: float = 0.0
    water_contamination_prob: float = 0.0
    economic_loss_estimate: float = 0.0
    critical_infrastructure_status: Dict[str, str] = field(default_factory=dict)
    disease_vector_risk: float = 0.0
    trauma_capacity_load: float = 0.0


class ConsequenceEngine:
    """
    Temporal state machine that simulates cascading risks over 3 phases.
    Outputs ONLY structured, quantifiable metrics. ZERO PROSE.
    """
    
    def __init__(self):
        self.base_impact = self._build_base_impact()
    
    def _build_base_impact(self) -> Dict[DisasterType, Dict[str, int]]:
        """Base impact multipliers for each disaster type"""
        return {
            DisasterType.VOLCANO: {"base_families": 5000, "severity": 8, "base_economic": 2500000},
            DisasterType.CYCLONE: {"base_families": 8000, "severity": 7, "base_economic": 2200000},
            DisasterType.TSUNAMI: {"base_families": 12000, "severity": 9, "base_economic": 3000000},
            DisasterType.EARTHQUAKE: {"base_families": 10000, "severity": 8, "base_economic": 2800000},
            DisasterType.FLOOD: {"base_families": 6000, "severity": 6, "base_economic": 1800000},
            DisasterType.WILDFIRE: {"base_families": 4000, "severity": 7, "base_economic": 1500000},
            DisasterType.DROUGHT: {"base_families": 15000, "severity": 7, "base_economic": 1200000},
            DisasterType.PANDEMIC: {"base_families": 20000, "severity": 9, "base_economic": 3500000},
            DisasterType.TERRORISM: {"base_families": 3000, "severity": 8, "base_economic": 4000000},
            DisasterType.NUCLEAR: {"base_families": 50000, "severity": 10, "base_economic": 5000000}
        }
    
    def _calculate_displaced_households(self, disaster: DisasterType, delay_days: int, phase: Phase) -> int:
        """Calculate displaced households - exponential progression (e.g., 1200 -> 3600 -> 8400)"""
        base = self.base_impact[disaster]["base_families"]
        
        disaster_multipliers = {
            DisasterType.FLOOD: 0.25,
            DisasterType.VOLCANO: 0.2,
            DisasterType.CYCLONE: 0.2,
            DisasterType.TSUNAMI: 0.22,
            DisasterType.EARTHQUAKE: 0.21,
            DisasterType.WILDFIRE: 0.19,
            DisasterType.DROUGHT: 0.18,
            DisasterType.PANDEMIC: 0.23,
            DisasterType.TERRORISM: 0.17,
            DisasterType.NUCLEAR: 0.24
        }
        
        multiplier_rate = disaster_multipliers.get(disaster, 0.2)
        delay_multiplier = math.exp(delay_days * multiplier_rate)
        
        # Exponential progression: Immediate (base), 12H (3x), 24H (7x)
        phase_multipliers = {
            Phase.IMMEDIATE: 0.14,  # ~1200 for base 8000
            Phase.HOUR_12: 0.45,    # ~3600 for base 8000
            Phase.HOUR_24: 1.05     # ~8400 for base 8000
        }
        
        result = base * phase_multipliers[phase] * delay_multiplier
        return int(result)
    
    def _calculate_hospital_overflow_rate(self, disaster: DisasterType, delay_days: int, phase: Phase) -> float:
        """Calculate hospital trauma load percentage - saturates quickly (e.g., 26% -> 58% -> 91%)"""
        # Base progression: 26% -> 58% -> 91%
        phase_base = {
            Phase.IMMEDIATE: 26.0,
            Phase.HOUR_12: 58.0,
            Phase.HOUR_24: 91.0
        }
        
        delay_multiplier = 1 + (delay_days * 0.08)
        base_occupancy = phase_base[phase]
        bed_occupancy = min(150.0, base_occupancy * delay_multiplier)
        
        if delay_days > 3:
            collapse_factor = (delay_days - 3) * 15
            bed_occupancy = min(150.0, base_occupancy + collapse_factor)
        
        return round(bed_occupancy, 1)
    
    def _calculate_water_contamination_prob(self, disaster: DisasterType, delay_days: int, phase: Phase) -> float:
        """Calculate water contamination probability - increases as infrastructure fails (0.12 -> 0.64 -> 0.89)"""
        if disaster in [DisasterType.FLOOD, DisasterType.TSUNAMI, DisasterType.CYCLONE]:
            # Exact progression: 0.12 -> 0.64 -> 0.89
            base_prob = {
                Phase.IMMEDIATE: 0.12,
                Phase.HOUR_12: 0.64,
                Phase.HOUR_24: 0.89
            }
        elif disaster == DisasterType.VOLCANO:
            base_prob = {
                Phase.IMMEDIATE: 0.08,
                Phase.HOUR_12: 0.45,
                Phase.HOUR_24: 0.75
            }
        else:
            base_prob = {
                Phase.IMMEDIATE: 0.05,
                Phase.HOUR_12: 0.30,
                Phase.HOUR_24: 0.60
            }
        
        delay_factor = 1 + (delay_days * 0.08)
        prob = min(1.0, base_prob[phase] * delay_factor)
        return round(prob, 2)
    
    def _calculate_economic_loss_estimate(self, disaster: DisasterType, delay_days: int, phase: Phase) -> float:
        """Calculate economic loss estimate in millions (currency units / 1,000,000)"""
        base_economic = self.base_impact[disaster]["base_economic"]
        
        phase_multipliers = {
            Phase.IMMEDIATE: 0.2,
            Phase.HOUR_12: 0.5,
            Phase.HOUR_24: 1.0
        }
        
        delay_multiplier = math.pow(1.5, delay_days)
        result = base_economic * phase_multipliers[phase] * delay_multiplier
        # Convert to millions
        return round(result / 1000000, 2)
    
    def _get_critical_infrastructure_status(self, disaster: DisasterType, delay_days: int, phase: Phase) -> Dict[str, str]:
        """Get critical infrastructure status - quantifiable status only"""
        power_status = "Operational"
        supply_chain_integrity = "100%"
        
        if delay_days > 0:
            if phase == Phase.IMMEDIATE:
                if delay_days >= 1:
                    power_status = "Unstable"
                    supply_chain_integrity = "80%"
            elif phase == Phase.HOUR_12:
                if delay_days >= 2:
                    power_status = "Unstable"
                    supply_chain_integrity = "60%"
                else:
                    power_status = "Unstable"
                    supply_chain_integrity = "80%"
            elif phase == Phase.HOUR_24:
                if delay_days >= 3:
                    power_status = "Failed"
                    supply_chain_integrity = "Critical Failure"
                elif delay_days >= 2:
                    power_status = "Unstable"
                    supply_chain_integrity = "60%"
                else:
                    power_status = "Unstable"
                    supply_chain_integrity = "80%"
        
        return {
            "power_grid_status": power_status,
            "supply_chain_integrity": supply_chain_integrity
        }
    
    def _calculate_disease_vector_risk(self, disaster: DisasterType, delay_days: int, phase: Phase) -> float:
        """Calculate disease vector risk (0.0 to 1.0)"""
        if disaster in [DisasterType.FLOOD, DisasterType.TSUNAMI]:
            base_risk = {
                Phase.IMMEDIATE: 0.12,
                Phase.HOUR_12: 0.48,
                Phase.HOUR_24: 0.82
            }
        elif disaster == DisasterType.PANDEMIC:
            base_risk = {
                Phase.IMMEDIATE: 0.15,
                Phase.HOUR_12: 0.55,
                Phase.HOUR_24: 0.89
            }
        else:
            base_risk = {
                Phase.IMMEDIATE: 0.05,
                Phase.HOUR_12: 0.25,
                Phase.HOUR_24: 0.50
            }
        
        delay_factor = 1 + (delay_days * 0.12)
        risk = min(1.0, base_risk[phase] * delay_factor)
        return round(risk, 2)
    
    def _calculate_trauma_capacity_load(self, disaster: DisasterType, delay_days: int, phase: Phase) -> float:
        """Calculate trauma capacity load as percentage"""
        base_load = {
            Phase.IMMEDIATE: 26.0,
            Phase.HOUR_12: 58.0,
            Phase.HOUR_24: 91.0
        }
        
        delay_multiplier = 1 + (delay_days * 0.08)
        load = min(150.0, base_load[phase] * delay_multiplier)
        return round(load, 1)
    
    def _calculate_readiness_score(self, delay_days: int) -> float:
        """Calculate Early-Warning Readiness Score"""
        base_score = 100.0
        
        if delay_days == 0:
            score = 100.0
        elif delay_days <= 2:
            penalty = delay_days * 8
            score = base_score - penalty
        elif delay_days <= 4:
            penalty = 16 + (delay_days - 2) * 15
            score = base_score - penalty
        elif delay_days <= 6:
            penalty = 46 + (delay_days - 4) * 20
            score = base_score - penalty
        else:
            penalty = 86 + (delay_days - 6) * 14
            score = base_score - penalty
        
        exponential_factor = math.exp(delay_days * 0.12) - 1
        score = score - (exponential_factor * 2)
        
        return max(0.0, round(score, 1))
    
    def get_hospital_metrics(self, disaster: DisasterType, phase: Phase, delay_days: int) -> Dict:
        """Calculate hospital metrics - quantifiable only"""
        bed_occupancy = self._calculate_hospital_overflow_rate(disaster, delay_days, phase)
        
        if bed_occupancy < 60:
            critical_supplies = "Sufficient"
        elif bed_occupancy < 85:
            critical_supplies = "Depleting"
        elif bed_occupancy < 100:
            critical_supplies = "Critical Shortage"
        else:
            critical_supplies = "System Collapse"
        
        if bed_occupancy < 50:
            triage_level = "Standard"
        elif bed_occupancy < 80:
            triage_level = "Emergency"
        elif bed_occupancy < 100:
            triage_level = "Catastrophic"
        else:
            triage_level = "System Failure"
        
        return {
            "bed_occupancy": bed_occupancy,
            "critical_supplies": critical_supplies,
            "triage_level": triage_level
        }
    
    def simulate(self, disaster_type: str, delay_days: int) -> Dict:
        """
        Main simulation method. Returns ONLY structured JSON with quantifiable metrics.
        ZERO PROSE. ZERO NARRATIVES.
        
        Args:
            disaster_type: String name of disaster type
            delay_days: Intervention delay in days (0-30)
        
        Returns:
            Dictionary with structured metrics matching required format
        """
        try:
            disaster = DisasterType[disaster_type.upper()]
        except KeyError:
            disaster = next((d for d in DisasterType if d.value == disaster_type), DisasterType.FLOOD)
        
        delay_days = max(0, min(30, delay_days))
        
        phases = [Phase.IMMEDIATE, Phase.HOUR_12, Phase.HOUR_24]
        timeline = []
        
        for phase in phases:
            state = PhaseState(
                phase=phase,
                displaced_households=self._calculate_displaced_households(disaster, delay_days, phase),
                hospital_overflow_rate=self._calculate_hospital_overflow_rate(disaster, delay_days, phase),
                water_contamination_prob=self._calculate_water_contamination_prob(disaster, delay_days, phase),
                economic_loss_estimate=self._calculate_economic_loss_estimate(disaster, delay_days, phase),
                critical_infrastructure_status=self._get_critical_infrastructure_status(disaster, delay_days, phase),
                disease_vector_risk=self._calculate_disease_vector_risk(disaster, delay_days, phase),
                trauma_capacity_load=self._calculate_trauma_capacity_load(disaster, delay_days, phase)
            )
            
            hospital_metrics = self.get_hospital_metrics(disaster, phase, delay_days)
            
            # Build structured output - NO NARRATIVE TEXT
            timeline.append({
                "phase": phase.value,
                "day": phase.name.split("_")[1] if "_" in phase.name else phase.name,
                "displaced_households": state.displaced_households,
                "hospital_overflow_rate": f"{state.hospital_overflow_rate}%",
                "water_contamination_prob": state.water_contamination_prob,
                "economic_loss_estimate": state.economic_loss_estimate,
                "critical_infrastructure_status": state.critical_infrastructure_status,
                "disease_vector_risk": state.disease_vector_risk,
                "trauma_capacity_load": f"{state.trauma_capacity_load}%",
                "hospital_metrics": hospital_metrics
            })
        
        readiness_score = self._calculate_readiness_score(delay_days)
        
        # Build final structured output matching EXACT JSON schema
        displaced_households = [self._calculate_displaced_households(disaster, delay_days, p) for p in phases]
        hospital_trauma_load = [self._calculate_hospital_overflow_rate(disaster, delay_days, p) for p in phases]
        water_contamination = [self._calculate_water_contamination_prob(disaster, delay_days, p) for p in phases]
        economic_impact = [self._calculate_economic_loss_estimate(disaster, delay_days, p) for p in phases]
        
        # Get critical infrastructure status for each phase
        power_grid_status = [self._get_critical_infrastructure_status(disaster, delay_days, p)["power_grid_status"] for p in phases]
        supply_chain_integrity = [self._get_critical_infrastructure_status(disaster, delay_days, p)["supply_chain_integrity"] for p in phases]
        
        # Determine impact vector based on disaster type and metrics (quantifiable only - NO PROSE)
        primary_driver = ""
        if disaster == DisasterType.FLOOD:
            primary_driver = f"Primary driver is flood water causing sewage breach. Contamination probability: {water_contamination[2]:.2f}"
        elif disaster == DisasterType.TSUNAMI:
            primary_driver = f"Primary driver is saltwater contamination and debris field. Displacement: {displaced_households[2]} households"
        elif disaster == DisasterType.VOLCANO:
            primary_driver = f"Primary driver is ash fall and respiratory surge. Hospital load: {hospital_trauma_load[2]:.1f}%"
        elif disaster == DisasterType.CYCLONE:
            primary_driver = f"Primary driver is wind damage and power grid failure. Infrastructure status: {power_grid_status[2]}"
        else:
            primary_driver = f"Primary driver is {disaster.value.lower()} causing infrastructure degradation"
        
        return {
            "time_steps": [p.value for p in phases],
            "metrics": {
                "displaced_households": displaced_households,
                "hospital_trauma_load_percent": hospital_trauma_load,
                "water_contamination_prob": water_contamination,
                "economic_impact_millions": economic_impact
            },
            "critical_infrastructure": {
                "power_grid_status": power_grid_status,
                "supply_chain_integrity": supply_chain_integrity
            },
            "impact_vector": primary_driver,
            "disaster_type": disaster.value,
            "delay_days": delay_days,
            "readiness_score": readiness_score,
            "detailed_timeline": timeline
        }
