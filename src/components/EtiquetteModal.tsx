import React, { useState } from 'react';
import { X, CheckSquare, Search } from 'lucide-react';
import { ETIQUETTE_RULES } from '../data/etiquetteRules';

interface EtiquetteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EtiquetteModal: React.FC<EtiquetteModalProps> = ({ isOpen, onClose }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const filteredRules = ETIQUETTE_RULES.filter((rule) => {
    const matchesCat = filterCategory === 'All' || rule.category === filterCategory;
    const matchesSearch =
      !search ||
      rule.title.toLowerCase().includes(search.toLowerCase()) ||
      rule.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-black">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white flex items-center justify-between border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-black" />
            <h2 className="text-sm font-semibold text-black">
              Academic Email Etiquette Guide
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {['All', 'Do', 'Don’t', 'Pro Tip'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer text-xs ${
                  filterCategory === cat
                    ? 'bg-black text-white font-medium'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search etiquette rules..."
              className="bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-1 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black w-full sm:w-48 transition"
            />
          </div>
        </div>

        {/* List of rules */}
        <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">{rule.title}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    rule.category === 'Do'
                      ? 'bg-zinc-100 text-black border border-zinc-300'
                      : rule.category === 'Don’t'
                      ? 'bg-black text-white'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {rule.category}
                </span>
              </div>
              <p className="text-zinc-600">{rule.description}</p>
              <div className="p-2 bg-zinc-50 border border-zinc-100 rounded text-[11px] font-mono text-zinc-800">
                {rule.example}
              </div>
            </div>
          ))}

          {filteredRules.length === 0 && (
            <p className="text-center py-6 text-zinc-500">No matching rules found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-zinc-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
