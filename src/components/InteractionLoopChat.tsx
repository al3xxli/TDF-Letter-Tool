import React, { useState } from 'react';
import {
  PeerMessage,
  InteractionLoopStep,
  StudentUseCaseType,
} from '../types';
import { MessageSquare, RotateCcw, Send } from 'lucide-react';

interface InteractionLoopChatProps {
  messages: PeerMessage[];
  currentStep: InteractionLoopStep;
  isLoading: boolean;
  professorName: string;
  useCase: StudentUseCaseType;
  onSendReply: (text: string) => void;
  onJumpToStep: (step: InteractionLoopStep) => void;
  onResetDialogue: () => void;
}

export const InteractionLoopChat: React.FC<InteractionLoopChatProps> = ({
  messages,
  currentStep,
  isLoading,
  professorName,
  useCase,
  onSendReply,
  onJumpToStep,
  onResetDialogue,
}) => {
  const [inputText, setInputText] = useState('');

  const stepDefinitions: { step: InteractionLoopStep; label: string }[] = [
    { step: 1, label: '1. Suggestion' },
    { step: 2, label: '2. Details' },
    { step: 3, label: '3. Advice' },
    { step: 4, label: '4. Alternatives' },
  ];

  const getDiagnosticSuggestions = (): string[] => {
    switch (useCase) {
      case 'deadline_extension':
        return [
          'Need 48 hours extra, draft is 75% complete',
          'Hit unexpected code bug, proposing Friday 5pm submission',
          'Stuck on final analytical section, requesting 2-day extension',
        ];
      case 'grade_inquiry':
        return [
          'Questions regarding rubric item #3 on methodology deductions',
          'Want to clarify expectations on the midterm essay thesis',
          'Seeking feedback on problem #4 to master concepts for final',
        ];
      case 'recommendation_letter':
        return [
          'Submitting graduate application, deadline in 4 weeks',
          'Applying for summer research fellowship, CV attached',
        ];
      case 'research_opportunity':
        return [
          'Can commit 12 hours/week, strong Python and lab background',
          'Read your recent paper, eager to assist with data modeling',
        ];
      case 'office_hours_meeting':
        return [
          'Need 15 minutes to review project architecture',
          'Available Tuesday 2-4pm or Thursday morning',
        ];
      case 'concept_clarification':
        return [
          'Stuck on week 4 lecture derivation and textbook theorem 3.2',
          'Attempted practice problem 6 but divergent outcome from syllabus',
        ];
      case 'follow_up_nudge':
        return [
          'Sent initial message 5 business days ago regarding research',
          'Checking in before the upcoming submission window closes',
        ];
      case 'sickness_absence':
      default:
        return [
          'High fever, bedridden for 48 hours',
          'Visiting health clinic urgent care for verification',
          'Partner notified and presenting our slides',
        ];
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendReply(inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 text-black shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-black" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-black">
            Dialogue Loop
          </h2>
        </div>
        <button
          type="button"
          onClick={onResetDialogue}
          className="text-xs text-zinc-500 hover:text-black transition cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 4-Step Progress Segmented Bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {stepDefinitions.map((def) => {
          const isActive = currentStep === def.step;
          const isPassed = currentStep > def.step;
          return (
            <button
              key={def.step}
              type="button"
              onClick={() => onJumpToStep(def.step)}
              className={`py-1.5 px-2 rounded-md border text-center transition cursor-pointer text-xs font-medium ${
                isActive
                  ? 'border-black bg-black text-white'
                  : isPassed
                  ? 'border-zinc-300 bg-zinc-100 text-black'
                  : 'border-zinc-200 bg-white text-zinc-400'
              }`}
            >
              {def.label}
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="space-y-3 min-h-[160px] max-h-[340px] overflow-y-auto p-3 rounded-lg border border-zinc-200 bg-white">
        {messages.map((msg) => {
          const isPeer = msg.sender === 'peer';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isPeer ? 'items-start' : 'items-end'}`}
            >
              <span className="text-[10px] text-zinc-400 mb-0.5">
                {isPeer ? 'Assistant' : 'You'} • Step {msg.step}
              </span>
              <div
                className={`max-w-[88%] rounded-lg p-3 text-xs leading-relaxed ${
                  isPeer
                    ? 'bg-zinc-100 text-black border border-zinc-200'
                    : 'bg-black text-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-zinc-100 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-600">
              Formulating response...
            </div>
          </div>
        )}
      </div>

      {/* Step 2 Diagnostic Chips */}
      {currentStep === 2 && (
        <div className="p-3 border border-zinc-200 rounded-lg space-y-1.5 bg-zinc-50">
          <span className="text-[11px] font-semibold text-zinc-600 block">
            Suggested details:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {getDiagnosticSuggestions().map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendReply(item)}
                className="text-xs bg-white hover:bg-zinc-100 text-black border border-zinc-200 px-2.5 py-1 rounded-md transition cursor-pointer text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Field */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Reply regarding ${professorName}...`}
          className="flex-1 text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-3.5 py-2 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
