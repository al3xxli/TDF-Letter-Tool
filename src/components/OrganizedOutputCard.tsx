import React, { useState } from 'react';
import {
  OrganizedFeedbackOutput,
  StudentUseCaseType,
} from '../types';
import { Copy, Check, Mail, Bookmark, RotateCw, ShieldCheck } from 'lucide-react';

interface OrganizedOutputCardProps {
  output: OrganizedFeedbackOutput | null;
  isLoading: boolean;
  professorName: string;
  courseCode: string;
  useCase: StudentUseCaseType;
  onRefresh: () => void;
  onSaveDraft: (title: string, subject: string, body: string) => void;
}

export const OrganizedOutputCard: React.FC<OrganizedOutputCardProps> = ({
  output,
  isLoading,
  professorName,
  courseCode,
  useCase,
  onRefresh,
  onSaveDraft,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editableBody, setEditableBody] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center space-y-3 text-black shadow-xs">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-black">
          Generating Letter &amp; Policies...
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Calibrating communication style, academic etiquette, and university policies.
        </p>
      </div>
    );
  }

  if (!output) return null;

  const activeDraft = output.letterDraft || output.letterDraftToHugh || {
    subject: `[${courseCode}] Coursework Communication - Student Update`,
    recipient: professorName,
    body: '',
    noteOnTone: 'Direct and respectful.',
  };

  const recipientDisplay = activeDraft.recipient || professorName;
  const currentBody = editableBody ?? activeDraft.body;

  const handleCopy = () => {
    const fullText = `Subject: ${activeDraft.subject}\nTo: ${recipientDisplay}\n\n${currentBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMail = () => {
    const subject = encodeURIComponent(activeDraft.subject);
    const body = encodeURIComponent(currentBody);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSave = () => {
    const title = `${useCase.replace(/_/g, ' ')} - ${professorName}`;
    onSaveDraft(title, activeDraft.subject, currentBody);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-5 text-black shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-black" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-black">
            Generated Letter &amp; Strategy
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs text-zinc-600 hover:text-black px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 transition cursor-pointer flex items-center gap-1"
        >
          <RotateCw className="w-3 h-3" />
          <span>Regenerate</span>
        </button>
      </div>

      {/* 1. Recommendation */}
      <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-black block">
          Recommendation
        </span>
        <p className="text-xs text-zinc-800 leading-relaxed">
          {output?.initialRecommendation}
        </p>
      </div>

      {/* 2. Letter Draft Box */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            Draft: {recipientDisplay}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSave}
              className="px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-100 text-black text-xs font-medium transition cursor-pointer flex items-center gap-1"
            >
              <Bookmark className="w-3 h-3" />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-100 text-black text-xs font-medium transition cursor-pointer flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenMail}
              className="px-2.5 py-1 rounded-md bg-black hover:bg-zinc-800 text-white text-xs font-medium transition cursor-pointer flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              <span>Mail Client</span>
            </button>
          </div>
        </div>

        {/* Email Meta */}
        <div className="p-3 rounded-lg border border-zinc-200 bg-white space-y-1.5 text-xs">
          <div className="flex items-baseline gap-2 border-b border-zinc-100 pb-1.5">
            <span className="text-zinc-500 w-14">To:</span>
            <span className="font-medium text-black">
              {recipientDisplay} &lt;{courseCode}&gt;
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-500 w-14">Subject:</span>
            <span className="font-medium text-black">{activeDraft.subject}</span>
          </div>
        </div>

        {/* Editable Email Body */}
        <textarea
          rows={9}
          value={currentBody}
          onChange={(e) => setEditableBody(e.target.value)}
          className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-3.5 text-black focus:outline-none focus:border-black leading-relaxed transition"
        />

        {/* Note on Tone */}
        {activeDraft.noteOnTone && (
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <strong className="text-black">Tone Calibration:</strong> {activeDraft.noteOnTone}
          </p>
        )}
      </div>

      {/* 3. Policy Guidelines */}
      <div className="space-y-2.5 border-t border-zinc-100 pt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-black block">
          Policy Guidelines &amp; Protocol
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span className="font-semibold text-black block">Primary Policy</span>
            <p className="text-zinc-600 leading-relaxed">
              {output.policyGuidelines?.primaryPolicy ||
                output.berkeleyPolicyAndResources.mdesStudioAttendance}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span className="font-semibold text-black block">Coordination</span>
            <p className="text-zinc-600 leading-relaxed">
              {output.policyGuidelines?.academicProcedure ||
                output.berkeleyPolicyAndResources.studioPartnerCoordination}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span className="font-semibold text-black block">Documentation</span>
            <p className="text-zinc-600 leading-relaxed">
              {output.policyGuidelines?.documentationRequirement ||
                output.berkeleyPolicyAndResources.tangCenterGuidelines}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span className="font-semibold text-black block">Timeline</span>
            <p className="text-zinc-600 leading-relaxed">
              {output.policyGuidelines?.communicationWindow ||
                output.berkeleyPolicyAndResources.dspAndDeanNotice}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Alternatives */}
      {output.alternativeOptions && output.alternativeOptions.length > 0 && (
        <div className="space-y-2 border-t border-zinc-100 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-black block">
            Alternative Solutions
          </span>
          <div className="space-y-1.5">
            {output.alternativeOptions.map((alt, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-black flex items-start gap-2"
              >
                <span className="font-mono text-zinc-500">{idx + 1}.</span>
                <p className="leading-relaxed">{alt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
