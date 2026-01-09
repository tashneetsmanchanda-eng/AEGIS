import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { SystemType, LocationData } from '../App';

interface CascadeViewProps {
  system: SystemType;
  location: LocationData;
  onClose: () => void;
}

const CASCADE_DATA = {
  flood: {
    title: 'Flood Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Critical infrastructure degradation: Road networks and bridge structures compromised',
          'Population displacement: Estimated 45,000–68,000 individuals requiring relocation',
          'Public health infrastructure: Municipal water supply contamination risk elevated'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Supply chain failure: Essential goods distribution systems disrupted',
          'Disease vector expansion: Waterborne pathogen transmission rates increased by 240%',
          'Economic productivity loss: Estimated ₹120–180 Cr daily economic output reduction'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Housing sector crisis: Permanent displacement requiring long-term accommodation solutions',
          'Agricultural sector collapse: Crop yield reductions estimated at 60%',
          'Social cohesion impact: Resource allocation conflicts and population migration patterns'
        ]
      }
    ]
  },
  cyclone: {
    title: 'Cyclone Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Structural integrity failure: Over 12,000 buildings assessed as high-risk',
          'Critical infrastructure collapse: Power distribution network failure affecting 2.5M residents',
          'Human casualty projection: Estimated 340–580 fatalities under current trajectory'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Emergency response capacity: Communication infrastructure degradation delays response protocols',
          'Healthcare system saturation: Trauma patient surge exceeds current treatment capacity',
          'Economic asset destruction: Property damage estimates exceed ₹1,200 Cr'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Reconstruction timeline: Estimated 18–24 month recovery period for critical infrastructure',
          'Insurance sector instability: Premium rate adjustments and coverage limitation implications',
          'Demographic shifts: Permanent population relocation patterns emerge'
        ]
      }
    ]
  },
  tsunami: {
    title: 'Tsunami Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Coastal zone inundation: Projected 5–8 km inland penetration depth',
          'Human casualty assessment: Estimated 2,000–5,000 fatalities in high-risk zones',
          'Port infrastructure destruction: International trade operations suspended'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Maritime economy collapse: Fishing industry operational capacity eliminated',
          'Agricultural land degradation: Soil salinization renders farmland unproductive',
          'Tourism sector economic impact: Estimated ₹800+ Cr annual revenue loss'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Marine ecosystem disruption: Biodiversity loss and habitat destruction',
          'Cultural heritage destruction: Coastal archaeological and historical sites compromised',
          'Public health psychological impact: Long-term trauma and mental health service demand'
        ]
      }
    ]
  },
  respiratory: {
    title: 'Respiratory Disease Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Hospital capacity saturation: Patient admissions increase by 35% exceeding baseline capacity',
          'Vulnerable population exposure: 2.3M individuals in high-risk demographic categories',
          'Economic productivity reduction: Estimated ₹85–120 Cr economic output impact'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Healthcare workforce capacity: Provider burnout and system resilience degradation',
          'Chronic disease progression: Long-term health burden from condition exacerbation',
          'Education system disruption: School closure protocols implemented'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Policy framework evolution: Emission control regulations and air quality standards',
          'Real estate market adjustment: Property valuation correlated with air quality metrics',
          'Health equity impact: Socioeconomic disparities in health outcomes amplified'
        ]
      }
    ]
  },
  diarrhea: {
    title: 'Diarrheal Disease Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Disease incidence elevation: Case rates 22% above baseline epidemiological thresholds',
          'Pediatric mortality risk: Children under 5 years represent highest vulnerability cohort',
          'Water treatment infrastructure: Treatment capacity stress and contamination risk'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Malnutrition prevalence: Growth stunting and nutritional deficiency indicators increase',
          'Healthcare expenditure: Treatment cost estimates range ₹28–40 Cr',
          'Educational attainment impact: School absenteeism rates correlate with academic performance decline'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Child development outcomes: Cognitive development delays and developmental milestone impacts',
          'Human capital formation: Future workforce productivity and economic participation reduction',
          'Infrastructure investment requirements: Sanitation system modernization and capacity expansion needs'
        ]
      }
    ]
  },
  cholera: {
    title: 'Cholera Outbreak Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Outbreak progression: 180–340 confirmed cases identified in geographic cluster zones',
          'Mobility restriction protocols: Quarantine measures and movement limitation implementation',
          'Water supply infrastructure: Contamination events require supply system shutdown procedures'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Economic activity suspension: Response cost estimates range ₹65–95 Cr',
          'Population movement patterns: Displacement and migration events from outbreak zones',
          'Healthcare resource allocation: System capacity overwhelmed by treatment demand'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Endemic disease establishment: Recurring outbreak patterns and epidemiological persistence risk',
          'Public confidence impact: Government response effectiveness and public trust implications',
          'International relations: Travel advisory impacts and trade relationship considerations'
        ]
      }
    ]
  },
  hepatitis: {
    title: 'Hepatitis Risk Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Case incidence elevation: Disease rates 12% above baseline surveillance thresholds',
          'Blood safety protocols: Screening procedures intensified and supply chain monitoring enhanced',
          'Food service regulation: Safety inspection frequency and compliance verification increased'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Chronic disease management: Long-term liver disease care requirements and resource allocation',
          'Healthcare system costs: Treatment expenditure estimates range ₹35–50 Cr',
          'Public health intervention: Vaccination campaign implementation and population coverage targets'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Organ transplantation demand: Liver transplant waitlist expansion and organ shortage implications',
          'Regulatory framework evolution: Food industry safety standards and compliance requirements',
          'Insurance sector adjustment: Health insurance premium rate modifications and coverage policy changes'
        ]
      }
    ]
  },
  leptospirosis: {
    title: 'Leptospirosis Outbreak Consequence Projection',
    consequences: [
      {
        order: 'Immediate (0–7 days)',
        impacts: [
          'Occupational exposure risk: Infection rates increase 28% in high-risk occupational categories',
          'Environmental correlation: Heavy rainfall events and flooding correlate with exposure incidents',
          'Vector population dynamics: Rodent population density increases create favorable transmission conditions'
        ]
      },
      {
        order: 'Medium (2–6 weeks)',
        impacts: [
          'Occupational safety protocols: Worker protection measures and safety standard enforcement requirements',
          'Economic productivity impact: Estimated ₹45–70 Cr productivity loss from workforce absence',
          'Urban infrastructure stress: Waste management systems and sanitation infrastructure capacity challenges'
        ]
      },
      {
        order: 'Long-term (6+ months)',
        impacts: [
          'Vector management policy: Integrated pest management strategies and population control programs',
          'Climate adaptation planning: Rainfall pattern analysis and infrastructure resilience requirements',
          'One Health framework: Zoonotic disease surveillance and interdisciplinary coordination protocols'
        ]
      }
    ]
  }
};

export function CascadeView({ system, location, onClose }: CascadeViewProps) {
  const [phase, setPhase] = useState<'entering' | 'display'>('entering');
  const data = CASCADE_DATA[system];

  useEffect(() => {
    // Entering phase with butterflies - slow, controlled motion
    const enterTimer = setTimeout(() => {
      setPhase('display');
    }, 2000);

    return () => {
      clearTimeout(enterTimer);
    };
  }, []);

  // Generate butterflies - fewer, slower, more visible
  const butterflies = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.3,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 30 + Math.random() * 20,
    duration: 4 + Math.random() * 3
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop - Dark panel with subtle glow edges */}
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: '#000000' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Butterflies - Entering Phase */}
      {phase === 'entering' && (
        <div className="absolute inset-0 overflow-hidden">
          {butterflies.map(butterfly => (
            <motion.div
              key={butterfly.id}
              className="absolute"
              initial={{ 
                x: `${butterfly.x}vw`, 
                y: '-10vh',
                opacity: 0 
              }}
              animate={{ 
                x: [`${butterfly.x}vw`, `${butterfly.x + (Math.random() - 0.5) * 20}vw`],
                y: [`-10vh`, `${butterfly.y}vh`, `${butterfly.y + 20}vh`],
                opacity: [0, 1, 1, 0],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: butterfly.duration,
                delay: butterfly.delay,
                ease: 'easeInOut'
              }}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(167, 139, 250, 0.6))'
              }}
            >
              <svg
                width={butterfly.size}
                height={butterfly.size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4C10 4 8 6 8 8C8 8 6 8 4 10C2 12 2 14 4 16C6 18 8 18 8 18C8 20 10 22 12 22C14 22 16 20 16 18C16 18 18 18 20 16C22 14 22 12 20 10C18 8 16 8 16 8C16 6 14 4 12 4Z"
                  fill="url(#gradient)"
                  opacity="0.8"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          ))}
        </div>
      )}

      {/* Content - Display Phase */}
      {phase === 'display' && (
        <motion.div
          className="relative max-w-5xl w-full mx-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full p-3 transition-colors"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6 text-slate-300" />
          </motion.button>

          <div className="backdrop-blur-md border border-indigo-500/30 rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: '#0a0a0a' }}>
            <motion.h2
              className="text-3xl font-bold text-center mb-8 text-indigo-300"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Consequence Projection Engine
            </motion.h2>

            <motion.h3
              className="text-xl text-center text-slate-300 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {data.title}
            </motion.h3>

            <p className="text-center text-sm text-slate-400 mb-8">
              Location: {location.city || location.continent || 'Custom Region'}
            </p>

            <div className="grid grid-cols-3 gap-6">
              {data.consequences.map((consequence, index) => (
                <motion.div
                  key={consequence.order}
                  className="border border-slate-700/50 rounded-2xl p-6"
                  style={{ backgroundColor: '#000000' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.15 }}
                >
                  <h4 className="text-sm tracking-[0.2em] uppercase text-indigo-400 mb-4">
                    {consequence.order}
                  </h4>
                  <ul className="space-y-3">
                    {consequence.impacts.map((impact, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-300 leading-relaxed flex items-start gap-2"
                      >
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>{impact}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}