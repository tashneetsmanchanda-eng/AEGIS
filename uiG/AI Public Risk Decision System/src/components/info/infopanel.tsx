import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

type Tab = 'insight' | 'validation' | 'system' | 'limitations';

export function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('insight');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'insight', label: 'INSIGHT' },
    { id: 'validation', label: 'VALIDATION' },
    { id: 'system', label: 'SYSTEM' },
    { id: 'limitations', label: 'LIMITS' },
  ];

  return (
    <>
      {/* 1️⃣ INFO BUTTON (Fixed Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="px-6 py-2 rounded-full bg-slate-900 border border-cyan-500/30 text-slate-300 text-sm font-medium transition-all hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Info
        </motion.button>

        {/* 2️⃣ INFO PANEL (Popup Container) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }} // ~200ms Flick
              className="absolute bottom-16 left-0 w-[460px] max-h-[70vh] flex flex-col bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden origin-bottom-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-950">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 tracking-wide">AEGIS — System Information</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Context, validation, and safety boundaries</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 3️⃣ PANEL NAVIGATION (Top Tabs) */}
              <div className="flex border-b border-slate-800/50 bg-slate-900/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 text-[10px] font-bold tracking-widest transition-colors relative ${
                      activeTab === tab.id 
                        ? 'text-cyan-400 bg-slate-900/50' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-500/50" 
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* 4️⃣ CONTENT AREA */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* SECTION 1 — INSIGHT */}
                {activeTab === 'insight' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-medium text-slate-100 mb-4">What triggered AEGIS</h3>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-400">
                      <p>
                        During urban floods, heatwaves, and public emergencies, we observed that panic was rarely caused by lack of alerts. It was caused by uncertainty about what action to take next.
                      </p>
                      <p>
                        Civilians searched Google, called overloaded emergency helplines, or relied on guesswork — especially those with health conditions or mobility constraints.
                      </p>
                      <p>
                        Existing systems delivered information (warnings, maps, advisories), but not context-aware guidance. No system helped people reason through their specific situation in real time.
                      </p>
                      <p className="text-slate-200 font-medium border-l-2 border-slate-700 pl-3">
                        AEGIS was built to close this gap — not by issuing commands, but by reducing decision confusion under stress.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* SECTION 2 — VALIDATION */}
                {activeTab === 'validation' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-medium text-slate-100 mb-2">Responder-Led Walkthrough</h3>
                    
                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Who participated</h4>
                      <ul className="text-sm text-slate-300 space-y-1 ml-1">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-cyan-500 rounded-full"/> Civil defense volunteer</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-cyan-500 rounded-full"/> Emergency response trainee</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-cyan-500 rounded-full"/> Healthcare trainee (non-clinical role)</li>
                      </ul>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What was demonstrated</h4>
                      <p className="text-sm text-slate-400 mb-1">Real disaster prompts (flood + health constraint scenarios)</p>
                      <p className="text-sm text-slate-400 mb-1">Escalation behavior under uncertainty</p>
                      <p className="text-sm text-slate-400">Refusal cases (when data was insufficient)</p>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Feedback received</h4>
                      <blockquote className="text-sm italic text-slate-400 border-l-2 border-slate-700 pl-3 mb-2">
                        “This is clearer than alerts because it tells you what to do next, not just what’s happening.”
                      </blockquote>
                      <blockquote className="text-sm italic text-slate-400 border-l-2 border-slate-700 pl-3">
                        “I like that it escalates instead of guessing when the situation is risky.”
                      </blockquote>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What changed</h4>
                      <p className="text-sm text-slate-400 mb-1">Reduced verbosity under high-stress scenarios</p>
                      <p className="text-sm text-slate-400 mb-1">Stronger escalation language when confidence is low</p>
                      <p className="text-sm text-slate-400">Clearer separation between advice and emergency instructions</p>
                    </div>

                    <p className="mt-8 text-[11px] text-slate-600 leading-tight">
                      This feedback directly influenced response clarity and escalation logic.
                      (All validation was conducted using live system outputs. No scripted responses were used.)
                    </p>
                  </motion.div>
                )}

                {/* SECTION 3 — SYSTEM (Not a Chatbot) */}
                {activeTab === 'system' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-medium text-slate-100 mb-4">Why AEGIS Is Not a Chatbot</h3>
                    <p className="text-sm text-slate-400 mb-6">
                      AEGIS does not operate as a free-form conversational AI.
                    </p>

                    <div className="space-y-3 mb-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key differences</h4>
                      <div className="grid gap-2">
                        {[
                          "Risk classification occurs before any language generation",
                          "The LLM is not always invoked",
                          "Silence or refusal is a valid and intentional output",
                          "Deterministic escalation rules override generation",
                          "Responses are constrained by safety and confidence thresholds"
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="text-slate-600 font-mono">0{i+1}</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* REQUIRED STATEMENT CALLOUT */}
                    <div className="border border-orange-500/20 bg-orange-500/5 rounded-lg p-4 my-6">
                      <p className="text-sm font-medium text-orange-200/90 mb-1">
                        AEGIS prioritizes safety over helpfulness.
                      </p>
                      <p className="text-xs text-orange-200/60">
                        If sufficient confidence or context is unavailable, the system refuses to answer.
                      </p>
                    </div>

                    <p className="text-sm text-slate-500">
                      This design ensures AEGIS behaves conservatively in high-risk situations rather than attempting to be conversational or persuasive.
                    </p>
                  </motion.div>
                )}

                {/* SECTION 4 — LIMITATIONS */}
                {activeTab === 'limitations' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-medium text-slate-100 mb-4">Limitations & Ethical Boundaries</h3>
                    <p className="text-sm text-slate-400 mb-6">AEGIS is intentionally limited.</p>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-red-400/80 uppercase tracking-wider mb-2">AEGIS should NOT be used when</h4>
                        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside marker:text-slate-600">
                          <li>Immediate professional medical care is required</li>
                          <li>Official evacuation or law-enforcement instructions are active</li>
                          <li>Disaster data is outdated or unavailable</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Who it could potentially harm</h4>
                        <p className="text-sm text-slate-400">Users who over-rely on AI guidance instead of seeking human help</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Decisions it must NEVER automate</h4>
                        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside marker:text-slate-600">
                          <li>Medical diagnosis or treatment</li>
                          <li>Evacuation orders</li>
                          <li>Emergency command decisions</li>
                        </ul>
                      </div>
                    </div>

                    {/* REQUIRED LINE CALLOUT */}
                    <div className="mt-8 pt-4 border-t border-slate-800">
                      <p className="text-sm font-medium text-slate-200 text-center">
                        “AEGIS is designed to support human judgment, not replace it.”
                      </p>
                    </div>

                    <p className="mt-4 text-[10px] text-slate-600 text-center">
                      Safeguards include conservative responses, refusal under uncertainty, and explicit escalation to emergency services when appropriate.
                    </p>
                  </motion.div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}