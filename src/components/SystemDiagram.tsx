import React, { useState } from 'react';
import {
  PeerConsultationInput,
  InteractionLoopStep,
} from '../types';
import { Search, ZoomIn, ZoomOut, RotateCcw, ArrowLeft } from 'lucide-react';

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

interface SystemDiagramProps {
  currentInput: PeerConsultationInput;
  currentStep: InteractionLoopStep;
  onReturnToEditor: () => void;
}

export const SystemDiagram: React.FC<SystemDiagramProps> = ({
  currentInput,
  currentStep,
  onReturnToEditor,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('hub-core');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const prof = currentInput.professorName || 'Professor';
  const course = currentInput.courseCode || 'Course';
  const scenario = (currentInput.useCase || 'sickness_absence').replace(/_/g, ' ');

  const nodes: MapNode[] = [
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
      subtitle: `Step ${currentStep} Active`,
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

  const nodeMap = new Map<string, MapNode>(nodes.map((n) => [n.id, n]));
  const activeNode = nodeMap.get(selectedNodeId) || nodes[0];

  const filteredNodes = searchQuery.trim()
    ? nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nodes;

  const edges = nodes
    .filter((n) => n.parentId)
    .map((n) => {
      const parent = nodeMap.get(n.parentId!);
      if (!parent) return null;

      const isConnected = parent.id === selectedNodeId || n.id === selectedNodeId;
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

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col text-black shadow-xs">
      {/* Toolbar */}
      <div className="p-3 sm:px-5 bg-white border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-black">
          System Logic Map
        </h2>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="relative text-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find node..."
              className="bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-1 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black w-36 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-zinc-400 hover:text-black cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center border border-zinc-200 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="px-2 py-0.5 text-zinc-500 hover:text-black text-xs font-mono transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-zinc-600">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="px-2 py-0.5 text-zinc-500 hover:text-black text-xs font-mono transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-2 py-0.5 text-zinc-500 hover:text-black text-[10px] uppercase font-mono transition cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden bg-white min-h-[480px] select-none border-b border-zinc-200">
        <div
          className="w-full h-full overflow-auto flex items-center justify-center p-4 transition-transform duration-150"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <svg
            viewBox="0 0 1100 700"
            className="w-full max-w-[1000px] h-auto min-h-[460px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Edges */}
            <g className="edges">
              {edges.map((edge) => (
                <g key={edge.id}>
                  <path
                    d={edge.path}
                    fill="none"
                    stroke={edge.isConnected ? '#000000' : '#d4d4d8'}
                    strokeWidth={edge.isConnected ? '2' : '1'}
                    strokeDasharray={edge.isConnected ? 'none' : '3 3'}
                  />
                  {edge.relationship && (
                    <g transform={`translate(${edge.midX},${edge.midY})`}>
                      <rect
                        x="-30"
                        y="-7"
                        width="60"
                        height="14"
                        rx="4"
                        fill="#ffffff"
                        stroke={edge.isConnected ? '#000000' : '#e4e4e7'}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        fill={edge.isConnected ? '#000000' : '#71717a'}
                        fontSize="7"
                        fontFamily="sans-serif"
                      >
                        {edge.relationship}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {filteredNodes.map((node) => {
                const isHub = node.id === 'hub-core';
                const isSelected = node.id === selectedNodeId;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={node.radius}
                      fill={isHub ? '#000000' : '#ffffff'}
                      stroke="#000000"
                      strokeWidth={isSelected ? '3' : '1.5'}
                    />
                    <text
                      textAnchor="middle"
                      y="4"
                      fill={isHub ? '#ffffff' : '#000000'}
                      fontSize={isHub ? '11' : '9'}
                      fontWeight="600"
                      fontFamily="system-ui, sans-serif"
                    >
                      {node.label}
                    </text>
                    {node.subtitle && (
                      <text
                        textAnchor="middle"
                        y={node.radius + 14}
                        fill="#71717a"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {node.subtitle}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Node Details Panel */}
      <div className="p-4 bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black">{activeNode.label}</span>
            {activeNode.subtitle && (
              <span className="text-[10px] text-zinc-500 font-mono">
                ({activeNode.subtitle})
              </span>
            )}
          </div>
          <p className="text-zinc-600">{activeNode.description}</p>
        </div>

        <button
          type="button"
          onClick={onReturnToEditor}
          className="px-3 py-1.5 rounded-md bg-black text-white hover:bg-zinc-800 text-xs font-medium shrink-0 transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Editor</span>
        </button>
      </div>
    </div>
  );
};
