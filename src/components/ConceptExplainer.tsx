import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Printer,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  Brain,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ConceptResponse, SavedItem } from '../types';
import { PRESETS_CONCEPTS } from '../data/presets';

interface ConceptExplainerProps {
  onSaveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  initialConcept?: string;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  onSaveItem,
  initialConcept = '',
}) => {
  const [concept, setConcept] = useState(initialConcept);
  const [analogyStyle, setAnalogyStyle] = useState('everyday-life');
  const [academicLevel, setAcademicLevel] = useState('beginner');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConceptResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleExplain = async (targetConcept?: string) => {
    const query = (targetConcept || concept).trim();
    if (!query) {
      setError('Please enter a concept you want explained.');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch('/api/study/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: query,
          analogyStyle,
          academicLevel,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error ${res.status}`);
      }

      const result: ConceptResponse = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to explain concept. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const text = `# Concept: ${data.concept}
## One-Line Summary
${data.oneLineSummary}

## Relatable Analogy
${data.relatableAnalogy.scenario}

### Analogy Mapping:
${data.relatableAnalogy.mapping.map((m) => `- ${m.analogyPart} <==> ${m.conceptPart}: ${m.explanation}`).join('\n')}

## Step-by-Step Breakdown
${data.stepByStepBreakdown.map((s) => `### Step ${s.step}: ${s.title}\n${s.detail}`).join('\n\n')}

## Why It Matters
${data.whyItMatters}

## Memory Tip / Mnemonic
${data.memoryAcroynmOrTip}

## Beginner FAQ
${data.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (!data) return;
    onSaveItem({
      feature: 'concept',
      title: data.concept,
      data,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const applyPreset = (preset: typeof PRESETS_CONCEPTS[0]) => {
    setConcept(preset.payload.concept);
    setAnalogyStyle(preset.payload.analogyStyle);
    handleExplain(preset.payload.concept);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Lightbulb className="w-4 h-4" />
            Feature 2 &middot; Intuitive Mental Models
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Simple Concept Explainer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unpack intimidating academic concepts using relatable real-life analogies, visual
            mappings, and zero-jargon breakdowns.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            What technical concept is confusing you?
          </label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleExplain()}
            placeholder="e.g. Pointers in C, Recursion call stack, TCP 3-Way Handshake, Polymorphism, Eigenvalues..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
          />
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Popular College Doubts:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS_CONCEPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-amber-700 font-bold">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Analogy Metaphor Style
            </label>
            <select
              value={analogyStyle}
              onChange={(e) => setAnalogyStyle(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="everyday-life">Everyday Life &amp; Household Objects</option>
              <option value="smartphone-apps">Smartphones, Social Media &amp; Apps</option>
              <option value="gaming">Video Games, RPGs &amp; Minecraft</option>
              <option value="cooking">Cooking, Food &amp; Kitchen Recipes</option>
              <option value="sports">Sports, Teams &amp; Athletics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Background Level
            </label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="beginner">Total Beginner / Non-Technical</option>
              <option value="fresher">1st Year Engineering / Science Fresher</option>
              <option value="sophomore">2nd Year Core Undergraduate</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleExplain()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Building intuitive analogies with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Explain in Beginner Terms</span>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Could not explain concept</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Output */}
      {data && (
        <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Intuitive Breakdown
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{data.concept}</h2>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-700 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-600" />
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

          {/* One-Line Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              The 5-Second TL;DR
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900">
              "{data.oneLineSummary}"
            </p>
          </div>

          {/* Relatable Analogy Scenario */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              The Relatable Analogy
            </h3>
            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-4">
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {data.relatableAnalogy.scenario}
              </p>

              {/* Analogy to Concept Mapping Cards */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Concept Mapping:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.relatableAnalogy.mapping.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-white border border-amber-200 shadow-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-amber-700">{item.analogyPart}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-blue-700">{item.conceptPart}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-normal pt-1">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              How It Actually Works (Step-by-Step)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.stepByStepBreakdown.map((step) => (
                <div
                  key={step.step}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {step.step}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why It Matters & Memory Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-600" />
                Why Professors &amp; Tech Companies Care
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {data.whyItMatters}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Memory Trick / Mnemonic
              </span>
              <p className="text-xs text-purple-950 font-bold leading-relaxed">
                {data.memoryAcroynmOrTip}
              </p>
            </div>
          </div>

          {/* Beginner FAQs Accordion */}
          {data.faq && data.faq.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                Frequently Asked Beginner Doubts
              </h3>
              <div className="space-y-2">
                {data.faq.map((item, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-amber-600">Q:</span>
                          {item.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          <span className="font-bold text-emerald-700">Answer: </span>
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};
