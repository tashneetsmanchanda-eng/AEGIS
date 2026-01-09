import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'insight' | 'validation' | 'not-chatbot' | 'limitations';

export function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('insight');
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'insight', label: 'INSIGHT' },
    { id: 'validation', label: 'Early Validation & Pilot Signals' },
    { id: 'not-chatbot', label: 'Why AEGIS Is Not a Chatbot' },
    { id: 'limitations', label: 'Limitations & Ethical Boundaries' },
  ];

  return (
    <>
      {/* Info Button - Fixed Bottom Left */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-40 cursor-pointer"
        style={{
          bottom: '24px',
          left: '24px',
          padding: '10px 20px',
          backgroundColor: '#0a0f14',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '13px',
          fontWeight: 400,
          letterSpacing: '0.05em',
          transition: 'all 0.2s ease',
          boxShadow: isOpen 
            ? '0 0 12px rgba(6, 182, 212, 0.4)' 
            : '0 0 6px rgba(6, 182, 212, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.boxShadow = '0 0 12px rgba(6, 182, 212, 0.4)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.boxShadow = '0 0 6px rgba(6, 182, 212, 0.2)';
          }
        }}
      >
        Info
      </button>

      {/* Info Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-50"
            style={{
              bottom: '80px',
              left: '24px',
              width: '450px',
              maxHeight: '68vh',
              backgroundColor: '#0a0f14',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#e2e8f0',
                    marginBottom: '4px',
                    letterSpacing: '0.02em',
                  }}
                >
                  AEGIS — System Information
                </h2>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    letterSpacing: '0.05em',
                  }}
                >
                  Context, validation, and safety boundaries
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: activeTab === tab.id ? '#e2e8f0' : '#64748b',
                    fontSize: '12px',
                    fontWeight: activeTab === tab.id ? 500 : 400,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: activeTab === tab.id 
                      ? 'rgba(6, 182, 212, 0.1)' 
                      : 'transparent',
                    borderLeft: activeTab === tab.id 
                      ? '2px solid rgba(6, 182, 212, 0.5)' 
                      : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'insight' && (
                    <div>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#e2e8f0',
                          marginBottom: '16px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        What triggered AEGIS
                      </h3>
                      <div
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.7',
                          color: '#cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                        }}
                      >
                        <p>
                          During urban floods, heatwaves, and public emergencies, we observed that panic was rarely caused by lack of alerts. It was caused by uncertainty about what action to take next.
                        </p>
                        <p>
                          Civilians searched Google, called overloaded emergency helplines, or relied on guesswork — especially those with health conditions or mobility constraints.
                        </p>
                        <p>
                          Existing systems delivered information (warnings, maps, advisories), but not context-aware guidance. No system helped people reason through their specific situation in real time.
                        </p>
                        <p
                          style={{
                            color: '#e2e8f0',
                            fontWeight: 400,
                          }}
                        >
                          AEGIS was built to close this gap — not by issuing commands, but by reducing decision confusion under stress.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'validation' && (
                    <div>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#e2e8f0',
                          marginBottom: '20px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Responder-Led Walkthrough
                      </h3>
                      <div
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.7',
                          color: '#cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '8px',
                            }}
                          >
                            Who participated
                          </h4>
                          <p style={{ marginLeft: '12px' }}>
                            Civil defense volunteer
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Emergency response trainee
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Healthcare trainee (non-clinical role)
                          </p>
                        </div>

                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '8px',
                            }}
                          >
                            What was demonstrated
                          </h4>
                          <p style={{ marginLeft: '12px' }}>
                            Real disaster prompts (flood + health constraint scenarios)
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Escalation behavior under uncertainty
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Refusal cases (when data was insufficient)
                          </p>
                        </div>

                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '8px',
                            }}
                          >
                            Feedback received
                          </h4>
                          <p style={{ marginLeft: '12px', fontStyle: 'italic' }}>
                            "This is clearer than alerts because it tells you what to do next, not just what's happening."
                          </p>
                          <p style={{ marginLeft: '12px', fontStyle: 'italic' }}>
                            "I like that it escalates instead of guessing when the situation is risky."
                          </p>
                        </div>

                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '8px',
                            }}
                          >
                            What changed because of this feedback
                          </h4>
                          <p style={{ marginLeft: '12px' }}>
                            Reduced verbosity under high-stress scenarios
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Stronger escalation language when confidence is low
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Clearer separation between advice and emergency instructions
                          </p>
                        </div>

                        <p
                          style={{
                            fontSize: '11px',
                            color: '#64748b',
                            marginTop: '8px',
                            lineHeight: '1.6',
                          }}
                        >
                          This feedback directly influenced response clarity and escalation logic.
                          <br />
                          (All validation was conducted using live system outputs. No scripted responses were used.)
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'not-chatbot' && (
                    <div>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#e2e8f0',
                          marginBottom: '16px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Why AEGIS Is Not a Chatbot
                      </h3>
                      <div
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.7',
                          color: '#cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                        }}
                      >
                        <p>
                          AEGIS does not operate as a free-form conversational AI.
                        </p>

                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '12px',
                            }}
                          >
                            Key differences
                          </h4>
                          <p style={{ marginLeft: '12px' }}>
                            Risk classification occurs before any language generation
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            The LLM is not always invoked
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Silence or refusal is a valid and intentional output
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Deterministic escalation rules override generation
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Responses are constrained by safety and confidence thresholds
                          </p>
                        </div>

                        <div
                          style={{
                            padding: '16px',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(6, 182, 212, 0.05)',
                            marginTop: '8px',
                            marginBottom: '8px',
                          }}
                        >
                          <p
                            style={{
                              fontSize: '13px',
                              lineHeight: '1.7',
                              color: '#e2e8f0',
                              margin: 0,
                            }}
                          >
                            AEGIS prioritizes safety over helpfulness.
                            <br />
                            If sufficient confidence or context is unavailable, the system refuses to answer.
                          </p>
                        </div>

                        <p>
                          This design ensures AEGIS behaves conservatively in high-risk situations rather than attempting to be conversational or persuasive.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'limitations' && (
                    <div>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#e2e8f0',
                          marginBottom: '16px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Limitations & Ethical Boundaries
                      </h3>
                      <div
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.7',
                          color: '#cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                        }}
                      >
                        <p>
                          AEGIS is intentionally limited.
                        </p>

                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '8px',
                            }}
                          >
                            AEGIS should NOT be used when
                          </h4>
                          <p style={{ marginLeft: '12px' }}>
                            Immediate professional medical care is required
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Official evacuation or law-enforcement instructions are active
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Disaster data is outdated or unavailable
                          </p>
                        </div>

                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '8px',
                            }}
                          >
                            Who it could potentially harm
                          </h4>
                          <p style={{ marginLeft: '12px' }}>
                            Users who over-rely on AI guidance instead of seeking human help
                          </p>
                        </div>

                        <div>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#e2e8f0',
                              marginBottom: '8px',
                            }}
                          >
                            Decisions it must NEVER automate
                          </h4>
                          <p style={{ marginLeft: '12px' }}>
                            Medical diagnosis or treatment
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Evacuation orders
                          </p>
                          <p style={{ marginLeft: '12px' }}>
                            Emergency command decisions
                          </p>
                        </div>

                        <div
                          style={{
                            padding: '16px',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(6, 182, 212, 0.05)',
                            marginTop: '8px',
                            marginBottom: '8px',
                          }}
                        >
                          <p
                            style={{
                              fontSize: '13px',
                              lineHeight: '1.7',
                              color: '#e2e8f0',
                              margin: 0,
                            }}
                          >
                            AEGIS is designed to support human judgment, not replace it.
                          </p>
                        </div>

                        <p
                          style={{
                            fontSize: '11px',
                            color: '#64748b',
                            marginTop: '8px',
                            lineHeight: '1.6',
                          }}
                        >
                          Safeguards include conservative responses, refusal under uncertainty, and explicit escalation to emergency services when appropriate.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
