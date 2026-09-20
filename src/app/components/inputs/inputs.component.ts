import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PeerConsultationInput,
  ProfessorCommunicationStyle,
  StudentUseCaseType,
  SpecificOutputType,
} from '../../models';

@Component({
  selector: 'app-inputs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 text-black">
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-black">
          Situation Parameters
        </h2>
        <span class="text-xs font-mono text-zinc-400">
          Required inputs
        </span>
      </div>

      <!-- Scenarios -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-semibold text-zinc-600 block">
          Topic / Scenario
        </label>
        <div class="flex flex-wrap gap-1.5">
          <button
            *ngFor="let s of scenarios"
            type="button"
            (click)="selectUseCase(s.id)"
            [class]="input.useCase === s.id
              ? 'px-2.5 py-1 text-xs rounded-md bg-black text-white font-medium border border-black cursor-pointer'
              : 'px-2.5 py-1 text-xs rounded-md bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:border-zinc-300 cursor-pointer'"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Faculty Profiles -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-semibold text-zinc-600 block">
          Faculty Communication Style
        </label>
        <div class="flex flex-wrap gap-1.5">
          <button
            *ngFor="let prof of professorStyles"
            type="button"
            (click)="selectProfessorStyle(prof.id)"
            [class]="input.professorStyle === prof.id
              ? 'px-2.5 py-1 text-xs rounded-md bg-black text-white font-medium border border-black cursor-pointer'
              : 'px-2.5 py-1 text-xs rounded-md bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:border-zinc-300 cursor-pointer'"
          >
            {{ prof.label }}
          </button>
        </div>
      </div>

      <!-- Course & Professor Inputs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-zinc-600 block">
            Professor Name
          </label>
          <input
            type="text"
            [(ngModel)]="input.professorName"
            (ngModelChange)="onInputChange()"
            class="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
            placeholder="e.g. Hugh Dubberly"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-zinc-600 block">
            Course Code / Department
          </label>
          <input
            type="text"
            [(ngModel)]="input.courseCode"
            (ngModelChange)="onInputChange()"
            class="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
            placeholder="e.g. DES INV 202"
          />
        </div>
      </div>

      <!-- Initial Ask -->
      <div class="space-y-1">
        <label class="text-[11px] font-semibold text-zinc-600 block">
          Initial Student Ask
        </label>
        <textarea
          rows="2"
          [(ngModel)]="input.initialAsk"
          (ngModelChange)="onInputChange()"
          class="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition leading-relaxed"
          placeholder="What do you want to ask the professor?"
        ></textarea>
      </div>

      <!-- Additional Information -->
      <div class="space-y-1">
        <label class="text-[11px] font-semibold text-zinc-600 block">
          Details / Context (Optional)
        </label>
        <input
          type="text"
          [(ngModel)]="input.additionalInformation"
          (ngModelChange)="onInputChange()"
          class="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:border-black transition"
          placeholder="e.g. Fever over 101F, slides handed off to partner, clinic appointment booked"
        />
      </div>

      <!-- Output Type & Submit -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-100 pt-3">
        <div class="flex items-center gap-1">
          <span class="text-[11px] text-zinc-500 mr-1.5">Output:</span>
          <button
            *ngFor="let opt of outputOptions"
            type="button"
            (click)="selectOutputType(opt.id)"
            [class]="input.specificOutput === opt.id
              ? 'px-2 py-0.5 text-xs rounded bg-black text-white font-medium border border-black cursor-pointer'
              : 'px-2 py-0.5 text-xs rounded bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 cursor-pointer'"
          >
            {{ opt.label }}
          </button>
        </div>

        <button
          type="button"
          (click)="triggerConsultation.emit()"
          [disabled]="isLoading"
          class="px-4 py-2 bg-black hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition cursor-pointer"
        >
          {{ isLoading ? 'Computing...' : 'Start Consultation' }}
        </button>
      </div>
    </div>
  `,
})
export class InputsComponent {
  @Input({ required: true }) input!: PeerConsultationInput;
  @Input() isLoading = false;
  @Output() inputChange = new EventEmitter<PeerConsultationInput>();
  @Output() triggerConsultation = new EventEmitter<void>();

  readonly scenarios: { id: StudentUseCaseType; label: string }[] = [
    { id: 'sickness_absence', label: 'Sickness Absence' },
    { id: 'deadline_extension', label: 'Deadline Extension' },
    { id: 'grade_inquiry', label: 'Grade Inquiry' },
    { id: 'recommendation_letter', label: 'Recommendation' },
    { id: 'research_opportunity', label: 'Research Opportunity' },
    { id: 'office_hours_meeting', label: 'Office Hours' },
    { id: 'follow_up_nudge', label: 'Follow-up Check' },
  ];

  readonly professorStyles: { id: ProfessorCommunicationStyle; label: string }[] = [
    { id: 'direct_systems', label: 'Direct & Systems' },
    { id: 'formal_traditional', label: 'Formal & Traditional' },
    { id: 'supportive_encouraging', label: 'Supportive & Mentoring' },
    { id: 'brief_busy', label: 'Brief & Busy' },
    { id: 'research_methodological', label: 'Research & Rigorous' },
  ];

  readonly outputOptions: { id: SpecificOutputType; label: string }[] = [
    { id: 'letter', label: 'Letter' },
    { id: 'advice', label: 'Advice' },
    { id: 'policy', label: 'Policies' },
  ];

  selectUseCase(id: StudentUseCaseType) {
    this.input.useCase = id;
    this.onInputChange();
  }

  selectProfessorStyle(id: ProfessorCommunicationStyle) {
    this.input.professorStyle = id;
    this.onInputChange();
  }

  selectOutputType(id: SpecificOutputType) {
    this.input.specificOutput = id;
    this.onInputChange();
  }

  onInputChange() {
    this.inputChange.emit(this.input);
  }
}
