import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InteractionLoopStep,
  PeerMessage,
  StudentUseCaseType,
} from '../../models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 text-black">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-black">
          Dialogue Loop
        </h2>
        <button
          type="button"
          (click)="resetDialogue.emit()"
          class="text-xs text-zinc-500 hover:text-black transition cursor-pointer"
        >
          Reset
        </button>
      </div>

      <!-- 4-Step Progress -->
      <div class="grid grid-cols-4 gap-1.5">
        <button
          *ngFor="let def of stepDefinitions"
          type="button"
          (click)="jumpToStep.emit(def.step)"
          [class]="currentStep === def.step
            ? 'py-1.5 px-2 rounded-md border text-center transition cursor-pointer text-xs border-black bg-black text-white font-medium'
            : currentStep > def.step
            ? 'py-1.5 px-2 rounded-md border text-center transition cursor-pointer text-xs border-zinc-300 bg-zinc-100 text-black font-medium'
            : 'py-1.5 px-2 rounded-md border text-center transition cursor-pointer text-xs border-zinc-200 bg-white text-zinc-400'"
        >
          {{ def.label }}
        </button>
      </div>

      <!-- Chat Messages -->
      <div class="space-y-3 min-h-[160px] max-h-[340px] overflow-y-auto p-3 rounded-lg border border-zinc-200 bg-white">
        <div
          *ngFor="let msg of messages"
          class="flex flex-col"
          [class.items-start]="msg.sender === 'peer'"
          [class.items-end]="msg.sender === 'student'"
        >
          <span class="text-[10px] text-zinc-400 mb-0.5">
            {{ msg.sender === 'peer' ? 'Assistant' : 'You' }} • Step {{ msg.step }}
          </span>
          <div
            class="max-w-[88%] rounded-lg p-3 text-xs leading-relaxed"
            [class.bg-zinc-100]="msg.sender === 'peer'"
            [class.text-black]="msg.sender === 'peer'"
            [class.border]="msg.sender === 'peer'"
            [class.border-zinc-200]="msg.sender === 'peer'"
            [class.bg-black]="msg.sender === 'student'"
            [class.text-white]="msg.sender === 'student'"
          >
            {{ msg.text }}
          </div>
        </div>

        <div *ngIf="isLoading" class="flex flex-col items-start">
          <div class="bg-zinc-100 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-600">
            Formulating response...
          </div>
        </div>
      </div>

      <!-- Step 2 Diagnostic Chips -->
      <div *ngIf="currentStep === 2" class="p-3 border border-zinc-200 rounded-lg space-y-1.5 bg-zinc-50">
        <span class="text-[11px] font-semibold text-zinc-600 block">
          Suggested details:
        </span>
        <div class="flex flex-wrap gap-1.5">
          <button
            *ngFor="let item of diagnosticSuggestions"
            type="button"
            (click)="selectSuggestion(item)"
            class="text-xs bg-white hover:bg-zinc-100 text-black border border-zinc-200 px-2.5 py-1 rounded-md transition cursor-pointer text-left"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <!-- Input Form -->
      <form (ngSubmit)="handleSend()" class="flex gap-2">
        <input
          type="text"
          [(ngModel)]="inputText"
          name="replyText"
          [placeholder]="'Reply regarding ' + professorName + '...'"
          class="flex-1 text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
        />
        <button
          type="submit"
          [disabled]="!inputText.trim() || isLoading"
          class="px-3.5 py-2 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  `,
})
export class ChatComponent {
  @Input({ required: true }) messages!: PeerMessage[];
  @Input({ required: true }) currentStep: InteractionLoopStep = 1;
  @Input() isLoading = false;
  @Input() professorName = 'Professor';
  @Input() useCase: StudentUseCaseType = 'sickness_absence';

  @Output() sendReply = new EventEmitter<string>();
  @Output() jumpToStep = new EventEmitter<InteractionLoopStep>();
  @Output() resetDialogue = new EventEmitter<void>();

  inputText = '';

  readonly stepDefinitions: { step: InteractionLoopStep; label: string }[] = [
    { step: 1, label: '1. Suggestion' },
    { step: 2, label: '2. Details' },
    { step: 3, label: '3. Advice' },
    { step: 4, label: '4. Alternatives' },
  ];

  get diagnosticSuggestions(): string[] {
    switch (this.useCase) {
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
      case 'follow_up_nudge':
        return [
          'Sent initial message 5 business days ago regarding research',
          'Checking in before the upcoming submission window',
        ];
      case 'sickness_absence':
      default:
        return [
          'High fever, bedridden for 48 hours',
          'Visiting health clinic urgent care for verification',
          'Partner notified and presenting our slides',
        ];
    }
  }

  handleSend() {
    if (!this.inputText.trim() || this.isLoading) return;
    this.sendReply.emit(this.inputText.trim());
    this.inputText = '';
  }

  selectSuggestion(item: string) {
    this.sendReply.emit(item);
  }
}
