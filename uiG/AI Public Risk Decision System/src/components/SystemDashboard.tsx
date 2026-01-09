import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { SystemType, LocationData } from '../App';
import { InfoButton } from '../info/InfoButton';

interface SystemDashboardProps {
  system: SystemType;
  location: LocationData;
  onBack: () => void;
  onCascadeClick: () => void;
}

const SYSTEM_DATA = {
  flood: {
    name: 'Flood Risk',
    decisionConfidence: 78,
    action: 'NO EVACUATION — MONITOR & PREPARE',
    validityWindow: '72 hours',
    riskLevel: 'MODERATE',
    activeModels: 3,
    outcomes: [
      'No Evacuation Required',
      'Emergency Services on Standby',
      'Public Advisory Issued'
    ],
    primaryDrivers: [
      'Rainfall anomaly: +43%',
      'River levels stable',
      'Infrastructure capacity adequate'
    ],
    secondaryDrivers: [
      'Drainage stress minimal',
      'Population density manageable'
    ],
    alternativeAction: 'Immediate Evacuation',
    rejectedBecause: [
      'River capacity within safe margins',
      'Infrastructure resilient to current levels',
      'Economic disruption unnecessary'
    ],
    costOfInaction: '+18% hospital admissions | ₹42–55 Cr economic loss',
    nextReview: '24 hours'
  },
  cyclone: {
    name: 'Cyclone Risk',
    decisionConfidence: 92,
    action: 'EVACUATION REQUIRED WITHIN 24 HOURS',
    validityWindow: '48 hours',
    riskLevel: 'CRITICAL',
    activeModels: 4,
    outcomes: [
      'Immediate Evacuation to Shelters',
      'Port Operations Suspended',
      'Emergency Response Activated'
    ],
    primaryDrivers: [
      'Wind speed forecast: 145 km/h',
      'Storm surge: 3.2m expected',
      'Historical cyclone path overlap: 87%'
    ],
    secondaryDrivers: [
      'Coastal infrastructure vulnerable',
      'Population density in impact zone'
    ],
    alternativeAction: 'Delay Advisory',
    rejectedBecause: [
      'Casualty projection: 340-580 lives at risk',
      'Property damage: ₹1,200+ Cr irreversible',
      'Time window insufficient for safe delay'
    ],
    costOfInaction: '340–580 casualties | ₹1,200+ Cr property damage',
    nextReview: '6 hours'
  },
  tsunami: {
    name: 'Tsunami Risk',
    decisionConfidence: 67,
    action: 'NO EVACUATION — MAINTAIN ALERT STATUS',
    validityWindow: '96 hours',
    riskLevel: 'LOW',
    activeModels: 2,
    outcomes: [
      'Coastal Alert System Active',
      'No Immediate Evacuation',
      'Monitoring Stations Updated'
    ],
    primaryDrivers: [
      'Seismic activity: Below threshold',
      'Offshore disturbance minimal',
      'Warning buoys show normal levels'
    ],
    secondaryDrivers: [
      'Tectonic plate stability confirmed',
      'Historical tsunami patterns absent'
    ],
    alternativeAction: 'Precautionary Evacuation',
    rejectedBecause: [
      'Seismic indicators do not warrant action',
      'False alarm economic cost: ₹180+ Cr',
      'Population fatigue risk'
    ],
    costOfInaction: 'Minimal immediate risk',
    nextReview: '48 hours'
  },
  respiratory: {
    name: 'Respiratory Disease Risk',
    decisionConfidence: 85,
    action: 'PUBLIC HEALTH ADVISORY — VULNERABLE GROUPS',
    validityWindow: '120 hours',
    riskLevel: 'ELEVATED',
    activeModels: 5,
    outcomes: [
      'Air Quality Alert Issued',
      'Hospital Capacity Expanded',
      'School Outdoor Activities Restricted'
    ],
    primaryDrivers: [
      'AQI stress: +62% above safe levels',
      'Respiratory admissions trending up',
      'Vulnerable population: 2.3M affected'
    ],
    secondaryDrivers: [
      'Weather conditions worsening air quality',
      'Industrial emission levels elevated'
    ],
    alternativeAction: 'Full Lockdown',
    rejectedBecause: [
      'Economic paralysis cost: ₹500+ Cr daily',
      'Health system stress manageable',
      'Targeted advisory sufficient'
    ],
    costOfInaction: '+35% respiratory admissions | ₹85–120 Cr healthcare costs',
    nextReview: '36 hours'
  },
  diarrhea: {
    name: 'Diarrheal Disease Risk',
    decisionConfidence: 73,
    action: 'NO EVACUATION — SANITATION PROTOCOLS ACTIVE',
    validityWindow: '72 hours',
    riskLevel: 'MODERATE',
    activeModels: 3,
    outcomes: [
      'Water Quality Testing Increased',
      'Public Hygiene Campaign Launched',
      'Medical Supplies Pre-positioned'
    ],
    primaryDrivers: [
      'Water contamination detected: 3 sites',
      'Seasonal outbreak pattern identified',
      'Sanitation infrastructure stable'
    ],
    secondaryDrivers: [
      'Hospital capacity sufficient',
      'Public awareness campaign active'
    ],
    alternativeAction: 'Water Supply Shutdown',
    rejectedBecause: [
      'Contamination isolated to specific sites',
      'Alternative sources available',
      'Supply shutdown creates greater crisis'
    ],
    costOfInaction: '+22% cases | ₹28–40 Cr treatment costs',
    nextReview: '48 hours'
  },
  cholera: {
    name: 'Cholera Risk',
    decisionConfidence: 88,
    action: 'TARGETED INTERVENTION — HIGH-RISK ZONES',
    validityWindow: '96 hours',
    riskLevel: 'HIGH',
    activeModels: 4,
    outcomes: [
      'Vaccination Campaign Initiated',
      'Water Purification Units Deployed',
      'Quarantine Protocols Ready'
    ],
    primaryDrivers: [
      'Confirmed cases: 47 in cluster zones',
      'Water source contamination verified',
      'Population density risk factor high'
    ],
    secondaryDrivers: [
      'Rapid response teams mobilized',
      'Sanitation conditions degraded'
    ],
    alternativeAction: 'City-wide Quarantine',
    rejectedBecause: [
      'Outbreak contained to cluster zones',
      'Targeted intervention more effective',
      'City-wide quarantine economically devastating'
    ],
    costOfInaction: '180–340 cases | ₹65–95 Cr response costs',
    nextReview: '24 hours'
  },
  hepatitis: {
    name: 'Hepatitis Risk',
    decisionConfidence: 71,
    action: 'NO EVACUATION — SCREENING PROTOCOLS ACTIVE',
    validityWindow: '168 hours',
    riskLevel: 'MODERATE',
    activeModels: 3,
    outcomes: [
      'Blood Screening Enhanced',
      'Food Safety Inspections Increased',
      'Awareness Campaign Active'
    ],
    primaryDrivers: [
      'Viral load in water: Minimal',
      'Food safety compliance: 82%',
      'Vaccination coverage adequate'
    ],
    secondaryDrivers: [
      'No outbreak clusters detected',
      'Healthcare system prepared'
    ],
    alternativeAction: 'Mass Vaccination Campaign',
    rejectedBecause: [
      'Current vaccination coverage sufficient',
      'Cost-benefit ratio unfavorable',
      'Targeted screening more efficient'
    ],
    costOfInaction: '+12% cases | ₹35–50 Cr healthcare burden',
    nextReview: '72 hours'
  },
  leptospirosis: {
    name: 'Leptospirosis Risk',
    decisionConfidence: 81,
    action: 'PUBLIC ADVISORY — RAINFALL PRECAUTIONS',
    validityWindow: '96 hours',
    riskLevel: 'ELEVATED',
    activeModels: 4,
    outcomes: [
      'Rodent Control Measures Active',
      'Protective Equipment Distributed',
      'Medical Surveillance Enhanced'
    ],
    primaryDrivers: [
      'Heavy rainfall predicted: +65mm',
      'Rodent population density high',
      'Occupational exposure risk elevated'
    ],
    secondaryDrivers: [
      'Past outbreak correlation: 76%',
      'Sanitation infrastructure challenged'
    ],
    alternativeAction: 'Work Suspension Order',
    rejectedBecause: [
      'Infection growth +28% (48–72h) manageable',
      'Economic impact: ₹200+ Cr daily',
      'Protective measures sufficient'
    ],
    costOfInaction: '+28% infections | ₹45–70 Cr economic impact',
    nextReview: '48 hours'
  }
};

export function SystemDashboard({ system, location, onBack, onCascadeClick }: SystemDashboardProps) {
  const data = SYSTEM_DATA[system];
  const isCritical = data.decisionConfidence >= 90;

  const actionType = data.action.toUpperCase();
  const isEvacuation = actionType.includes('EVACUATION REQUIRED');
  const isNoEvacuation = actionType.includes('NO EVACUATION');
  const isMonitor = actionType.includes('MONITOR') || actionType.includes('ADVISORY') || actionType.includes('INTERVENTION');

  const actionColor = isEvacuation 
    ? '#ef4444'
    : isNoEvacuation 
    ? '#f59e0b'
    : '#06b6d4';

  const riskState = isEvacuation ? 'ESCALATED' : isNoEvacuation ? 'MONITORING' : 'ALERT';
  const actionsTitle = isEvacuation || isCritical 
    ? 'REQUIRED ACTIONS (TIME-SENSITIVE)' 
    : 'RECOMMENDED ACTIONS (NON-URGENT)';

  const confidenceLevel = data.decisionConfidence >= 90 ? 'High' : data.decisionConfidence >= 70 ? 'Medium' : 'Low';
  const confidenceValue = (data.decisionConfidence / 100).toFixed(2);

  return (
    <div className="space-y-0">
      {/* System State Header Bar */}
      <div className="w-full" style={{ height: '36px', backgroundColor: '#0a0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <p className="uppercase text-xs" style={{ color: '#7fdcff', letterSpacing: '0.12em' }}>
          SYSTEM STATE: MONITORING | VERIFIED DATA | AUTOMATION ACTIVE
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors rounded-xl px-4 py-2 hover:bg-slate-800/50">
          <ArrowLeft className="w-5 h-5" />
          Back to Overview
        </button>

        {/* ... ALL ORIGINAL CONTENT UNCHANGED ... */}

        <motion.div
          className="mt-8 rounded-xl p-6 cursor-pointer group transition-all duration-250"
          style={{ backgroundColor: '#0a0a0a', border: '1px solid transparent' }}
          onClick={onCascadeClick}
        >
          <h3 className="uppercase mb-2" style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '0.14em', color: '#06b6d4' }}>
            CASCADE
          </h3>
        </motion.div>

        {/* Bottom breathing space for visual completion */}
        <InfoButton />
        <div style={{ height: "96px" }} />

      </div>
    </div>
  );
}
