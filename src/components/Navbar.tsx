import React from 'react';
import { Network, BookOpen, CheckSquare, Bookmark, FileText, Key } from 'lucide-react';

interface NavbarProps {
  activeTab: 'workspace' | 'diagram';
  setActiveTab: (tab: 'workspace' | 'diagram') => void;
  onOpenRules: () => void;
  onOpenEtiquette: () => void;
  onOpenAudit: () => void;
  onOpenSaved: () => void;
  onOpenApiKey: () => void;
  hasApiKey: boolean;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenRules,
  onOpenEtiquette,
  onOpenAudit,
  onOpenSaved,
  onOpenApiKey,
  hasApiKey,
  savedCount,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-black">
              Professor Assistant
            </span>
            <span className="text-zinc-300">|</span>
            <span className="text-xs text-zinc-500 font-mono">
              Berkeley MDes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main View Switcher */}
          <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-white text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'workspace'
                  ? 'bg-black text-white'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'diagram'
                  ? 'bg-black text-white'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Logic Map</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block" />

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={onOpenRules}
              className="px-2.5 py-1 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-black font-medium transition cursor-pointer hidden md:flex items-center gap-1"
              title="System Rules and Role Card"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Rules</span>
            </button>

            <button
              type="button"
              onClick={onOpenEtiquette}
              className="px-2.5 py-1 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-black font-medium transition cursor-pointer hidden sm:flex items-center gap-1"
              title="Academic Etiquette Guide"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Etiquette</span>
            </button>

            <button
              type="button"
              onClick={onOpenAudit}
              className="px-2.5 py-1 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-black font-medium transition cursor-pointer flex items-center gap-1"
              title="Audit Custom Draft"
            >
              <span>Audit</span>
            </button>

            <button
              type="button"
              onClick={onOpenSaved}
              className="px-2.5 py-1 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-black font-medium transition cursor-pointer flex items-center gap-1"
              title="Saved Drafts"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedCount})</span>
            </button>

            {/* API Key Manager Button */}
            <button
              id="btn-navbar-api-key"
              type="button"
              onClick={onOpenApiKey}
              className={`px-2.5 py-1 border rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                hasApiKey
                  ? 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900'
                  : 'border-black bg-black text-white hover:bg-zinc-800'
              }`}
              title={hasApiKey ? 'Gemini API key configured in localStorage' : 'Gemini API key required'}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{hasApiKey ? 'API Key' : 'Set Key'}</span>
              {hasApiKey ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
