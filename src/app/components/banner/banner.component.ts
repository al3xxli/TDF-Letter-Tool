import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="border-b border-zinc-200 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="font-bold text-sm tracking-tight text-black">
            Professor Assistant
          </span>
          <span class="text-zinc-300">|</span>
          <span class="text-xs text-zinc-500 font-mono">
            Berkeley MDes
          </span>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-white text-xs">
            <button
              type="button"
              (click)="changeTab.emit('workspace')"
              [class]="activeTab === 'workspace' 
                ? 'px-3 py-1 bg-black text-white rounded-md font-medium' 
                : 'px-3 py-1 text-zinc-600 hover:text-black font-medium'"
            >
              Editor
            </button>
            <button
              type="button"
              (click)="changeTab.emit('diagram')"
              [class]="activeTab === 'diagram' 
                ? 'px-3 py-1 bg-black text-white rounded-md font-medium' 
                : 'px-3 py-1 text-zinc-600 hover:text-black font-medium'"
            >
              Logic Map
            </button>
          </div>

          <button
            type="button"
            (click)="openRules.emit()"
            class="text-xs font-medium text-black px-2.5 py-1 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition cursor-pointer"
          >
            Rules
          </button>
        </div>
      </div>
    </header>
  `,
})
export class BannerComponent {
  @Input() activeTab: 'workspace' | 'diagram' = 'workspace';
  @Output() changeTab = new EventEmitter<'workspace' | 'diagram'>();
  @Output() openRules = new EventEmitter<void>();
}
