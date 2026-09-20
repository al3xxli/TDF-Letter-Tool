import React from 'react';
import { X, BookOpen, CheckCircle, ShieldAlert } from 'lucide-react';

interface RoleCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleCardModal: React.FC<RoleCardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-black">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white flex items-center justify-between border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-black" />
            <h2 className="text-sm font-semibold text-black">
              System Rules &amp; Role Card
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-800 leading-relaxed">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black block">
              Core Principles
            </span>
            <ul className="space-y-1.5 pl-4 list-disc text-zinc-700">
              <li>
                <strong>Informational, not conversational:</strong> Clear, actionable peer guidance without empty pleasantries.
              </li>
              <li>
                <strong>Single Short Paragraph:</strong> Responses are strictly constrained to 2 to 4 sentences.
              </li>
              <li>
                <strong>No Name Address:</strong> Never uses personal names in greetings to maintain natural peer flow.
              </li>
              <li>
                <strong>Peer Opinion Phrasing:</strong> Uses natural conversational framing (<em>"I think"</em>, <em>"I would"</em>, <em>"I know"</em>).
              </li>
              <li>
                <strong>Max 1 Question:</strong> Strict limit of at most one diagnostic inquiry exclusively in Step 2.
              </li>
            </ul>
          </div>

          <div className="space-y-1 border-t border-zinc-100 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black block">
              4-Step Interaction Protocol
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span className="font-semibold text-black block">1. Suggestion</span>
                <span className="text-zinc-500">High-level advice</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span className="font-semibold text-black block">2. Details</span>
                <span className="text-zinc-500">Diagnostic inquiry</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span className="font-semibold text-black block">3. Advice</span>
                <span className="text-zinc-500">Policy alignment</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span className="font-semibold text-black block">4. Alternatives</span>
                <span className="text-zinc-500">Backup options</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 border-t border-zinc-100 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black block">
              System Boundaries
            </span>
            <ul className="space-y-1 pl-4 list-disc text-zinc-600">
              <li>Refrains from emotional drama or oversharing medical records.</li>
              <li>Encourages accountability, clear return dates, and syllabus compliance.</li>
              <li>Adapts tone according to the selected faculty communication archetype.</li>
            </ul>
          </div>
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
