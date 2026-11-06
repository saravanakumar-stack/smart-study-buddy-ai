import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Code2,
  Calendar,
  Bookmark,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { FeatureId } from '../types';

interface NavbarProps {
  activeTab: FeatureId;
  setActiveTab: (tab: FeatureId) => void;
  savedCount: number;
  onOpenSaved: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenSaved,
}) => {
  const navItems: { id: FeatureId; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'notes',
      label: 'AI Notes',
      shortLabel: 'Notes',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'concept',
      label: 'Concept Explainer',
      shortLabel: 'Explainer',
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      id: 'quiz',
      label: 'AI Quiz',
      shortLabel: 'Quiz',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id: 'questions',
      label: 'Practice Questions',
      shortLabel: 'Questions',
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: 'code',
      label: 'Code Explainer',
      shortLabel: 'Code',
      icon: <Code2 className="w-4 h-4" />,
    },
    {
      id: 'planner',
      label: 'Study Planner',
      shortLabel: 'Planner',
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Smart Study Buddy <span className="text-blue-600">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-md">
                  Edu
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Student Learning Assistant &middot; 1st & 2nd Year College
              </p>
            </div>
          </button>

          {/* Nav Items (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Saved Drawer Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSaved}
              className="relative flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
              title="Saved Study Materials"
            >
              <Bookmark className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Saved Library</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Tab Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none -mx-4 px-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
