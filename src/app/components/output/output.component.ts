import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OrganizedFeedbackOutput,
  SpecificOutputType,
  StudentUseCaseType,
} from '../../models';

@Component({
  selector: 'app-output',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isLoading" class="bg-white border border-zinc-200 rounded-xl p-8 text-center space-y-2 text-black">
      <div class="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h3 class="text-xs font-semibold uppercase tracking-wider text-black">
        Generating Letter &amp; Policies...
      </h3>
    </div>

    <div *ngIf="!isLoading && output" class="bg-white border border-zinc-200 rounded-xl p-5 space-y-5 text-black">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-black">
          Generated Letter &amp; Strategy
        </h2>
        <button
          type="button"
          (click)="refreshOutput.emit()"
          class="text-xs text-zinc-600 hover:text-black px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 transition cursor-pointer"
        >
          Regenerate
        </button>
      </div>

      <!-- 1. Recommendation -->
      <div class="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 space-y-1">
        <span class="text-[11px] font-bold uppercase tracking-wider text-black block">
          Recommendation
        </span>
        <p class="text-xs text-zinc-800 leading-relaxed">
          {{ output.initialRecommendation }}
        </p>
      </div>

      <!-- 2. Letter Draft -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-black">
            Draft: {{ recipientDisplay }}
          </span>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="copyLetter()"
              class="px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-100 text-black text-xs font-medium transition cursor-pointer"
            >
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
            <button
              type="button"
              (click)="openMailClient()"
              class="px-2.5 py-1 rounded-md bg-black hover:bg-zinc-800 text-white text-xs font-medium transition cursor-pointer"
            >
              Mail Client
            </button>
          </div>
        </div>

        <!-- Email Meta -->
        <div class="p-3 rounded-lg border border-zinc-200 bg-white space-y-1.5 text-xs">
          <div class="flex items-baseline gap-2 border-b border-zinc-100 pb-1.5">
            <span class="text-zinc-500 w-14">To:</span>
            <span class="font-medium text-black">{{ recipientDisplay }} &lt;{{ courseCode }}&gt;</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-zinc-500 w-14">Subject:</span>
            <span class="font-medium text-black">{{ activeDraft.subject }}</span>
          </div>
        </div>

        <!-- Email Body Textarea -->
        <textarea
          rows="9"
          [(ngModel)]="letterBody"
          class="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-3.5 text-black focus:outline-none focus:border-black leading-relaxed transition"
        ></textarea>

        <!-- Tone Note -->
        <p *ngIf="activeDraft.noteOnTone" class="text-[11px] text-zinc-500 leading-relaxed">
          <strong class="text-black">Tone:</strong> {{ activeDraft.noteOnTone }}
        </p>
      </div>

      <!-- 3. Policy Guidelines -->
      <div class="space-y-2.5 border-t border-zinc-100 pt-4">
        <span class="text-xs font-bold uppercase tracking-wider text-black block">
          Policy Guidelines
        </span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div class="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span class="font-semibold text-black block">Primary Policy</span>
            <p class="text-zinc-600 leading-relaxed">
              {{ output.policyGuidelines?.primaryPolicy || output.berkeleyPolicyAndResources.mdesStudioAttendance }}
            </p>
          </div>

          <div class="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span class="font-semibold text-black block">Coordination</span>
            <p class="text-zinc-600 leading-relaxed">
              {{ output.policyGuidelines?.academicProcedure || output.berkeleyPolicyAndResources.studioPartnerCoordination }}
            </p>
          </div>

          <div class="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span class="font-semibold text-black block">Documentation</span>
            <p class="text-zinc-600 leading-relaxed">
              {{ output.policyGuidelines?.documentationRequirement || output.berkeleyPolicyAndResources.tangCenterGuidelines }}
            </p>
          </div>

          <div class="p-3 rounded-lg border border-zinc-200 bg-white space-y-1">
            <span class="font-semibold text-black block">Timeline</span>
            <p class="text-zinc-600 leading-relaxed">
              {{ output.policyGuidelines?.communicationWindow || output.berkeleyPolicyAndResources.dspAndDeanNotice }}
            </p>
          </div>
        </div>
      </div>

      <!-- 4. Alternatives -->
      <div *ngIf="output.alternativeOptions && output.alternativeOptions.length > 0" class="space-y-2 border-t border-zinc-100 pt-4">
        <span class="text-xs font-bold uppercase tracking-wider text-black block">
          Alternatives
        </span>
        <div class="space-y-1.5">
          <div
            *ngFor="let alt of output.alternativeOptions; let idx = index"
            class="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-black flex items-start gap-2"
          >
            <span class="font-mono text-zinc-500">{{ idx + 1 }}.</span>
            <p class="leading-relaxed">{{ alt }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OutputComponent {
  @Input() output: OrganizedFeedbackOutput | null = null;
  @Input() isLoading = false;
  @Input() professorName = 'Professor';
  @Input() courseCode = 'Course';
  @Input() useCase: StudentUseCaseType = 'sickness_absence';

  @Output() refreshOutput = new EventEmitter<void>();

  copied = false;
  editableBody: string | null = null;

  get activeDraft() {
    return this.output?.letterDraft || this.output?.letterDraftToHugh || {
      subject: '',
      recipient: this.professorName,
      body: '',
      noteOnTone: '',
    };
  }

  get recipientDisplay() {
    return this.activeDraft.recipient || this.professorName;
  }

  get letterBody(): string {
    return this.editableBody ?? this.activeDraft.body;
  }

  set letterBody(val: string) {
    this.editableBody = val;
  }

  copyLetter() {
    const fullText = `Subject: ${this.activeDraft.subject}\nTo: ${this.recipientDisplay}\n\n${this.letterBody}`;
    navigator.clipboard.writeText(fullText);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  openMailClient() {
    const subject = encodeURIComponent(this.activeDraft.subject);
    const body = encodeURIComponent(this.letterBody);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}
