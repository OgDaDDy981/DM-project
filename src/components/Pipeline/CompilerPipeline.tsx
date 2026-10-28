import React, { useState, useEffect } from 'react';
import {
  Code,
  Activity,
  GitBranch,
  Cpu,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Terminal,
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
  const [selectedVar, setSelectedVar] = useState<string | null>('health');
  const [livenessLine, setLivenessLine] = useState<number>(3);

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

  const pipelineVariables = [
    {
      id: 'health',
      name: 'health',
      friendlyName: 'Health',
      icon: '❤️',
      start: 1,
      end: 5,
      reg: 'R1',
      color: '#06B6D4',
      defLine: 1,
      lastUse: 5,
      desc: 'Player vitality spawned at Line 1, kept alive until final speed calc at Line 5.',
    },
    {
      id: 'coins',
      name: 'coins',
      friendlyName: 'Coins',
      icon: '🪙',
      start: 2,
      end: 3,
      reg: 'R2',
      color: '#8B5CF6',
      defLine: 2,
      lastUse: 3,
      desc: 'Collected at Line 2, converted to score at Line 3. Dead after Line 3!',
    },
    {
      id: 'score',
      name: 'score',
      friendlyName: 'Score',
      icon: '🎯',
      start: 3,
      end: 4,
      reg: 'R3',
      color: '#10B981',
      defLine: 3,
      lastUse: 4,
      desc: 'Calculated at Line 3 from health + coins. Dead after Line 4!',
    },
    {
      id: 'shield',
      name: 'shield',
      friendlyName: 'Shield',
      icon: '🛡️',
      start: 4,
      end: 6,
      reg: 'R2',
      color: '#8B5CF6',
      defLine: 4,
      lastUse: 6,
      desc: 'Shield created at Line 4. Reuses R2 since coins is already dead!',
    },
    {
      id: 'speed',
      name: 'speed',
      friendlyName: 'Speed',
      icon: '⚡',
      start: 5,
      end: 6,
      reg: 'R3',
      color: '#10B981',
      defLine: 5,
      lastUse: 6,
      desc: 'Speed created at Line 5. Reuses R3 since score is already dead!',
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
              className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                isDark ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Auto Play'}</span>
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

        {/* 4 Pipeline Stages Navigation Bar with Interconnect Stream */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
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
                  className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative cursor-pointer group ${
                    isActive
                      ? isDark
                        ? 'bg-slate-800/95 border-2 shadow-2xl scale-[1.03] ring-2 ring-cyan-400/30'
                        : 'bg-white border-2 shadow-2xl scale-[1.03] ring-2 ring-cyan-500/20'
                      : isCompleted
                      ? isDark
                        ? 'bg-slate-900/80 border-emerald-500/40 opacity-90'
                        : 'bg-slate-50 border-emerald-500/40 opacity-90'
                      : isDark
                      ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                  }`}
                  style={{
                    borderColor: isActive ? stage.color : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${stage.color}20`,
                        color: stage.color,
                        border: `1.5px solid ${stage.color}50`,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black/40 text-white">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between">
                    <span>{stage.title}</span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {stage.summary}
                  </p>

                  {isActive && (
                    <div
                      className="absolute bottom-0 left-6 right-6 h-1 rounded-t-full shadow-lg"
                      style={{ backgroundColor: stage.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Content Detail View */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl relative overflow-hidden ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          <div className="hud-corner-tl opacity-75" />
          <div className="hud-corner-tr opacity-75" />
          <div className="hud-corner-bl opacity-75" />
          <div className="hud-corner-br opacity-75" />
          
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
            
            {/* STAGE 1: Interactive Source Code & AST Lexing */}
            {activeStage === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-bold">
                    <span>Source Program (Click any variable to inspect)</span>
                    <span className="text-cyan-400">5 Symbolic Identifiers</span>
                  </div>
                  <div className={`p-5 rounded-2xl border font-mono text-xs sm:text-sm space-y-2.5 shadow-inner ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}>
                    {[
                      { line: 1, v: 'health', code: 'health = 100;', comment: '// Player health initialized' },
                      { line: 2, v: 'coins', code: 'coins = 50;', comment: '// Coins collected in level' },
                      { line: 3, v: 'score', code: 'score = health + coins;', comment: '// coins read for last time (Dead!)' },
                      { line: 4, v: 'shield', code: 'shield = score * 2;', comment: '// score read for last time (Dead!)' },
                      { line: 5, v: 'speed', code: 'speed = health + 10;', comment: '// health read for last time (Dead!)' },
                      { line: 6, v: null, code: 'return shield + speed;', comment: '// Final game state rendered' },
                    ].map((row) => (
                      <div
                        key={row.line}
                        onClick={() => {
                          if (row.v) {
                            sounds.playPop();
                            setSelectedVar(row.v);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          row.v && selectedVar === row.v
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div>
                          <span className="text-slate-500 mr-3">{row.line}:</span>
                          <span>{row.code}</span>
                        </div>
                        <span className="text-slate-500 text-xs hidden sm:inline">{row.comment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-2 uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Symbolic Variable Inspector</span>
                    </div>
                    {selectedVar ? (
                      (() => {
                        const v = pipelineVariables.find((pv) => pv.id === selectedVar);
                        if (!v) return null;
                        return (
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-white">
                              <span>{v.icon} {v.friendlyName} (`{v.name}`)</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black" style={{ backgroundColor: `${v.color}25`, color: v.color }}>
                                Assigned: {v.reg}
                              </span>
                            </div>
                            <div className="text-slate-400">Created: Line {v.defLine} • Last Read: Line {v.lastUse}</div>
                            <p className="text-slate-300 text-xs leading-relaxed font-sans">{v.desc}</p>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-slate-400 font-sans">Click any line of code to inspect its variable scope.</p>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm">
                    Compilers cannot store every named variable into an infinite pool. The CPU only provides a fixed register file ($k=3$), requiring an automatic mapping.
                  </p>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      setActiveStage(1);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 font-black hover:underline cursor-pointer"
                  >
                    <span>Proceed to Step 2: Who Lives When?</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: Interactive Liveness Timeline & Gantt Analysis */}
            {activeStage === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-bold">
                    <span>Liveness Intervals (Lines 1 to 6)</span>
                    <span className="text-purple-400">Interactive Line Cursor: Line {livenessLine}</span>
                  </div>

                  {/* Scrubber slider for timeline line */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">Line:</span>
                    <div className="grid grid-cols-6 gap-1.5 flex-1">
                      {[1, 2, 3, 4, 5, 6].map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            sounds.playPop();
                            setLivenessLine(l);
                          }}
                          className={`py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                            livenessLine === l
                              ? 'bg-purple-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          L{l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Gantt Bar Matrix */}
                  <div className={`p-4 rounded-2xl border space-y-3 font-mono text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    {pipelineVariables.map((v) => {
                      const isAliveAtLine = livenessLine >= v.start && livenessLine <= v.end;
                      const leftPercent = ((v.start - 1) / 5) * 100;
                      const widthPercent = ((v.end - v.start) / 5) * 100;

                      return (
                        <div key={v.id} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold flex items-center gap-1.5">
                              <span>{v.icon}</span>
                              <span className="text-slate-900 dark:text-white">{v.friendlyName}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAliveAtLine
                                ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                                : 'text-slate-500'
                            }`}>
                              {isAliveAtLine ? 'ALIVE NOW' : `Lines ${v.start}-${v.end}`}
                            </span>
                          </div>

                          <div className="h-4 w-full rounded-lg bg-slate-800/60 relative overflow-hidden">
                            <div
                              className="absolute top-0 bottom-0 rounded-lg transition-all duration-300"
                              style={{
                                left: `${leftPercent}%`,
                                width: `${Math.max(12, widthPercent)}%`,
                                backgroundColor: v.color,
                                opacity: isAliveAtLine ? 1 : 0.45,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Liveness Discovery at Line {livenessLine}:</h4>
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
                  }`}>
                    <span className="font-bold">Active Variables at Line {livenessLine}: </span>
                    {pipelineVariables
                      .filter((v) => livenessLine >= v.start && livenessLine <= v.end)
                      .map((v) => `${v.friendlyName} (${v.name})`)
                      .join(', ')}
                  </div>

                  <p className="text-xs leading-relaxed">
                    Notice that <strong className="text-purple-400">Coins</strong> dies at Line 3, and <strong className="text-purple-400">Shield</strong> is only born at Line 4.
                    Because their active intervals never overlap, they can safely share <strong>Register R2</strong>!
                  </p>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      setActiveStage(2);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 font-black hover:underline cursor-pointer"
                  >
                    <span>Proceed to Step 3: Draw The Clash Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: Interference Graph with Collision Lasers */}
            {activeStage === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={`lg:col-span-7 h-72 rounded-2xl border p-4 relative select-none flex items-center justify-center ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                }`}>
                  <svg viewBox="0 0 320 260" className="w-full h-full">
                    {/* Laser Clash Lines */}
                    {[
                      { u: { x: 160, y: 40 }, v: { x: 60, y: 110 } }, // health - coins
                      { u: { x: 60, y: 110 }, v: { x: 90, y: 200 } }, // coins - score
                      { u: { x: 160, y: 40 }, v: { x: 90, y: 200 } }, // health - score
                      { u: { x: 160, y: 40 }, v: { x: 230, y: 200 } }, // health - shield
                      { u: { x: 90, y: 200 }, v: { x: 230, y: 200 } }, // score - shield
                      { u: { x: 230, y: 200 }, v: { x: 260, y: 110 } }, // shield - speed
                    ].map((edge, idx) => (
                      <line
                        key={idx}
                        x1={edge.u.x}
                        y1={edge.u.y}
                        x2={edge.v.x}
                        y2={edge.v.y}
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeDasharray="6 3"
                        className="animate-laser-dash"
                      />
                    ))}

                    {/* Nodes */}
                    {[
                      { id: 'health', name: 'Health', icon: '❤️', x: 160, y: 40, deg: 3 },
                      { id: 'coins', name: 'Coins', icon: '🪙', x: 60, y: 110, deg: 2 },
                      { id: 'score', name: 'Score', icon: '🎯', x: 90, y: 200, deg: 3 },
                      { id: 'shield', name: 'Shield', icon: '🛡️', x: 230, y: 200, deg: 3 },
                      { id: 'speed', name: 'Speed', icon: '⚡', x: 260, y: 110, deg: 1 },
                    ].map((n) => (
                      <g key={n.id} className="cursor-pointer">
                        <circle cx={n.x} cy={n.y} r="22" fill={isDark ? '#1E293B' : '#E2E8F0'} stroke="#F59E0B" strokeWidth="2.5" />
                        <text x={n.x} y={n.y + 7} textAnchor="middle" fontSize="16">
                          {n.icon}
                        </text>
                        <text x={n.x} y={n.y + 36} textAnchor="middle" fontSize="10" fontWeight="bold" fill={isDark ? '#F1F5F9' : '#0F172A'}>
                          {n.name} (d={n.deg})
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="lg:col-span-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">The Interference Topology:</h4>
                  <p>
                    Every variable becomes a vertex. An edge is placed between any two variables whose live ranges overlap.
                  </p>
                  <div className={`p-4 rounded-xl border text-xs font-mono space-y-1.5 ${
                    isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Missing Edge = Opportunity for Reuse!</span>
                    </div>
                    <div>Notice that <strong>Coins (🪙)</strong> has NO edge to <strong>Shield (🛡️)</strong>!</div>
                    <div>And <strong>Score (🎯)</strong> has NO edge to <strong>Speed (⚡)</strong>!</div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      setActiveStage(3);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-black hover:underline cursor-pointer"
                  >
                    <span>Proceed to Step 4: Color The Circles!</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 4: Register Allocation & Assembly Code Generation */}
            {activeStage === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Allocated Physical Registers (k = 3)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-cyan-500/15 border-2 border-cyan-500/40 text-center font-mono">
                      <div className="text-xs text-cyan-400 font-bold">POCKET R1</div>
                      <div className="text-base font-black text-slate-900 dark:text-white mt-1">❤️ Health</div>
                      <div className="text-[10px] text-slate-400 mt-1">0.3ns Latency</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-500/15 border-2 border-purple-500/40 text-center font-mono">
                      <div className="text-xs text-purple-400 font-bold">POCKET R2</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-1">🪙 ➔ 🛡️</div>
                      <div className="text-[10px] text-purple-300 font-bold mt-1">Reused for Shield!</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-center font-mono">
                      <div className="text-xs text-emerald-400 font-bold">POCKET R3</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-1">🎯 ➔ ⚡</div>
                      <div className="text-[10px] text-emerald-300 font-bold mt-1">Reused for Speed!</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Emitted Machine Assembly (Zero Spill Stalls!)</span>
                  </div>
                  <div className={`p-4 rounded-2xl border font-mono text-xs space-y-1.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div><span className="text-cyan-400 font-bold">mov</span> <span className="text-cyan-300">r1</span>, 100 <span className="text-slate-500">; r1 = health</span></div>
                    <div><span className="text-purple-400 font-bold">mov</span> <span className="text-purple-300">r2</span>, 50 <span className="text-slate-500">; r2 = coins</span></div>
                    <div><span className="text-emerald-400 font-bold">add</span> <span className="text-emerald-300">r3</span>, r1, r2 <span className="text-slate-500">; r3 = score (coins dead!)</span></div>
                    <div><span className="text-purple-400 font-bold">shl</span> <span className="text-purple-300">r2</span>, r3, 1 <span className="text-slate-500">; r2 = shield (reuses r2!)</span></div>
                    <div><span className="text-emerald-400 font-bold">add</span> <span className="text-emerald-300">r3</span>, r1, 10 <span className="text-slate-500">; r3 = speed (reuses r3!)</span></div>
                    <div><span className="text-yellow-400 font-bold">add</span> <span className="text-yellow-300">r0</span>, r2, r3 <span className="text-slate-500">; return shield + speed</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleRunFullCompilation}
                      className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-black hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Replay Compilation Pipeline</span>
                    </button>
                    <span className="text-xs font-mono text-emerald-400 font-black">
                      100% In-Register Execution
                    </span>
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
