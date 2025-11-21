import React from 'react';
import { MetricsData } from '../types';

interface MetricsDisplayProps {
  plausibility: number; // 0-100
  comparisonMetrics?: MetricsData | null;
  humanScore: number | null;
  setHumanScore: (score: number) => void;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  plausibility,
  comparisonMetrics,
  humanScore,
  setHumanScore
}) => {
  
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (score >= 50) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
        Metric Analysis
      </h3>

      {/* AI Plausibility Score */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">AI Plausibility (Confidence)</span>
          <span className="text-gray-200 font-mono">{plausibility}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${plausibility}%` }}
          ></div>
        </div>
      </div>

      {/* Reference Comparison (ROUGE Proxy) */}
      {comparisonMetrics && (
        <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700 space-y-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Reference Comparison</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded border ${getColor(comparisonMetrics.tokenOverlap)} text-center`}>
              <div className="text-2xl font-bold font-mono">{comparisonMetrics.tokenOverlap.toFixed(1)}%</div>
              <div className="text-xs opacity-80">Token Overlap (ROUGE-Proxy)</div>
            </div>
             <div className={`p-3 rounded border ${comparisonMetrics.lengthRatio >= 0.8 && comparisonMetrics.lengthRatio <= 1.2 ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-blue-400 bg-blue-400/10 border-blue-400/20'} text-center`}>
              <div className="text-2xl font-bold font-mono">{comparisonMetrics.lengthRatio.toFixed(2)}x</div>
              <div className="text-xs opacity-80">Length Ratio</div>
            </div>
          </div>
        </div>
      )}

      {/* Human Plausibility Rating */}
      <div className="space-y-2 pt-2 border-t border-gray-800">
        <label className="block text-sm text-gray-400">Human Plausibility Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setHumanScore(star)}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                humanScore === star 
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {star}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );
};