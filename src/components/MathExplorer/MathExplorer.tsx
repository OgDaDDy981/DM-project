import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Binary,
} from 'lucide-react';
import { REGISTER_PALETTE } from '../../types/compiler';
import { sounds } from '../../utils/soundEffects';

interface MathExplorerProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const MathExplorer: React.FC<MathExplorerProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(0);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

  // Concept 1: Interactive Node Inspector
  const [c1ActiveNode, setC1ActiveNode] = useState<string>('A');

  // Concept 2 Playground: 3-node graph (X, Y, Z) with edge X-Y and Y-Z
  const [sandboxColors, setSandboxColors] = useState<Record<string, number>>({
    X: 1, // Cyan
    Y: 2, // Purple
    Z: 1, // Cyan (valid!)
  });

  // Concept 3: Clique Size Toggle (K3 vs K4)
  const [cliqueK, setCliqueK] = useState<number>(3);

  // Concept 4: Interactive Constraint Edge Toggling
  const [hasConstraintEdge, setHasConstraintEdge] = useState<boolean>(false);

  // Concept 5: Active Color Class Tab
  const [activeColorClass, setActiveColorClass] = useState<number>(1);

  // Concept 6: Chaitin Heuristic Simplification Stack
  const [chaitinStep, setChaitinStep] = useState<number>(0);

  const cycleNodeColor = (nodeId: string) => {
    sounds.playPop();
    setSandboxColors((prev) => {
      const current = prev[nodeId] || 1;
      const next = current >= 3 ? 1 : current + 1;
      return { ...prev, [nodeId]: next };
    });
  };

  // Check conflicts in Concept 2 playground
  const c2EdgeXYConflict = sandboxColors['X'] === sandboxColors['Y'];
  const c2EdgeYZConflict = sandboxColors['Y'] === sandboxColors['Z'];
  const hasAnyConflict = c2EdgeXYConflict || c2EdgeYZConflict;

  const concepts = [
    {
      id: 'graph-theory',
      title: isStoryMode ? '1. Dots & Clash Lines' : '1. Graph Theory: G = (V, E)',
      subtitle: isStoryMode ? 'Variables are Dots, Clashes are Lines' : 'Vertices as Variables, Edges as Conflicts',
      beginnerSummary:
        'A graph is simply a collection of dots connected by lines. Think of dots as people at a dinner table, and lines as people who argue with each other!',
      cpuConnection:
        'Every variable in code becomes a dot (vertex). If two variables are needed at the same microsecond, a clash line (edge) is wired between them.',
      formalMath:
        'Let G = (V, E) where V = {v₁, v₂, ..., vₙ} denotes the finite set of program variables, and E ⊆ {{u, v} | u, v ∈ V, u ≠ v} denotes the set of unordered pairs where Lifetime(u) ∩ Lifetime(v) ≠ ∅. By Euler\'s Handshaking Lemma, ∑_{v ∈ V} deg(v) = 2|E|.',
    },
    {
      id: 'vertex-coloring',
      title: isStoryMode ? '2. The Fundamental Color Rule' : '2. Vertex Coloring Formulation',
      subtitle: isStoryMode ? 'Never Give Two Connected Dots the Same Color!' : 'The Adjacency Condition: ∀ {u, v} ∈ E, c(u) ≠ c(v)',
      beginnerSummary:
        'Imagine coloring a map of countries. You can never use the same color for two countries that touch borders, or the map looks confusing! That is Vertex Coloring.',
      cpuConnection:
        'Each color is a physical CPU register. If two variables are connected by an edge, they MUST be assigned distinct registers so they do not overwrite each other.',
      formalMath:
        'A proper k-coloring of graph G = (V, E) is a homomorphism c: V → {1, 2, ..., k} such that ∀ {u, v} ∈ E, c(u) ≠ c(v). The pre-images c⁻¹(i) are pairwise disjoint independent sets.',
    },
    {
      id: 'chromatic-number',
      title: isStoryMode ? '3. The Magic Number χ(G)' : '3. The Chromatic Number: χ(G)',
      subtitle: isStoryMode ? 'The Minimum Registers Mathematically Required' : 'The Minimum Register Limit & Clique Lower Bound',
      beginnerSummary:
        'What is the absolute fewest colors you need to color a graph? That number is called the Chromatic Number, written with the Greek letter χ (chi).',
      cpuConnection:
        'If the Chromatic Number of your code is 3, but the CPU hardware only has 2 registers, it is physically impossible to run without spilling variables to slow RAM!',
      formalMath:
        'χ(G) = min { k ∈ ℕ | ∃ proper k-coloring of G }. By the Clique Lower Bound theorem, χ(G) ≥ ω(G), where ω(G) is the clique number (the order of the largest complete subgraph Kₘ ⊆ G).',
    },
    {
      id: 'adjacency-constraints',
      title: isStoryMode ? '4. Adding Restrictions' : '4. Adjacency & Constraint Networks',
      subtitle: isStoryMode ? 'How One New Line of Code Forces an Extra Color' : 'Degree Bounds & Brooks\' Theorem: χ(G) ≤ Δ(G) + 1',
      beginnerSummary:
        'An edge is a rule that says "you two cannot match." Adding just one extra line between two dots can suddenly force you to buy an extra color!',
      cpuConnection:
        'Keeping variable A alive across a loop while variable B is active adds a clash edge. If it increases the chromatic number, a register spill is triggered.',
      formalMath:
        'For G = (V, E) and e = {u, v} ∉ E, let G\' = (V, E ∪ {e}). Then χ(G) ≤ χ(G\') ≤ χ(G) + 1. By Brooks\' Theorem (1941), for any connected graph G not an odd cycle or complete graph, χ(G) ≤ Δ(G), where Δ(G) = max_{v ∈ V} deg(v).',
    },
    {
      id: 'sets-and-mappings',
      title: isStoryMode ? '5. Best Friends Groups' : '5. Independent Sets & Color Classes',
      subtitle: isStoryMode ? 'Variables That Never Clash Share a Pocket' : 'Equivalence Partitioning: V = ⋃ᵢ₌₁ᵏ Vᵢ',
      beginnerSummary:
        'An "independent set" is a group of friends who never argue with each other. Everyone in this group can peacefully share the exact same room!',
      cpuConnection:
        'The compiler groups all variables that never overlap together. Group 1 gets Register R1, Group 2 gets Register R2, and so on. No data corruption occurs.',
      formalMath:
        'A proper k-coloring partitions V into k disjoint independent sets: V = ⋃ᵢ₌₁ᵏ Vᵢ where each Vᵢ is an independent set (∀ u, v ∈ Vᵢ, {u, v} ∉ E). Register allocation is mathematically isomorphic to finding a partition into minimum independent sets.',
    },
    {
      id: 'computational-complexity',
      title: isStoryMode ? '6. Why It\'s Super Hard' : '6. NP-Completeness & Chaitin\'s Heuristic',
      subtitle: isStoryMode ? 'Why Computers Use Smart Shortcuts' : 'Karp\'s 21 NP-Complete Problems & Degree-Saturation',
      beginnerSummary:
        'Finding the perfect coloring for a big graph is one of the hardest math problems in human history (NP-complete). Checking every possibility would take millions of years!',
      cpuConnection:
        'Because compilers must finish in milliseconds, they use Chaitin-Briggs heuristics: if a node has fewer than k neighbors (deg < k), it can always be colored safely!',
      formalMath:
        'The k-colorability decision problem is NP-complete for k ≥ 3 (Richard M. Karp, 1972). Chaitin\'s reduction heuristic: If ∃ v ∈ V with deg(v) < k, then G is k-colorable iff G \\ {v} is k-colorable. This runs in linear time O(|V| + |E|).',
    },
  ];

  const currentConcept = concepts[selectedConceptIndex];

  return (
    <section
      id="math"
      className={`py-16 md:py-24 border-b transition-colors duration-300 relative overflow-hidden ${
        isDark ? 'bg-[#0B0F1C] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Background CAD grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>The Mathematical Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            The Mathematics Behind{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              The Magic
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Register allocation is not a hardware fluke—it is a pure real-world application of discrete mathematics,
            graph theory, chromatic invariants, and NP-complete heuristics.
          </p>
        </div>

        {/* 6 Concept Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {concepts.map((c, idx) => {
            const isSelected = selectedConceptIndex === idx;
            return (
              <button
                key={c.id}
                onClick={() => {
                  sounds.playPop();
                  setSelectedConceptIndex(idx);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 scale-102 font-bold ring-2 ring-cyan-400'
                    : isDark
                    ? 'bg-[#121829] border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-[10px] font-mono uppercase font-black mb-1 opacity-80">
                  Concept {idx + 1}
                </div>
                <div className="text-xs font-bold truncate">{c.title.replace(/^\d+\.\s*/, '')}</div>
              </button>
            );
          })}
        </div>

        {/* Concept Detail Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-8 ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-black">
                Discrete Math × Silicon Microarchitecture
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {currentConcept.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{currentConcept.subtitle}</p>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                setShowMathDetails(!showMathDetails);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
              }`}
            >
              <span>{showMathDetails ? 'Hide Formal Theorem' : 'Show Formal Theorem'}</span>
              {showMathDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* 2-Column Concept Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Beginner Intuition */}
            <div
              className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Beginner Intuition</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {currentConcept.beginnerSummary}
              </p>
            </div>

            {/* Microarchitecture Connection */}
            <div
              className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Microarchitecture Translation</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {currentConcept.cpuConnection}
              </p>
            </div>
          </div>

          {/* Formal Mathematics Accordion */}
          {showMathDetails && (
            <div className="p-5 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 font-mono text-xs sm:text-sm space-y-2 animate-fade-in">
              <div className="text-purple-400 font-bold flex items-center gap-2">
                <Binary className="w-4 h-4" />
                <span>Formal Discrete Mathematics Definition</span>
              </div>
              <div
                className={`p-3.5 rounded-xl border overflow-x-auto font-mono text-xs leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {currentConcept.formalMath}
              </div>
            </div>
          )}

          {/* Interactive Micro-Playgrounds for ALL 6 Concepts */}
          <div
            className={`p-6 rounded-3xl border-2 space-y-5 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Interactive Concept Laboratory #{selectedConceptIndex + 1}</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">Live Mathematical Proof</span>
            </div>

            {/* Concept 1 Lab: Graph G = (V, E) & Degree Inspector */}
            {selectedConceptIndex === 0 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Click any node in this interference graph to inspect its degree $\deg(v)$, adjacent conflict set $N(v)$, and the Handshaking Lemma sum:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 relative h-56 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <svg viewBox="0 0 320 200" className="w-full h-full">
                      {/* Edges */}
                      <line x1="70" y1="60" x2="160" y2="40" stroke="#475569" strokeWidth="2" />
                      <line x1="70" y1="60" x2="110" y2="150" stroke="#475569" strokeWidth="2" />
                      <line x1="160" y1="40" x2="250" y2="80" stroke="#475569" strokeWidth="2" />
                      <line x1="160" y1="40" x2="110" y2="150" stroke="#475569" strokeWidth="2" />
                      <line x1="110" y1="150" x2="220" y2="150" stroke="#475569" strokeWidth="2" />
                      <line x1="250" y1="80" x2="220" y2="150" stroke="#475569" strokeWidth="2" />

                      {/* Nodes */}
                      {[
                        { id: 'A', x: 70, y: 60, deg: 2, neighbors: ['B', 'C'] },
                        { id: 'B', x: 160, y: 40, deg: 3, neighbors: ['A', 'C', 'D'] },
                        { id: 'C', x: 110, y: 150, deg: 3, neighbors: ['A', 'B', 'E'] },
                        { id: 'D', x: 250, y: 80, deg: 2, neighbors: ['B', 'E'] },
                        { id: 'E', x: 220, y: 150, deg: 2, neighbors: ['C', 'D'] },
                      ].map((node) => {
                        const isNodeActive = c1ActiveNode === node.id;
                        return (
                          <g
                            key={node.id}
                            className="cursor-pointer"
                            onClick={() => {
                              sounds.playPop();
                              setC1ActiveNode(node.id);
                            }}
                          >
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={20}
                              fill={isNodeActive ? '#06B6D4' : '#1E293B'}
                              stroke={isNodeActive ? '#FFFFFF' : '#64748B'}
                              strokeWidth={isNodeActive ? 3 : 1.5}
                            />
                            <text
                              x={node.x}
                              y={node.y + 4.5}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {node.id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="md:col-span-5 space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-cyan-400 font-bold">Selected Vertex: {c1ActiveNode}</div>
                      <div className="text-slate-300">
                        Degree deg({c1ActiveNode}) ={' '}
                        {c1ActiveNode === 'B' || c1ActiveNode === 'C' ? '3' : '2'}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Neighborhood N({c1ActiveNode}) ={' '}
                        {c1ActiveNode === 'A'
                          ? '{B, C}'
                          : c1ActiveNode === 'B'
                          ? '{A, C, D}'
                          : c1ActiveNode === 'C'
                          ? '{A, B, E}'
                          : c1ActiveNode === 'D'
                          ? '{B, E}'
                          : '{C, D}'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] leading-relaxed">
                      <strong>Handshaking Lemma:</strong> |V| = 5, |E| = 6.
                      <div className="mt-1 font-bold">∑ deg(v) = 2 + 3 + 3 + 2 + 2 = 12 = 2 × 6.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Concept 2 Lab: Manual Colorization Tester */}
            {selectedConceptIndex === 1 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Click any circle below to cycle its register color. Notice the clash laser flash when connected dots match:
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
                  {/* Node X */}
                  <div className="text-center">
                    <button
                      onClick={() => cycleNodeColor('X')}
                      className="w-16 h-16 rounded-full flex items-center justify-center font-black text-lg text-white transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: REGISTER_PALETTE[sandboxColors['X'] - 1].color,
                      }}
                    >
                      X
                    </button>
                    <div className="mt-2 text-xs font-mono font-bold text-slate-300">
                      R{sandboxColors['X']} ({REGISTER_PALETTE[sandboxColors['X'] - 1].name})
                    </div>
                  </div>

                  {/* Edge X - Y */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-2.5 w-16 sm:w-24 rounded-full transition-colors ${
                        c2EdgeXYConflict ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-slate-700'
                      }`}
                    />
                    {c2EdgeXYConflict && (
                      <span className="text-[10px] font-mono text-red-500 font-black mt-1">
                        CLASH!
                      </span>
                    )}
                  </div>

                  {/* Node Y */}
                  <div className="text-center">
                    <button
                      onClick={() => cycleNodeColor('Y')}
                      className="w-16 h-16 rounded-full flex items-center justify-center font-black text-lg text-white transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: REGISTER_PALETTE[sandboxColors['Y'] - 1].color,
                      }}
                    >
                      Y
                    </button>
                    <div className="mt-2 text-xs font-mono font-bold text-slate-300">
                      R{sandboxColors['Y']} ({REGISTER_PALETTE[sandboxColors['Y'] - 1].name})
                    </div>
                  </div>

                  {/* Edge Y - Z */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-2.5 w-16 sm:w-24 rounded-full transition-colors ${
                        c2EdgeYZConflict ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-slate-700'
                      }`}
                    />
                    {c2EdgeYZConflict && (
                      <span className="text-[10px] font-mono text-red-500 font-black mt-1">
                        CLASH!
                      </span>
                    )}
                  </div>

                  {/* Node Z */}
                  <div className="text-center">
                    <button
                      onClick={() => cycleNodeColor('Z')}
                      className="w-16 h-16 rounded-full flex items-center justify-center font-black text-lg text-white transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: REGISTER_PALETTE[sandboxColors['Z'] - 1].color,
                      }}
                    >
                      Z
                    </button>
                    <div className="mt-2 text-xs font-mono font-bold text-slate-300">
                      R{sandboxColors['Z']} ({REGISTER_PALETTE[sandboxColors['Z'] - 1].name})
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                    hasAnyConflict
                      ? 'bg-red-500/15 border-red-500/40 text-red-500'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {hasAnyConflict ? (
                      <>
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>CLASH DETECTED: Connected variables cannot share the same register!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>VALID COLORING: Zero clashes. Note that X and Z safely share Register 1!</span>
                      </>
                    )}
                  </span>
                  <span className="hidden sm:inline text-xs opacity-75 font-mono">Click circles to toggle</span>
                </div>
              </div>
            )}

            {/* Concept 3 Lab: Complete Graph Clique Theorem χ(G) ≥ ω(G) */}
            {selectedConceptIndex === 2 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    A complete subgraph $K_m$ (clique) where every node touches every other node proves the minimum register count:
                  </p>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <button
                      onClick={() => {
                        sounds.playPop();
                        setCliqueK(3);
                      }}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        cliqueK === 3 ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      K₃ (Triangle)
                    </button>
                    <button
                      onClick={() => {
                        sounds.playPop();
                        setCliqueK(4);
                      }}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        cliqueK === 4 ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      K₄ (Tetrahedron)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center h-48">
                    <svg viewBox="0 0 240 180" className="w-full h-full">
                      {cliqueK === 3 ? (
                        <>
                          <line x1="120" y1="30" x2="50" y2="150" stroke="#06B6D4" strokeWidth="2.5" />
                          <line x1="120" y1="30" x2="190" y2="150" stroke="#8B5CF6" strokeWidth="2.5" />
                          <line x1="50" y1="150" x2="190" y2="150" stroke="#10B981" strokeWidth="2.5" />
                          <circle cx="120" cy="30" r="18" fill="#06B6D4" />
                          <text x="120" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">R1</text>
                          <circle cx="50" cy="150" r="18" fill="#8B5CF6" />
                          <text x="50" y="155" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">R2</text>
                          <circle cx="190" cy="150" r="18" fill="#10B981" />
                          <text x="190" y="155" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">R3</text>
                        </>
                      ) : (
                        <>
                          {/* K4 all 6 edges */}
                          <line x1="60" y1="40" x2="180" y2="40" stroke="#38BDF8" strokeWidth="2" />
                          <line x1="60" y1="40" x2="60" y2="140" stroke="#38BDF8" strokeWidth="2" />
                          <line x1="180" y1="40" x2="180" y2="140" stroke="#38BDF8" strokeWidth="2" />
                          <line x1="60" y1="140" x2="180" y2="140" stroke="#38BDF8" strokeWidth="2" />
                          <line x1="60" y1="40" x2="180" y2="140" stroke="#38BDF8" strokeWidth="2" />
                          <line x1="180" y1="40" x2="60" y2="140" stroke="#38BDF8" strokeWidth="2" />
                          <circle cx="60" cy="40" r="16" fill="#06B6D4" />
                          <text x="60" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">R1</text>
                          <circle cx="180" cy="40" r="16" fill="#8B5CF6" />
                          <text x="180" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">R2</text>
                          <circle cx="60" cy="140" r="16" fill="#10B981" />
                          <text x="60" y="144" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">R3</text>
                          <circle cx="180" cy="140" r="16" fill="#F59E0B" />
                          <text x="180" y="144" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">R4</text>
                        </>
                      )}
                    </svg>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-cyan-400 font-bold">Clique Number: ω(G) = {cliqueK}</div>
                      <div className="text-emerald-400 font-bold">Chromatic Lower Bound: χ(G) ≥ {cliqueK}</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                        Because all {cliqueK} variables are mutually alive, no two can share a color. If your CPU has only {cliqueK - 1} registers, spilling is 100% mathematically unavoidable!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Concept 4 Lab: Adding / Removing Constraint Edge */}
            {selectedConceptIndex === 3 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Toggle a clash edge between Variable A and Variable C. Watch how adding an edge forces them into separate registers:
                </p>
                <div
                  className={`flex items-center justify-between p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Clash Edge (A, C)</div>
                    <div className="text-xs text-slate-400">
                      {hasConstraintEdge
                        ? 'Edge ACTIVE: Variables A and C overlap in execution (Cannot share register)'
                        : 'Edge REMOVED: Variables A and C have disjoint lifespans (Can safely share R1)'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setHasConstraintEdge(!hasConstraintEdge);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      hasConstraintEdge
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                        : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    }`}
                  >
                    {hasConstraintEdge ? 'Remove Clash Edge' : 'Add Clash Edge'}
                  </button>
                </div>
                <div
                  className={`p-3.5 rounded-xl text-xs font-mono font-bold ${
                    hasConstraintEdge ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {hasConstraintEdge
                    ? '⚡ Adding the edge increases register demand to χ(G) = 3 (Requires R1, R2, R3).'
                    : '✨ Removing the edge allows χ(G) = 2 (A and C share R1 with zero memory stall).'}
                </div>
              </div>
            )}

            {/* Concept 5 Lab: Independent Sets & Color Classes */}
            {selectedConceptIndex === 4 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  A valid vertex coloring partitions the variable set $V$ into disjoint <strong>Independent Sets</strong> (color classes). Select a register class to view its member variables:
                </p>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {[1, 2, 3].map((rNum) => (
                    <button
                      key={rNum}
                      onClick={() => {
                        sounds.playPop();
                        setActiveColorClass(rNum);
                      }}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        activeColorClass === rNum
                          ? 'bg-purple-600 text-white font-black shadow-md'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Color Class V_{rNum} ({REGISTER_PALETTE[rNum - 1].name})
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-cyan-400 font-bold">
                    Independent Set V_{activeColorClass}:
                  </div>
                  <div className="text-slate-200">
                    {activeColorClass === 1 && 'V₁ = { health, trophy } (Both assigned to Register R1)'}
                    {activeColorClass === 2 && 'V₂ = { coins, shield } (Both assigned to Register R2)'}
                    {activeColorClass === 3 && 'V₃ = { speed } (Assigned to Register R3)'}
                  </div>
                  <p className="text-slate-400 text-[11px] pt-1">
                    Mathematical Invariant: ∀ u, v ∈ V_{activeColorClass}, &#123;u, v&#125; ∉ E. Zero internal edges exist between any members of this class!
                  </p>
                </div>
              </div>
            )}

            {/* Concept 6 Lab: Chaitin Reduction Heuristic Simulator */}
            {selectedConceptIndex === 5 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Gregory Chaitin's 1981 heuristic: If a node has degree $\deg(v) &lt; k$ (where hardware budget $k = 2$), it can always be colored after its neighbors. Watch simplification eliminate nodes:
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setChaitinStep((prev) => (prev >= 3 ? 0 : prev + 1));
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-mono font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {chaitinStep === 3 ? 'Reset Simplification' : `Step Simplification (${chaitinStep}/3)`}
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    Hardware Registers k = 2
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  {chaitinStep === 0 && (
                    <div className="text-slate-300">
                      Initial Graph: Chain A — B — C — D. Vertex D has deg(D) = 1 &lt; 2.
                    </div>
                  )}
                  {chaitinStep === 1 && (
                    <div className="text-cyan-400">
                      Step 1: Removed vertex D (deg = 1 &lt; 2) and pushed to stack: [ D ]. Graph now: A — B — C.
                    </div>
                  )}
                  {chaitinStep === 2 && (
                    <div className="text-purple-400">
                      Step 2: Removed vertex C (deg now = 1 &lt; 2) and pushed to stack: [ D, C ]. Graph now: A — B.
                    </div>
                  )}
                  {chaitinStep === 3 && (
                    <div className="text-emerald-400 font-bold">
                      Step 3: Graph is empty! Popping stack colors every node in O(|V| + |E|) time with zero backtracking!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
