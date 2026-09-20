import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    >
      <div class="bg-white border border-zinc-200 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-black">
        <!-- Header -->
        <div class="px-5 py-3.5 bg-white flex items-center justify-between border-b border-zinc-200">
          <h2 class="text-sm font-semibold text-black">
            System Rules &amp; Guidelines
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="p-1 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs text-zinc-800 leading-relaxed">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-black block">
              Core Principles
            </span>
            <ul class="space-y-1.5 pl-4 list-disc text-zinc-700">
              <li><strong>Informational:</strong> Actionable, direct advice without conversational filler.</li>
              <li><strong>Single Short Paragraph:</strong> Responses are limited to 2–4 sentences.</li>
              <li><strong>No Name Address:</strong> Never uses personal names in greetings to maintain conversational peer flow.</li>
              <li><strong>Peer Phrasing:</strong> Uses natural opinions (<em>"I think"</em>, <em>"I would"</em>, <em>"I know"</em>).</li>
              <li><strong>Max 1 Question:</strong> Limited to a single diagnostic inquiry strictly in Step 2.</li>
            </ul>
          </div>

          <div class="space-y-1 border-t border-zinc-100 pt-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-black block">
              4-Step Interaction Loop
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <div class="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span class="font-semibold text-black block">1. Suggestion</span>
                <span class="text-zinc-500">Initial recommendation</span>
              </div>
              <div class="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span class="font-semibold text-black block">2. Details</span>
                <span class="text-zinc-500">Diagnostic inquiry</span>
              </div>
              <div class="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span class="font-semibold text-black block">3. Advice</span>
                <span class="text-zinc-500">Policy alignment</span>
              </div>
              <div class="p-2 bg-zinc-50 rounded border border-zinc-200">
                <span class="font-semibold text-black block">4. Alternatives</span>
                <span class="text-zinc-500">Backup options</span>
              </div>
            </div>
          </div>

          <div class="space-y-1 border-t border-zinc-100 pt-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-black block">
              Boundaries
            </span>
            <ul class="space-y-1 pl-4 list-disc text-zinc-600">
              <li>No excessive emotional pleasantries or medical oversharing.</li>
              <li>Encourages proactive accountability, explicit return dates, and syllabus compliance.</li>
              <li>Adapts tone according to the selected faculty communication profile.</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            type="button"
            (click)="close.emit()"
            class="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-zinc-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
}
