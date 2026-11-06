import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Share2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { QuizResponse, QuizQuestion, SavedItem } from '../types';
import { PRESETS_QUIZ } from '../data/presets';

interface QuizGeneratorProps {
  onSaveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  onQuizCompleted: () => void;
  initialTopic?: string;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  onSaveItem,
  onQuizCompleted,
  initialTopic = '',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState('college exam style');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);

  // Quiz active state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (targetTopic?: string) => {
    const query = (targetTopic || topic).trim();
    if (!query) {
      setError('Please enter a topic for the quiz.');
      return;
    }

    setLoading(true);
    setError(null);
    setQuizData(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowHint(false);
    setIsCompleted(false);
    setSaved(false);

    try {
      const res = await fetch('/api/study/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: query,
          difficulty,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data: QuizResponse = await res.json();
      setQuizData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate quiz. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    // If already answered this question, don't allow re-answering
    if (selectedAnswers[currentIndex] !== undefined) return;

    const newAnswers = { ...selectedAnswers, [currentIndex]: optionIndex };
    setSelectedAnswers(newAnswers);

    // If correct, play a soft chime or short burst
    if (quizData && optionIndex === quizData.questions[currentIndex].correctOptionIndex) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    setShowHint(false);
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
      onQuizCompleted();
      // Grand finale confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowHint(false);
    setIsCompleted(false);
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    return quizData.questions.reduce((score, q, idx) => {
      return score + (selectedAnswers[idx] === q.correctOptionIndex ? 1 : 0);
    }, 0);
  };

  const handleSave = () => {
    if (!quizData) return;
    onSaveItem({
      feature: 'quiz',
      title: `Quiz: ${quizData.topic}`,
      data: {
        quizData,
        score: calculateScore(),
        total: quizData.questions.length,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const applyPreset = (preset: typeof PRESETS_QUIZ[0]) => {
    setTopic(preset.payload.topic);
    setDifficulty(preset.payload.difficulty);
    handleGenerate(preset.payload.topic);
  };

  const currentQ: QuizQuestion | undefined = quizData?.questions[currentIndex];
  const answered = selectedAnswers[currentIndex] !== undefined;
  const selectedOption = selectedAnswers[currentIndex];
  const score = calculateScore();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Feature 3 &middot; Active Self-Testing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Quiz Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate 5 syllabus-targeted MCQs with four options, instant scoring, helpful hints, and
            detailed answer explanations.
          </p>
        </div>
      </div>

      {/* Generator Form (Always accessible or when quiz not completed) */}
      {!quizData && (
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Topic or Syllabus Subject to Test
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
              placeholder="e.g. Arrays vs Linked Lists, Python Loops & Functions, SQL Joins, Calculus Limits..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Popular College Quiz Presets:
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESETS_QUIZ.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{preset.title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-emerald-700 font-bold">
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Difficulty Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'beginner', label: 'Beginner (Concepts & Basics)' },
                { id: 'balanced', label: 'Balanced (Standard College Level)' },
                { id: 'college exam style', label: 'University Exam Style (Challenging)' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    difficulty === d.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleGenerate()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating 5 MCQs with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Create 5-Question Quiz</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Quiz Generation Failed</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Active Interactive Quiz Mode */}
      {quizData && !isCompleted && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          {/* Progress Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">
                Question <span className="text-emerald-700">{currentIndex + 1}</span> of{' '}
                {quizData.questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {quizData.difficulty}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentIndex + (answered ? 1 : 0)) / quizData.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            {currentQ.conceptTested && (
              <span className="inline-block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Topic: {currentQ.conceptTested}
              </span>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Hint Accordion */}
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
            </button>
            {showHint && (
              <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-fadeIn">
                <span className="font-bold">Hint: </span>
                {currentQ.hint}
              </div>
            )}
          </div>

          {/* Options (A, B, C, D) */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const optionLetters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedOption === optIdx;
              const isCorrect = currentQ.correctOptionIndex === optIdx;

              let buttonStyle = 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40';

              if (answered) {
                if (isCorrect) {
                  buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/30';
                } else if (isSelected && !isCorrect) {
                  buttonStyle = 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500/30';
                } else {
                  buttonStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={answered}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${buttonStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      answered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : answered && isSelected && !isCorrect
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {optionLetters[optIdx]}
                  </span>
                  <span className="text-sm font-semibold flex-1 leading-relaxed">{option}</span>

                  {answered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {answered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate In-depth Explanation Box */}
          {answered && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Explanation &amp; Concept Review
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setQuizData(null);
                setCurrentIndex(0);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Exit Quiz
            </button>

            {answered && (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer animate-fadeIn"
              >
                <span>
                  {currentIndex === quizData.questions.length - 1
                    ? 'View Final Results'
                    : 'Next Question'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Completion Screen */}
      {quizData && isCompleted && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-2">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Quiz Completed!</h2>
            <p className="text-sm text-slate-600">
              Topic: <span className="font-bold text-slate-900">{quizData.topic}</span>
            </p>

            {/* Score Pill */}
            <div className="py-4">
              <div className="inline-flex items-baseline gap-2 px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-4xl font-black text-emerald-700">{score}</span>
                <span className="text-slate-400 font-bold text-xl">/ 5</span>
                <span className="text-sm font-extrabold text-emerald-800 ml-2">
                  ({Math.round((score / 5) * 100)}%)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md mx-auto">
              {score === 5
                ? '🌟 Flawless score! You have solid conceptual clarity on this topic.'
                : score >= 3
                ? '👍 Good job! Review the questions you missed below to solidify the concepts.'
                : '💡 Needs revision. Take a look at the AI Notes for this topic and retry!'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 no-print">
            <button
              onClick={handleRetake}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake This Quiz</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span>{saved ? 'Saved!' : 'Save Quiz & Score'}</span>
            </button>
            <button
              onClick={() => {
                setQuizData(null);
                setTopic('');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Generate New Quiz</span>
            </button>
          </div>

          {/* Full Review of All 5 Questions */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">
              Detailed Question Review
            </h3>

            <div className="space-y-4">
              {quizData.questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctOptionIndex;
                const letters = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={q.id || idx}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{q.question}</h4>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optI) => (
                        <div
                          key={optI}
                          className={`p-2.5 rounded-lg border font-medium ${
                            optI === q.correctOptionIndex
                              ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold'
                              : userChoice === optI && !isCorrect
                              ? 'bg-red-100/70 border-red-300 text-red-950 line-through'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="font-bold mr-1.5">{letters[optI]}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-blue-700">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
