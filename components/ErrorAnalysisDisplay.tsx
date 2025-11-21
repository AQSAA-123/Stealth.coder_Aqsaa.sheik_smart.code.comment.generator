import React from 'react';
import { ErrorAnalysis } from '../types';

interface ErrorAnalysisDisplayProps {
  analysis: ErrorAnalysis;
}

export const ErrorAnalysisDisplay: React.FC<ErrorAnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis || !analysis.hasErrors) return null;

  return (
    <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-5 mt-6 animate-fade-in-up shadow-lg shadow-red-900/5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-md font-bold text-red-200 flex items-center justify-between">
             <span>Issue Detected</span>
          </h3>
          <p className="text-sm text-red-200/80 leading-relaxed">
            {analysis.description}
          </p>
          
          {analysis.correctedCode && (
            <div className="mt-4 pt-3 border-t border-red-900/30">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-semibold text-red-300/70 uppercase tracking-wider">Suggested Fix</div>
                <button 
                  onClick={() => navigator.clipboard.writeText(analysis.correctedCode)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy
                </button>
              </div>
              <div className="relative group">
                <pre className="bg-black/30 border border-red-500/20 rounded-md p-3 text-sm font-mono text-red-100 overflow-x-auto whitespace-pre-wrap">
                  {analysis.correctedCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};