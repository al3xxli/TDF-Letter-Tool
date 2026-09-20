import React, { useState, useEffect } from 'react';
import {
  PeerConsultationInput,
  PeerMessage,
  InteractionLoopStep,
  OrganizedFeedbackOutput,
  SavedDraft,
} from './types';
import { Navbar } from './components/Navbar';
import { RequiredInputsCard } from './components/RequiredInputsCard';
import { InteractionLoopChat } from './components/InteractionLoopChat';
import { OrganizedOutputCard } from './components/OrganizedOutputCard';
import { SystemDiagram } from './components/SystemDiagram';
import { RoleCardModal } from './components/RoleCardModal';
import { EtiquetteModal } from './components/EtiquetteModal';
import { DraftAuditModal } from './components/DraftAuditModal';
import { SavedDraftsModal } from './components/SavedDraftsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Key } from 'lucide-react';

const DEFAULT_INPUT: PeerConsultationInput = {
  professorName: 'Professor Hugh Dubberly',
  courseCode: 'DES INV 202',
  professorStyle: 'direct_systems',
  useCase: 'sickness_absence',
  initialAsk: 'I am sick and cannot make it to studio critique today. I want to let the professor know without sounding unprofessional.',
  specificOutput: 'letter_draft',
  additionalInformation: 'Fever over 101F, slides handed off to partner, urgent care appointment booked',
};

const DEFAULT_INITIAL_MSG: PeerMessage = {
  id: 'init-1',
  sender: 'peer',
  text: "I think sending a short heads-up note before class starts is the way to go, focusing strictly on when you expect to return and letting the instructor know your studio partner is briefed so project momentum doesn't stall.",
  step: 1,
  timestamp: Date.now(),
};

const DEFAULT_OUTPUT: OrganizedFeedbackOutput = {
  initialRecommendation:
    'I think sending a concise heads-up note before studio begins, confirming that your project partner is briefed and giving your estimated return date, will reassure Hugh that design momentum is maintained.',
  letterDraftToHugh: {
    subject: '[DES INV 202] Absence Notice & Studio Handoff - [Your Name]',
    recipient: 'Professor Hugh Dubberly',
    body: `Dear Professor Dubberly,\n\nI am writing to inform you that I will be absent from today's studio session due to acute illness. I am following university health guidelines and isolating to avoid spreading illness to the cohort.\n\nTo ensure our team's critique is uninterrupted, I have handed off our latest Figma iteration and slide deck to my partner [Partner Name], who is fully prepared to lead our presentation.\n\nI will complete the asynchronous reflection on our Miro board and expect to return by [Date]. Please let me know if any further documentation is needed.\n\nSincerely,\n[Your Full Name]\n[Student ID]`,
    noteOnTone:
      'Direct, zero emotional drama, emphasizes immediate team accountability, deliverables continuity, and concrete return timeline.',
  },
  letterDraft: {
    subject: '[DES INV 202] Absence Notice & Studio Handoff - [Your Name]',
    recipient: 'Professor Hugh Dubberly',
    body: `Dear Professor Dubberly,\n\nI am writing to inform you that I will be absent from today's studio session due to acute illness. I am following university health guidelines and isolating to avoid spreading illness to the cohort.\n\nTo ensure our team's critique is uninterrupted, I have handed off our latest Figma iteration and slide deck to my partner [Partner Name], who is fully prepared to lead our presentation.\n\nI will complete the asynchronous reflection on our Miro board and expect to return by [Date]. Please let me know if any further documentation is needed.\n\nSincerely,\n[Your Full Name]\n[Student ID]`,
    noteOnTone:
      'Direct, zero emotional drama, emphasizes immediate team accountability, deliverables continuity, and concrete return timeline.',
  },
  berkeleyPolicyAndResources: {
    tangCenterGuidelines:
      'Visit UHS Tang Center or use eTang for urgent care visit verification.',
    mdesStudioAttendance:
      'MDes studio policy requires notifying faculty prior to class start.',
    studioPartnerCoordination:
      'Ensure team presentations have all assets transferred before review begins.',
    dspAndDeanNotice:
      'Absences exceeding 3 consecutive studio sessions require graduate advisor notification.',
  },
  policyGuidelines: {
    primaryPolicy:
      'MDes studio policy requires notifying faculty prior to class start.',
    academicProcedure:
      'Ensure team presentations have all assets transferred before review begins.',
    documentationRequirement:
      'Visit UHS Tang Center or use eTang for urgent care visit verification.',
    communicationWindow:
      'Absences exceeding 3 consecutive studio sessions require graduate advisor notification.',
  },
  alternativeOptions: [
    'Leave asynchronous critique stickies on the team Miro board during recovery.',
    'Ask your studio teammate to record faculty audio feedback during your group slot.',
    'Schedule a 5-minute check-in during Thursday office hours to review progress.',
  ],
};

export default function App() {
  const [input, setInput] = useState<PeerConsultationInput>(DEFAULT_INPUT);
  const [messages, setMessages] = useState<PeerMessage[]>([DEFAULT_INITIAL_MSG]);
  const [currentStep, setCurrentStep] = useState<InteractionLoopStep>(1);
  const [organizedOutput, setOrganizedOutput] = useState<OrganizedFeedbackOutput | null>(DEFAULT_OUTPUT);

  const [activeTab, setActiveTab] = useState<'workspace' | 'diagram'>('workspace');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isOutputLoading, setIsOutputLoading] = useState(false);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isEtiquetteOpen, setIsEtiquetteOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  // Saved Drafts
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(() => {
    try {
      const stored = localStorage.getItem('saved_professor_drafts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // User-provided API key strictly in localStorage
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('user_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyPromptMessage, setApiKeyPromptMessage] = useState<string | null>(null);

  const handleSaveApiKey = (newKey: string) => {
    const trimmed = newKey.trim();
    setApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('user_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('user_gemini_api_key');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const requireApiKey = (reason = 'proceed'): boolean => {
    if (!apiKey || !apiKey.trim()) {
      setApiKeyPromptMessage(`A Gemini API key is required to ${reason}. Please enter your key below.`);
      setIsApiKeyModalOpen(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    try {
      localStorage.setItem('saved_professor_drafts', JSON.stringify(savedDrafts));
    } catch (e) {
      console.error(e);
    }
  }, [savedDrafts]);

  // Start Consultation
  const handleStartConsultation = async () => {
    if (!requireApiKey('start consultation and draft your email')) {
      return;
    }

    setIsChatLoading(true);
    setIsOutputLoading(true);
    setCurrentStep(1);

    try {
      // 1. Fetch Step 1 Chat Advice
      const chatRes = await fetch('/api/peer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          step: 1,
          initialAsk: input.initialAsk,
          specificOutput: input.specificOutput,
          additionalInformation: input.additionalInformation,
          professorName: input.professorName,
          courseCode: input.courseCode,
          professorStyle: input.professorStyle,
          useCase: input.useCase,
          apiKey,
        }),
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok && chatData.requiresKey) {
        setApiKeyPromptMessage(chatData.error || 'Please provide a valid Gemini API key.');
        setIsApiKeyModalOpen(true);
        return;
      }
      if (chatData.reply) {
        setMessages([
          {
            id: `msg-${Date.now()}`,
            sender: 'peer',
            text: chatData.reply,
            step: 1,
            timestamp: Date.now(),
          },
        ]);
      }

      // 2. Fetch Structured Output & Letter
      const outRes = await fetch('/api/peer/organized-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          initialAsk: input.initialAsk,
          specificOutput: input.specificOutput,
          additionalInformation: input.additionalInformation,
          professorName: input.professorName,
          courseCode: input.courseCode,
          professorStyle: input.professorStyle,
          useCase: input.useCase,
          apiKey,
        }),
      });
      const outData = await outRes.json();
      if (!outRes.ok && outData.requiresKey) {
        setApiKeyPromptMessage(outData.error || 'Please provide a valid Gemini API key.');
        setIsApiKeyModalOpen(true);
        return;
      }
      if (outData.output) {
        setOrganizedOutput(outData.output);
      }
    } catch (err) {
      console.error('Consultation error:', err);
    } finally {
      setIsChatLoading(false);
      setIsOutputLoading(false);
    }
  };

  // Send reply in chat loop
  const handleSendReply = async (userText: string) => {
    if (!requireApiKey('send chat messages to the peer assistant')) {
      return;
    }

    const nextStep = Math.min(4, currentStep + 1) as InteractionLoopStep;

    const userMsg: PeerMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      step: currentStep,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);
    setCurrentStep(nextStep);

    try {
      const res = await fetch('/api/peer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          step: nextStep,
          initialAsk: input.initialAsk,
          additionalInformation: input.additionalInformation,
          userMessage: userText,
          professorName: input.professorName,
          courseCode: input.courseCode,
          professorStyle: input.professorStyle,
          useCase: input.useCase,
          apiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok && data.requiresKey) {
        setApiKeyPromptMessage(data.error || 'Please provide a valid Gemini API key.');
        setIsApiKeyModalOpen(true);
        return;
      }
      if (data.reply) {
        const peerMsg: PeerMessage = {
          id: `peer-${Date.now()}`,
          sender: 'peer',
          text: data.reply,
          step: nextStep,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, peerMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Jump to specific step
  const handleJumpToStep = async (step: InteractionLoopStep) => {
    if (!requireApiKey('consult peer on this step')) {
      return;
    }

    setCurrentStep(step);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/peer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey,
        },
        body: JSON.stringify({
          step,
          initialAsk: input.initialAsk,
          additionalInformation: input.additionalInformation,
          professorName: input.professorName,
          courseCode: input.courseCode,
          professorStyle: input.professorStyle,
          useCase: input.useCase,
          apiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok && data.requiresKey) {
        setApiKeyPromptMessage(data.error || 'Please provide a valid Gemini API key.');
        setIsApiKeyModalOpen(true);
        return;
      }
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `peer-${Date.now()}`,
            sender: 'peer',
            text: data.reply,
            step,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetDialogue = () => {
    setCurrentStep(1);
    setMessages([DEFAULT_INITIAL_MSG]);
  };

  const handleSaveDraft = (title: string, subject: string, body: string) => {
    const newDraft: SavedDraft = {
      id: `draft-${Date.now()}`,
      scenario: 'custom',
      title,
      subject,
      body,
      professorName: input.professorName,
      courseCode: input.courseCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSavedDrafts((prev) => [newDraft, ...prev]);
  };

  const handleDeleteDraft = (id: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    if (organizedOutput) {
      setOrganizedOutput({
        ...organizedOutput,
        letterDraft: {
          subject: draft.subject,
          recipient: draft.professorName || input.professorName,
          body: draft.body,
          noteOnTone: 'Restored from saved draft.',
        },
      });
    }
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased selection:bg-black selection:text-white">
      {/* Top Banner Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenEtiquette={() => setIsEtiquetteOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenApiKey={() => {
          setApiKeyPromptMessage(null);
          setIsApiKeyModalOpen(true);
        }}
        hasApiKey={Boolean(apiKey.trim())}
        savedCount={savedDrafts.length}
      />

      {/* API Key Required Banner */}
      {!apiKey.trim() && (
        <div
          id="api-key-warning-banner"
          className="bg-black text-white px-4 sm:px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-zinc-300 shrink-0" />
            <p className="leading-snug">
              <span className="font-bold">API Key Required:</span> Please provide your personal Google Gemini API key to run consultations and draft emails. Your key stays saved strictly in your browser&apos;s local storage.
            </p>
          </div>
          <button
            id="btn-banner-set-key"
            type="button"
            onClick={() => {
              setApiKeyPromptMessage(null);
              setIsApiKeyModalOpen(true);
            }}
            className="bg-white text-black font-semibold px-3 py-1 rounded text-xs hover:bg-zinc-200 transition shrink-0 cursor-pointer"
          >
            Enter API Key
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'diagram' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('workspace')}
                className="text-xs font-medium text-black hover:underline cursor-pointer"
              >
                &larr; Return to Editor
              </button>
              <span className="text-xs text-zinc-500 font-mono">
                System Synthesis Architecture
              </span>
            </div>

            <SystemDiagram
              currentInput={input}
              currentStep={currentStep}
              onReturnToEditor={() => setActiveTab('workspace')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Parameters & Chat Loop */}
            <div className="lg:col-span-6 space-y-6">
              <RequiredInputsCard
                input={input}
                setInput={setInput}
                onTriggerConsultation={handleStartConsultation}
                isLoading={isChatLoading || isOutputLoading}
              />

              <InteractionLoopChat
                messages={messages}
                currentStep={currentStep}
                isLoading={isChatLoading}
                professorName={input.professorName}
                useCase={input.useCase}
                onSendReply={handleSendReply}
                onJumpToStep={handleJumpToStep}
                onResetDialogue={handleResetDialogue}
              />
            </div>

            {/* Right Column: Letter Draft & Guidelines */}
            <div className="lg:col-span-6 space-y-6">
              <OrganizedOutputCard
                output={organizedOutput}
                isLoading={isOutputLoading}
                professorName={input.professorName}
                courseCode={input.courseCode}
                useCase={input.useCase}
                onRefresh={handleStartConsultation}
                onSaveDraft={handleSaveDraft}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-3.5 px-4 sm:px-6 text-xs text-zinc-400 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>Letter &amp; Email Assistant</span>
          <span>UC Berkeley MDes</span>
        </div>
      </footer>

      {/* Modals */}
      <RoleCardModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <EtiquetteModal
        isOpen={isEtiquetteOpen}
        onClose={() => setIsEtiquetteOpen(false)}
      />

      <DraftAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        defaultText={organizedOutput?.letterDraft?.body || ''}
        courseCode={input.courseCode}
        apiKey={apiKey}
        onRequireKey={(reason) => {
          setApiKeyPromptMessage(reason);
          setIsApiKeyModalOpen(true);
        }}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
        promptMessage={apiKeyPromptMessage}
      />

      <SavedDraftsModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        drafts={savedDrafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />
    </div>
  );
}
