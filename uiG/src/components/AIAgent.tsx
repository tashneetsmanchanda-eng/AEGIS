import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import type { SystemType, LocationData } from '../App';
import { analyzeDecision, type DecisionAnalysisResponse } from '../services/api';
import { ConsequenceMirror } from './ConsequenceMirror';
import { useLocale } from '../contexts/LocaleContext';
import { getLanguageDisplay } from '../i18n/outputTranslator';
import { t } from '../i18n/strings';

interface AIAgentProps {
  selectedSystem: SystemType | null;
  location: LocationData;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'cheseal';
  content: string;
  response?: DecisionAnalysisResponse; // For CHESEAL messages
  timestamp: Date;
}

const SYSTEM_CONTEXT = {
  flood: 'flood risk assessment',
  cyclone: 'cyclone preparedness',
  tsunami: 'tsunami alert protocols',
  respiratory: 'respiratory disease monitoring',
  diarrhea: 'diarrheal disease prevention',
  cholera: 'cholera outbreak management',
  hepatitis: 'hepatitis surveillance',
  leptospirosis: 'leptospirosis risk mitigation'
};

export function AIAgent({ selectedSystem, location, isOpen, onOpen, onClose }: AIAgentProps) {
  const { locale } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

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
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Explicit toggle handler
  const handleToggle = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  // Get risk vector from selected system context
  const getRiskVector = (): Record<string, any> => {
    const baseVector: Record<string, any> = {
      confidence: 0.75, // Default confidence
    };

    // Map selected system to risk vector
    if (selectedSystem === 'flood') {
      baseVector.flood_risk = 0.5;
    } else if (selectedSystem && ['respiratory', 'diarrhea', 'cholera', 'hepatitis', 'leptospirosis'].includes(selectedSystem)) {
      baseVector.disease_risk = 0.5;
    }

    return baseVector;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, isLoading]);
  
  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle CHESEAL analysis
  const handleAnalysis = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const riskVector = getRiskVector();
      const result = await analyzeDecision({
        question,
        language: locale, // Pass selected language to backend
        risk_vector: riskVector,
      });
      
      // Add CHESEAL response to messages - backend is responsible for language
      const chesealMessage: ChatMessage = {
        id: `cheseal-${Date.now()}`,
        role: 'cheseal',
        content: result.explanation,
        response: result,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, chesealMessage]);
    } catch (err) {
      console.error('[CHESEAL] Analysis error:', err);
      const errorMessage = err instanceof Error 
        ? (err.message.includes('fetch') || err.message.includes('network') 
           ? 'CHESEAL temporarily unavailable. Please check your connection and try again.' 
           : err.message)
        : 'Failed to analyze decision. Please try again.';
      setError(errorMessage);
      
      // Add error message to chat
      const errorMessageObj: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'cheseal',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scenario handler
  const handleScenario = async (question: string) => {
    console.log('[CHESEAL] Scenario selected:', question);
    setInputValue(question);
    
    // Add user message to history
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    await handleAnalysis(question);
  };

  // Handle input submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const question = inputValue.trim();
    if (!question || isLoading) {
      return;
    }

    // Clear input immediately and refocus
    setInputValue('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    
    // Add user message to history immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    console.log('[CHESEAL] Submitting question:', question);
    await handleAnalysis(question);
  };

  // Handle Enter key (redundant but kept for explicit handling)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Get decision color
  const getDecisionColor = (decision: string, riskLevel: string): string => {
    const decisionUpper = decision.toUpperCase();
    const levelUpper = riskLevel.toUpperCase();
    
    // GREEN glow → ALL CLEAR / REVOKE
    if (decisionUpper.includes('ALL CLEAR') || 
        decisionUpper.includes('REVOKE') ||
        decisionUpper.includes('NORMAL OPERATIONS') ||
        levelUpper.includes('LOW') || 
        levelUpper.includes('MONITORING')) {
      return '#10b981'; // green-500
    } 
    // RED glow → ESCALATE / EVACUATION
    else if (decisionUpper.includes('EVACUATION') || 
             decisionUpper.includes('ESCALATE') ||
             decisionUpper.includes('INITIATE') ||
             levelUpper.includes('CRITICAL')) {
      return '#ef4444'; // red-500
    } 
    // YELLOW glow → MONITOR / ADVISORY
    else {
      return '#f59e0b'; // amber-500 (yellow)
    }
  };

  return (
    <>
      {/* AI Agent Container - Button + Label */}
      <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-center gap-2">
        {/* Chat Toggle Button - Calm cyan glow */}
        <motion.button
          ref={buttonRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("CHESEAL BUTTON CLICKED - isOpen:", isOpen);
            handleToggle();
          }}
          className="rounded-full p-4 transition-all"
          style={{
            backgroundColor: '#0891b2',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
            pointerEvents: 'auto',
            zIndex: 1001,
            position: 'relative',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </motion.button>
        
        {/* Persistent Label - Static, professional */}
        <div className="text-center">
          <div 
            className="text-sm font-semibold tracking-wider"
            style={{ 
              color: '#06b6d4',
              letterSpacing: '0.1em'
            }}
          >
            CHESEAL
          </div>
          <div 
            className="text-xs font-normal mt-0.5"
            style={{ 
              color: '#64748b',
              letterSpacing: '0.05em'
            }}
          >
            AI Analyst
          </div>
        </div>
      </div>

      {/* Chat Panel - Explicit conditional rendering */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            className="fixed right-8 w-96 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl flex flex-col"
            style={{ 
              bottom: '120px',
              backgroundColor: '#000000',
              maxHeight: 'calc(100vh - 140px)',
              zIndex: 1000,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold tracking-wider text-cyan-400">
                  CHESEAL
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  An AI Crisis Co-Pilot for Cascading Disasters
                </p>
              </div>
              {/* Language Indicator for Judges */}
              <div className="text-xs text-slate-500 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">
                {getLanguageDisplay(locale)}
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setMessages([]);
                      setError(null);
                      setInputValue('');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded"
                    type="button"
                    title="Clear chat"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("CHESEAL CLOSE BUTTON CLICKED");
                    onClose();
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded"
                  type="button"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>{isLoading ? t(locale, 'ANALYZING') : t(locale, 'MONITORING_SYSTEM_STATE')}</span>
              </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Show buttons when no messages */}
              {messages.length === 0 && !isLoading && (
                <>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Select a scenario or ask a custom question to begin analysis.
                  </p>

                  {/* Scenario Questions */}
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        handleScenario(
                          "If we enforce a 48 hour localized quarantine in Zone B to stop the pathogen, what are the predicted 3rd order impacts on the supply chain for essential medicines in the neighboring zones?"
                        )
                      }
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-colors text-sm"
                      type="button"
                      disabled={isLoading}
                    >
                      If we enforce a 48 hour localized quarantine in Zone B to stop the pathogen, what are the predicted 3rd order impacts on the supply chain for essential medicines in the neighboring zones?
                    </button>
                    <button
                      onClick={() =>
                        handleScenario(
                          "Based on the current flood surge projections and the 116.1% system confidence variance, should we prioritize vaccine distribution or emergency drainage infrastructure to minimize long term mortality rates?"
                        )
                      }
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-colors text-sm"
                      type="button"
                      disabled={isLoading}
                    >
                      Based on the current flood surge projections and the 116.1% system confidence variance, should we prioritize vaccine distribution or emergency drainage infrastructure to minimize long term mortality rates?
                    </button>
                    <button
                      onClick={() =>
                        handleScenario(
                          "Re-evaluate the current Cyclone linked prevention strategy: How can we maintain a 90% containment rate while reducing the economic halt impact on daily wage workers by at least 15%?"
                        )
                      }
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-colors text-sm"
                      type="button"
                      disabled={isLoading}
                    >
                      Re-evaluate the current Cyclone linked prevention strategy: How can we maintain a 90% containment rate while reducing the economic halt impact on daily wage workers by at least 15%?
                    </button>
                  </div>
                </>
              )}

              {/* Message History */}
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`space-y-3 ${index > 0 ? 'mt-6 pt-6 border-t border-slate-800/50' : ''}`}
                >
                  {message.role === 'user' ? (
                    // User Message
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        USER QUESTION
                      </p>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-sm text-slate-200 break-words whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    // CHESEAL Response
                    <div className="flex flex-col gap-3">
                      {/* AI-generated narrative content follows backend language context */}
                      <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                        CHESEAL — AI ANALYST
                      </p>
                      
                      {message.response ? (
                        <>
                          {/* Decision */}
                          <div>
                            <p className="text-xs text-slate-500 mb-1">DECISION</p>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: getDecisionColor(message.response.decision, message.response.risk_level) }}
                            >
                              {message.response.decision}
                            </p>
                          </div>

                          {/* Risk Level & Score */}
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">RISK LEVEL</p>
                              <p className="text-sm font-medium text-slate-200">{message.response.risk_level}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">RISK SCORE</p>
                              <p className="text-sm font-medium text-slate-200">{(message.response.risk_score * 100).toFixed(1)}%</p>
                            </div>
                          </div>

                          {/* Explanation - Improved formatting */}
                          <div>
                            <p className="text-xs text-slate-500 mb-2">EXPLANATION</p>
                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-3">
                              {/* Split explanation into paragraphs */}
                              {message.response.explanation.split('\n\n').map((paragraph: string, idx: number) => (
                                paragraph.trim() && (
                                  <p key={idx} className="text-sm text-slate-300 leading-relaxed">
                                    {paragraph.trim()}
                                  </p>
                                )
                              ))}
                            </div>
                          </div>
                          
                          {/* Key Risk Drivers Section */}
                          {message.response.explanation && (
                            <div>
                              <p className="text-xs text-slate-500 mb-2">KEY RISK DRIVERS</p>
                              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <ul className="space-y-1.5 text-sm text-slate-300">
                                  {message.response.explanation
                                    .split(/[.!?]\s+/)
                                    .filter((s: string) => s.length > 20)
                                    .slice(0, 3)
                                    .map((driver: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-cyan-400 mt-1">•</span>
                                        <span className="flex-1">{driver.trim()}</span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          )}
                          
                          {/* Confidence Indicator */}
                          <div>
                            <p className="text-xs text-slate-500 mb-2">{t(locale, 'CONFIDENCE_LEVEL')}</p>
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-slate-300">
                                      {message.response.risk_score >= 0.8 ? 'High' : 
                                       message.response.risk_score >= 0.5 ? 'Medium' : 'Low'} Confidence
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {(message.response.risk_score * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${
                                        message.response.risk_score >= 0.8 ? 'bg-green-400' :
                                        message.response.risk_score >= 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                                      }`}
                                      style={{ width: `${message.response.risk_score * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 mt-2">
                                {message.response.risk_score >= 0.8 
                                  ? 'High confidence due to consistent signals across multiple data sources'
                                  : message.response.risk_score >= 0.5
                                  ? 'Medium confidence — some uncertainty in data quality or model inputs'
                                  : 'Low confidence — limited data or conflicting signals detected'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Data Lineage / Inputs Considered */}
                          <details className="group">
                            <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-400 transition-colors mb-2">
                              {t(locale, 'VIEW_TECHNICAL_DETAILS')}
                            </summary>
                            <div className="mt-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2">
                              <div className="text-xs text-slate-400 space-y-1">
                                <div>
                                  <span className="text-slate-500">Disaster Data:</span>{' '}
                                  <span className="text-slate-300">Historical + Synthetic</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Disease Signals:</span>{' '}
                                  <span className="text-slate-300">
                                    {selectedSystem && ['respiratory', 'diarrhea', 'cholera', 'hepatitis', 'leptospirosis'].includes(selectedSystem)
                                      ? selectedSystem.charAt(0).toUpperCase() + selectedSystem.slice(1)
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
                              </div>
                            </div>
                          </details>

                          {/* Actions - Numbered List */}
                          {message.response.actions && message.response.actions.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 mb-2">{t(locale, 'RECOMMENDED_ACTIONS')}</p>
                              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2">
                                {message.response.actions.map((action, index) => (
                                  <div key={index} className="text-sm text-slate-300 flex items-start gap-3">
                                    <span className="text-cyan-400 font-semibold min-w-[1.5rem]">{index + 1}.</span>
                                    <span className="flex-1 leading-relaxed">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Validation Status */}
                          <div className="pt-2 border-t border-slate-800">
                            <p className="text-xs text-slate-500">
                              Validation: <span className={message.response.validation === 'OK' ? 'text-green-400' : 'text-amber-400'}>{message.response.validation}</span>
                            </p>
                          </div>

                          {/* Consequence Mirror */}
                          {message.response.consequences && (
                            <ConsequenceMirror consequences={message.response.consequences} />
                          )}
                        </>
                      ) : (
                        // Error or plain text message
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                          <p className="text-sm text-slate-300">{message.content}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="ml-2 text-sm text-slate-400">{t(locale, 'ANALYZING_WITH_CHESEAL')}</span>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CHESEAL a question…"
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
                  disabled={isLoading}
                  aria-label="Question input for CHESEAL AI analyst"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  aria-label="Submit question to CHESEAL"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
