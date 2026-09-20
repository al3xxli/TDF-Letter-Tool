import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PeerConsultationInput,
  PeerMessage,
  InteractionLoopStep,
  OrganizedFeedbackOutput,
  StudentUseCaseType,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  readonly input = signal<PeerConsultationInput>({
    initialAsk:
      "I am really sick with a severe fever and need to miss Hugh's class today. How should I write to him?",
    specificOutput: 'letter',
    professorStyle: 'direct_systems',
    professorName: 'Hugh Dubberly',
    courseCode: 'DES INV 202',
    useCase: 'sickness_absence',
    additionalInformation:
      'Studio critique presentation scheduled today; fever over 101F; urgent care appointment at Tang Center scheduled.',
  });

  readonly currentStep = signal<InteractionLoopStep>(1);

  readonly messages = signal<PeerMessage[]>([
    {
      id: 'init-1',
      sender: 'peer',
      step: 1,
      text: "I think you should send Hugh a brief, direct note right away explaining you're ill with a fever and need to miss today's critique. Keep it short, let him know your partner is prepared with your slides, and follow up with a note once you visit Tang.",
      timestamp: 'Just now',
    },
  ]);

  readonly organizedOutput = signal<OrganizedFeedbackOutput | null>(null);
  readonly isChatLoading = signal<boolean>(false);
  readonly isOutputLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.generateOrganizedOutput(this.input());
  }

  setInput(newInput: Partial<PeerConsultationInput>) {
    this.input.update((curr) => ({ ...curr, ...newInput }));
  }

  setStep(step: InteractionLoopStep) {
    this.currentStep.set(step);
  }

  resetDialogue() {
    this.currentStep.set(1);
    const prof = this.input().professorName || 'Professor';
    this.messages.set([
      {
        id: `reset-${Date.now()}`,
        sender: 'peer',
        step: 1,
        text: `I think you should send ${prof} a clear, concise note outlining your situation directly. State your timeline and proposed next step so they can easily accommodate you.`,
        timestamp: 'Just now',
      },
    ]);
  }

  startConsultation() {
    const current = this.input();
    this.isChatLoading.set(true);
    this.isOutputLoading.set(true);

    this.http
      .post<{ reply: string }>('/api/peer-guidance', {
        initialAsk: current.initialAsk,
        specificOutput: current.specificOutput,
        additionalInformation: current.additionalInformation,
        professorStyle: current.professorStyle,
        professorName: current.professorName,
        courseCode: current.courseCode,
        useCase: current.useCase,
      })
      .subscribe({
        next: (res) => {
          this.currentStep.set(1);
          this.messages.set([
            {
              id: `msg-${Date.now()}`,
              sender: 'peer',
              step: 1,
              text:
                res.reply ||
                `I think you should send a concise note to ${current.professorName} stating your situation plainly and proposing a concrete timeline for your next submission.`,
              timestamp: 'Just now',
            },
          ]);
          this.isChatLoading.set(false);
          this.generateOrganizedOutput(current);
        },
        error: () => {
          this.isChatLoading.set(false);
          this.resetDialogue();
          this.generateOrganizedOutput(current);
        },
      });
  }

  sendReply(userText: string) {
    const nextStepNum = Math.min(4, this.currentStep() + 1) as InteractionLoopStep;
    const studentMsg: PeerMessage = {
      id: `std-${Date.now()}`,
      sender: 'student',
      step: this.currentStep(),
      text: userText,
      timestamp: 'Just now',
    };

    this.messages.update((msgs) => [...msgs, studentMsg]);
    this.currentStep.set(nextStepNum);
    this.isChatLoading.set(true);

    const history = this.messages().map((m) => ({
      sender: m.sender,
      text: m.text,
      step: m.step,
    }));

    this.http
      .post<{ reply: string }>('/api/peer-chat', {
        step: nextStepNum,
        userMessage: userText,
        history,
        professorStyle: this.input().professorStyle,
        professorName: this.input().professorName,
        courseCode: this.input().courseCode,
        useCase: this.input().useCase,
      })
      .subscribe({
        next: (res) => {
          const peerReply: PeerMessage = {
            id: `peer-${Date.now()}`,
            sender: 'peer',
            step: nextStepNum,
            text: res.reply || this.getFallbackReply(nextStepNum, this.input()),
            timestamp: 'Just now',
          };
          this.messages.update((msgs) => [...msgs, peerReply]);
          this.isChatLoading.set(false);

          if (nextStepNum >= 3) {
            this.generateOrganizedOutput(this.input());
          }
        },
        error: () => {
          const fallbackReply: PeerMessage = {
            id: `peer-fb-${Date.now()}`,
            sender: 'peer',
            step: nextStepNum,
            text: this.getFallbackReply(nextStepNum, this.input()),
            timestamp: 'Just now',
          };
          this.messages.update((msgs) => [...msgs, fallbackReply]);
          this.isChatLoading.set(false);
        },
      });
  }

  generateOrganizedOutput(input: PeerConsultationInput) {
    this.isOutputLoading.set(true);

    this.http
      .post<OrganizedFeedbackOutput>('/api/generate-letter', {
        initialAsk: input.initialAsk,
        specificOutput: input.specificOutput,
        additionalInformation: input.additionalInformation,
        professorStyle: input.professorStyle,
        professorName: input.professorName,
        courseCode: input.courseCode,
        useCase: input.useCase,
      })
      .subscribe({
        next: (data) => {
          if (data && (data.letterDraft || data.letterDraftToHugh)) {
            this.organizedOutput.set(data);
          } else {
            this.organizedOutput.set(this.buildFallbackOutput(input));
          }
          this.isOutputLoading.set(false);
        },
        error: () => {
          this.organizedOutput.set(this.buildFallbackOutput(input));
          this.isOutputLoading.set(false);
        },
      });
  }

  private getFallbackReply(step: InteractionLoopStep, input: PeerConsultationInput): string {
    const prof = input.professorName || 'Professor';
    if (step === 2) {
      return `I think you should clarify how long you expect this to take and what specific step you need from ${prof}. Are you proposing an alternate deadline or requesting an asynchronous review?`;
    }
    if (step === 3) {
      return `I would recommend keeping your message under three sentences and attaching any relevant documentation right away so ${prof} has full context without back-and-forth.`;
    }
    return `I know some students also reach out to the GSI or arrange peer notes as a backup plan. That shows you are taking full responsibility for staying on track.`;
  }

  private buildFallbackOutput(input: PeerConsultationInput): OrganizedFeedbackOutput {
    const prof = input.professorName || 'Professor';
    const course = input.courseCode || 'Course';

    return {
      initialRecommendation: `Keep your communication with ${prof} clear, direct, and actionable. State what happened, the impact on ${course}, and your proposed solution.`,
      letterDraftToHugh: {
        recipient: prof,
        subject: `[${course}] Coursework Notice - Student Update`,
        body: `Dear ${prof},\n\nI am writing to notify you regarding ${course}. Due to unforeseen health circumstances, I am unable to attend today's session.\n\nI have coordinated with my project partners so our team presentation proceeds smoothly, and I will submit my doctor's note from urgent care as soon as received.\n\nThank you for your understanding.`,
        noteOnTone: 'Direct, accountable, and respectful without excessive apologies.',
      },
      letterDraft: {
        recipient: prof,
        subject: `[${course}] Coursework Notice - Student Update`,
        body: `Dear ${prof},\n\nI am writing to notify you regarding ${course}. Due to unforeseen health circumstances, I am unable to attend today's session.\n\nI have coordinated with my project partners so our team presentation proceeds smoothly, and I will submit my doctor's note from urgent care as soon as received.\n\nThank you for your understanding.`,
        noteOnTone: 'Direct, accountable, and respectful without excessive apologies.',
      },
      policyGuidelines: {
        primaryPolicy: `${course} syllabus attendance guidelines`,
        academicProcedure: 'Advance written notice to faculty and teaching assistants',
        documentationRequirement: 'Official verification note from student health services',
        communicationWindow: 'Submit notification within 24 hours of absence',
      },
      berkeleyPolicyAndResources: {
        mdesStudioAttendance: 'Jacobs Hall studio participation policy',
        tangCenterGuidelines: 'UHS Tang Center walk-in and eTang verification',
        studioPartnerCoordination: 'Team slide handoff prior to scheduled critique',
        dspAndDeanNotice: 'Student accommodation and medical leave support',
      },
      alternativeOptions: [
        'Coordinate an asynchronous video walkthrough or slide deck summary.',
        'Attend scheduled office hours to review feedback in person.',
        'Request permission to submit an expanded written design document.',
      ],
    };
  }
}
