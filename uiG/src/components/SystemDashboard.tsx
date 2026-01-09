import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { SystemType, LocationData } from '../App';
import ConsequenceCascade from './ConsequenceCascade';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../i18n/strings';

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
  const { locale } = useLocale();
  const [consequences, setConsequences] = useState<{ day_0: any; day_10: any; day_30: any } | null>(null);
  // Local UI-only state for collapsing the Decision Trace Timeline panel
  const [showDecisionTrace, setShowDecisionTrace] = useState(false);
  const data = SYSTEM_DATA[system];
  const isCritical = data.decisionConfidence >= 90;
  
  // Determine action type for color coding - ALL systems use same logic
  const actionType = data.action.toUpperCase();
  const isEvacuation = actionType.includes('EVACUATION REQUIRED');
  const isNoEvacuation = actionType.includes('NO EVACUATION');
  const isMonitor = actionType.includes('MONITOR') || actionType.includes('ADVISORY') || actionType.includes('INTERVENTION');
  
  // Color coding: red for EVACUATION, amber for NO EVACUATION, cyan for MONITOR/ADVISORY/INTERVENTION
  // Fallback to cyan if pattern doesn't match (shouldn't happen, but ensures consistency)
  const actionColor = isEvacuation 
    ? '#ef4444' // red-500 - controlled red
    : isNoEvacuation 
    ? '#f59e0b' // amber-500 - calm amber
    : '#06b6d4'; // cyan-500 - neutral blue

  // Determine risk state and actions title
  const riskState = isEvacuation ? 'ESCALATED' : isNoEvacuation ? 'MONITORING' : 'ALERT';
  const actionsTitle = isEvacuation || isCritical 
    ? t(locale, 'REQUIRED_ACTIONS_TIME_SENSITIVE')
    : t(locale, 'RECOMMENDED_ACTIONS_NON_URGENT');
  
  // Get confidence level text
  const confidenceLevel = data.decisionConfidence >= 90 ? 'High' : data.decisionConfidence >= 70 ? 'Medium' : 'Low';
  const confidenceValue = (data.decisionConfidence / 100).toFixed(2);

  return (
    <div className="space-y-0">
      {/* System State Header Bar */}
      <div 
        className="w-full"
        style={{
          height: '36px',
          backgroundColor: '#0a0f14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <div className="flex items-center gap-3">
          <p 
            className="uppercase text-xs"
            style={{
              color: '#7fdcff',
              letterSpacing: '0.12em',
            }}
          >
            {t(locale, 'SYSTEM_STATE_HEADER')}
          </p>
          {/* Scenario mode indicator - UI label only, no logic */}
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-amber-400/60 text-amber-300 bg-amber-500/5">
            Scenario Mode: Stable Demo Snapshot
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors rounded-xl px-4 py-2 hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-5 h-5" />
          {t(locale, 'BACK_TO_OVERVIEW')}
        </button>

        {/* Input Status Block */}
        <div 
          className="rounded-lg border border-slate-700/30 p-4"
          style={{ backgroundColor: '#0a0a0a' }}
        >
          <h3 className="text-xs tracking-[0.2em] uppercase text-slate-400 mb-3">
            {t(locale, 'INPUTS_CONSIDERED')}
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <span style={{ color: '#22c55e' }}>✔</span>
              <span>Environmental: Verified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span style={{ color: '#22c55e' }}>✔</span>
              <span>Health: Verified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span style={{ color: '#22c55e' }}>✔</span>
              <span>Infrastructure: Verified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span style={{ color: '#f59e0b' }}>✖</span>
              <span>Social / Political: Ignored</span>
            </div>
          </div>
          
          {/* Edge Case Guardrails */}
          <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-2">
            {data.decisionConfidence < 70 && (
              <div className="flex items-start gap-2 text-xs text-amber-400">
                <span>⚠</span>
                <span>Limited historical data — projections may have higher uncertainty</span>
              </div>
            )}
            {system === 'cyclone' && data.riskLevel === 'CRITICAL' && (
              <div className="flex items-start gap-2 text-xs text-orange-400">
                <span>⚠</span>
                <span>Overlapping hazards detected — cascading risk amplified</span>
              </div>
            )}
          </div>
          
          {/* Data Lineage / Technical Details */}
          <details className="mt-4 group">
            <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-400 transition-colors">
              {t(locale, 'VIEW_TECHNICAL_DETAILS')}
            </summary>
            <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-2 text-xs text-slate-400">
              <div>
                <span className="text-slate-500">Disaster Data:</span>{' '}
                <span className="text-slate-300">Historical + Synthetic ({system})</span>
              </div>
              <div>
                <span className="text-slate-500">Disease Signals:</span>{' '}
                <span className="text-slate-300">
                  {['respiratory', 'diarrhea', 'cholera', 'hepatitis', 'leptospirosis'].includes(system)
                    ? system.charAt(0).toUpperCase() + system.slice(1)
                    : 'Multi-vector analysis'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Climate Inputs:</span>{' '}
                <span className="text-slate-300">Temperature, AQI, Regional patterns</span>
              </div>
              <div>
                <span className="text-slate-500">Location Context:</span>{' '}
                <span className="text-slate-300">
                  {location.mode === 'city' 
                    ? `${location.city}, ${location.state}`
                    : location.mode === 'global'
                    ? location.continent || 'Global'
                    : 'Custom coordinates'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Active Models:</span>{' '}
                <span className="text-slate-300">{data.activeModels}</span>
              </div>
            </div>
          </details>
        </div>

      {/* 1. SYSTEM DECISION (TOP - DOMINANT) - Visual Priority Upgrade */}
      <motion.div
        className="rounded-2xl p-8 border-2"
        style={{ 
          backgroundColor: '#000000',
          borderColor: `${actionColor}40` // Subtle border using action color
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h2 className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-4">
            {t(locale, 'SYSTEM_DECISION')}
          </h2>
          {/* Action Header - Enhanced with stronger weight and accent line */}
          <div className="relative pb-4 mb-4 border-b" style={{ borderColor: `${actionColor}30` }}>
            <h3 
              className="text-4xl font-semibold leading-tight mb-2"
              style={{ 
                color: actionColor,
                textShadow: `0 0 20px ${actionColor}20` // Subtle glow on action text only
              }}
            >
              {t(locale, 'ACTION_LABEL')}: {data.action}
            </h3>
            <p className="text-lg text-slate-300">
              {t(locale, 'RISK_STATE')}: {riskState}
            </p>
            {/* Thin accent line under action text */}
            <div 
              className="absolute bottom-0 left-0 h-0.5"
              style={{ 
                width: '100%',
                backgroundColor: actionColor,
                boxShadow: `0 0 8px ${actionColor}60`
              }}
            />
          </div>
          
          {/* Decision Confidence - Directly under decision text */}
          <p className="text-sm text-slate-400 mt-4">
            {t(locale, 'DECISION_CONFIDENCE')}: <span className="text-slate-300">{confidenceLevel}</span> ({confidenceValue})
          </p>
          {/* Confidence explanation microcopy - static, UI-only text */}
          <p className="mt-1 text-xs text-slate-500">
            {confidenceLevel === 'High' && 'High confidence due to consistent signals across multiple verified data sources.'}
            {confidenceLevel === 'Medium' && 'Medium confidence due to partial environmental variance or data sparsity.'}
            {confidenceLevel === 'Low' && 'Low confidence due to limited historical or environmental data.'}
          </p>
        </div>
        
        {/* Policy Justification Panel - static, non-AI text */}
        <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
          <h3 className="text-xs tracking-[0.2em] uppercase text-slate-300 mb-2">
            Policy Alignment &amp; Justification
          </h3>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>Decision follows proportional risk-response principles.</li>
            <li>Avoids unnecessary escalation where indicators remain below thresholds.</li>
            <li>Aligns with public-health and disaster-management best practices.</li>
            <li>Ensures economic and social stability are preserved.</li>
          </ul>
        </div>
        
        {/* Decision Trace Timeline - collapsible, UI-only */}
        <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-300 uppercase tracking-[0.16em]"
            onClick={() => setShowDecisionTrace(!showDecisionTrace)}
          >
            <span>Decision Trace Timeline</span>
            <span className="text-slate-500">{showDecisionTrace ? '−' : '+'}</span>
          </button>
          {showDecisionTrace && (
            <div className="px-4 pb-4 pt-1 text-xs text-slate-400 space-y-3">
              <div>
                <p className="font-semibold text-slate-300">Data Ingested</p>
                <ul className="ml-3 mt-1 space-y-0.5 list-disc">
                  <li>Environmental data: Verified</li>
                  <li>Health data: Verified</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-300">Risk Signal Evaluation</p>
                <p className="ml-3 mt-1">Current risk state: {riskState}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300">Confidence Assessment</p>
                <p className="ml-3 mt-1">
                  Confidence level: {confidenceLevel} ({confidenceValue})
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-300">Threshold Validation</p>
                <p className="ml-3 mt-1">Escalation thresholds evaluated against current signals.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300">Final System Decision</p>
                <p className="ml-3 mt-1">
                  {data.action} &mdash; Timestamp: Recent
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Divider Line */}
      <div 
        className="my-6"
        style={{
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      />

      {/* WHY THIS DECISION - Combined Primary and Secondary */}
      <div className="rounded-2xl border border-slate-700/50 p-6" style={{ backgroundColor: '#0a0a0a' }}>
        <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-slate-300 mb-4">
          {t(locale, 'WHY_THIS_DECISION')}
        </h3>
        <ul className="space-y-2">
          {data.primaryDrivers.map((driver, index) => (
            <li key={index} className="flex items-start gap-2 text-slate-200 text-sm">
              <span className="text-slate-400">•</span>
              <span>{driver}</span>
            </li>
          ))}
          {data.secondaryDrivers.map((driver, index) => (
            <li key={`secondary-${index}`} className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-slate-500">•</span>
              <span>{driver}</span>
            </li>
          ))}
        </ul>
        <a 
          href="#" 
          className="text-xs text-cyan-400 mt-4 inline-block hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          {t(locale, 'VIEW_TECHNICAL_DETAILS_LINK')}
        </a>
      </div>

      {/* REJECTED OPTIONS */}
      <div className="rounded-lg border border-slate-700/30 p-4" style={{ backgroundColor: '#0a0a0a' }}>
        <h3 className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">
          {t(locale, 'REJECTED_OPTIONS')}
        </h3>
        <ul className="space-y-1">
          {data.rejectedBecause.map((reason, index) => (
            <li key={index} className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-slate-500">•</span>
              <span>{data.alternativeAction} — {reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ACTIONS SECTION - Improved formatting */}
      <div className="rounded-lg border border-slate-700/30 p-4" style={{ backgroundColor: '#0a0a0a' }}>
        <h3 className="text-xs tracking-[0.2em] uppercase text-slate-400 mb-3">
          {actionsTitle}
        </h3>
        <ol className="space-y-2.5 list-none">
          {data.outcomes.map((outcome, index) => (
            <li key={index} className="text-sm text-slate-300 flex items-start gap-3">
              <span className="text-cyan-400 font-semibold min-w-[1.5rem]">{index + 1}.</span>
              <span className="flex-1 leading-relaxed">{outcome}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ESCALATION THRESHOLDS */}
      <div className="rounded-lg border border-slate-700/30 p-4" style={{ backgroundColor: '#0a0a0a' }}>
        <h3 className="text-xs tracking-[0.2em] uppercase text-slate-400 mb-3">
          {t(locale, 'RE_ESCALATION_TRIGGERS')}
        </h3>
        <ul className="space-y-1 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            <span>Flood risk ≥ 0.65</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            <span>ICU load ≥ 85%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            <span>Time-to-impact ≤ 6 hours</span>
          </li>
        </ul>
      </div>

      {/* Last Updated Timestamp */}
      <div className="relative" style={{ minHeight: '40px' }}>
        <p 
          className="absolute bottom-0 right-0 text-xs text-slate-500"
          style={{ opacity: 0.6 }}
        >
          {t(locale, 'LAST_EVALUATION')}: 18 seconds ago
        </p>
      </div>

      {/* CASCADE - Clean, Minimal Design (Typography + Spacing Only) */}
      <motion.div
        className="mt-8 rounded-xl p-6 cursor-pointer group transition-all duration-250"
        style={{ 
          backgroundColor: '#0a0a0a', // Same background as other cards
          border: '1px solid transparent', // Hairline border, transparent by default
          transition: 'border-color 250ms ease, box-shadow 250ms ease'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        onMouseEnter={(e) => {
          // Soft border glow on hover only
          e.currentTarget.style.borderColor = '#06b6d4'; // muted cyan
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(6, 182, 212, 0.3)';
        }}
        onMouseLeave={(e) => {
          // Remove glow completely on mouse leave
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={onCascadeClick}
      >
        {/* CASCADE Label - Typography emphasis only */}
        <h3 
          className="uppercase mb-2" 
          style={{ 
            fontSize: '26px', // +30% increase for visual importance
            fontWeight: 500, // Medium/Semibold (not bold)
            letterSpacing: '0.14em', // Slight, premium feel
            color: '#FF8C00' // Strong orange for critical-impact theme
          }}
        >
          {t(locale, 'CASCADE')}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {t(locale, 'CASCADE_SUBTITLE')}
        </p>
        
        {/* Content - Neutral styling */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
          <div>
            <p className="text-base font-medium text-slate-300 mb-1">
              {t(locale, 'CASCADE_PROJECTION_ENGINE')}
            </p>
            <p className="text-xs text-slate-500">
              {t(locale, 'CASCADE_HOVER_HINT')}
            </p>
          </div>
          <div 
            className="text-slate-400 text-sm transition-opacity duration-200 group-hover:opacity-100"
            style={{ opacity: 0.5 }}
          >
            →
          </div>
        </div>
      </motion.div>

      {/* Consequence Cascade - Conditional Rendering */}
      {consequences && (
        <ConsequenceCascade data={consequences} />
      )}
      
      {/* Ethical AI Guardrails - static, Responsible AI copy */}
      <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-xs tracking-[0.2em] uppercase text-slate-300 mb-3">
          Ethical AI Guardrails
        </h3>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>Advisory system only — no autonomous enforcement.</li>
          <li>Human oversight required for all decisions.</li>
          <li>Designed to support, not replace, public authorities.</li>
          <li>No personal data processing.</li>
        </ul>
      </div>
      </div>
    </div>
  );
}
