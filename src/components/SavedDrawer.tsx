import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Trash2,
  ExternalLink,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Code2,
  Calendar,
  Download,
} from 'lucide-react';
import { SavedItem, FeatureId } from '../types';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onLoadItem: (item: SavedItem) => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  savedItems,
  onDeleteItem,
  onClearAll,
  onLoadItem,
}) => {
  const [filter, setFilter] = useState<string>('all');

  if (!isOpen) return null;

  const getFeatureIcon = (feature: FeatureId) => {
    switch (feature) {
      case 'notes':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'concept':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'quiz':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'questions':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-sky-600" />;
      case 'planner':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bookmark className="w-4 h-4 text-slate-500" />;
    }
  };

  const filtered =
    filter === 'all' ? savedItems : savedItems.filter((i) => i.feature === filter);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'smart-study-buddy-library.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Saved Study Library</h2>
              <p className="text-xs text-slate-500">
                {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved in browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {savedItems.length > 0 && (
              <button
                onClick={handleExportJSON}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                title="Export as JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'notes', label: 'Notes' },
            { id: 'concept', label: 'Concepts' },
            { id: 'quiz', label: 'Quizzes' },
            { id: 'questions', label: 'Questions' },
            { id: 'code', label: 'Code' },
            { id: 'planner', label: 'Plans' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bookmark className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">No saved items found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click the "Save" button on any generated notes, quiz, practice set, or plan to store it
                here.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                      {getFeatureIcon(item.feature)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {item.feature}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{item.title}</h3>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onLoadItem(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <span>View in Tool</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedItems.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs">
            <span className="text-slate-500 font-medium">Stored in your browser</span>
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
            >
              Clear Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
