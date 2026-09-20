import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantService } from './services/assistant.service';
import { BannerComponent } from './components/banner/banner.component';
import { InputsComponent } from './components/inputs/inputs.component';
import { ChatComponent } from './components/chat/chat.component';
import { OutputComponent } from './components/output/output.component';
import { DiagramComponent } from './components/diagram/diagram.component';
import { ModalComponent } from './components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    BannerComponent,
    InputsComponent,
    ChatComponent,
    OutputComponent,
    DiagramComponent,
    ModalComponent,
  ],
  template: `
    <div class="min-h-screen bg-white text-black flex flex-col font-sans antialiased">
      <!-- Top Banner -->
      <app-banner
        [activeTab]="activeTab"
        (changeTab)="activeTab = $event"
        (openRules)="isRulesModalOpen = true"
      ></app-banner>

      <!-- Main Content Layout -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ng-container *ngIf="activeTab === 'diagram'">
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-200 pb-2">
              <button
                type="button"
                (click)="activeTab = 'workspace'"
                class="text-xs font-medium text-black hover:underline cursor-pointer"
              >
                ← Return to Editor
              </button>
              <span class="text-xs text-zinc-500">
                System Flow
              </span>
            </div>

            <app-diagram
              [currentInput]="assistant.input()"
              [currentStep]="assistant.currentStep()"
              (returnToEditor)="activeTab = 'workspace'"
            ></app-diagram>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab === 'workspace'">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Left Column: Inputs & Chat Loop -->
            <div class="lg:col-span-6 space-y-6">
              <app-inputs
                [input]="assistant.input()"
                [isLoading]="assistant.isChatLoading() || assistant.isOutputLoading()"
                (inputChange)="assistant.setInput($event)"
                (triggerConsultation)="assistant.startConsultation()"
              ></app-inputs>

              <app-chat
                [messages]="assistant.messages()"
                [currentStep]="assistant.currentStep()"
                [isLoading]="assistant.isChatLoading()"
                [professorName]="assistant.input().professorName"
                [useCase]="assistant.input().useCase"
                (sendReply)="assistant.sendReply($event)"
                (jumpToStep)="assistant.setStep($event)"
                (resetDialogue)="assistant.resetDialogue()"
              ></app-chat>
            </div>

            <!-- Right Column: Letter & Feedback -->
            <div class="lg:col-span-6 space-y-6">
              <app-output
                [output]="assistant.organizedOutput()"
                [isLoading]="assistant.isOutputLoading()"
                [professorName]="assistant.input().professorName"
                [courseCode]="assistant.input().courseCode"
                [useCase]="assistant.input().useCase"
                (refreshOutput)="assistant.generateOrganizedOutput(assistant.input())"
              ></app-output>
            </div>
          </div>
        </ng-container>
      </main>

      <!-- Footer -->
      <footer class="border-t border-zinc-200 py-3 px-4 sm:px-6 text-center text-xs text-zinc-400">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <span>Letter &amp; Email Assistant</span>
          <span>UC Berkeley MDes</span>
        </div>
      </footer>

      <!-- Rules Modal -->
      <app-modal
        [isOpen]="isRulesModalOpen"
        (close)="isRulesModalOpen = false"
      ></app-modal>
    </div>
  `,
})
export class AppComponent {
  readonly assistant = inject(AssistantService);
  activeTab: 'workspace' | 'diagram' = 'workspace';
  isRulesModalOpen = false;
}
