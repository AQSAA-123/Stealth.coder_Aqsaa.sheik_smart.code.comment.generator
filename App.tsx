import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { MetricsDisplay } from './components/MetricsDisplay';
import { ErrorAnalysisDisplay } from './components/ErrorAnalysisDisplay';
import { generateCodeComment } from './services/geminiService';
import { CommentResult, MetricsData, Language, CommentStyle, HistoryItem } from './types';
import { calculateTokenOverlap, calculateLengthRatio, truncateCode } from './utils/metrics';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [language, setLanguage] = useState<Language>(Language.JavaScript);
  const [style, setStyle] = useState<CommentStyle>(CommentStyle.Concise);
  const [checkErrors, setCheckErrors] = useState<boolean>(false);
  
  const [result, setResult] = useState<CommentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [humanScore, setHumanScore] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleGenerate = useCallback(async () => {
    if (!code.trim()) {
      setError("Please enter some code first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setMetrics(null);
    setHumanScore(null);

    try {
      const generatedData = await generateCodeComment(code, language, style, checkErrors);
      setResult(generatedData);

      // Calculate initial metrics if reference exists
      if (reference.trim()) {
        setMetrics({
          tokenOverlap: calculateTokenOverlap(generatedData.comment, reference),
          lengthRatio: calculateLengthRatio(generatedData.comment, reference)
        });
      }
      
      // Add to history
      setHistory(prev => [{
          id: Date.now().toString(),
          timestamp: Date.now(),
          codeSnippet: code,
          generatedComment: generatedData.comment,
          plausibility: generatedData.plausibilityScore,
          style: style
      }, ...prev.slice(0, 4)]); // Keep last 5

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [code, language, style, reference, checkErrors]);

  // Recalculate metrics if reference changes after generation
  useEffect(() => {
    if (result && reference.trim()) {
      setMetrics({
        tokenOverlap: calculateTokenOverlap(result.comment, reference),
        lengthRatio: calculateLengthRatio(result.comment, reference)
      });
    } else {
      setMetrics(null);
    }
  }, [reference, result]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCommentForDisplay = (comment: string, lang: Language, styleType: CommentStyle) => {
    if (styleType === CommentStyle.Docstring) {
      if (lang === Language.Python) {
        return `"""\n${comment}\n"""`;
      }
      // JS, TS, Java, Rust, etc. - Assume Javadoc style
      return `/**\n${comment}\n*/`; 
    }
    
    if (styleType === CommentStyle.Inline) {
        const prefix = (lang === Language.Python) ? '# ' : '// ';
        return prefix + comment;
    }

    // Concise or Detailed
    if (lang === Language.Python) {
        return `# ${comment.replace(/\n/g, '\n# ')}`;
    }
    return `/**\n * ${comment.replace(/\n/g, '\n * ')}\n */`;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight">SmartCommenter</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-gray-800 border-gray-700 text-xs rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
             >
                {Object.values(Language).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
             </select>
             <div className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                Model: gemini-2.5-flash
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8 gap-8 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 p-1 rounded-xl">
             <CodeEditor 
                label="Input Function (Code)"
                value={code}
                onChange={setCode}
                placeholder={`// Paste your ${language} function here...`}
             />
          </div>

          {/* Controls Row */}
          <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-gray-900/50 border border-gray-800 p-3 rounded-xl">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Comment Style</label>
                  <div className="flex gap-1 p-1 bg-gray-800 rounded-lg">
                    {Object.values(CommentStyle).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStyle(s)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                style === s 
                                ? 'bg-indigo-600 text-white shadow-sm' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                  </div>
              </div>

              {/* Error Check Toggle */}
              <div 
                className="bg-gray-900/50 border border-gray-800 p-3 rounded-xl flex flex-col justify-center cursor-pointer group min-w-[100px]"
                onClick={() => setCheckErrors(!checkErrors)}
              >
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block cursor-pointer">Diagnostics</label>
                  <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checkErrors ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-800 border-gray-600 group-hover:border-gray-500'}`}>
                          {checkErrors && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className={`text-xs font-medium transition-colors ${checkErrors ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>Find Bugs</span>
                  </div>
              </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 p-1 rounded-xl">
            <div className="flex justify-between items-end mb-2 px-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference Comment (Optional)</label>
                <span className="text-[10px] text-indigo-400">For ROUGE-proxy metric</span>
            </div>
            <textarea
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Paste a 'gold standard' comment here to compare accuracy..."
                className="w-full h-24 p-3 bg-gray-900 border border-gray-800 rounded-lg 
                font-mono text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 
                focus:border-transparent resize-none placeholder-gray-700"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !code.trim()}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all duration-200
              flex items-center justify-center gap-2
              ${loading || !code.trim() 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:transform active:scale-[0.99]'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Generate Comment
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-200 rounded-lg text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Output & Metrics */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Generated Result Card */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    {style} Comment ({language})
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(formatCommentForDisplay(result.comment, language, style))}
                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="p-6 bg-gray-900 relative group overflow-x-auto">
                    <pre className="whitespace-pre-wrap text-sm text-green-300 font-mono leading-relaxed">
                        {formatCommentForDisplay(result.comment, language, style)}
                    </pre>
                </div>
                <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-800 text-xs text-gray-400 italic">
                   Reasoning: {result.reasoning}
                </div>
              </div>

              {/* Metrics Card */}
              <MetricsDisplay 
                plausibility={result.plausibilityScore}
                comparisonMetrics={metrics}
                humanScore={humanScore}
                setHumanScore={setHumanScore}
              />

              {/* Error Analysis - Displayed below metrics if errors found */}
              <ErrorAnalysisDisplay analysis={result.errorAnalysis} />

            </div>
          ) : (
             <div className="h-full flex flex-col">
                {/* Empty State / History */}
                 <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex-grow">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Recent Generations</h3>
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm">No history yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map(item => (
                                <div key={item.id} className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => {
                                    setCode(item.codeSnippet);
                                    if (item.style) setStyle(item.style);
                                }}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-xs font-mono text-indigo-300">{truncateCode(item.codeSnippet, 25)}</div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-[10px] text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</div>
                                            {item.style && <div className="text-[9px] text-gray-600 px-1 rounded bg-gray-800 border border-gray-700 mt-1">{item.style}</div>}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-300 line-clamp-2 border-l-2 border-gray-600 pl-2 mt-1">
                                        {item.generatedComment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;