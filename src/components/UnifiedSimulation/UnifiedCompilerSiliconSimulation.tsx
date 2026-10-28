import React, { useState, useEffect } from 'react';
import {
  Code,
  Activity,
  GitBranch,
  Cpu,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  AlertTriangle,
  Zap,
  HardDrive,
  Sparkles,
  Clock,
  Layers,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEffects';

interface UnifiedSimulationProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const UnifiedCompilerSiliconSimulation: React.FC<UnifiedSimulationProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  // Master execution line: 1 to 6
  const [currentLine, setCurrentLine] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1800); // ms per step
  
  // Hardware Register Budget: 3 (Optimal, 0 Spills) or 2 (Constrained, Spills to RAM)
  const [registerBudget, setRegisterBudget] = useState<number>(3);

  // Active Deep Dive Tab: 'simulation' | 'compiler-math' | 'memory-speed'
  const [activeTab, setActiveTab] = useState<'simulation' | 'compiler-math' | 'memory-speed'>('simulation');

  // Selected variable for deep inspector
  const [selectedVarId, setSelectedVarId] = useState<string>('coins');

  // Program variables definition
  const variables = [
    {
      id: 'health',
      name: 'health',
      friendlyName: 'Health',
      icon: '❤️',
      start: 1,
      end: 5,
      regK3: 'R1',
      regK2: 'R1',
      valAtEnd: '100',
      color: '#06B6D4', // Cyan
      desc: 'Player vitality. Created at Line 1, read continuously until Line 5.',
      assembly: 'mov r1, 100',
    },
    {
      id: 'coins',
      name: 'coins',
      friendlyName: 'Coins',
      icon: '🪙',
      start: 2,
      end: 3,
      regK3: 'R2',
      regK2: 'R2',
      valAtEnd: '50',
      color: '#8B5CF6', // Purple
      desc: 'Level coin count. Created at Line 2, consumed to calculate score at Line 3. Dead after Line 3!',
      assembly: 'mov r2, 50',
    },
    {
      id: 'score',
      name: 'score',
      friendlyName: 'Score',
      icon: '🎯',
      start: 3,
      end: 4,
      regK3: 'R3',
      regK2: 'R2', // in k=2, reused immediately from dead coins
      valAtEnd: '150',
      color: '#10B981', // Lime
      desc: 'Player score = health + coins. Created at Line 3, consumed at Line 4. Dead after Line 4!',
      assembly: 'add r3, r1, r2',
    },
    {
      id: 'shield',
      name: 'shield',
      friendlyName: 'Shield',
      icon: '🛡️',
      start: 4,
      end: 6,
      regK3: 'R2', // REUSES R2 since coins is dead!
      regK2: 'RAM [rbp-8]', // SPILLED in k=2!
      valAtEnd: '300',
      color: '#8B5CF6', // Reuses R2 color in k=3, or Red in k=2
      desc: 'Shield energy = score * 2. In k=3, reuses R2! In k=2, forced to spill to RAM stack!',
      assembly: 'shl r2, r3, 1',
    },
    {
      id: 'speed',
      name: 'speed',
      friendlyName: 'Speed',
      icon: '⚡',
      start: 5,
      end: 6,
      regK3: 'R3', // REUSES R3 since score is dead!
      regK2: 'R2',
      valAtEnd: '110',
      color: '#10B981', // Reuses R3 color
      desc: 'Speed boost = health + 10. Reuses R3 since score is dead!',
      assembly: 'add r3, r1, 10',
    },
  ];

  // 6 lines of code with detailed pedagogical metadata
  const codeLines = [
    {
      line: 1,
      code: 'health = 100;',
      asm: 'mov r1, 100',
      varsBorn: ['health'],
      varsDying: [],
      activeVars: ['health'],
      desc: 'Player health initialized to 100. Stored in Register R1.',
      event: 'birth',
    },
    {
      line: 2,
      code: 'coins = 50;',
      asm: 'mov r2, 50',
      varsBorn: ['coins'],
      varsDying: [],
      activeVars: ['health', 'coins'],
      desc: '50 coins collected. Both health & coins are alive. Stored in R1 and R2.',
      event: 'birth',
    },
    {
      line: 3,
      code: 'score = health + coins;',
      asm: 'add r3, r1, r2',
      varsBorn: ['score'],
      varsDying: ['coins'],
      activeVars: ['health', 'coins', 'score'],
      desc: 'Score computed! "coins" is read for the last time—COINS DIES HERE! Register R2 is now free!',
      event: 'handoff',
    },
    {
      line: 4,
      code: 'shield = score * 2;',
      asm: registerBudget === 3 ? 'shl r2, r3, 1  ; Reuses R2!' : 'mov [rbp-8], r2 ; SPILLED TO RAM!',
      varsBorn: ['shield'],
      varsDying: ['score'],
      activeVars: ['health', 'score', 'shield'],
      desc: registerBudget === 3
        ? 'Shield activated! Since coins died at Line 3, shield safely inherits Register R2 with 0 stalls!'
        : '🚨 SPILL DISASTER! With only 2 registers, shield cannot fit! Evicted to slow RAM stack [rbp-8]!',
      event: registerBudget === 3 ? 'handoff' : 'spill',
    },
    {
      line: 5,
      code: 'speed = health + 10;',
      asm: 'add r3, r1, 10  ; Reuses R3!',
      varsBorn: ['speed'],
      varsDying: ['health'],
      activeVars: ['health', 'shield', 'speed'],
      desc: 'Speed calculated! Health read for last time (health dies!). Speed safely inherits Register R3!',
      event: 'handoff',
    },
    {
      line: 6,
      code: 'return shield + speed;',
      asm: registerBudget === 3 ? 'add r0, r2, r3  ; In-register' : 'mov r1, [rbp-8]; 200-cycle RAM stall!\nadd r0, r1, r2',
      varsBorn: [],
      varsDying: ['shield', 'speed'],
      activeVars: ['shield', 'speed'],
      desc: 'Final frame rendered! All variables consumed. Execution complete.',
      event: 'finish',
    },
  ];

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentLine((prev) => {
          if (prev >= 6) {
            setIsPlaying(false);
            sounds.playVictory();
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            } catch {}
            return 6;
          }
          const next = prev + 1;
          if (next === 4 && registerBudget === 2) {
            sounds.playSpill();
          } else if (next === 3 || next === 4 || next === 5) {
            sounds.playHandoff();
          } else {
            sounds.playPop();
          }
          return next;
        });
      }, playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, registerBudget]);

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentLine < 6) {
      const next = currentLine + 1;
      setCurrentLine(next);
      if (next === 4 && registerBudget === 2) {
        sounds.playSpill();
      } else if (next === 3 || next === 4 || next === 5) {
        sounds.playHandoff();
      } else {
        sounds.playPop();
      }
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentLine > 1) {
      sounds.playPop();
      setCurrentLine(currentLine - 1);
    }
  };

  const handleJumpToLine = (line: number) => {
    sounds.playPop();
    setIsPlaying(false);
    setCurrentLine(line);
  };

  const handleReset = () => {
    sounds.playPop();
    setIsPlaying(false);
    setCurrentLine(1);
  };

  const currentInfo = codeLines[currentLine - 1];

  // Graph Nodes & Edges
  const graphNodes = [
    { id: 'health', name: 'Health', icon: '❤️', x: 160, y: 35, deg: 3, reg: 'R1', color: '#06B6D4' },
    { id: 'coins', name: 'Coins', icon: '🪙', x: 65, y: 110, deg: 2, reg: 'R2', color: '#8B5CF6' },
    { id: 'score', name: 'Score', icon: '🎯', x: 95, y: 200, deg: 3, reg: 'R3', color: '#10B981' },
    { id: 'shield', name: 'Shield', icon: '🛡️', x: 225, y: 200, deg: 3, reg: registerBudget === 3 ? 'R2' : 'RAM', color: registerBudget === 3 ? '#8B5CF6' : '#EF4444' },
    { id: 'speed', name: 'Speed', icon: '⚡', x: 255, y: 110, deg: 1, reg: 'R3', color: '#10B981' },
  ];

  const graphEdges = [
    { u: 'health', v: 'coins', activeLines: [2] },
    { u: 'coins', v: 'score', activeLines: [3] },
    { u: 'health', v: 'score', activeLines: [3] },
    { u: 'health', v: 'shield', activeLines: [4, 5] },
    { u: 'score', v: 'shield', activeLines: [4] },
    { u: 'shield', v: 'speed', activeLines: [5, 6] },
  ];

  // Cycle & Latency calculation
  const totalCycles = registerBudget === 3 ? currentLine : (currentLine >= 4 ? currentLine + 200 : currentLine);
  const totalLatencyNs = registerBudget === 3 ? (currentLine * 0.3).toFixed(1) : (currentLine >= 4 ? (60.0 + currentLine * 0.3).toFixed(1) : (currentLine * 0.3).toFixed(1));

  return (
    <section id="simulation" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 1. Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{isStoryMode ? 'The Unified Compiler & Silicon Experience' : 'Formal Liveness Analysis & Microarchitecture Simulation'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            {isStoryMode ? 'How Code Turns Into ' : 'From Abstract Source Code to '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              {isStoryMode ? 'Blazing Fast Hardware' : 'Physical CPU Silicon Registers'}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isStoryMode
              ? 'Watch how human variables, compiler math, and physical CPU registers dance together in real time. Step through the lines or simulate what happens when hardware registers run out.'
              : 'Interactive execution tracing: Symbolic AST instructions → Live range computation → Interference graph construction → Chaitin-Briggs k-coloring → Microarchitectural register file allocation & memory spilling.'}
          </p>
        </div>

        {/* 2. Interactive Mission Control Toolbar */}
        <div className={`p-4 sm:p-5 rounded-3xl border-2 shadow-2xl flex flex-wrap items-center justify-between gap-4 transition-all ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          {/* Playback & Line Step Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                sounds.playPop();
                setIsPlaying(!isPlaying);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play Simulation'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setPlaybackSpeed((prev) => (prev === 1800 ? 900 : 1800));
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                playbackSpeed === 900
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-black'
              }`}
              title="Toggle Playback Speed"
            >
              {playbackSpeed === 900 ? '⚡ 2× Speed' : '🐢 1× Speed'}
            </button>

            <div className="flex items-center gap-1 bg-slate-800/60 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={handleStepBack}
                disabled={currentLine <= 1}
                className="p-2 rounded-xl text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-700 transition-all"
                title="Step Backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs font-mono font-black text-cyan-400">
                Line {currentLine} / 6
              </span>

              <button
                onClick={handleStepForward}
                disabled={currentLine >= 6}
                className="p-2 rounded-xl text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-700 transition-all"
                title="Step Forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleReset}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-black'
              }`}
              title="Reset to Line 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Line Scrubber Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs font-mono font-bold text-slate-400 mr-1 hidden sm:inline">Jump:</span>
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <button
                key={l}
                onClick={() => handleJumpToLine(l)}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                  currentLine === l
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 scale-110 ring-2 ring-cyan-300'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-black border border-slate-200'
                }`}
              >
                L{l}
              </button>
            ))}
          </div>

          {/* Hardware Register Budget Toggle (k=3 vs k=2) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">Hardware Budget:</span>
            <div className="flex items-center bg-slate-800/60 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={() => {
                  sounds.playPop();
                  setRegisterBudget(3);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  registerBudget === 3
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                k = 3 (Perfect Fit)
              </button>
              <button
                onClick={() => {
                  sounds.playSpill();
                  setRegisterBudget(2);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  registerBudget === 2
                    ? 'bg-red-500 text-white shadow-md animate-pulse'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>k = 2 (RAM Spill!)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Real-Time Hardware Telemetry Strip */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Silicon Registers In Use</span>
            </span>
            <div className="text-lg font-black font-mono text-cyan-400">
              {registerBudget === 3 ? `${Math.min(3, currentInfo.activeVars.length)} / 3 Registers` : `${Math.min(2, currentInfo.activeVars.length)} / 2 Registers`}
            </div>
            <div className="text-[11px] text-slate-400">0.3ns Flip-Flop Latency</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>CPU Execution Cycles</span>
            </span>
            <div className="text-lg font-black font-mono text-purple-400">
              {totalCycles} Cycles
            </div>
            <div className="text-[11px] text-slate-400">
              {registerBudget === 3 ? '0 Stall Bubbles' : currentLine >= 4 ? '⚠️ +200 RAM Stalls!' : '0 Stalls so far'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>Elapsed Real Time</span>
            </span>
            <div className="text-lg font-black font-mono text-emerald-400">
              {totalLatencyNs} ns
            </div>
            <div className="text-[11px] text-slate-400">
              {registerBudget === 3 ? '3.3 GHz Max Turbo Speed' : currentLine >= 4 ? 'Throttled by DRAM Bus' : 'Full Speed'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-pink-400" />
              <span>Memory Spilling Status</span>
            </span>
            <div className={`text-lg font-black font-mono ${registerBudget === 3 ? 'text-emerald-400' : currentLine >= 4 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {registerBudget === 3 ? 'Zero Spills (100% Cache Hit)' : currentLine >= 4 ? 'Spilled to [rbp - 8]' : 'Approaching Threshold'}
            </div>
            <div className="text-[11px] text-slate-400">
              {registerBudget === 3 ? 'Registers suffice for all vars' : currentLine >= 4 ? 'Stack frame eviction' : 'Capacity 2 exhausted at L4'}
            </div>
          </div>
        </div>

        {/* 4. The 4 Synchronized Master Simulation Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* PANE 1: Human Code & Compiler IR Assembly (Left Col - 4 cols) */}
          <div className={`lg:col-span-4 p-5 sm:p-6 rounded-3xl border-2 flex flex-col justify-between shadow-xl ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    1. Code & Compiler IR
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                  Active: Line {currentLine}
                </span>
              </div>

              {/* Code Lines Listing */}
              <div className="space-y-2 font-mono text-xs">
                {codeLines.map((item) => {
                  const isCurrent = item.line === currentLine;
                  return (
                    <div
                      key={item.line}
                      onClick={() => handleJumpToLine(item.line)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        isCurrent
                          ? 'bg-cyan-500/20 border-cyan-400/80 text-white shadow-md scale-[1.02]'
                          : isDark
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 text-right font-mono ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {item.line}:
                          </span>
                          <span className={isCurrent ? 'text-white' : ''}>{item.code}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-black text-cyan-400 bg-cyan-500/30 px-2 py-0.5 rounded-md animate-pulse">
                            EXEC
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pl-7">
                        <span className="text-purple-400 font-mono">{item.asm}</span>
                        {item.event === 'handoff' && (
                          <span className="text-emerald-400 font-bold text-[10px]">Slot Reused!</span>
                        )}
                        {item.event === 'spill' && (
                          <span className="text-red-400 font-bold text-[10px]">Spilled to RAM!</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Compiler Commentary Box */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                isDark ? 'bg-slate-900/80 border-cyan-500/30 text-slate-300' : 'bg-cyan-50 border-cyan-200 text-cyan-950'
              }`}>
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compiler Analysis at Line {currentLine}:</span>
                </div>
                <p>{currentInfo.desc}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono">
              Tip: Click any code line or use the scrubber above to jump execution.
            </div>
          </div>

          {/* PANE 2: Compiler Liveness Gantt Timelines (Mid-Left Col - 4 cols) */}
          <div className={`lg:col-span-4 p-5 sm:p-6 rounded-3xl border-2 flex flex-col justify-between shadow-xl ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    2. Liveness Timelines
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                  {currentInfo.activeVars.length} Variables Alive Now
                </span>
              </div>

              {/* Gantt Timeline Chart */}
              <div className="space-y-3 font-mono text-xs">
                {/* Timeline Header Numbers */}
                <div className="grid grid-cols-6 text-center text-[10px] font-bold text-slate-500 border-b pb-1 border-slate-800">
                  <span>L1</span>
                  <span>L2</span>
                  <span>L3</span>
                  <span>L4</span>
                  <span>L5</span>
                  <span>L6</span>
                </div>

                {/* Variable Lifespan Bars */}
                {variables.map((v) => {
                  const isAlive = currentLine >= v.start && currentLine <= v.end;
                  const leftPercent = ((v.start - 1) / 5) * 100;
                  const widthPercent = ((v.end - v.start) / 5) * 100;

                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        sounds.playPop();
                        setSelectedVarId(v.id);
                      }}
                      className={`space-y-1 p-2 rounded-xl border transition-all cursor-pointer ${
                        selectedVarId === v.id
                          ? 'border-purple-400/80 bg-purple-500/10'
                          : 'border-transparent hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>{v.icon}</span>
                          <span className="text-white">{v.friendlyName}</span>
                          <span className="text-[10px] text-slate-400">({v.name})</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAlive
                            ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                            : 'text-slate-500'
                        }`}>
                          {isAlive ? 'ALIVE NOW' : `Lines ${v.start}–${v.end}`}
                        </span>
                      </div>

                      {/* Bar Container */}
                      <div className="h-4 w-full rounded-lg bg-slate-800/60 relative overflow-hidden">
                        {/* Current Line Vertical Marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10 shadow-sm"
                          style={{ left: `${((currentLine - 1) / 5) * 100}%` }}
                        />

                        {/* Active Range Bar */}
                        <div
                          className="absolute top-0 bottom-0 rounded-lg transition-all duration-300"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(16, widthPercent)}%`,
                            backgroundColor: v.color,
                            opacity: isAlive ? 1 : 0.45,
                            boxShadow: isAlive ? `0 0 12px ${v.color}80` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* The "Why Graph Coloring Works" Callout */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                isDark ? 'bg-slate-900/80 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-purple-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Fundamental Rule of Liveness:</span>
                </div>
                <p>
                  Two variables can share the same physical register if and only if their active intervals <strong className="text-white">DO NOT OVERLAP</strong>.
                  Notice <strong className="text-purple-300">Coins [2–3]</strong> dies before <strong className="text-purple-300">Shield [4–6]</strong> is born!
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono">
              Cyan line indicates compiler's active instruction pointer.
            </div>
          </div>

          {/* PANE 3: Conflict Graph & Inside CPU Silicon (Right Col - 4 cols) */}
          <div className={`lg:col-span-4 p-5 sm:p-6 rounded-3xl border-2 flex flex-col justify-between shadow-xl ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-700/60">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    3. Conflict Graph & Coloring
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                  χ(G) = 3 Colors
                </span>
              </div>

              {/* SVG Conflict Graph */}
              <div className={`h-60 rounded-2xl border relative flex items-center justify-center overflow-hidden ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
              }`}>
                <svg viewBox="0 0 320 250" className="w-full h-full select-none">
                  {/* Edges */}
                  {graphEdges.map((e, idx) => {
                    const uNode = graphNodes.find((n) => n.id === e.u)!;
                    const vNode = graphNodes.find((n) => n.id === e.v)!;
                    const isClashingNow = e.activeLines.includes(currentLine);

                    return (
                      <g key={idx}>
                        <line
                          x1={uNode.x}
                          y1={uNode.y}
                          x2={vNode.x}
                          y2={vNode.y}
                          stroke={isClashingNow ? '#EF4444' : '#64748B'}
                          strokeWidth={isClashingNow ? '3.5' : '1.5'}
                          strokeDasharray={isClashingNow ? '6 3' : 'none'}
                          className={isClashingNow ? 'animate-pulse' : ''}
                          opacity={isClashingNow ? 1 : 0.4}
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graphNodes.map((n) => {
                    const isAlive = currentInfo.activeVars.includes(n.id);
                    const isSelected = selectedVarId === n.id;

                    return (
                      <g
                        key={n.id}
                        className="cursor-pointer transition-transform"
                        onClick={() => {
                          sounds.playPop();
                          setSelectedVarId(n.id);
                        }}
                      >
                        {/* Selection Glow */}
                        {(isAlive || isSelected) && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r="28"
                            fill="none"
                            stroke={n.color}
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            className="animate-spin"
                            style={{ animationDuration: '6s' }}
                          />
                        )}

                        {/* Node Body */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r="22"
                          fill={isDark ? '#1E293B' : '#E2E8F0'}
                          stroke={n.color}
                          strokeWidth="3"
                          style={{
                            boxShadow: `0 0 15px ${n.color}`,
                          }}
                        />

                        {/* Icon */}
                        <text x={n.x} y={n.y + 6} textAnchor="middle" fontSize="16">
                          {n.icon}
                        </text>

                        {/* Badge with Register */}
                        <rect
                          x={n.x - 18}
                          y={n.y + 25}
                          width="36"
                          height="16"
                          rx="8"
                          fill={n.color}
                        />
                        <text
                          x={n.x}
                          y={n.y + 36}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill="#FFFFFF"
                        >
                          {n.reg}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating clash legend */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 text-[10px] font-mono text-slate-400 bg-slate-900/90 py-1 rounded-lg border border-slate-800">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-red-500 inline-block" />
                    <span>Red = Active Clash</span>
                  </span>
                  <span>Colored by Register</span>
                </div>
              </div>

              {/* Physical Silicon Register File Bank (Real Microarchitecture!) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>CPU Silicon Register File</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">0.3ns Circuit</span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono">
                  {/* Register R1 */}
                  <div className="p-2.5 rounded-xl border-2 border-cyan-500/50 bg-cyan-500/10 text-center">
                    <div className="text-[10px] text-cyan-400 font-bold">SLOT R1</div>
                    <div className="text-xs font-black text-white mt-0.5">
                      {currentLine <= 5 ? '❤️ Health (100)' : 'FREE'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {currentLine <= 5 ? 'Active' : 'Purged'}
                    </div>
                  </div>

                  {/* Register R2 */}
                  <div className="p-2.5 rounded-xl border-2 border-purple-500/50 bg-purple-500/10 text-center">
                    <div className="text-[10px] text-purple-400 font-bold">SLOT R2</div>
                    <div className="text-xs font-black text-white mt-0.5">
                      {currentLine <= 3
                        ? '🪙 Coins (50)'
                        : registerBudget === 3
                        ? '🛡️ Shield (300)'
                        : '🎯 Score (150)'}
                    </div>
                    <div className="text-[9px] text-purple-300 font-bold mt-0.5">
                      {currentLine >= 4 && registerBudget === 3 ? '♻️ Reused!' : 'Occupied'}
                    </div>
                  </div>

                  {/* Register R3 */}
                  <div className={`p-2.5 rounded-xl border-2 text-center ${
                    registerBudget === 3
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/60 opacity-40'
                  }`}>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      {registerBudget === 3 ? 'SLOT R3' : 'DISABLED'}
                    </div>
                    <div className="text-xs font-black text-white mt-0.5">
                      {registerBudget === 3
                        ? currentLine <= 4
                          ? currentLine >= 3
                            ? '🎯 Score (150)'
                            : 'IDLE'
                          : '⚡ Speed (110)'
                        : 'OFFLINE'}
                    </div>
                    <div className="text-[9px] text-emerald-300 font-bold mt-0.5">
                      {registerBudget === 3 && currentLine >= 5 ? '♻️ Reused!' : 'Occupied'}
                    </div>
                  </div>
                </div>

                {/* System RAM Stack Frame (When Spilling Occurs) */}
                {registerBudget === 2 && currentLine >= 4 && (
                  <div className="p-3 rounded-xl border-2 border-red-500/60 bg-red-500/15 text-xs font-mono space-y-1 animate-pulse">
                    <div className="flex items-center justify-between text-red-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>System RAM Stack: [rbp - 8]</span>
                      </span>
                      <span>STALL +200 CYCLES</span>
                    </div>
                    <p className="text-[11px] text-red-200">
                      Shield had to be evicted to System RAM because R1 & R2 were full! Reading it stalls the CPU for 200 cycles!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono">
              Nodes with no clash edge share the same physical register slot.
            </div>
          </div>

        </div>

        {/* 5. Deep-Dive Pedagogical Explainer Tabs */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-6 ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/60 pb-4">
            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('simulation');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'simulation'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>1. Why Graph Coloring Solves Register Scarcity</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('compiler-math');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'compiler-math'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. The Compiler Algorithm (Chaitin-Briggs)</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('memory-speed');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'memory-speed'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>3. The Physical Penalty of Spilling (RAM vs Silicon)</span>
            </button>
          </div>

          {/* TAB 1: Core Concept */}
          {activeTab === 'simulation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono">1</span>
                  <span>Infinite Code vs Finite Silicon</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Programmers can define dozens, hundreds, or thousands of variable names (`health`, `coins`, `shield`). But physical CPU silicon chips only have a tiny handful of high-speed register pockets (e.g. 16 general purpose registers on x86-64, 31 on ARM64).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono">2</span>
                  <span>The Overlap Condition</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Variables don't live forever. A variable only consumes hardware space while it is alive. By calculating the exact birth and death lines, the compiler proves that `coins` and `shield` never need storage at the same time, allowing them to share Register R2 with zero conflicts!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">3</span>
                  <span>Graph Coloring Theorem</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In 1981, Gregory Chaitin proved that mapping variables to physical registers is mathematically identical to Vertex Coloring in Graph Theory. A valid $k$-coloring of the interference graph guarantees 100% bug-free register assignment!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Compiler Algorithm */}
          {activeTab === 'compiler-math' && (
            <div className="space-y-4 text-sm text-slate-300 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="text-purple-400 font-bold text-xs uppercase">Step 1: Build</div>
                  <p className="text-xs text-slate-300 mt-1">Compute live ranges $[start, end]$ and add an edge between any two overlapping variables.</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="text-purple-400 font-bold text-xs uppercase">Step 2: Simplify</div>
                  <p className="text-xs text-slate-300 mt-1">Find a node with degree &lt; $k$. Remove it from the graph and push onto a coloring stack.</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="text-purple-400 font-bold text-xs uppercase">Step 3: Spill (If Stuck)</div>
                  <p className="text-xs text-slate-300 mt-1">If all nodes have degree &ge; $k$, pick candidate with lowest access frequency to evict to RAM.</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="text-purple-400 font-bold text-xs uppercase">Step 4: Select</div>
                  <p className="text-xs text-slate-300 mt-1">Pop nodes from stack one by one, picking an available register color not used by any neighbor.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Memory Speed Hierarchy */}
          {activeTab === 'memory-speed' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Physical Computer Latency Hierarchy (Why Registers Matter)</span>
                  <span className="text-red-400 font-bold">200× Difference!</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">CPU Register File (On-Die Silicon)</span>
                    <span className="text-cyan-400">0.3 ns (1 Clock Cycle)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '1%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-purple-400 font-bold">L1 CPU Cache</span>
                    <span className="text-purple-400">1.0 ns (4 Clock Cycles)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: '3%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-red-400 font-bold">System DRAM RAM (Memory Spill)</span>
                    <span className="text-red-400 font-bold">60.0 ns (200 Clock Cycles)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>

                <p className="text-slate-400 text-xs font-sans pt-2">
                  When the compiler runs out of registers and spills a variable to the RAM stack, the CPU must stall its execution pipeline waiting for the memory bus. Graph coloring keeps critical data inside 0.3ns silicon registers, preventing massive 200-cycle bottlenecks!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
