import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Bookmark,
  Printer,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Play,
  Terminal,
  Bug,
  CheckCircle,
} from 'lucide-react';
import { CodeExplainerResponse, SavedItem } from '../types';
import { PRESETS_CODE } from '../data/presets';

interface CodeExplainerProps {
  onSaveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  initialCode?: string;
  initialLanguage?: string;
}

export const CodeExplainer: React.FC<CodeExplainerProps> = ({
  onSaveItem,
  initialCode = '',
  initialLanguage = 'python',
}) => {
  const [language, setLanguage] = useState<'python' | 'java' | 'c' | 'html'>(
    (initialLanguage as any) || 'python'
  );
  const [code, setCode] = useState(
    initialCode || PRESETS_CODE[0].payload.code
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CodeExplainerResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeLineHover, setActiveLineHover] = useState<number | null>(null);

  const handleExplain = async (targetCode?: string, targetLang?: string) => {
    const qCode = (targetCode || code).trim();
    if (!qCode) {
      setError('Please paste or write code to explain.');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch('/api/study/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: qCode,
          language: targetLang || language,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const result: CodeExplainerResponse = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to explain code. Please verify the syntax.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const text = `# Code Walkthrough: ${data.language.toUpperCase()}
## Overview
${data.overallSummary}

## Concepts
${data.mainConcepts.map((c) => `- ${c}`).join('\n')}

## Line-by-Line Breakdown
${data.lineByLine
  .map(
    (l) => `Line ${l.lineNumber}: \`${l.codeSnippet}\`
Explanation: ${l.explanation}`
  )
  .join('\n\n')}

## Execution Flow
${data.executionFlow}

${data.sampleOutputOrBehavior ? `## Expected Output\n${data.sampleOutputOrBehavior}\n` : ''}

## Beginner Pitfalls
${data.commonBeginnerPitfalls.map((p) => `- ${p}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (!data) return;
    onSaveItem({
      feature: 'code',
      title: `${language.toUpperCase()} Code Walkthrough`,
      data,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const applyPreset = (preset: typeof PRESETS_CODE[0]) => {
    setLanguage(preset.payload.language);
    setCode(preset.payload.code);
    handleExplain(preset.payload.code, preset.payload.language);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            Feature 5 &middot; Code Deconstruction
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Code Explainer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deconstruct beginner-level Python, Java, C, and HTML code line by line to understand
            memory, execution logic, and avoid beginner bugs.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-sky-100 p-6 shadow-xs space-y-6">
        {/* Language Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Programming Language
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: 'python', label: 'Python 3', badge: 'Beginner Friendly' },
                { id: 'c', label: 'C Language', badge: 'Pointers & Memory' },
                { id: 'java', label: 'Java', badge: 'OOP & Classes' },
                { id: 'html', label: 'HTML & Web', badge: 'Structure & Tags' },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  language === lang.id
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-sm font-bold">{lang.label}</div>
                <div className="text-[10px] text-slate-500">{lang.badge}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick College Code Snippets:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS_CODE.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-sky-700 font-bold">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Paste your {language.toUpperCase()} code:</span>
            <span className="text-slate-400 font-normal">Supports full functions and programs</span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <textarea
              rows={9}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste Python, Java, C, or HTML code here..."
              className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 selection:bg-sky-600 focus:outline-hidden leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleExplain()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing code line by line with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Explain Line by Line</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Analysis Failed</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Output Section */}
      {data && (
        <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wider">
                  {data.language} Breakdown
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Program Walkthrough &amp; Line-by-Line Guide
              </h2>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-sky-600" />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Program Overview */}
          <div className="p-5 rounded-xl bg-sky-50/70 border border-sky-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              What this program does
            </span>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {data.overallSummary}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Core Concepts:</span>
              {data.mainConcepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-xs font-bold text-sky-800"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Line by Line Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-600" />
              Line-by-Line Code Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Hover over or inspect each line to see what happens under the hood:
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {data.lineByLine.map((item, idx) => {
                const isHovered = activeLineHover === item.lineNumber;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveLineHover(item.lineNumber)}
                    onMouseLeave={() => setActiveLineHover(null)}
                    className={`p-4 transition-colors flex flex-col md:flex-row md:items-start gap-3 sm:gap-4 ${
                      isHovered ? 'bg-sky-50/60' : 'bg-white'
                    }`}
                  >
                    {/* Line number badge */}
                    <div className="flex items-center gap-2 md:w-20 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-600">
                        L{item.lineNumber}
                      </span>
                      {item.isImportant && (
                        <span className="w-2 h-2 rounded-full bg-sky-500" title="Key operation line" />
                      )}
                    </div>

                    {/* Code Snippet */}
                    <div className="md:w-5/12 shrink-0">
                      <code className="block p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre">
                        {item.codeSnippet}
                      </code>
                    </div>

                    {/* Explanation */}
                    <div className="flex-1 text-xs text-slate-700 leading-relaxed font-medium">
                      {item.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Flow & Expected Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-600" />
                Execution Flow Order
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                {data.executionFlow}
              </p>
            </div>

            {data.sampleOutputOrBehavior && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  Expected Output / Rendered Result
                </span>
                <pre className="p-3 rounded-lg bg-black/40 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                  {data.sampleOutputOrBehavior}
                </pre>
              </div>
            )}
          </div>

          {/* Beginner Pitfalls & Best Practices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Bug className="w-4 h-4 text-amber-600" />
                Common Beginner Bugs With This Code
              </div>
              <ul className="space-y-2">
                {data.commonBeginnerPitfalls.map((pitfall, pIdx) => (
                  <li key={pIdx} className="text-xs text-amber-950 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            {data.bestPractices && data.bestPractices.length > 0 && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  College Professor Best Practice Tips
                </div>
                <ul className="space-y-2">
                  {data.bestPractices.map((tip, tIdx) => (
                    <li key={tIdx} className="text-xs text-emerald-950 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>
      )}
    </div>
  );
};
