import React, { useState } from 'react';
import {
  GitBranch,
  Sparkles,
  Activity,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Info,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface MathSolutionSimulationProps {
  isDark: boolean;
  onProceedToSilicon: () => void;
}

export const MathSolutionSimulation: React.FC<MathSolutionSimulationProps> = ({
  isDark,
  onProceedToSilicon,
}) => {
  // Active mathematical stage:
  // 0: Liveness Analysis (Lifespans)
  // 1: Interference Graph Construction
  // 2: Graph Vertex Coloring
  // 3: The Chromatic Number Theorem
  const [activeStage, setActiveStage] = useState<number>(0);

  // Scrubber line for Liveness Stage (1 to 5)
  const [livenessLine, setLivenessLine] = useState<number>(3);

  // Coloring progress (0: uncolored, 1: a colored, 2: b colored, 3: c colored, 4: d colored, 5: e colored)
  const [coloringStep, setColoringStep] = useState<number>(0);

  const variables = [
    { id: 'a', name: 'var a', start: 1, end: 5, color: '#06B6D4', reg: 'R1', desc: 'Base operand. Alive across lines 1 to 5.' },
    { id: 'b', name: 'var b', start: 2, end: 3, color: '#8B5CF6', reg: 'R2', desc: 'Second operand. DIES at line 3.' },
    { id: 'c', name: 'var c', start: 3, end: 4, color: '#8B5CF6', reg: 'R2', desc: 'Intermediate sum. Born line 3, DIES line 4. Never touches b!' },
    { id: 'd', name: 'var d', start: 4, end: 5, color: '#8B5CF6', reg: 'R2', desc: 'Scaled product. Born line 4, DIES line 5. Never touches b or c!' },
    { id: 'e', name: 'var e', start: 5, end: 6, color: '#06B6D4', reg: 'R1', desc: 'Final return value. Born line 5, reuses R1!' },
  ];

  // Graph nodes layout
  const nodes = [
    { id: 'a', label: 'a', x: 250, y: 70 },
    { id: 'b', label: 'b', x: 100, y: 160 },
    { id: 'c', label: 'c', x: 150, y: 260 },
    { id: 'd', label: 'd', x: 350, y: 260 },
    { id: 'e', label: 'e', x: 400, y: 160 },
  ];

  // Interference edges:
  // a interferes with b (at line 2)
  // a interferes with c (at line 3)
  // a interferes with d (at line 4)
  const edges = [
    { u: 'a', v: 'b', activeAt: 2, label: 'Both alive at Line 2' },
    { u: 'a', v: 'c', activeAt: 3, label: 'Both alive at Line 3' },
    { u: 'a', v: 'd', activeAt: 4, label: 'Both alive at Line 4' },
  ];

  // Coloring steps sequence
  const coloringSequence = [
    {
      step: 1,
      target: 'a',
      color: '#06B6D4',
      reg: 'R1',
      reason: 'Variable a has the highest degree (3 edges). Assign lowest available register R1 (Cyan).',
    },
    {
      step: 2,
      target: 'b',
      color: '#8B5CF6',
      reg: 'R2',
      reason: 'Variable b touches a (R1). R1 is forbidden! Assign lowest available register R2 (Purple).',
    },
    {
      step: 3,
      target: 'c',
      color: '#8B5CF6',
      reg: 'R2',
      reason: 'EUREKA! Variable c touches a (R1), but does NOT touch b (b is already dead). c safely REUSES R2 (Purple)!',
    },
    {
      step: 4,
      target: 'd',
      color: '#8B5CF6',
      reg: 'R2',
      reason: 'Variable d touches a (R1), but does NOT touch b or c. d safely REUSES R2 (Purple)!',
    },
    {
      step: 5,
      target: 'e',
      color: '#06B6D4',
      reg: 'R1',
      reason: 'Variable e does not touch any currently live variables. e safely REUSES R1 (Cyan)!',
    },
  ];

  const handleNextColor = () => {
    if (coloringStep < 5) {
      sounds.playPop();
      setColoringStep((prev) => prev + 1);
    } else {
      sounds.playVictory();
    }
  };

  const handleAutoColor = () => {
    sounds.playVictory();
    setColoringStep(5);
  };

  const handleResetColoring = () => {
    sounds.playPop();
    setColoringStep(0);
  };

  return (
    <section
      id="math-solution"
      className={`py-16 md:py-24 border-b transition-colors duration-300 relative overflow-hidden ${
        isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <GitBranch className="w-4 h-4 text-purple-500" />
            <span>Stage 2: The Discrete Math Solution</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            How Graph Coloring Solves{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              The Hardware Bottleneck
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Instead of guessing, the compiler converts program execution into a <strong>Discrete Graph</strong>.
            By coloring this graph, we mathematically guarantee that <strong>5 variables run on ONLY 2 registers</strong> with zero stalls and zero data loss!
          </p>
        </div>

        {/* 4-Step Interactive Architecture Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 0, title: '1. Liveness Analysis', subtitle: 'Find variable lifespans', icon: <Activity className="w-4 h-4" /> },
            { id: 1, title: '2. Interference Graph', subtitle: 'Draw collision edges', icon: <GitBranch className="w-4 h-4" /> },
            { id: 2, title: '3. Vertex Coloring', subtitle: 'Assign registers (colors)', icon: <Sparkles className="w-4 h-4" /> },
            { id: 3, title: '4. Chromatic Theorem', subtitle: 'Proof of zero spills', icon: <CheckCircle2 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playPop();
                setActiveStage(tab.id);
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                activeStage === tab.id
                  ? isDark
                    ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg ring-2 ring-purple-500/40'
                    : 'bg-purple-100 border-2 border-purple-500 text-purple-950 font-black shadow-md ring-2 ring-purple-400/40'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold">{tab.title}</span>
                {tab.icon}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{tab.subtitle}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Interactive Stage Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Mathematical Concept & Stepper (5 cols) */}
          <div className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-6 ${
            isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            
            {/* Stage 0: Liveness Analysis */}
            {activeStage === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-mono font-black uppercase text-slate-900 dark:text-white">
                    Step 1: Liveness Analysis
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    Line {livenessLine} of 5
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  A variable is only <strong>"ALIVE"</strong> between when it is first written and its final read.
                  Drag the cursor or click lines to see when variables are born and when they die!
                </p>

                {/* Scrubber Line Selector */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((ln) => (
                    <button
                      key={ln}
                      onClick={() => {
                        sounds.playPop();
                        setLivenessLine(ln);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        livenessLine === ln
                          ? 'bg-cyan-600 text-white font-black shadow-sm'
                          : isDark
                          ? 'bg-slate-900 border border-slate-800 text-slate-400'
                          : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      Line {ln}
                    </button>
                  ))}
                </div>

                {/* Key Mathematical Finding */}
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Discrete Liveness Property:</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li><strong className="text-slate-900 dark:text-white">var a</strong> is alive across Lines 1–5.</li>
                    <li><strong className="text-slate-900 dark:text-white">var b</strong> dies at Line 3.</li>
                    <li><strong className="text-slate-900 dark:text-white">var c</strong> is born at Line 3 and dies at Line 4.</li>
                    <li><strong className="text-emerald-600 dark:text-emerald-400">Conclusion:</strong> Since <code>b</code> and <code>c</code> never overlap, they can share the exact same register!</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Stage 1: Interference Graph */}
            {activeStage === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-mono font-black uppercase text-slate-900 dark:text-white">
                    Step 2: Constructing Graph G = (V, E)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    5 Vertices, 3 Edges
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  The compiler maps variables to <strong>Vertices (V)</strong>.
                  Whenever two variables are alive at the exact same line, an <strong>Edge (E)</strong> is drawn between them.
                </p>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                    <strong>Edge (a, b):</strong> Simultaneously alive at Line 2!
                  </div>
                  <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                    <strong>Edge (a, c):</strong> Simultaneously alive at Line 3!
                  </div>
                  <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                    <strong>Edge (a, d):</strong> Simultaneously alive at Line 4!
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-purple-950/20 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950'
                }`}>
                  <span className="font-bold text-purple-700 dark:text-purple-400">The Absence of Edges is Key:</span>
                  <p>
                    Notice there is <strong>NO EDGE</strong> between <code>b</code> and <code>c</code>, and <strong>NO EDGE</strong> between <code>c</code> and <code>d</code>.
                    Non-connected vertices can safely share the same color!
                  </p>
                </div>
              </div>
            )}

            {/* Stage 2: Graph Vertex Coloring */}
            {activeStage === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-mono font-black uppercase text-slate-900 dark:text-white">
                    Step 3: Vertex Coloring (Registers)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    Colored {coloringStep} of 5
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We assign physical registers (colors) so that connected variables never share a register:
                  <code className="block my-2 p-2 rounded bg-slate-100 dark:bg-slate-900 text-center font-bold text-purple-600 dark:text-purple-400">
                    ∀ (u, v) ∈ E ⟹ Color(u) ≠ Color(v)
                  </code>
                </p>

                {/* Step Explanation */}
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Coloring Decision (Step {coloringStep || 1}):</span>
                  </div>
                  <p className="font-medium">
                    {coloringStep === 0
                      ? 'Click "Assign Next Register" to watch the algorithm color each variable.'
                      : coloringSequence[coloringStep - 1].reason}
                  </p>
                </div>

                {/* Stepper Controls */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNextColor}
                      disabled={coloringStep >= 5}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        coloringStep >= 5
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-500 shadow-md'
                      }`}
                    >
                      {coloringStep >= 5 ? 'All Colored! ✨' : 'Assign Next Register ➔'}
                    </button>

                    <button
                      onClick={handleResetColoring}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
                      }`}
                      title="Reset Coloring"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAutoColor}
                    className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Solve All
                  </button>
                </div>
              </div>
            )}

            {/* Stage 3: The Chromatic Number Theorem */}
            {activeStage === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-mono font-black uppercase text-slate-900 dark:text-white">
                    Step 4: The Chromatic Theorem
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    χ(G) = 2
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
                    Mathematical Proof of Feasibility:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    The <strong>Chromatic Number χ(G)</strong> is the minimal number of colors required to color graph G.
                    Here, <code className="font-bold text-emerald-600 dark:text-emerald-400">χ(G) = 2</code>.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    Therefore, a CPU with <strong>k = 2 physical hardware registers</strong> is guaranteed to run this 5-variable code with <strong>ZERO spills to RAM</strong>!
                  </p>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-between">
                    <span className="font-bold text-cyan-700 dark:text-cyan-300">Register R1 (Cyan):</span>
                    <span className="font-bold text-slate-900 dark:text-white">Holds var a, then var e</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-between">
                    <span className="font-bold text-purple-700 dark:text-purple-300">Register R2 (Purple):</span>
                    <span className="font-bold text-slate-900 dark:text-white">Sequentially reuses var b ➔ var c ➔ var d</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playVictory();
                    onProceedToSilicon();
                  }}
                  className="w-full py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-500 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Stage 3: Watch This Run On Silicon!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Dynamic Interactive Visualization Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visualizer Card */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-5 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <span className="text-sm font-mono font-black uppercase text-slate-900 dark:text-white">
                  {activeStage === 0
                    ? 'Liveness Matrix (Variable Lifespans)'
                    : 'Interference Graph G = (V, E)'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {activeStage === 0 ? 'Temporal View' : 'Topological View'}
                </span>
              </div>

              {/* View 1: Gantt Lifespan View (when in Stage 0) */}
              {activeStage === 0 && (
                <div className="space-y-3 font-mono text-xs">
                  {/* Timeline Axis */}
                  <div className="grid grid-cols-5 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b pb-1.5 border-slate-200 dark:border-slate-800">
                    <span>Line 1 (a=10)</span>
                    <span>Line 2 (b=20)</span>
                    <span>Line 3 (c=a+b)</span>
                    <span>Line 4 (d=c*2)</span>
                    <span>Line 5 (e=d+a)</span>
                  </div>

                  {/* Variables Lifespan Rows */}
                  {variables.map((v) => {
                    const isAliveNow = livenessLine >= v.start && livenessLine <= v.end;
                    const leftPct = ((v.start - 1) / 4) * 100;
                    const widthPct = ((v.end - v.start) / 4) * 100;

                    return (
                      <div
                        key={v.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isAliveNow
                            ? isDark
                              ? 'bg-cyan-500/10 border-cyan-500/40'
                              : 'bg-cyan-50 border-cyan-300'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{v.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isAliveNow
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}>
                            {isAliveNow ? 'ALIVE AT ACTIVE LINE' : `Lines ${v.start}–${v.end}`}
                          </span>
                        </div>

                        {/* Bar */}
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden">
                          {/* Active Line Cursor */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-cyan-600 dark:bg-cyan-400 z-10"
                            style={{ left: `${((livenessLine - 1) / 4) * 100}%` }}
                          />

                          {/* Lifespan Span */}
                          <div
                            className="absolute top-0 bottom-0 rounded-lg transition-all"
                            style={{
                              left: `${leftPct}%`,
                              width: `${Math.max(16, widthPct)}%`,
                              backgroundColor: v.color,
                              opacity: isAliveNow ? 1 : 0.4,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View 2: SVG Graph Canvas (Stages 1, 2, 3) */}
              {activeStage > 0 && (
                <div className={`h-[330px] sm:h-[350px] rounded-2xl border-2 relative flex items-center justify-center select-none ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <svg viewBox="0 0 500 320" className="w-full h-full">
                    {/* Graph Edges */}
                    {edges.map((e, idx) => {
                      const u = nodes.find((n) => n.id === e.u)!;
                      const v = nodes.find((n) => n.id === e.v)!;
                      return (
                        <g key={idx}>
                          <line
                            x1={u.x}
                            y1={u.y}
                            x2={v.x}
                            y2={v.y}
                            stroke={isDark ? '#EF4444' : '#DC2626'}
                            strokeWidth="3.5"
                            strokeDasharray="6 3"
                            className="animate-pulse"
                          />
                        </g>
                      );
                    })}

                    {/* Graph Nodes */}
                    {nodes.map((n) => {
                      // Determine color state based on coloringStep
                      const varInfo = variables.find((v) => v.id === n.id)!;
                      let nodeColor = isDark ? '#334155' : '#CBD5E1';
                      let assignedRegister: string | null = null;

                      if (activeStage >= 3) {
                        nodeColor = varInfo.color;
                        assignedRegister = varInfo.reg;
                      } else if (activeStage === 2) {
                        const stepIndex = coloringSequence.findIndex((s) => s.target === n.id);
                        if (stepIndex !== -1 && coloringStep > stepIndex) {
                          nodeColor = coloringSequence[stepIndex].color;
                          assignedRegister = coloringSequence[stepIndex].reg;
                        }
                      }

                      return (
                        <g key={n.id}>
                          {/* Node Circle */}
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r="26"
                            fill={isDark ? '#1E293B' : '#FFFFFF'}
                            stroke={nodeColor}
                            strokeWidth="4"
                            className="transition-colors duration-300 drop-shadow-md"
                          />

                          {/* Node Variable Text inside circle */}
                          <text
                            x={n.x}
                            y={n.y + 6}
                            textAnchor="middle"
                            fontSize="17"
                            fontWeight="bold"
                            fill={isDark ? '#FFFFFF' : '#0F172A'}
                          >
                            {n.label}
                          </text>

                          {/* Register Pill Badge (cleanly spaced below circle at y + 28) */}
                          {assignedRegister && (
                            <g transform={`translate(${n.x - 22}, ${n.y + 28})`}>
                              <rect
                                width="44"
                                height="20"
                                rx="10"
                                fill={nodeColor}
                                stroke="#FFFFFF"
                                strokeWidth="1"
                              />
                              <text
                                x="22"
                                y="14"
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="bold"
                                fill="#FFFFFF"
                              >
                                {assignedRegister}
                              </text>
                            </g>
                          )}

                          {/* Node Full Label (cleanly spaced above circle at y - 30) */}
                          <text
                            x={n.x}
                            y={n.y - 30}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="bold"
                            fill={isDark ? '#CBD5E1' : '#334155'}
                          >
                            var {n.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Dedicated Graph Legend Bar (Out in HTML flow - Zero Overlaps) */}
              <div className={`flex flex-wrap items-center justify-between text-xs font-mono p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
                  <span className="font-bold">R1 = Cyan</span>
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block ml-3" />
                  <span className="font-bold">R2 = Purple</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                  <span className="w-3 h-1 bg-red-500 inline-block" />
                  <span>Dashed Red Line = Simultaneous Collision</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
