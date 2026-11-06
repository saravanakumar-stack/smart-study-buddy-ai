import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { NotesGenerator } from './components/NotesGenerator';
import { ConceptExplainer } from './components/ConceptExplainer';
import { QuizGenerator } from './components/QuizGenerator';
import { ImportantQuestions } from './components/ImportantQuestions';
import { CodeExplainer } from './components/CodeExplainer';
import { StudyPlanner } from './components/StudyPlanner';
import { SavedDrawer } from './components/SavedDrawer';
import { FeatureId, SavedItem } from './types';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Heart,
  BookOpen,
  ArrowRight,
  BookmarkCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<FeatureId>('dashboard');
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Pre-filled state for jumping into tools from presets
  const [presetNotesTopic, setPresetNotesTopic] = useState<string>('');
  const [presetConcept, setPresetConcept] = useState<string>('');
  const [presetQuizTopic, setPresetQuizTopic] = useState<string>('');
  const [presetQuestionsTopic, setPresetQuestionsTopic] = useState<string>('');
  const [presetCode, setPresetCode] = useState<string>('');
  const [presetCodeLang, setPresetCodeLang] = useState<string>('python');

  // Stored items in localStorage
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem('study_buddy_saved_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track session usage stats
  const [stats, setStats] = useState(() => {
    try {
      const stored = localStorage.getItem('study_buddy_stats');
      return stored
        ? JSON.parse(stored)
        : {
            notesGenerated: 0,
            quizzesCompleted: 0,
            conceptsExplained: 0,
            plansCreated: 0,
          };
    } catch {
      return {
        notesGenerated: 0,
        quizzesCompleted: 0,
        conceptsExplained: 0,
        plansCreated: 0,
      };
    }
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('study_buddy_saved_items', JSON.stringify(savedItems));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [savedItems]);

  useEffect(() => {
    try {
      localStorage.setItem('study_buddy_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [stats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveItem = (itemData: Omit<SavedItem, 'id' | 'timestamp'>) => {
    const newItem: SavedItem = {
      ...itemData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    setSavedItems((prev) => [newItem, ...prev]);
    showToast(`Saved "${newItem.title}" to your Study Library!`);
  };

  const handleDeleteSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    showToast('Item removed from Library.');
  };

  const handleClearAllSaved = () => {
    if (window.confirm('Are you sure you want to clear your saved items?')) {
      setSavedItems([]);
      showToast('All saved materials cleared.');
    }
  };

  const handleLoadSavedItem = (item: SavedItem) => {
    setActiveTab(item.feature);
    if (item.feature === 'notes') {
      setPresetNotesTopic(item.data.title || item.title);
    } else if (item.feature === 'concept') {
      setPresetConcept(item.data.concept || item.title);
    } else if (item.feature === 'quiz') {
      setPresetQuizTopic(item.data.quizData?.topic || item.title);
    } else if (item.feature === 'questions') {
      setPresetQuestionsTopic(item.data.topic || item.title);
    } else if (item.feature === 'code') {
      setPresetCode(item.data.code || '');
      setPresetCodeLang(item.data.language || 'python');
    }
  };

  const handleLaunchPreset = (feature: FeatureId) => {
    setActiveTab(feature);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-3 text-xs font-bold animate-fadeIn border border-slate-700">
          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedItems.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectFeature={(feat) => setActiveTab(feat)}
            onLaunchPreset={handleLaunchPreset}
            stats={stats}
          />
        )}

        {activeTab === 'notes' && (
          <NotesGenerator
            initialTopic={presetNotesTopic}
            onSaveItem={(item) => {
              handleSaveItem(item);
              setStats((prev: any) => ({ ...prev, notesGenerated: prev.notesGenerated + 1 }));
            }}
          />
        )}

        {activeTab === 'concept' && (
          <ConceptExplainer
            initialConcept={presetConcept}
            onSaveItem={(item) => {
              handleSaveItem(item);
              setStats((prev: any) => ({ ...prev, conceptsExplained: prev.conceptsExplained + 1 }));
            }}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizGenerator
            initialTopic={presetQuizTopic}
            onSaveItem={(item) => {
              handleSaveItem(item);
            }}
            onQuizCompleted={() => {
              setStats((prev: any) => ({ ...prev, quizzesCompleted: prev.quizzesCompleted + 1 }));
            }}
          />
        )}

        {activeTab === 'questions' && (
          <ImportantQuestions
            initialTopic={presetQuestionsTopic}
            onSaveItem={handleSaveItem}
          />
        )}

        {activeTab === 'code' && (
          <CodeExplainer
            initialCode={presetCode}
            initialLanguage={presetCodeLang}
            onSaveItem={handleSaveItem}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            onSaveItem={handleSaveItem}
            onPlanCreated={() => {
              setStats((prev: any) => ({ ...prev, plansCreated: prev.plansCreated + 1 }));
            }}
          />
        )}
      </main>

      {/* Saved Drawer */}
      <SavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedItems={savedItems}
        onDeleteItem={handleDeleteSavedItem}
        onClearAll={handleClearAllSaved}
        onLoadItem={handleLoadSavedItem}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-100 text-blue-700">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">Smart Study Buddy AI</span>
            <span>&middot; Generative AI in Higher Education</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('notes')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('concept')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Explainer
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Quiz
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Practice Questions
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Code Walkthrough
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Planner
            </button>
          </div>

          <div className="text-slate-400">
            Powered by Google Gemini 3.8 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}
