import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Coffee,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  Printer,
  AlertTriangle,
  Plus,
  X,
  Target,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PlannerResponse, SavedItem } from '../types';
import { PRESETS_PLANNER } from '../data/presets';

interface StudyPlannerProps {
  onSaveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  onPlanCreated: () => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  onSaveItem,
  onPlanCreated,
}) => {
  const [subjects, setSubjects] = useState<string[]>([
    'Data Structures & Algorithms',
    'Discrete Mathematics',
    'Digital Electronics',
  ]);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [dailyHours, setDailyHours] = useState<number>(4);
  const [totalDays, setTotalDays] = useState<number>(7);
  const [targetGoal, setTargetGoal] = useState('Mid-Semester Exam Preparation');
  const [weakAreas, setWeakAreas] = useState('Trees & Recursion, Karnaugh Maps');
  const [preferredStudyTime, setPreferredStudyTime] = useState('Late Afternoon & Evening');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlannerResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
      setNewSubjectInput('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const handleGenerate = async (presetPayload?: any) => {
    const subs = presetPayload?.subjects || subjects;
    if (subs.length === 0) {
      setError('Please add at least one subject to plan for.');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch('/api/study/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subs,
          dailyHours: presetPayload?.dailyHours || dailyHours,
          totalDays: presetPayload?.totalDays || totalDays,
          targetGoal: presetPayload?.targetGoal || targetGoal,
          weakAreas: presetPayload?.weakAreas || weakAreas,
          preferredStudyTime: presetPayload?.preferredStudyTime || preferredStudyTime,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data: PlannerResponse = await res.json();
      setPlan(data);
      onPlanCreated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate study timetable.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!plan) return;
    const text = `# ${plan.planTitle}
Total Study Time: ${plan.totalStudyHours} Hours
Strategy: ${plan.strategyOverview}

## Subject Allocation
${plan.subjectAllocation.map((s) => `- ${s.subject} (${s.hoursPerWeek}h): ${s.priorityLevel} Priority - ${s.focusFocusReason}`).join('\n')}

## Daily Schedule Template (Pomodoro)
${plan.idealDailyScheduleTemplate.map((slot) => `[${slot.timeSlot}] (${slot.type.toUpperCase()}) ${slot.activity}: ${slot.suggestedContent}`).join('\n')}

## Day-by-Day Roadmap
${plan.dayByDayRoadmap
  .map(
    (d) => `### Day ${d.dayNumber}: ${d.focusTheme}
Tasks:
${d.tasks.map((t) => `- [${t.duration}] ${t.subject}: ${t.objective}`).join('\n')}
End of day: ${d.endOfDayReview}`
  )
  .join('\n\n')}

## Study Hacks:
${plan.studyHacks.map((h) => `- ${h}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (!plan) return;
    onSaveItem({
      feature: 'planner',
      title: plan.planTitle,
      data: plan,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const applyPreset = (preset: typeof PRESETS_PLANNER[0]) => {
    setSubjects(preset.payload.subjects);
    setDailyHours(preset.payload.dailyHours);
    setTotalDays(preset.payload.totalDays);
    setTargetGoal(preset.payload.targetGoal);
    setWeakAreas(preset.payload.weakAreas);
    setPreferredStudyTime(preset.payload.preferredStudyTime);
    handleGenerate(preset.payload);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            Feature 6 &middot; Time Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Study Planner &amp; Timetable Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate an achievable, burnout-free study schedule tailored to your subjects, available
            hours, and target exam deadlines.
          </p>
        </div>
      </div>

      {/* Input Configuration Card */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs space-y-6">
        {/* Subjects List input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Enrolled Subjects for this Plan
          </label>
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50">
            {subjects.map((sub, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <span>{sub}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(sub)}
                  className="hover:text-red-600 cursor-pointer"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <div className="flex-1 min-w-[200px] flex items-center gap-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
                placeholder="+ Add another course (press Enter)..."
                className="w-full px-2 py-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden font-medium"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick College Presets */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick College Scenarios:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS_PLANNER.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-indigo-700 font-bold">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Sliders & Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Daily Study Hours</label>
              <span className="text-xs font-extrabold text-indigo-600">{dailyHours} hrs / day</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 hr (Light)</span>
              <span>4 hrs (Balanced)</span>
              <span>10 hrs (Crunch)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Plan Duration</label>
            <select
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 cursor-pointer"
            >
              <option value={3}>3 Days (Weekend Sprint)</option>
              <option value={5}>5 Days (School Week)</option>
              <option value={7}>7 Days (1 Week Full Review)</option>
              <option value={10}>10 Days (Pre-Exam Sprint)</option>
              <option value={14}>14 Days (2 Weeks Comprehensive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Academic Goal</label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. Midterm Exams, Finals, Lab Clear"
              className="w-full py-2 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Peak Focus Window
            </label>
            <select
              value={preferredStudyTime}
              onChange={(e) => setPreferredStudyTime(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 cursor-pointer"
            >
              <option value="Early Morning (06:00 AM - 10:00 AM)">Early Morning Fresh</option>
              <option value="Afternoon (01:00 PM - 05:00 PM)">Afternoon Focused</option>
              <option value="Late Afternoon & Evening (04:00 PM - 09:00 PM)">
                Late Afternoon &amp; Evening
              </option>
              <option value="Night Owl (08:00 PM - 12:00 AM)">Night Owl Post-Dinner</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Weak / Priority Topics to Allocate Extra Time
          </label>
          <input
            type="text"
            value={weakAreas}
            onChange={(e) => setWeakAreas(e.target.value)}
            placeholder="e.g. Recursion & Trees, Pointer arithmetic, Karnaugh maps, Calculus chain rule..."
            className="w-full py-2 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-indigo-500"
          />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleGenerate()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Optimizing Study Timetable with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Generate Realistic Study Timetable</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Planner Error</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Output Section */}
      {plan && (
        <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {totalDays}-Day Plan
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {plan.totalStudyHours} Total Hours Scheduled
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {plan.planTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
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

          {/* Strategy Overview */}
          <div className="p-5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              Pacing Strategy &amp; Feasibility
            </span>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {plan.strategyOverview}
            </p>
          </div>

          {/* Subject Time Allocation */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Subject Time Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.subjectAllocation.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{sub.subject}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        sub.priorityLevel?.toLowerCase().includes('high')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {sub.priorityLevel}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-indigo-700">
                    {sub.hoursPerWeek} hrs total allocated
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">{sub.focusFocusReason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Schedule Template with Pomodoro 50/10 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Ideal Daily Schedule Template
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                50m Study &bull; 10m Break Pomodoro
              </span>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {plan.idealDailyScheduleTemplate.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    slot.type === 'break' ? 'bg-amber-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-700 min-w-[150px]">
                      {slot.timeSlot}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        slot.type === 'break'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {slot.type}
                    </span>
                    <span className="font-bold text-slate-900">{slot.activity}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] sm:text-right">
                    {slot.suggestedContent}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day-by-Day Milestone Roadmap */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Day-by-Day Milestone Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.dayByDayRoadmap.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 space-y-3 transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-extrabold text-xs">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{day.focusTheme}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Target Tasks:
                    </div>
                    {day.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start gap-2"
                      >
                        <span className="font-mono text-indigo-700 font-bold shrink-0">
                          {task.duration}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 mr-1">{task.subject}:</span>
                          <span className="text-slate-600">{task.objective}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                    <span className="font-bold">Active Recall Check: </span>
                    {day.endOfDayReview}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Hacks & Burnout Prevention */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-purple-600" />
                Science-Backed Study Hacks
              </div>
              <ul className="space-y-2">
                {plan.studyHacks.map((hack, hIdx) => (
                  <li key={hIdx} className="text-xs text-purple-950 flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{hack}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Coffee className="w-4 h-4 text-amber-600" />
                Burnout Prevention &amp; Energy Care
              </div>
              <ul className="space-y-2">
                {plan.burnoutPreventionTips.map((tip, tIdx) => (
                  <li key={tIdx} className="text-xs text-amber-950 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
