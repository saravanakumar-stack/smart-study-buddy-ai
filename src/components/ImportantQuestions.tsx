import React, { useState } from 'react';
import {
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  Bookmark,
  Printer,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { QuestionsResponse, SavedItem } from '../types';
import { PRESETS_QUESTIONS } from '../data/presets';

interface ImportantQuestionsProps {
  onSaveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  initialTopic?: string;
}

export const ImportantQuestions: React.FC<ImportantQuestionsProps> = ({
  onSaveItem,
  initialTopic = '',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuestionsResponse | null>(null);

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  const handleGenerate = async (targetTopic?: string, targetSubject?: string) => {
    const qTopic = (targetTopic || topic).trim();
    if (!qTopic) {
      setError('Please enter a syllabus topic or chapter name.');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch('/api/study/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: qTopic,
          subject: targetSubject || subject,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const result: QuestionsResponse = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate practice questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const text = `# Practice Revision Questions: ${data.topic}
${data.disclaimer}

## Part A: Short Answer Questions (2 Marks)
${data.shortAnswerQuestions
  .map(
    (q, i) => `${i + 1}. [2 Marks] ${q.question}
Answer Key: ${q.idealAnswerKey}`
  )
  .join('\n\n')}

## Part B: Medium Explanatory Questions (5 Marks)
${data.mediumAnswerQuestions
  .map(
    (q, i) => `${i + 1}. [5 Marks] ${q.question}
Key Points to Include:
${q.keyPointsToInclude.map((p) => `- ${p}`).join('\n')}
Model Outline: ${q.modelOutline || 'Standard structured breakdown'}`
  )
  .join('\n\n')}

## Part C: Long Analytical / Essay Questions (10 Marks)
${data.longAnswerQuestions
  .map(
    (q, i) => `${i + 1}. [10 Marks] ${q.question}
Breakdown:
${q.structuredBreakdown.map((b) => `- ${b}`).join('\n')}
Scoring Tip: ${q.scoringTip || 'Focus on diagrams and clean explanations'}`
  )
  .join('\n\n')}

${
  data.highYieldKeyTerms
    ? `## High-Yield Key Terminology\n${data.highYieldKeyTerms.map((t) => `- ${t}`).join('\n')}`
    : ''
}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (!data) return;
    onSaveItem({
      feature: 'questions',
      title: `Practice Questions: ${data.topic}`,
      data,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const applyPreset = (preset: typeof PRESETS_QUESTIONS[0]) => {
    setTopic(preset.payload.topic);
    setSubject(preset.payload.subject);
    handleGenerate(preset.payload.topic, preset.payload.subject);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            Feature 4 &middot; Exam Preparation &amp; Revision
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Important Question Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate 2-mark, 5-mark, and 10-mark revision questions with model answer keys to
            systematically master your course syllabus.
          </p>
        </div>
      </div>

      {/* Mandatory Regulatory / Trust Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold">Academic Integrity &amp; Revision Note: </span>
          These questions are created by AI based on standard university curricula for{' '}
          <span className="font-semibold underline">practice and self-assessment only</span>. They are
          not guaranteed or leaked examination papers. Always review your professor's prescribed
          syllabus.
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Topic or Syllabus Unit
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
              placeholder="e.g. Normalization in DBMS, Stack Applications, Cache Memory..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Subject Name (Optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Database Systems, Data Structures, Digital Electronics..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick College Syllabi Presets:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS_QUESTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-purple-700 font-bold">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleGenerate()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Revision Questions with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Generate Practice Questions</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Generation Error</p>
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
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Revision Practice Set
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{data.topic}</h2>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAnswers ? 'Hide Answers' : 'Reveal Answers'}</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-600" />
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

          {/* Part A: 2-Mark Short Answer Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-black">
                  Part A
                </span>
                Short Questions (2 Marks Each)
              </h3>
              <span className="text-xs text-slate-400 font-medium">Definitions &amp; Differences</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {data.shortAnswerQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 space-y-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      <span className="text-blue-600 mr-1.5">Q{idx + 1}.</span> {q.question}
                    </p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      2 Marks
                    </span>
                  </div>

                  {showAnswers && (
                    <div className="p-3 rounded-lg bg-blue-50/50 border-l-4 border-blue-500 text-xs text-slate-700 leading-relaxed animate-fadeIn">
                      <span className="font-bold text-blue-800">Ideal Answer Key: </span>
                      {q.idealAnswerKey}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Part B: 5-Mark Medium Explanatory Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-black">
                  Part B
                </span>
                Medium Questions (5 Marks Each)
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Mechanisms, Algorithms &amp; Tables
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.mediumAnswerQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-purple-200 space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      <span className="text-purple-600 mr-1.5">Q{idx + 1}.</span> {q.question}
                    </p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      5 Marks
                    </span>
                  </div>

                  {showAnswers && (
                    <div className="space-y-2 pt-1 animate-fadeIn">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Mandatory Points to Cover in Answer:
                      </div>
                      <ul className="space-y-1">
                        {q.keyPointsToInclude.map((pt, pIdx) => (
                          <li
                            key={pIdx}
                            className="text-xs text-slate-600 flex items-start gap-2"
                          >
                            <span className="text-purple-500 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>

                      {q.modelOutline && (
                        <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                          <span className="font-bold">Structure: </span>
                          {q.modelOutline}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Part C: 10-Mark Long Analytical / Essay Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black">
                  Part C
                </span>
                Long Questions (10 Marks Each)
              </h3>
              <span className="text-xs text-slate-400 font-medium">In-Depth Case &amp; System Design</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.longAnswerQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      <span className="text-emerald-700 mr-1.5">Q{idx + 1}.</span> {q.question}
                    </p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      10 Marks
                    </span>
                  </div>

                  {showAnswers && (
                    <div className="space-y-3 pt-1 animate-fadeIn">
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Recommended Essay Structure:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {q.structuredBreakdown.map((sec, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                            >
                              <span className="font-bold text-slate-900 block mb-0.5">
                                Phase {sIdx + 1}
                              </span>
                              {sec}
                            </div>
                          ))}
                        </div>
                      </div>

                      {q.scoringTip && (
                        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                          <span className="font-bold">Evaluator Scoring Tip: </span>
                          {q.scoringTip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* High-Yield Key Terms Checklist */}
          {data.highYieldKeyTerms && data.highYieldKeyTerms.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-purple-600" />
                High-Yield Technical Vocabulary Checklist
              </div>
              <p className="text-xs text-slate-500">
                Make sure you include these keywords in your written answers:
              </p>
              <div className="flex flex-wrap gap-2">
                {data.highYieldKeyTerms.map((term, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-xs"
                  >
                    ✓ {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};
