import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Printer,
  Bookmark,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { NotesResponse, SavedItem } from '../types';
import { PRESETS_NOTES } from '../data/presets';

interface NotesGeneratorProps {
  onSaveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  initialTopic?: string;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({
  onSaveItem,
  initialTopic = '',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [academicYear, setAcademicYear] = useState<'1st Year' | '2nd Year'>('1st Year');
  const [detailLevel, setDetailLevel] = useState<'quick' | 'standard' | 'comprehensive'>('standard');
  const [includeExamples, setIncludeExamples] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NotesResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (targetTopic?: string) => {
    const queryTopic = (targetTopic || topic).trim();
    if (!queryTopic) {
      setError('Please enter a syllabus topic or subject chapter.');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch('/api/study/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: queryTopic,
          academicYear,
          detailLevel,
          includeExamples,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data: NotesResponse = await res.json();
      setNotes(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate study notes. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!notes) return;
    const text = `# ${notes.title} (${notes.subjectCategory})
Academic Level: ${academicYear}

## Overview
${notes.overview}

## Formal Definition
${notes.formalDefinition}

## Simplified Explanation
${notes.simplifiedExplanation}

## Key Concepts
${notes.keyConcepts
  .map(
    (c) => `### ${c.heading}
${c.explanation}
${c.example ? `Example: ${c.example}` : ''}`
  )
  .join('\n\n')}

${notes.visualOrSyntaxSummary ? `## Blueprint / Diagram\n${notes.visualOrSyntaxSummary}\n` : ''}

## Common Exam Traps
${notes.commonExamMistakes?.map((m) => `- ${m}`).join('\n') || ''}

## Quick Revision Points
${notes.quickRevisionPoints?.map((p) => `✓ ${p}`).join('\n') || ''}

## Self-Test Questions
${notes.selfTestQuestions?.map((q, i) => `${i + 1}. ${q}`).join('\n') || ''}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (!notes) return;
    onSaveItem({
      feature: 'notes',
      title: notes.title,
      data: notes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const applyPreset = (p: typeof PRESETS_NOTES[0]) => {
    setTopic(p.payload.topic);
    setAcademicYear(p.payload.academicYear);
    setDetailLevel(p.payload.detailLevel);
    handleGenerate(p.payload.topic);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Feature Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Feature 1 &middot; Structured Learning
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Notes Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Produce structured, exam-ready study notes with formal definitions, beginner breakdowns,
            and real-world examples.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Enter Study Topic or Syllabus Concept
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
              placeholder="e.g. Binary Search Trees, Pointers in C, TCP 3-Way Handshake, Newton's Laws..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
        </div>

        {/* Quick College Presets */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick College Starters:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS_NOTES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50/80 text-blue-700 hover:bg-blue-100 border border-blue-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-blue-600 font-bold">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Level</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAcademicYear('1st Year')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  academicYear === '1st Year'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                1st Year (Fresher)
              </button>
              <button
                type="button"
                onClick={() => setAcademicYear('2nd Year')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  academicYear === '2nd Year'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                2nd Year (Core)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Detail Depth</label>
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value as any)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="quick">Quick Revision (Short &amp; High-Yield)</option>
              <option value="standard">Standard Exam Notes (Recommended)</option>
              <option value="comprehensive">Comprehensive Deep Dive (Full Syllabus)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Include Concrete Real-World Examples
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleGenerate()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Structured Notes with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Generate Structured Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Could not generate notes</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Output Section */}
      {notes && (
        <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
          {/* Notes Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  {notes.subjectCategory}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {academicYear} Curriculum
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{notes.title}</h2>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors cursor-pointer"
                title="Copy markdown text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Notes'}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors cursor-pointer"
                title="Save to Library"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors cursor-pointer"
                title="Print or export as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Overview */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-sm text-slate-800 leading-relaxed">
            <span className="font-bold text-blue-900 block mb-1">Chapter Overview:</span>
            {notes.overview}
          </div>

          {/* Side-by-Side: Formal Definition vs Beginner Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <BookOpen className="w-4 h-4 text-slate-600" />
                Textbook Definition
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed italic">
                "{notes.formalDefinition}"
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                Beginner-Friendly Breakdown
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">
                {notes.simplifiedExplanation}
              </p>
            </div>
          </div>

          {/* Key Concepts List */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Core Concepts &amp; Subtopics
            </h3>
            <div className="space-y-4">
              {notes.keyConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200/90 hover:border-blue-200 bg-white transition-colors space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-2 w-full">
                      <h4 className="font-bold text-base text-slate-900">{concept.heading}</h4>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {concept.explanation}
                      </p>

                      {concept.example && (
                        <div className="mt-2 p-3 rounded-lg bg-blue-50/50 border-l-4 border-blue-500 text-xs text-slate-800">
                          <span className="font-bold text-blue-800">Practical Example: </span>
                          <span>{concept.example}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Diagram / Syntax Blueprint */}
          {notes.visualOrSyntaxSummary && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                Visual Architecture / Blueprint / Syntax
              </h3>
              <pre className="p-4 rounded-xl bg-slate-900 text-blue-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                {notes.visualOrSyntaxSummary}
              </pre>
            </div>
          )}

          {/* Exam Traps & Quick Revision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.commonExamMistakes && notes.commonExamMistakes.length > 0 && (
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Common Exam Traps &amp; Misconceptions
                </div>
                <ul className="space-y-2">
                  {notes.commonExamMistakes.map((mistake, i) => (
                    <li key={i} className="text-xs text-amber-950 flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notes.quickRevisionPoints && notes.quickRevisionPoints.length > 0 && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  2-Minute Revision Points
                </div>
                <ul className="space-y-2">
                  {notes.quickRevisionPoints.map((point, i) => (
                    <li key={i} className="text-xs text-emerald-950 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Self Test Questions */}
          {notes.selfTestQuestions && notes.selfTestQuestions.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Active Recall: Self-Test Questions
              </div>
              <div className="space-y-2">
                {notes.selfTestQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      Q{i + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};
