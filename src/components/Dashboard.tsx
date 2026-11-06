import React from 'react';
import {
  BookOpen,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Code2,
  Calendar,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  GraduationCap,
  Clock,
  Check,
  BrainCircuit,
  FileText,
  Share2,
} from 'lucide-react';
import { FeatureId } from '../types';

interface DashboardProps {
  onSelectFeature: (feature: FeatureId) => void;
  onLaunchPreset: (feature: FeatureId, presetData?: any) => void;
  stats: {
    notesGenerated: number;
    quizzesCompleted: number;
    conceptsExplained: number;
    plansCreated: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectFeature,
  onLaunchPreset,
  stats,
}) => {
  const features = [
    {
      id: 'notes' as FeatureId,
      title: '1. AI Notes Generator',
      badge: 'High Yield',
      description:
        'Transform complex college syllabus topics into crisp, structured revision notes with formal definitions, simplified breakdowns, and key takeaways.',
      bullets: [
        'Structured headings & definitions',
        'Real-world examples & analogies',
        'Common exam traps & self-check questions',
      ],
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      colorClass: 'from-blue-500/10 to-indigo-500/10 border-blue-200 hover:border-blue-400',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      sampleTopic: 'Binary Search Trees (BST) & Traversals',
    },
    {
      id: 'concept' as FeatureId,
      title: '2. Simple Concept Explainer',
      badge: 'Zero Jargon',
      description:
        'Stuck on an intimidating technical topic? Get beginner-friendly analogies and step-by-step visual metaphors that make difficult concepts click.',
      bullets: [
        'Everyday analogies & mental models',
        'Step-by-step beginner walkthrough',
        'Common doubts & FAQ clarifications',
      ],
      icon: <Lightbulb className="w-6 h-6 text-amber-500" />,
      colorClass: 'from-amber-500/10 to-orange-500/10 border-amber-200 hover:border-amber-400',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      sampleTopic: 'Pointers & Memory Addresses in C',
    },
    {
      id: 'quiz' as FeatureId,
      title: '3. AI Quiz Generator',
      badge: 'Interactive',
      description:
        'Test your comprehension with 5 curated multiple-choice questions complete with instant feedback, hints, and in-depth answer explanations.',
      bullets: [
        '5 tailored MCQs with 4 options',
        'Instant scoring and feedback',
        'Hints and comprehensive justifications',
      ],
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      colorClass: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 hover:border-emerald-400',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      sampleTopic: 'Array vs Linked List Complexity',
    },
    {
      id: 'questions' as FeatureId,
      title: '4. Practice Question Generator',
      badge: 'Exam Practice',
      description:
        'Curate focused 2-mark short questions, 5-mark mechanism questions, and 10-mark application questions for thorough revision.',
      bullets: [
        '2-mark, 5-mark, and 10-mark breakdown',
        'Model answer keys and scoring tips',
        'Revision guide (not guaranteed exam leaks)',
      ],
      icon: <HelpCircle className="w-6 h-6 text-purple-600" />,
      colorClass: 'from-purple-500/10 to-pink-500/10 border-purple-200 hover:border-purple-400',
      buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      sampleTopic: 'Normalization in DBMS (1NF to BCNF)',
    },
    {
      id: 'code' as FeatureId,
      title: '5. Code Explainer',
      badge: 'Python • C • Java • HTML',
      description:
        'Paste any beginner or intermediate program and inspect it line by line to understand memory, execution flow, and avoid beginner bugs.',
      bullets: [
        'Line-by-line syntax breakdown',
        'Step-by-step CPU & memory execution flow',
        'Common beginner pitfalls & best practices',
      ],
      icon: <Code2 className="w-6 h-6 text-sky-600" />,
      colorClass: 'from-sky-500/10 to-cyan-500/10 border-sky-200 hover:border-sky-400',
      buttonClass: 'bg-sky-600 hover:bg-sky-700 text-white',
      sampleTopic: 'Recursive Fibonacci in Python',
    },
    {
      id: 'planner' as FeatureId,
      title: '6. Smart Study Planner',
      badge: 'Pomodoro',
      description:
        'Generate an actionable, realistic study timetable based on your enrolled subjects, daily study hours, target deadlines, and weak areas.',
      bullets: [
        'Daily Pomodoro study/rest time slots',
        'Subject weightage by difficulty',
        'Spaced repetition roadmap & burnout advice',
      ],
      icon: <Calendar className="w-6 h-6 text-indigo-600" />,
      colorClass: 'from-indigo-500/10 to-violet-500/10 border-indigo-200 hover:border-indigo-400',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      sampleTopic: 'Semester Midterm 7-Day Plan',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-8 sm:p-12 shadow-xl shadow-blue-900/15">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Designed for 1st &amp; 2nd Year College Students
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Master College Subjects <br />
            <span className="text-blue-200">Without the Overwhelm.</span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 leading-relaxed font-normal max-w-2xl">
            Smart Study Buddy AI turns intimidating textbooks, abstract code, and heavy exam syllabi
            into clear revision notes, intuitive analogies, interactive quizzes, and realistic study
            timetables.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectFeature('notes')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-lg shadow-black/10 hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onSelectFeature('quiz')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-sm border border-white/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Take a Quick Quiz</span>
            </button>
          </div>
        </div>

        {/* Quick Session Stats Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-blue-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{stats.notesGenerated}</div>
              <div className="text-xs text-blue-200">Notes Generated</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-blue-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{stats.quizzesCompleted}</div>
              <div className="text-xs text-blue-200">Quizzes Taken</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-blue-200">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{stats.conceptsExplained}</div>
              <div className="text-xs text-blue-200">Concepts Simplified</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-blue-200">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{stats.plansCreated}</div>
              <div className="text-xs text-blue-200">Plans Structured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Feature Cards Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Core Toolset
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Six Purpose-Built AI Study Assistants
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Pick a tool below or jump directly into a topic with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`flex flex-col justify-between p-6 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all duration-200 group ${feature.colorClass}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white shadow-xs border border-slate-100 group-hover:scale-105 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {feature.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  {feature.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => onSelectFeature(feature.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${feature.buttonClass}`}
                >
                  <span>Open {feature.title.split('. ')[1]}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onLaunchPreset(feature.id)}
                  className="w-full py-1.5 text-center text-[11px] font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors cursor-pointer"
                >
                  Try sample: <span className="underline italic">{feature.sampleTopic}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* College Study Tips Section */}
      <section className="rounded-2xl bg-white border border-blue-100 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Evidence-Based Study Tips for Freshmen &amp; Sophomores
            </h3>
            <p className="text-xs text-slate-500">
              How top college students study efficiently without all-nighters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Rule 1: Active Recall
            </div>
            <h4 className="text-sm font-bold text-slate-900">Stop Re-reading Passively</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Close your textbook and explain the concept out loud or take our 5-MCQ quiz. Testing
              yourself builds 3x stronger neural connections than highlighting notes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Rule 2: The 50/10 Rhythm
            </div>
            <h4 className="text-sm font-bold text-slate-900">Sustainable Deep Work</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Study intensely for 50 minutes with your phone in another room, followed by a strict
              10-minute walk or screen-free break. Never cram for 4 hours nonstop.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Rule 3: Feynman Technique
            </div>
            <h4 className="text-sm font-bold text-slate-900">Explain Like to a 10-Year-Old</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use our Concept Explainer to find intuitive metaphors. If you cannot explain recursion
              or pointers using a simple kitchen or phone analogy, you don't fully own it yet.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Rule 4: Target Marking Schemes
            </div>
            <h4 className="text-sm font-bold text-slate-900">Know Your Professor's Rubric</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use our Practice Question Generator to practice 2-mark definitions and 10-mark essay
              blueprints. College grading rewards precise diagrams and bulleted points.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
