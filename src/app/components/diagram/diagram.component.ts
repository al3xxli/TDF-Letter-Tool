import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeerConsultationInput, InteractionLoopStep } from '../../models';

interface MapNode {
  id: string;
  parentId?: string;
  cluster: 'hub' | 'inputs' | 'guardrails' | 'knowledge' | 'loop' | 'output';
  label: string;
  subtitle?: string;
  x: number;
  y: number;
  radius: number;
  relationship?: string;
  description: string;
  rules: string[];
}

@Component({
  selector: 'app-diagram',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col text-black">
      <!-- Toolbar -->
      <div class="p-3 sm:px-5 bg-white border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-black">
          System Logic Map
        </h2>

        <!-- Controls -->
        <div class="flex items-center gap-2">
          <div class="relative text-xs">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Find node..."
              class="bg-white border border-zinc-200 rounded-md px-3 py-1 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black w-36 transition"
            />
            <button
              *ngIf="searchQuery"
              type="button"
              (click)="searchQuery = ''"
              class="absolute right-2 top-1.5 text-zinc-400 hover:text-black cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="flex items-center border border-zinc-200 rounded-md p-0.5">
            <button
              type="button"
              (click)="zoomOut()"
              class="px-2 py-0.5 text-zinc-500 hover:text-black text-xs font-mono transition cursor-pointer"
            >
              -
            </button>
            <span class="text-[10px] font-mono px-1.5 text-zinc-600">
              {{ zoomPercentage }}%
            </span>
            <button
              type="button"
              (click)="zoomIn()"
              class="px-2 py-0.5 text-zinc-500 hover:text-black text-xs font-mono transition cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              (click)="resetZoom()"
              class="px-2 py-0.5 text-zinc-500 hover:text-black text-[10px] uppercase font-mono transition cursor-pointer"
            >
              100%
            </button>
          </div>
        </div>
      </div>

      <!-- Main SVG Area -->
      <div class="relative w-full overflow-hidden bg-white min-h-[480px] select-none border-b border-zinc-200">
        <div
          class="w-full h-full overflow-auto flex items-center justify-center p-4 transition-transform duration-150"
          [style.transform]="'scale(' + zoomLevel + ')'"
          style="transform-origin: center center"
        >
          <svg
            viewBox="0 0 1100 700"
            class="w-full max-w-[1000px] h-auto min-h-[460px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Edges -->
            <g class="edges">
              <g *ngFor="let edge of edges">
                <path
                  [attr.d]="edge.path"
                  fill="none"
                  [attr.stroke]="edge.isConnected ? '#000000' : '#d4d4d8'"
                  [attr.stroke-width]="edge.isConnected ? '2' : '1'"
                  [attr.stroke-dasharray]="edge.isConnected ? 'none' : '3 3'"
                />
                <g *ngIf="edge.relationship" [attr.transform]="'translate(' + edge.midX + ',' + edge.midY + ')'">
                  <rect
                    x="-30"
                    y="-7"
                    width="60"
                    height="14"
                    rx="4"
                    fill="#ffffff"
                    [attr.stroke]="edge.isConnected ? '#000000' : '#e4e4e7'"
                    stroke-width="1"
                  />
                  <text
                    text-anchor="middle"
                    y="3"
                    [attr.fill]="edge.isConnected ? '#000000' : '#71717a'"
                    font-size="7"
                    font-family="sans-serif"
                  >
                    {{ edge.relationship }}
                  </text>
                </g>
              </g>
            </g>

            <!-- Nodes -->
            <g class="nodes">
              <g
                *ngFor="let node of filteredNodes"
                [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
                (click)="selectedNodeId = node.id"
                class="cursor-pointer"
              >
                <circle
                  [attr.r]="node.radius"
                  [attr.fill]="node.id === 'hub-core' ? '#000000' : '#ffffff'"
                  stroke="#000000"
                  [attr.stroke-width]="node.id === selectedNodeId ? '3' : '1.5'"
                />
                <text
                  text-anchor="middle"
                  y="4"
                  [attr.fill]="node.id === 'hub-core' ? '#ffffff' : '#000000'"
                  [attr.font-size]="node.id === 'hub-core' ? '11' : '9'"
                  font-weight="600"
                  font-family="system-ui, sans-serif"
                >
                  {{ node.label }}
                </text>
                <text
                  *ngIf="node.subtitle"
                  text-anchor="middle"
                  [attr.y]="node.radius + 14"
                  fill="#71717a"
                  font-size="8"
                  font-family="monospace"
                >
                  {{ node.subtitle }}
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <!-- Selected Node Details -->
      <div class="p-4 bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-black">{{ activeNode.label }}</span>
            <span class="text-[10px] text-zinc-500 font-mono">({{ activeNode.subtitle }})</span>
          </div>
          <p class="text-zinc-600">{{ activeNode.description }}</p>
        </div>

        <button
          type="button"
          (click)="returnToEditor.emit()"
          class="px-3 py-1.5 rounded-md bg-black text-white hover:bg-zinc-800 text-xs font-medium shrink-0 transition cursor-pointer"
        >
          Return to Editor
        </button>
      </div>
    </div>
  `,
})
export class DiagramComponent {
  @Input({ required: true }) currentInput!: PeerConsultationInput;
  @Input({ required: true }) currentStep: InteractionLoopStep = 1;
  @Output() returnToEditor = new EventEmitter<void>();

  selectedNodeId = 'hub-core';
  zoomLevel = 1;
  searchQuery = '';

  get zoomPercentage(): number {
    return Math.round(this.zoomLevel * 100);
  }

  zoomIn() {
    this.zoomLevel = Math.min(1.4, this.zoomLevel + 0.1);
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.7, this.zoomLevel - 0.1);
  }

  resetZoom() {
    this.zoomLevel = 1;
  }

  get nodes(): MapNode[] {
    const prof = this.currentInput.professorName || 'Professor';
    const course = this.currentInput.courseCode || 'Course';
    const scenario = (this.currentInput.useCase || 'sickness_absence').replace(/_/g, ' ');

    return [
      {
        id: 'hub-core',
        cluster: 'hub',
        label: `${prof} Synthesizer`,
        subtitle: `${course} • ${scenario}`,
        x: 550,
        y: 370,
        radius: 46,
        description: `Central synthesis engine integrating student inputs, university policy, and etiquette rules for ${prof}.`,
        rules: ['Enforces single short paragraph', 'Zero name greetings', 'Grounded policy only'],
      },
      {
        id: 'inputs-cluster',
        parentId: 'hub-core',
        cluster: 'inputs',
        label: 'Student Inputs',
        subtitle: 'Parameters',
        x: 230,
        y: 200,
        radius: 34,
        relationship: 'feeds into',
        description: 'The explicit situation variables provided by the student.',
        rules: ['Ask query', 'Output format', 'Context notes'],
      },
      {
        id: 'input-initial-ask',
        parentId: 'inputs-cluster',
        cluster: 'inputs',
        label: 'Initial Ask',
        subtitle: 'Query',
        x: 100,
        y: 110,
        radius: 26,
        relationship: 'defines',
        description: 'The initial request submitted by the student.',
        rules: ['Natural phrasing', 'Must describe objective'],
      },
      {
        id: 'input-context-details',
        parentId: 'inputs-cluster',
        cluster: 'inputs',
        label: 'Situation Context',
        subtitle: 'Context',
        x: 90,
        y: 240,
        radius: 26,
        relationship: 'contextualizes',
        description: 'Additional situation notes including timeline, symptoms, and partner coordination.',
        rules: ['Timeline verification', 'Accountability'],
      },
      {
        id: 'guardrails-cluster',
        parentId: 'hub-core',
        cluster: 'guardrails',
        label: 'Persona Guardrails',
        subtitle: 'Constraints',
        x: 550,
        y: 130,
        radius: 34,
        relationship: 'regulates',
        description: 'Strict non-negotiable boundaries ensuring peer tone and conciseness.',
        rules: ['Single paragraph', 'No name address', 'Max 1 question in Step 2'],
      },
      {
        id: 'knowledge-cluster',
        parentId: 'hub-core',
        cluster: 'knowledge',
        label: 'Domain Policies',
        subtitle: 'Department',
        x: 870,
        y: 200,
        radius: 34,
        relationship: 'informs',
        description: 'University and departmental policies for attendance, deadlines, and grades.',
        rules: ['Clinic note verification', 'Advance notice requirements'],
      },
      {
        id: 'loop-cluster',
        parentId: 'hub-core',
        cluster: 'loop',
        label: '4-Step Dialogue Loop',
        subtitle: `Step ${this.currentStep} Active`,
        x: 230,
        y: 530,
        radius: 34,
        relationship: 'sequences',
        description: 'Structured peer interaction protocol guiding the student through advice and options.',
        rules: ['Step 1: Suggestion', 'Step 2: Details', 'Step 3: Advice', 'Step 4: Alternatives'],
      },
      {
        id: 'output-cluster',
        parentId: 'hub-core',
        cluster: 'output',
        label: 'Draft & Strategy',
        subtitle: 'Output Artifact',
        x: 870,
        y: 530,
        radius: 34,
        relationship: 'produces',
        description: 'Final structured output with formatted email draft, subject line, and policy references.',
        rules: ['Formatted letter draft', 'One-click copy', 'Mailto protocol'],
      },
    ];
  }

  get filteredNodes(): MapNode[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.nodes;
    return this.nodes.filter(
      (n) => n.label.toLowerCase().includes(q) || n.subtitle?.toLowerCase().includes(q)
    );
  }

  get nodeMap(): Map<string, MapNode> {
    return new Map<string, MapNode>(this.nodes.map((n) => [n.id, n]));
  }

  get activeNode(): MapNode {
    return this.nodeMap.get(this.selectedNodeId) || this.nodes[0];
  }

  get edges() {
    return this.nodes
      .filter((n) => n.parentId)
      .map((n) => {
        const parent = this.nodeMap.get(n.parentId!);
        if (!parent) return null;

        const isConnected = parent.id === this.selectedNodeId || n.id === this.selectedNodeId;
        const dx = n.x - parent.x;
        const dy = n.y - parent.y;
        const cx1 = parent.x + dx * 0.45;
        const cy1 = parent.y;
        const cx2 = parent.x + dx * 0.55;
        const cy2 = n.y;
        const path = `M ${parent.x} ${parent.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${n.x} ${n.y}`;

        return {
          id: `${parent.id}-${n.id}`,
          path,
          midX: (parent.x + n.x) / 2,
          midY: (parent.y + n.y) / 2,
          relationship: n.relationship,
          isConnected,
        };
      })
      .filter(Boolean) as {
        id: string;
        path: string;
        midX: number;
        midY: number;
        relationship?: string;
        isConnected: boolean;
      }[];
  }
}
