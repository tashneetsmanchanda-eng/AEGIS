import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import type { SystemType, LocationData } from '../App';
import { analyzeDecision, type DecisionAnalysisResponse } from '../services/api';
import { ConsequenceMirror } from './ConsequenceMirror';

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle CHESEAL analysis
  const handleAnalysis = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const riskVector = getRiskVector();
      const result = await analyzeDecision({
        question,
        risk_vector: riskVector,
      });
      
      // Add CHESEAL response to messages
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

    // Clear input immediately
    setInputValue('');
    
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
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-cyan-400">
                  CHESEAL
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI Analyst
                </p>
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
                <span>{isLoading ? 'Analyzing...' : 'Monitoring system state'}</span>
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
                          "Flood evacuation was issued earlier, but verified flood risk is now 0.34 and hospitals are stable. What is the correct system decision and re-escalation threshold?"
                        )
                      }
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-colors text-sm"
                      type="button"
                      disabled={isLoading}
                    >
                      Flood decision re-evaluation
                    </button>
                    <button
                      onClick={() =>
                        handleScenario(
                          "How should osteoarthritis pain be safely managed?"
                        )
                      }
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-colors text-sm"
                      type="button"
                      disabled={isLoading}
                    >
                      Osteoarthritis pain management
                    </button>
                    <button
                      onClick={() =>
                        handleScenario(
                          "A cyclone is approaching — how can diarrheal outbreaks be prevented?"
                        )
                      }
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-colors text-sm"
                      type="button"
                      disabled={isLoading}
                    >
                      Cyclone-linked diarrheal prevention
                    </button>
                  </div>
                </>
              )}

              {/* Message History */}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {message.role === 'user' ? (
                    // User Message
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        USER QUESTION
                      </p>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-sm text-slate-200">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    // CHESEAL Response
                    <div className="flex flex-col gap-3">
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

                          {/* Explanation */}
                          <div>
                            <p className="text-xs text-slate-500 mb-2">EXPLANATION</p>
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {message.response.explanation}
                              </p>
                            </div>
                          </div>

                          {/* Actions - Numbered List */}
                          {message.response.actions && message.response.actions.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 mb-2">RECOMMENDED ACTIONS</p>
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
                  <span className="ml-2 text-sm text-slate-400">Analyzing with CHESEAL...</span>
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
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
