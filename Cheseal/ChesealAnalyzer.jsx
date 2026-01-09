import React, { useState } from 'react';
import axios from 'axios';

/**
 * ChesealAnalyzer - React Component for AI Crisis Analysis
 * Connects to FastAPI backend at http://localhost:8001
 */
const ChesealAnalyzer = ({ dashboardState }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);

  /**
   * Analyze crisis scenario using Cheseal AI
   * Sends dashboard_state (city, flood_risk, disease) to backend
   */
  const analyzeCrisis = async () => {
    // Reset previous state
    setError(null);
    setResponse(null);
    setLoading(true);

    try {
      // Send request to backend using Axios
      // Using simplified route /cheseal with QueryRequest model
      const result = await axios.post(
        'http://localhost:8001/ask',
        {
          question: "Analyze the current crisis situation and provide immediate action recommendations.",
          city: dashboardState.city,
          flood_risk: dashboardState.flood_risk,
          predicted_disease: dashboardState.predicted_disease || dashboardState.disease,
          confidence: dashboardState.confidence,
          risk_level: dashboardState.risk_level || "Unknown"
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout for AI processing
        }
      );

      // Save response to state variable for UI display
      setResponse(result.data);
    } catch (err) {
      // User-friendly error handling
      if (err.code === 'ECONNREFUSED' || err.response === undefined) {
        setError('Backend server is not running. Please start the FastAPI server with: python main.py');
      } else if (err.response?.status === 500) {
        setError('AI processing error. Please check your API keys in the .env file.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please verify your API keys.');
      } else {
        setError(err.response?.data?.detail || err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get risk level color classes
   */
  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'safe':
        return 'bg-green-100 border-green-400 text-green-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  /**
   * Get risk level badge
   */
  const getRiskBadge = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical':
        return '🔴 Critical';
      case 'warning':
        return '⚠️ Warning';
      case 'safe':
        return '✅ Safe';
      default:
        return '❓ Unknown';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* AI Analyst Button */}
      <div className="mb-6">
        <button
          onClick={analyzeCrisis}
          disabled={loading}
          className={`
            w-full px-6 py-4 rounded-lg font-semibold text-white
            transition-all duration-200
            ${loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
            disabled:opacity-50
            shadow-lg hover:shadow-xl
            flex items-center justify-center gap-3
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Cheseal is thinking...</span>
            </>
          ) : (
            <span>🤖 Run AI Analysis</span>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Response Card */}
      {response && (
        <div className="space-y-4">
          {/* Risk Level Badge */}
          <div className={`p-4 rounded-lg border-2 ${getRiskColor(response.risk_level)}`}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{getRiskBadge(response.risk_level)}</span>
              <span className="text-sm opacity-75">Risk Assessment</span>
            </div>
          </div>

          {/* Chat Bubble - Cheseal's Response */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  C
                </div>
              </div>
              
              {/* Message Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">Cheseal Intelligence</h3>
                  <span className="text-xs text-gray-500">AI Crisis Co-Pilot</span>
                </div>
                
                {/* Response Text */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {response.response}
                  </p>
                </div>

                {/* Reasoning Toggle */}
                {response.reasoning && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowReasoning(!showReasoning)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${showReasoning ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>{showReasoning ? 'Hide' : 'Show'} ReAct Reasoning Trace</span>
                    </button>
                    
                    {showReasoning && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap">
                          {response.reasoning}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 italic">
                          💭 This shows Cheseal's internal Thought/Action/Observation reasoning process.
                          Check your Python terminal for the full trace.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChesealAnalyzer;

