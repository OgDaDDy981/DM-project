import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap, GitBranch, Cpu, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

interface HeroProps {
  onStartTour: () => void;
  onExploreSimulation: () => void;
  isDark: boolean;
  isStoryMode: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onStartTour,
  onExploreSimulation,
  isDark,
}) => {
  // 3-step interactive state in hero:
  // 0: Uncolored Variables
  // 1: Interference Clashes (Red edges)
  // 2: Register Graph Coloring Applied!
  const [heroState, setHeroState] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [selectedHeroNode, setSelectedHeroNode] = useState<string | null>(null);

  // Clean, realistic program variables
  const heroItems = [
    {
      id: 'a',
      name: 'var a',
      x: 75,
      y: 75,
      color: heroState === 2 ? '#06B6D4' : '#64748B', // Cyan
      reg: 'R1 (Cyan)',
      timing: 'Lines 1–5',
    },
    {
      id: 'b',
      name: 'var b',
      x: 235,
      y: 65,
      color: heroState === 2 ? '#8B5CF6' : '#64748B', // Purple
      reg: 'R2 (Purple)',
      timing: 'Lines 2–3',
    },
    {
      id: 'c',
      name: 'var c',
      x: 75,
      y: 215,
      color: heroState === 2 ? '#8B5CF6' : '#64748B', // Purple (REUSES R2!)
      reg: 'R2 (Purple - Reused!)',
      timing: 'Lines 3–4 (Reuses R2)',
    },
    {
      id: 'd',
      name: 'var d',
      x: 235,
      y: 205,
      color: heroState === 2 ? '#8B5CF6' : '#64748B', // Purple (REUSES R2!)
      reg: 'R2 (Purple - Reused!)',
      timing: 'Lines 4–5 (Reuses R2)',
    },
  ];

  const heroEdges = [
    { from: 0, to: 1, label: 'a & b alive at Line 2' },
    { from: 0, to: 2, label: 'a & c alive at Line 3' },
    { from: 0, to: 3, label: 'a & d alive at Line 4' },
  ];

  // Auto-play loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setHeroState((prev) => {
          const next = (prev + 1) % 3;
          if (next === 1) sounds.playConflict();
          else if (next === 2) {
            sounds.playVictory();
            try {
              confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.55, x: 0.75 },
              });
            } catch {}
          } else {
            sounds.playPop();
          }
          return next;
        });
      }, 2600);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying]);

  const handleNextHeroStep = () => {
    setIsAutoPlaying(false);
    if (heroState === 0) {
      sounds.playConflict();
      setHeroState(1);
    } else if (heroState === 1) {
      sounds.playRegisterAssign(2);
      sounds.playVictory();
      setHeroState(2);
      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6, x: 0.75 },
        });
      } catch {}
    } else {
      sounds.playPop();
      setHeroState(0);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24 transition-colors duration-300">
      
      {/* Background ambient lighting orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Big Friendly Hook & Explanation */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-emerald-500/15 border border-purple-500/30 shadow-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
                Discrete Mathematics × Compiler Architecture
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              How Compilers Run Infinite Variables on Only{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400">
                2 CPU Registers
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Programmers write code with unlimited variables (<code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-mono">a, b, c, d, e</code>).
              However, physical CPU chips only have a <strong>tiny handful of ultra-fast registers (0.3ns)</strong>.
              How does the compiler make them fit without crashing or freezing? <strong className="text-purple-600 dark:text-purple-400">Graph Vertex Coloring!</strong>
            </p>

            {/* 3-Stage Quick Road Map */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <a
                href="#problem"
                onClick={() => sounds.playPop()}
                className={`p-3.5 rounded-2xl border transition-all hover:scale-105 ${
                  isDark ? 'bg-red-500/10 border-red-500/30 text-white' : 'bg-red-50 border-red-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Stage 1: The Problem</span>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Why registers overflow and cause 200-cycle RAM stalls.
                </div>
              </a>

              <a
                href="#math-solution"
                onClick={() => sounds.playPop()}
                className={`p-3.5 rounded-2xl border transition-all hover:scale-105 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-white' : 'bg-purple-50 border-purple-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Stage 2: Discrete Math</span>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Liveness analysis, interference graphs, and coloring.
                </div>
              </a>

              <a
                href="#compiler-silicon"
                onClick={() => sounds.playPop()}
                className={`p-3.5 rounded-2xl border transition-all hover:scale-105 ${
                  isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-white' : 'bg-emerald-50 border-emerald-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Stage 3: Silicon Execution</span>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Compiled assembly running at full 3.3 GHz clock speed.
                </div>
              </a>
            </div>

            {/* CTAs with generous spacing */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-3">
              <a
                href="#problem"
                onClick={() => {
                  sounds.playLaser();
                  onExploreSimulation();
                }}
                className="flex items-center gap-2.5 px-6 sm:px-7 py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-600 text-white shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Step-by-Step Simulation</span>
              </a>

              <a
                href="#challenge"
                onClick={() => sounds.playPop()}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>Interactive Arcade</span>
              </a>

              <button
                onClick={() => {
                  sounds.playPop();
                  onStartTour();
                }}
                className={`flex items-center gap-2.5 px-5 py-4 rounded-2xl font-bold text-sm sm:text-base border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Classroom Slides (P)</span>
              </button>
            </div>

          </div>

          {/* Right Column: Interactive Hero Toy (Clean Variables) */}
          <div className="lg:col-span-5">
            <div className={`relative rounded-3xl border-2 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
              isDark ? 'bg-[#0F1424]/95 border-slate-700/80 shadow-cyan-950/20' : 'bg-white/95 border-slate-200'
            }`}>
              
              {/* Header inside toy */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors ${heroState === 0 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors ${heroState === 1 ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors ${heroState === 2 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  </div>
                  <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 ml-2">
                    {heroState === 0 && 'STEP 1: 4 PROGRAM VARIABLES'}
                    {heroState === 1 && 'STEP 2: DETECT INTERFERENCE EDGES ⚡'}
                    {heroState === 2 && 'STEP 3: GRAPH COLORING SOLVED ✨'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setIsAutoPlaying(!isAutoPlaying);
                    }}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isAutoPlaying
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 font-bold'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                    title={isAutoPlaying ? 'Pause loop' : 'Auto-run loop'}
                  >
                    {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  <button
                    onClick={handleNextHeroStep}
                    className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>
                      {heroState === 0 && 'Find Clashes ⚡'}
                      {heroState === 1 && 'Allocate Colors 🎨'}
                      {heroState === 2 && 'Reset ↺'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Telemetry Ribbon */}
              <div className="grid grid-cols-4 gap-2 py-2.5 border-b border-slate-200 dark:border-slate-800/80 text-center font-mono">
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold">Variables |V|</div>
                  <div className="text-xs font-black text-cyan-700 dark:text-cyan-400">4 Variables</div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold">Clashes |E|</div>
                  <div className={`text-xs font-black ${heroState >= 1 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {heroState === 0 ? 'Scanning...' : '3 Edges'}
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold">Chromatic χ</div>
                  <div className="text-xs font-black text-purple-700 dark:text-purple-400">χ(G) = 2</div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold">Spill Delay</div>
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">0.0 ns (0%)</div>
                </div>
              </div>

              {/* Interactive SVG Display */}
              <div className="relative h-72 w-full mt-2 flex items-center justify-center select-none">
                <svg className="w-full h-full" viewBox="0 0 310 280">
                  <defs>
                    <linearGradient id="hero-laser" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#F43F5E" />
                    </linearGradient>
                  </defs>

                  {/* Edges / Clash Lines */}
                  {heroEdges.map((e, idx) => {
                    const fromNode = heroItems[e.from];
                    const toNode = heroItems[e.to];
                    const isConflicted = heroState === 1;

                    return (
                      <g key={idx}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={isConflicted ? 'url(#hero-laser)' : isDark ? '#334155' : '#E2E8F0'}
                          strokeWidth={isConflicted ? '3.5' : '1.5'}
                          strokeDasharray={isConflicted ? '6 3' : 'none'}
                          className={isConflicted ? 'animate-pulse' : ''}
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {heroItems.map((n) => {
                    const isSelected = selectedHeroNode === n.id;
                    return (
                      <g
                        key={n.id}
                        className="cursor-pointer"
                        onClick={() => {
                          sounds.playPop();
                          setSelectedHeroNode(n.id);
                        }}
                      >
                        {/* Circle */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r="24"
                          fill={isDark ? '#1E293B' : '#FFFFFF'}
                          stroke={n.color}
                          strokeWidth={isSelected ? '4' : '3'}
                          className="transition-colors duration-300 drop-shadow-md"
                        />

                        {/* Variable identifier */}
                        <text
                          x={n.x}
                          y={n.y + 6}
                          textAnchor="middle"
                          fontSize="15"
                          fontWeight="bold"
                          fill={isDark ? '#FFFFFF' : '#0F172A'}
                        >
                          {n.id}
                        </text>

                        {/* Register Badge below */}
                        {heroState === 2 && (
                          <g transform={`translate(${n.x - 20}, ${n.y + 26})`}>
                            <rect
                              width="40"
                              height="18"
                              rx="9"
                              fill={n.color}
                              stroke="#FFFFFF"
                              strokeWidth="1"
                            />
                            <text
                              x="20"
                              y="12.5"
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="bold"
                              fill="#FFFFFF"
                            >
                              {n.id === 'a' ? 'R1' : 'R2'}
                            </text>
                          </g>
                        )}

                        {/* Label above */}
                        <text
                          x={n.x}
                          y={n.y - 28}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill={isDark ? '#CBD5E1' : '#334155'}
                        >
                          {n.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Explainer Footer */}
              <div className={`p-3 rounded-2xl border text-xs font-mono mt-2 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {heroState === 0 && 'Four program variables. Notice that var a overlaps with b, c, and d.'}
                {heroState === 1 && 'Interference edges drawn! But notice b, c, and d do NOT connect to each other!'}
                {heroState === 2 && '✨ Solved! b, c, and d safely share Register R2 sequentially. 4 variables fit in 2 registers!'}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
