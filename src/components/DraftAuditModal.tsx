import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface DraftAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultText?: string;
  courseCode?: string;
  apiKey?: string;
  onRequireKey?: (reason: string) => void;
}

export const DraftAuditModal: React.FC<DraftAuditModalProps> = ({
  isOpen,
  onClose,
  defaultText = '',
  courseCode = 'Course',
  apiKey = '',
  onRequireKey,
}) => {
  const [draftText, setDraftText] = useState(defaultText);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAudit = async () => {
    if (!draftText.trim()) return;

    if (!apiKey.trim()) {
      if (onRequireKey) {
        onRequireKey('audit email drafts');
      }
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/critique', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          draftText,
          course: { courseCode },
          apiKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.critique) {
        setAuditResult(data.critique);
      } else if (data.requiresKey && onRequireKey) {
        onRequireKey(data.error || 'Please provide your Gemini API key.');
      } else {
        setErrorMessage(data.error || 'Failed to complete audit. Please check your API key.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error during draft audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-black">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white flex items-center justify-between border-b border-zinc-200">
          <h2 className="text-sm font-semibold text-black">
            Audit Email Draft
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-600 block">
              Paste your email draft to inspect etiquette and compliance:
            </label>
            <textarea
              rows={6}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Paste email draft here..."
              className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition"
            />
          </div>

          <button
            type="button"
            onClick={handleAudit}
            disabled={!draftText.trim() || loading}
            className="px-4 py-2 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            {loading ? 'Evaluating...' : 'Run Audit'}
          </button>

          {errorMessage && (
            <div className="p-3 bg-zinc-50 border border-zinc-400 text-black rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {auditResult && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-black">Etiquette Rating</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black text-white">
                  {auditResult.overallScore} / 100 ({auditResult.etiquetteRating})
                </span>
              </div>

              {auditResult.strengths && auditResult.strengths.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-black" /> Strengths:
                  </span>
                  <ul className="pl-4 list-disc text-zinc-600 space-y-0.5">
                    {auditResult.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {auditResult.improvements && auditResult.improvements.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-black" /> Recommended Improvements:
                  </span>
                  <ul className="pl-4 list-disc text-zinc-600 space-y-0.5">
                    {auditResult.improvements.map((imp: string, i: number) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-zinc-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
