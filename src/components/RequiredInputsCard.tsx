import React from 'react';
import {
  PeerConsultationInput,
  ProfessorArchetype,
  StudentUseCaseType,
  SpecificOutputType,
} from '../types';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface RequiredInputsCardProps {
  input: PeerConsultationInput;
  setInput: React.Dispatch<React.SetStateAction<PeerConsultationInput>>;
  onTriggerConsultation: () => void;
  isLoading: boolean;
}

export const RequiredInputsCard: React.FC<RequiredInputsCardProps> = ({
  input,
  setInput,
  onTriggerConsultation,
  isLoading,
}) => {
  const scenarios: { id: StudentUseCaseType; label: string }[] = [
    { id: 'sickness_absence', label: 'Sickness Absence' },
    { id: 'deadline_extension', label: 'Deadline Extension' },
    { id: 'grade_inquiry', label: 'Grade Inquiry' },
    { id: 'recommendation_letter', label: 'Recommendation' },
    { id: 'research_opportunity', label: 'Research Opportunity' },
    { id: 'office_hours_meeting', label: 'Office Hours' },
    { id: 'concept_clarification', label: 'Concept Help' },
    { id: 'follow_up_nudge', label: 'Follow-up Check' },
  ];

  const professorStyles: { id: ProfessorArchetype; label: string; desc: string }[] = [
    { id: 'direct_systems', label: 'Direct & Systems', desc: 'Logic, timelines, accountability, concise' },
    { id: 'formal_traditional', label: 'Formal & Traditional', desc: 'Hierarchy, courteous titles, syllabus' },
    { id: 'busy_concise', label: 'Busy & Concise', desc: 'Under 100 words, direct ask, fast read' },
    { id: 'warm_supportive', label: 'Warm & Mentoring', desc: 'Growth mindset, reflection, open dialogue' },
    { id: 'research_pi', label: 'Research & Rigorous', desc: 'Lab work, papers, technical skills, hours' },
  ];

  const outputOptions: { id: SpecificOutputType; label: string }[] = [
    { id: 'letter_draft', label: 'Letter Draft' },
    { id: 'organized_feedback', label: 'Advice & Policy' },
    { id: 'studio_critique_protocol', label: 'Studio Protocol' },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 text-black shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-black" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-black">
            Situation Parameters
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          Required inputs
        </span>
      </div>

      {/* Scenario Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-zinc-600 block">
          Topic / Scenario
        </label>
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s) => {
            const isSelected = input.useCase === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setInput((prev) => ({ ...prev, useCase: s.id }))}
                className={`px-2.5 py-1 text-xs rounded-md border transition cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white font-medium border-black'
                    : 'bg-white text-zinc-700 hover:text-black border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Professor Style */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-zinc-600 block">
          Faculty Communication Archetype
        </label>
        <div className="flex flex-wrap gap-1.5">
          {professorStyles.map((style) => {
            const isSelected = input.professorStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setInput((prev) => ({ ...prev, professorStyle: style.id }))}
                title={style.desc}
                className={`px-2.5 py-1 text-xs rounded-md border transition cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white font-medium border-black'
                    : 'bg-white text-zinc-700 hover:text-black border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Professor Name & Course Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-600 block">
            Professor Name
          </label>
          <input
            type="text"
            value={input.professorName}
            onChange={(e) => setInput((prev) => ({ ...prev, professorName: e.target.value }))}
            placeholder="e.g. Hugh Dubberly"
            className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-600 block">
            Course Code / Department
          </label>
          <input
            type="text"
            value={input.courseCode}
            onChange={(e) => setInput((prev) => ({ ...prev, courseCode: e.target.value }))}
            placeholder="e.g. DES INV 202"
            className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
          />
        </div>
      </div>

      {/* Initial Ask */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-zinc-600 block">
          Initial Student Ask
        </label>
        <textarea
          rows={2}
          value={input.initialAsk}
          onChange={(e) => setInput((prev) => ({ ...prev, initialAsk: e.target.value }))}
          placeholder="What do you want to ask the professor?"
          className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition leading-relaxed"
        />
      </div>

      {/* Context Details */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-zinc-600 block">
          Details / Context (Optional)
        </label>
        <input
          type="text"
          value={input.additionalInformation}
          onChange={(e) => setInput((prev) => ({ ...prev, additionalInformation: e.target.value }))}
          placeholder="e.g. Fever over 101F, slides handed off to partner, clinic appointment booked"
          className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
        />
      </div>

      {/* Output Type & Submit Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-100 pt-3">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-zinc-500 mr-1.5">Output:</span>
          {outputOptions.map((opt) => {
            const isSelected = input.specificOutput === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setInput((prev) => ({ ...prev, specificOutput: opt.id }))}
                className={`px-2 py-0.5 text-xs rounded border transition cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white font-medium border-black'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onTriggerConsultation}
          disabled={isLoading}
          className="px-4 py-2 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Computing...' : 'Start Consultation'}</span>
        </button>
      </div>
    </div>
  );
};
