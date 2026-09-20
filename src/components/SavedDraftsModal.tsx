import React from 'react';
import { X, Bookmark, Trash2, ArrowUpRight } from 'lucide-react';
import { SavedDraft } from '../types';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedDraft[];
  onLoadDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (id: string) => void;
}

export const SavedDraftsModal: React.FC<SavedDraftsModalProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-black">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white flex items-center justify-between border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-black" />
            <h2 className="text-sm font-semibold text-black">
              Saved Drafts ({drafts.length})
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

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {drafts.map((d) => (
            <div
              key={d.id}
              className="p-3.5 rounded-lg border border-zinc-200 bg-white space-y-2 hover:border-zinc-300 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-black block">{d.title}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Subject: {d.subject}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadDraft(d);
                      onClose();
                    }}
                    className="p-1.5 rounded hover:bg-zinc-100 text-black cursor-pointer"
                    title="Load into Editor"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDraft(d.id)}
                    className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-black cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-zinc-600 line-clamp-3 font-mono text-[11px] bg-zinc-50 p-2 rounded border border-zinc-100">
                {d.body}
              </p>
            </div>
          ))}

          {drafts.length === 0 && (
            <p className="text-center py-8 text-zinc-500">
              No saved drafts yet. Click "Save" on any generated letter to bookmark it here.
            </p>
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
