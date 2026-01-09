import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ConsequenceProjection } from '../services/api';

interface ConsequenceMirrorProps {
  consequences: ConsequenceProjection;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function ConsequenceMirror({ consequences, collapsed = false, onToggle }: ConsequenceMirrorProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  const horizons = [
    { key: 'day_0' as const, label: 'Day 0 — Immediate', data: consequences.day_0 },
    { key: 'day_10' as const, label: 'Day 10 — Secondary', data: consequences.day_10 },
    { key: 'day_30' as const, label: 'Day 30 — Long-term', data: consequences.day_30 },
  ];

  return (
    <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
        type="button"
      >
        <div>
          <h4 className="text-sm font-semibold text-cyan-400">Consequence Mirror — Butterfly Effect Engine</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Downstream consequence projections based on verified research data
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 space-y-4"
        >
          {/* Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/50">
            <p className="text-xs text-amber-300">
              <strong>Note:</strong> Consequence projections are modeled downstream effects based on verified research data and current system state. Actual outcomes may vary with live conditions.
            </p>
          </div>

          {/* Timeline Horizons */}
          <div className="space-y-4">
            {horizons.map((horizon, index) => (
              <motion.div
                key={horizon.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30"
              >
                {/* Horizon Header */}
                <h5 className="text-sm font-semibold text-slate-200 mb-3">{horizon.label}</h5>

                {/* Phase Name */}
                <div className="mb-3">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Phase:</span>
                  <span className="ml-2 text-sm text-slate-300">{horizon.data.phase}</span>
                </div>

                {/* Impacts */}
                {horizon.data.impacts && horizon.data.impacts.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Impacts</p>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {horizon.data.impacts.map((impact, idx) => (
                        <li key={idx} className="text-sm text-slate-300 leading-relaxed">
                          {impact}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Infrastructure Domains */}
                {horizon.data.infrastructure_domains && Object.keys(horizon.data.infrastructure_domains).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Infrastructure Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(horizon.data.infrastructure_domains).map(([domain, status]) => (
                        <div key={domain} className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 capitalize">{domain}:</span>
                          <span
                            className={`font-medium ${
                              status === 'Operational' || status === 'Minimal Impact'
                                ? 'text-green-400'
                                : status === 'Critical' || status === 'Severe Impact' || status?.includes('Breach')
                                ? 'text-red-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

