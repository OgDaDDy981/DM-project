import React, { useState, useEffect } from 'react';
import {
  Code,
  Activity,
  GitBranch,
  Cpu,
  Play,
  RotateCcw,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface CompilerPipelineProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const CompilerPipeline: React.FC<CompilerPipelineProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const stages = [
    {
      id: 'source',
      title: isStoryMode ? '1. Human Code' : '1. Source Program',
      icon: Code,
      badge: 'Step 1: Write',
      color: '#06B6D4', // Cyan
      summary: 'Programmers create readable variables with semantic names.',
      description:
        'The developer writes code using human-friendly names (health, coins, score, shield, speed). At this stage, the computer treats variables as infinite abstract storage locations.',
    },
    {
      id: 'liveness',
      title: isStoryMode ? '2. Who Lives When?' : '2. Liveness Analysis',
      icon: Activity,
      badge: 'Step 2: Timelines',
      color: '#8B5CF6', // Purple
      summary: 'Calculate exact birth and death points for each variable.',
      description:
        'A variable is "ALIVE" from the moment it is calculated until it is read for the last time. Once read for the last time, it is "DEAD" and its pocket is free!',
    },
    {
      id: 'interference',
      title: isStoryMode ? '3. The Clash Map' : '3. Interference Graph',
      icon: GitBranch,
      badge: 'Step 3: Graph',
      color: '#F59E0B', // Amber
      summary: 'Draw a clash line between variables that are awake at the same time.',
      description:
        'Two variables "interfere" if they exist at the exact same moment. Connected variables cannot safely share a pocket without destroying each other\'s data.',
    },
    {
      id: 'registers',
      title: isStoryMode ? '4. The Rainbow Solution' : '4. Register Allocation',
      icon: Cpu,
      badge: 'Step 4: Color',
      color: '#10B981', // Emerald
      summary: 'Color vertices so adjacent nodes have different physical pockets.',
      description:
        'Vertex coloring maps every variable to a physical CPU pocket (R1, R2, R3). Compatible variables share slots; conflicting variables get distinct colors.',
    },
  ];

  // Auto-run pipeline sequence
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        sounds.playChime(1.1);
        setActiveStage((prev) => {
          if (prev >= 3) {
            setIsRunning(false);
            sounds.playVictory();
            return prev;
          }
          return prev + 1;
        });
      }, 2400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const handleRunFullCompilation = () => {
    sounds.playLaser();
    setActiveStage(0);
    setIsRunning(true);
  };

  const handleNextStage = () => {
    sounds.playPop();
    setIsRunning(false);
    setActiveStage((prev) => Math.min(3, prev + 1));
  };

  const handlePrevStage = () => {
    sounds.playPop();
    setIsRunning(false);
    setActiveStage((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    sounds.playPop();
    setIsRunning(false);
    setActiveStage(0);
  };

  return (
    <section id="pipeline" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Layers className="w-4 h-4" />
            <span>The 4-Step Journey</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            From Human Code to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              Lightning Fast Silicon
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Follow how your code transforms from typed text into colored graph dots, and finally into CPU registers.
          </p>
        </div>

        {/* Pipeline Controls Row */}
        <div className={`p-5 rounded-3xl border-2 flex flex-wrap items-center justify-between gap-5 shadow-xl ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
            <button
              onClick={handleRunFullCompilation}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Full 4-Step Pipeline</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setIsRunning(!isRunning);
              }}
              className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                isDark ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isRunning ? 'Pause' : 'Auto Play'}
            </button>

            <button
              onClick={handleReset}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-300 hover:text-black'
              }`}
              title="Reset Pipeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <button
              onClick={handlePrevStage}
              disabled={activeStage === 0}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              ← Prev
            </button>
            <span className="text-slate-500 dark:text-slate-400 px-2 font-black">
              Stage {activeStage + 1} of 4
            </span>
            <button
              onClick={handleNextStage}
              disabled={activeStage === 3}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              Next →
            </button>
          </div>
        </div>

        {/* 4 Pipeline Stages Navigation Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            const isCompleted = activeStage > idx;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  sounds.playPop();
                  setIsRunning(false);
                  setActiveStage(idx);
                }}
                className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-slate-800 border-2 shadow-2xl scale-[1.03]'
                      : 'bg-white border-2 shadow-2xl scale-[1.03]'
                    : isCompleted
                    ? isDark
                      ? 'bg-slate-900/80 border-emerald-500/40 opacity-90'
                      : 'bg-slate-50 border-emerald-500/40 opacity-90'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                    : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                }`}
                style={{
                  borderColor: isActive ? stage.color : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md"
                    style={{
                      backgroundColor: `${stage.color}20`,
                      color: stage.color,
                      border: `1.5px solid ${stage.color}50`,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black/30 text-white">
                    {stage.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{stage.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {stage.summary}
                </p>

                {isActive && (
                  <div
                    className="absolute bottom-0 left-6 right-6 h-1 rounded-t-full"
                    style={{ backgroundColor: stage.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Stage Content Detail View */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl relative overflow-hidden ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          
          <div className="max-w-3xl mb-8">
            <span
              className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border inline-block mb-3"
              style={{
                color: stages[activeStage].color,
                borderColor: `${stages[activeStage].color}50`,
                backgroundColor: `${stages[activeStage].color}15`,
              }}
            >
              Active Stage: {stages[activeStage].title}
            </span>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {stages[activeStage].description}
            </p>
          </div>

          {/* Interactive Visual Display Per Stage */}
          <div className={`p-6 rounded-2xl border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            
            {/* STAGE 1: Source Code */}
            {activeStage === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-2 uppercase font-bold">
                    High-Level Game Code (5 Variables)
                  </div>
                  <div className={`p-4 rounded-xl border font-mono text-xs sm:text-sm space-y-2 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}>
                    <div><span className="text-slate-400">1:</span> health = 100; <span className="text-slate-400">// Health created</span></div>
                    <div><span className="text-slate-400">2:</span> coins = 50; <span className="text-slate-400">// Coins collected</span></div>
                    <div><span className="text-slate-400">3:</span> score = health + coins; <span className="text-slate-400">// Coins dead!</span></div>
                    <div><span className="text-slate-400">4:</span> shield = score * 2; <span className="text-slate-400">// Score dead!</span></div>
                    <div><span className="text-slate-400">5:</span> speed = health + 10; <span className="text-slate-400">// Health dead!</span></div>
                    <div><span className="text-slate-400">6:</span> return shield + speed;</div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Why Human Code Looks Like This:</h4>
                  <p>
                    Programmers create as many named variables as needed to make logic clear and readable.
                  </p>
                  <p>
                    However, CPU hardware does not know what "health" or "coins" is! The computer must map all 5 variables into tiny machine pockets.
                  </p>
                  <button
                    onClick={() => setActiveStage(1)}
                    className="inline-flex items-center gap-2 text-xs font-mono text-cyan-500 font-bold hover:underline cursor-pointer"
                  >
                    <span>Proceed to Step 2: Who Lives When?</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: Liveness Analysis */}
            {activeStage === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-2 uppercase font-bold">
                    Variable Lifetimes (Lines 1 to 6)
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex justify-between items-center">
                      <span className="font-bold text-cyan-500">❤️ Health:</span>
                      <span className="text-slate-600 dark:text-slate-300">Live from Line 1 to 5</span>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex justify-between items-center">
                      <span className="font-bold text-purple-500">🪙 Coins:</span>
                      <span className="text-slate-600 dark:text-slate-300">Live from Line 2 to 3 (Short-lived)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                      <span className="font-bold text-emerald-500">🎯 Score:</span>
                      <span className="text-slate-600 dark:text-slate-300">Live from Line 3 to 4 (Short-lived)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center">
                      <span className="font-bold text-amber-500">🛡️ Shield:</span>
                      <span className="text-slate-600 dark:text-slate-300">Live from Line 4 to 6</span>
                    </div>
                    <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 flex justify-between items-center">
                      <span className="font-bold text-pink-500">⚡ Speed:</span>
                      <span className="text-slate-600 dark:text-slate-300">Live from Line 5 to 6</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">The Big Discovery:</h4>
                  <p>
                    By tracking when each variable starts and stops, the computer discovers which variables <strong>never meet in time</strong>!
                  </p>
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    <span className="font-bold">Key Insight:</span> Notice that <strong className="text-emerald-500">Coins</strong> dies at line 3, and <strong className="text-emerald-500">Shield</strong> is not born until line 4! They NEVER clash in time!
                  </div>
                  <button
                    onClick={() => setActiveStage(2)}
                    className="inline-flex items-center gap-2 text-xs font-mono text-purple-500 font-bold hover:underline cursor-pointer"
                  >
                    <span>Proceed to Step 3: Draw The Clash Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: Interference Graph */}
            {activeStage === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className={`h-64 flex items-center justify-center rounded-2xl border p-4 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                }`}>
                  <svg viewBox="0 0 300 240" className="w-full h-full">
                    {/* Edges */}
                    <line x1="150" y1="50" x2="70" y2="120" stroke="#F59E0B" strokeWidth="2.5" />
                    <line x1="150" y1="50" x2="90" y2="190" stroke="#F59E0B" strokeWidth="2.5" />
                    <line x1="150" y1="50" x2="210" y2="190" stroke="#F59E0B" strokeWidth="2.5" />
                    <line x1="210" y1="190" x2="230" y2="120" stroke="#F59E0B" strokeWidth="2.5" />

                    {/* Nodes */}
                    {[
                      { id: 'health', icon: '❤️', x: 150, y: 50 },
                      { id: 'coins', icon: '🪙', x: 70, y: 120 },
                      { id: 'score', icon: '🎯', x: 90, y: 190 },
                      { id: 'shield', icon: '🛡️', x: 210, y: 190 },
                      { id: 'speed', icon: '⚡', x: 230, y: 120 },
                    ].map((n) => (
                      <g key={n.id}>
                        <circle cx={n.x} cy={n.y} r="20" fill={isDark ? '#1E293B' : '#E2E8F0'} stroke="#F59E0B" strokeWidth="2" />
                        <text x={n.x} y={n.y + 6} textAnchor="middle" fontSize="14">
                          {n.icon}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Connecting the Enemies:</h4>
                  <p>
                    Every variable becomes a circle. Whenever two variables are active at the same time, we draw an <strong>enemy clash line</strong> between them.
                  </p>
                  <p>
                    Notice there is <strong className="text-emerald-500">NO LINE</strong> between Coins and Shield! That means they are safe to share the same pocket!
                  </p>
                  <button
                    onClick={() => setActiveStage(3)}
                    className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-bold hover:underline cursor-pointer"
                  >
                    <span>Proceed to Step 4: Color The Circles!</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 4: Register Allocation */}
            {activeStage === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="text-xs font-mono text-slate-400 uppercase font-bold">
                    Assigned CPU Hardware Pockets (k = 3)
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-cyan-500/15 border-2 border-cyan-500/40 text-center font-mono">
                      <div className="text-xs text-cyan-500 font-bold">POCKET 1</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-1">❤️ Health</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-500/15 border-2 border-purple-500/40 text-center font-mono">
                      <div className="text-xs text-purple-500 font-bold">POCKET 2</div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-1">🪙 ➔ 🛡️</div>
                      <div className="text-[10px] text-purple-400 font-bold">Reused!</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-center font-mono">
                      <div className="text-xs text-emerald-500 font-bold">POCKET 3</div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-1">🎯 ➔ ⚡</div>
                      <div className="text-[10px] text-emerald-400 font-bold">Reused!</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Mission Accomplished! 🎉</h4>
                  <p>
                    By solving this graph coloring puzzle, <strong>5 variables fit into only 3 physical pockets</strong> with ZERO collisions!
                  </p>
                  <p>
                    Zero variables were thrown into slow RAM, giving your game 100% maximum lightning speed!
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleRunFullCompilation}
                      className="inline-flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Replay Compilation Pipeline</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
