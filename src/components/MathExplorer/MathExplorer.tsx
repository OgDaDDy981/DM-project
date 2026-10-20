import React, { useState } from 'react';
import { BookOpen, Sparkles, ChevronDown, ChevronUp, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(1);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

  // Concept 2 Interactive Playground State: 3-node graph (X, Y, Z) with edge X-Y and Y-Z
  const [sandboxColors, setSandboxColors] = useState<Record<string, number>>({
    X: 1, // Cyan
    Y: 2, // Purple
    Z: 1, // Cyan (valid!)
  });

  // Concept 4 Interactive Edge Toggling
  const [hasConstraintEdge, setHasConstraintEdge] = useState<boolean>(false);

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
      title: isStoryMode ? '1. Dots & Lines' : '1. Graph Theory: G = (V, E)',
      subtitle: isStoryMode ? 'Variables are Dots, Clashes are Lines' : 'Vertices as Variables, Edges as Conflicts',
      beginnerSummary:
        'A graph is simply a collection of dots connected by lines. Think of dots as people at a dinner table, and lines as people who argue with each other!',
      cpuConnection:
        'Every variable becomes a dot. If two variables are needed at the same second, we connect them with a clash line.',
      formalMath:
        'Let G = (V, E) where V = {v₁, v₂, ..., vₙ} denotes the finite set of program variables, and E ⊆ {{u, v} | u, v ∈ V, u ≠ v} denotes the set of unordered pairs where Lifetime(u) ∩ Lifetime(v) ≠ ∅.',
    },
    {
      id: 'vertex-coloring',
      title: isStoryMode ? '2. The Color Rule' : '2. Vertex Coloring',
      subtitle: isStoryMode ? 'Never Give Two Connected Dots the Same Color!' : 'The Adjacency Condition: c(u) ≠ c(v)',
      beginnerSummary:
        'Imagine coloring a map of countries. You can never use the same color for two countries that touch borders, or the map looks confusing! That is Vertex Coloring.',
      cpuConnection:
        'Each color is a physical CPU register. If two variables are connected by an edge, they MUST use different registers so they don\'t overwrite each other!',
      formalMath:
        'A proper k-coloring of graph G = (V, E) is a function c: V → {1, 2, ..., k} such that ∀ {u, v} ∈ E, c(u) ≠ c(v).',
    },
    {
      id: 'chromatic-number',
      title: isStoryMode ? '3. The Magic Number χ(G)' : '3. The Chromatic Number: χ(G)',
      subtitle: isStoryMode ? 'The Minimum Colors Mathematically Required' : 'The Minimum Register Limit of a Graph',
      beginnerSummary:
        'What is the absolute fewest colors you need to color a graph? That number is called the Chromatic Number, written as χ (chi).',
      cpuConnection:
        'If the Chromatic Number of your code is 3, but the CPU only has 2 registers, it is physically impossible to run without spilling variables into slow RAM!',
      formalMath:
        'χ(G) = min { k ∈ ℕ | ∃ proper k-coloring of G }. By the Clique Lower Bound theorem, χ(G) ≥ ω(G), where ω(G) is the clique number (the size of the largest complete subgraph).',
    },
    {
      id: 'adjacency-constraints',
      title: isStoryMode ? '4. Adding Restrictions' : '4. Adjacency & Constraint Networks',
      subtitle: isStoryMode ? 'How One New Line of Code Forces an Extra Color' : 'How an Edge Forbids Sharing',
      beginnerSummary:
        'An edge is a rule that says "you two cannot match." Adding just one extra line between two dots can suddenly force you to buy an extra color!',
      cpuConnection:
        'Adding a single line of code that keeps variable A alive while variable B is active can add a clash line and trigger an expensive memory spill.',
      formalMath:
        'For G = (V, E) and e = {u, v} ∉ E, let G\' = (V, E ∪ {e}). Then χ(G) ≤ χ(G\') ≤ χ(G) + 1. The degree deg(v) = |{u ∈ V | {u, v} ∈ E}| bounds color requirements: χ(G) ≤ Δ(G) + 1 (Brooks\' Theorem).',
    },
    {
      id: 'sets-and-mappings',
      title: isStoryMode ? '5. Best Friends Groups' : '5. Sets & Independent Sets',
      subtitle: isStoryMode ? 'Variables That Never Clash Share a Pocket' : 'Partitioning Variables into Shared Registers',
      beginnerSummary:
        'An "independent set" is a group of friends who never argue with each other. Everyone in this group can peacefully share the exact same room!',
      cpuConnection:
        'The compiler groups all variables that never overlap together. Group 1 gets Register R1, Group 2 gets Register R2, and so on.',
      formalMath:
        'A proper k-coloring partitions V into k disjoint independent sets: V = ⋃ᵢ₌₁ᵏ Vᵢ where each Vᵢ is an independent set (∀ u, v ∈ Vᵢ, {u, v} ∉ E).',
    },
    {
      id: 'computational-complexity',
      title: isStoryMode ? '6. Why It\'s Super Hard' : '6. NP-Completeness & Optimization',
      subtitle: isStoryMode ? 'Why Computers Use Smart Shortcuts (Heuristics)' : 'Computational Complexity (NP-Complete)',
      beginnerSummary:
        'Finding the perfect coloring for a big graph is one of the hardest math problems in human history (NP-complete). Checking every possibility would take millions of years!',
      cpuConnection:
        'Because compilers must finish in milliseconds, they use brilliant shortcuts (Chaitin-Briggs heuristics) that find 99% optimal solutions almost instantly.',
      formalMath:
        'The k-colorability decision problem is NP-complete for k ≥ 3 (proven by Richard Karp in 1972). Modern optimizing compilers (GCC, LLVM) employ Kempe-chain heuristics and degree-saturation ordering in O(|V| + |E|) time.',
    },
  ];

  const currentConcept = concepts[selectedConceptIndex];

  return (
    <section id="math" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#0B0F1C] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <BookOpen className="w-4 h-4" />
            <span>The Mathematical Secret</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            The Mathematics Behind{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              The Magic
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Register allocation is not a hardware fluke—it is a pure real-world application of discrete math, graph theory, and chromatic numbers.
          </p>
        </div>

        {/* 6 Concept Navigation Tabs with Generous Spacing */}
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
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-sm hover:scale-102 ${
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
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-8 ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-500 uppercase tracking-wider font-black">
                Discrete Math × Silicon Hardware
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentConcept.title}</h3>
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
              <span>{showMathDetails ? 'Hide Formal Math Equation' : 'Show Formal Math Equation'}</span>
              {showMathDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* 2-Column Concept Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Beginner Translation */}
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Beginner Intuition</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {currentConcept.beginnerSummary}
              </p>
            </div>

            {/* Computer Connection */}
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>What It Means For Your CPU</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {currentConcept.cpuConnection}
              </p>
            </div>

          </div>

          {/* Formal Mathematics Accordion */}
          {showMathDetails && (
            <div className="p-5 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 font-mono text-xs sm:text-sm space-y-2 animate-fade-in">
              <div className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-2">
                <span>Formal Mathematical Theorem</span>
              </div>
              <div className={`p-3 rounded-xl border overflow-x-auto font-mono text-xs ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                {currentConcept.formalMath}
              </div>
            </div>
          )}

          {/* Interactive Micro-Playgrounds per concept */}
          <div className={`p-6 rounded-3xl border-2 space-y-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Interactive Concept Lab</span>
            </h4>

            {/* Concept 2 Playground: Manual Colorization Tester */}
            {selectedConceptIndex === 1 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Click any circle below to change its color! Can you give connected circles different colors?
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
                  {/* Node X */}
                  <div className="text-center">
                    <button
                      onClick={() => cycleNodeColor('X')}
                      className="w-16 h-16 rounded-full flex items-center justify-center font-black text-lg text-white transition-all shadow-xl cursor-pointer transform hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: REGISTER_PALETTE[sandboxColors['X'] - 1].color,
                      }}
                    >
                      X
                    </button>
                    <div className="mt-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                      R{sandboxColors['X']} ({REGISTER_PALETTE[sandboxColors['X'] - 1].name})
                    </div>
                  </div>

                  {/* Edge X - Y */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-2 w-16 sm:w-24 rounded-full transition-colors ${
                        c2EdgeXYConflict ? 'bg-red-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-700'
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
                      className="w-16 h-16 rounded-full flex items-center justify-center font-black text-lg text-white transition-all shadow-xl cursor-pointer transform hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: REGISTER_PALETTE[sandboxColors['Y'] - 1].color,
                      }}
                    >
                      Y
                    </button>
                    <div className="mt-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                      R{sandboxColors['Y']} ({REGISTER_PALETTE[sandboxColors['Y'] - 1].name})
                    </div>
                  </div>

                  {/* Edge Y - Z */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-2 w-16 sm:w-24 rounded-full transition-colors ${
                        c2EdgeYZConflict ? 'bg-red-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-700'
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
                      className="w-16 h-16 rounded-full flex items-center justify-center font-black text-lg text-white transition-all shadow-xl cursor-pointer transform hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: REGISTER_PALETTE[sandboxColors['Z'] - 1].color,
                      }}
                    >
                      Z
                    </button>
                    <div className="mt-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                      R{sandboxColors['Z']} ({REGISTER_PALETTE[sandboxColors['Z'] - 1].name})
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                    hasAnyConflict
                      ? 'bg-red-500/15 border-red-500/40 text-red-500'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {hasAnyConflict ? (
                      <>
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>INVALID COLORING: Connected circles share the same color! Data will overwrite!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>PERFECT COLORING: No connected circles share the same color! Zero clashes!</span>
                      </>
                    )}
                  </span>
                  <span className="hidden sm:inline text-xs opacity-75">Click circles to cycle colors</span>
                </div>
              </div>
            )}

            {/* Concept 3 Playground: Chromatic Number of Triangle */}
            {selectedConceptIndex === 2 && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <p>
                  Consider a triangle of 3 friends who all talk at the same time:
                </p>
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="font-mono text-sm space-y-1">
                    <div>Triangle Clique Size: <strong className="text-slate-900 dark:text-white">3</strong></div>
                    <div>Minimum Colors Needed: <strong className="text-cyan-500">χ = 3</strong></div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                    If your CPU only has <strong className="text-red-500">2 registers</strong>, it is mathematically IMPOSSIBLE to color this triangle without a clash! One variable has to be evicted to slow RAM.
                  </div>
                </div>
              </div>
            )}

            {/* Concept 4 Playground: Adding / Removing Constraint Edge */}
            {selectedConceptIndex === 3 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Toggle a clash line between Variable A and Variable C. Watch how adding a line forces them into separate pockets!
                </p>
                <div className={`flex items-center justify-between p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Clash Line (A, C)</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {hasConstraintEdge
                        ? 'Line ACTIVE: Variables A and C are needed at the same time (Clashing)'
                        : 'Line REMOVED: Variables A and C exist at different times (Can share Pocket 1)'}
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
                    {hasConstraintEdge ? 'Remove Clash Line' : 'Add Clash Line'}
                  </button>
                </div>
                <div className={`p-4 rounded-xl text-xs font-mono font-bold ${
                  hasConstraintEdge ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
                }`}>
                  {hasConstraintEdge ? (
                    <span>
                      Adding the clash line forces them into separate registers (e.g. R1 and R2).
                    </span>
                  ) : (
                    <span>
                      Removing the clash line allows them to share Register R1 with zero issues!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Other Concepts */}
            {(selectedConceptIndex === 0 || selectedConceptIndex === 4 || selectedConceptIndex === 5) && (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Explore how this mathematical theorem directly enables software to run at peak silicon speeds in modern systems like iPhone chips, Android devices, gaming consoles, and cloud servers.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
