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
  CheckCircle2,
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

  // Selected variable for inspector
  const [selectedVarId, setSelectedVarId] = useState<string>('coins');

  // Pulse key for re-triggering microarchitecture animations
  const [pulseKey, setPulseKey] = useState<number>(0);

  // Program variables definition with complete compiler & silicon metadata
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
      hexVal: '0x0064',
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
      hexVal: '0x0032',
      color: '#8B5CF6', // Purple
      desc: 'Coin count. Created at Line 2, consumed to calculate score at Line 3. Dead after Line 3!',
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
      hexVal: '0x0096',
      color: '#10B981', // Lime / Emerald
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
      hexVal: '0x012C',
      color: '#8B5CF6', // Reuses R2 color in k=3, or Red in k=2
      desc: 'Shield = score * 2. In k=3, reuses R2! In k=2, forced to spill to RAM stack!',
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
      hexVal: '0x006E',
      color: '#10B981', // Reuses R3 color
      desc: 'Speed = health + 10. Reuses R3 since score is dead!',
      assembly: 'add r3, r1, 10',
    },
  ];

  // 6 lines of code with detailed pedagogical and execution metadata
  const codeLines = [
    {
      line: 1,
      code: 'health = 100;',
      asm: 'mov r1, 100',
      varsBorn: ['health'],
      varsDying: [],
      activeVars: ['health'],
      desc: 'Player health initialized to 100. Electron pulse writes 100 into Hardware Register R1.',
      event: 'birth',
      aluOp: 'LOAD CONSTANT 100',
    },
    {
      line: 2,
      code: 'coins = 50;',
      asm: 'mov r2, 50',
      varsBorn: ['coins'],
      varsDying: [],
      activeVars: ['health', 'coins'],
      desc: '50 coins collected. Both health & coins are alive. Stored in R1 and R2. Zero clashes yet!',
      event: 'birth',
      aluOp: 'LOAD CONSTANT 50',
    },
    {
      line: 3,
      code: 'score = health + coins;',
      asm: 'add r3, r1, r2',
      varsBorn: ['score'],
      varsDying: ['coins'],
      activeVars: ['health', 'coins', 'score'],
      desc: 'ALU computes 100 + 50 = 150 into R3. Coins is read for the last time — COINS DIES HERE! Register R2 is freed!',
      event: 'handoff',
      aluOp: 'ALU ADD: 100 + 50 = 150',
    },
    {
      line: 4,
      code: 'shield = score * 2;',
      asm: registerBudget === 3 ? 'shl r2, r3, 1  ; Reuses R2!' : 'mov [rbp-8], r2 ; SPILLED TO RAM!',
      varsBorn: ['shield'],
      varsDying: ['score'],
      activeVars: ['health', 'score', 'shield'],
      desc: registerBudget === 3
        ? '⚡ ZERO-STALL RECYCLE: Coins is dead, so Shield takes over Register R2 without waiting! Score dies here.'
        : '🚨 SPILL DISASTER! With only 2 registers, Shield cannot fit in silicon! Evicted to slow RAM stack [rbp-8]!',
      event: registerBudget === 3 ? 'handoff' : 'spill',
      aluOp: registerBudget === 3 ? 'ALU SHIFT: 150 * 2 = 300' : 'BUS SPILL: STORE [rbp-8]',
    },
    {
      line: 5,
      code: 'speed = health + 10;',
      asm: 'add r3, r1, 10  ; Reuses R3!',
      varsBorn: ['speed'],
      varsDying: ['health'],
      activeVars: ['health', 'shield', 'speed'],
      desc: '⚡ ZERO-STALL RECYCLE: Health read for the last time (Health dies!). Speed takes over Register R3!',
      event: 'handoff',
      aluOp: 'ALU ADD: 100 + 10 = 110',
    },
    {
      line: 6,
      code: 'return shield + speed;',
      asm: registerBudget === 3 ? 'add r0, r2, r3  ; In-register' : 'mov r1, [rbp-8]; 200-cycle RAM stall!\nadd r0, r1, r2',
      varsBorn: [],
      varsDying: ['shield', 'speed'],
      activeVars: ['shield', 'speed'],
      desc: 'Final game frame rendered! Shield (300) + Speed (110) = 410. Execution complete!',
      event: 'finish',
      aluOp: 'ALU ADD: 300 + 110 = 410',
    },
  ];

  // Auto-play timer loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentLine((prev) => {
          if (prev >= 6) {
            setIsPlaying(false);
            sounds.playVictory();
            try {
              confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
            } catch {}
            return 6;
          }
          const next = prev + 1;
          setPulseKey((k) => k + 1);
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
      setPulseKey((k) => k + 1);
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
      setPulseKey((k) => k + 1);
    }
  };

  const handleJumpToLine = (line: number) => {
    sounds.playPop();
    setIsPlaying(false);
    setCurrentLine(line);
    setPulseKey((k) => k + 1);
  };

  const handleReset = () => {
    sounds.playPop();
    setIsPlaying(false);
    setCurrentLine(1);
    setPulseKey((k) => k + 1);
  };

  const currentInfo = codeLines[currentLine - 1];

  // Graph Nodes & Edges (spacious, zero-overlap 460x280 coordinate system)
  const graphNodes = [
    { id: 'health', name: 'Health', icon: '❤️', x: 230, y: 55, deg: 3, reg: 'R1', color: '#06B6D4' },
    { id: 'coins', name: 'Coins', icon: '🪙', x: 80, y: 130, deg: 2, reg: 'R2', color: '#8B5CF6' },
    { id: 'score', name: 'Score', icon: '🎯', x: 135, y: 225, deg: 3, reg: 'R3', color: '#10B981' },
    { id: 'shield', name: 'Shield', icon: '🛡️', x: 325, y: 225, deg: 3, reg: registerBudget === 3 ? 'R2' : 'RAM', color: registerBudget === 3 ? '#8B5CF6' : '#EF4444' },
    { id: 'speed', name: 'Speed', icon: '⚡', x: 380, y: 130, deg: 1, reg: 'R3', color: '#10B981' },
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
  const isSpilledNow = registerBudget === 2 && currentLine >= 4;
  const totalCycles = registerBudget === 3 ? currentLine : (currentLine >= 4 ? currentLine + 200 : currentLine);
  const totalLatencyNs = registerBudget === 3 ? (currentLine * 0.3).toFixed(1) : (currentLine >= 4 ? (60.0 + currentLine * 0.3).toFixed(1) : (currentLine * 0.3).toFixed(1));

  return (
    <section id="simulation" className={`py-12 md:py-20 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Header Banner */}
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-sm border ${
            isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-900 border-cyan-300'
          }`}>
            <Zap className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span>{isStoryMode ? 'The Interactive Compiler & Silicon Studio' : 'Live Microarchitecture & Interference Graph Coloring Simulation'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            {isStoryMode ? 'Watch Code Turn Into ' : 'From Symbolic Code to '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500">
              {isStoryMode ? 'Lightning Fast Silicon' : 'Physical CPU Hardware Registers'}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {isStoryMode
              ? 'Variables alive at the same moment clash and need different pockets. Variables alive at different moments share pockets for free! Watch the data packets flow from code lines directly into CPU registers.'
              : 'End-to-end execution pipeline: Symbolic AST → Liveness interval analysis → Interference graph coloring → Physical register allocation → Memory spilling and pipeline stall penalties.'}
          </p>
        </div>

        {/* 2. Mission Control Toolbar & Real-Time Telemetry HUD */}
        <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
          isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Playback Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  sounds.playPop();
                  setIsPlaying(!isPlaying);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play Simulation'}</span>
              </button>

              <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'
              }`}>
                <button
                  onClick={handleStepBack}
                  disabled={currentLine <= 1}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  title="Step Backward"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <span className="px-3 text-xs font-mono font-black text-cyan-600 dark:text-cyan-400">
                  Line {currentLine} / 6
                </span>

                <button
                  onClick={handleStepForward}
                  disabled={currentLine >= 6}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  title="Step Forward"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleReset}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-slate-100 text-slate-700 border-slate-300 hover:text-black'
                }`}
                title="Reset to Line 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  setPlaybackSpeed((prev) => (prev === 1800 ? 900 : 1800));
                }}
                className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  playbackSpeed === 900
                    ? isDark
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-sm'
                      : 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:text-black'
                }`}
                title="Toggle Playback Speed"
              >
                {playbackSpeed === 900 ? '⚡ 2× Speed' : '🐢 1× Speed'}
              </button>
            </div>

            {/* Hardware Register Budget Selector (The Spill Switch) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hidden sm:inline">Hardware Registers:</span>
              <div className={`flex items-center p-1 rounded-2xl border ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'
              }`}>
                <button
                  onClick={() => {
                    sounds.playPop();
                    setRegisterBudget(3);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    registerBudget === 3
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  k = 3 (Perfect Fit ✨)
                </button>
                <button
                  onClick={() => {
                    sounds.playSpill();
                    setRegisterBudget(2);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    registerBudget === 2
                      ? 'bg-red-500 text-white shadow-md animate-pulse'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>k = 2 (Forced Spill! 🚨)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scrubber Line Track Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 pb-1.5">
              <span className="font-semibold">Execution Timeline Scrubber (Click any step to jump)</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Active: Line {currentLine} — {codeLines[currentLine - 1].code}</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {codeLines.map((item) => {
                const isCurrent = item.line === currentLine;
                const isPassed = item.line < currentLine;
                return (
                  <button
                    key={item.line}
                    onClick={() => handleJumpToLine(item.line)}
                    className={`py-2 px-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? isDark
                          ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg ring-2 ring-cyan-400/50 scale-[1.02]'
                          : 'bg-cyan-100 border-cyan-500 text-cyan-950 font-black shadow-md ring-2 ring-cyan-400 scale-[1.02]'
                        : isPassed
                        ? isDark
                          ? 'bg-slate-800/70 border-emerald-500/40 text-slate-300 hover:bg-slate-800'
                          : 'bg-emerald-50/70 border-emerald-300 text-slate-700 hover:bg-emerald-100'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-850 hover:text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className={isCurrent ? 'text-cyan-600 dark:text-cyan-400 font-black' : ''}>L{item.line}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />}
                    </div>
                    <div className="text-xs font-mono font-bold truncate mt-1">
                      {item.code.split('=')[0].trim()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Registers Used</div>
                <div className="text-base font-black font-mono text-cyan-700 dark:text-cyan-400">
                  {registerBudget === 3 ? `${Math.min(3, currentInfo.activeVars.length)} / 3 Slots` : `${Math.min(2, currentInfo.activeVars.length)} / 2 Slots`}
                </div>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Execution Cycles</div>
                <div className="text-base font-black font-mono text-purple-700 dark:text-purple-400">
                  {totalCycles} Cycles
                </div>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Elapsed Time</div>
                <div className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {totalLatencyNs} ns
                </div>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isSpilledNow
                ? 'bg-red-500/15 border-red-500/50 text-red-900 dark:text-red-300 animate-pulse'
                : isDark
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className={`p-2.5 rounded-xl ${isSpilledNow ? 'bg-red-500 text-white' : 'bg-pink-500/20 text-pink-500'}`}>
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">RAM Stack Spill</div>
                <div className={`text-base font-black font-mono ${isSpilledNow ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isSpilledNow ? 'EVACUATED TO RAM' : '0 B (In-Register)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Stage: Two Spacious Connected Panels (Left: Code & Liveness | Right: Graph & Silicon Hardware) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT PANEL (5 COLS): CODE TERMINAL & LIVENESS TIMELINES   */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Box 1: Interactive Code Terminal */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    1. Code & Compiler IR
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-900 border-cyan-300'
                }`}>
                  Active Pointer: L{currentLine}
                </span>
              </div>

              {/* Code Editor Rows */}
              <div className="space-y-2.5 font-mono text-xs">
                {codeLines.map((row) => {
                  const isCurrent = row.line === currentLine;
                  return (
                    <div
                      key={row.line}
                      onClick={() => handleJumpToLine(row.line)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isCurrent
                          ? isDark
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/50'
                            : 'bg-cyan-50 border-cyan-500 text-slate-950 font-bold shadow-md ring-2 ring-cyan-400/50'
                          : isDark
                          ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 text-right font-mono ${isCurrent ? 'text-cyan-600 dark:text-cyan-400 font-black' : 'text-slate-400'}`}>
                            {row.line}:
                          </span>
                          <span className={isCurrent ? 'text-slate-950 dark:text-white font-black' : ''}>{row.code}</span>
                        </div>
                        {isCurrent && (
                          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md animate-pulse ${
                            isDark ? 'bg-cyan-500/30 text-cyan-400' : 'bg-cyan-600 text-white shadow-sm'
                          }`}>
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pl-7">
                        <span className="text-purple-700 dark:text-purple-400 font-mono font-bold">{row.asm}</span>
                        {row.event === 'handoff' && (
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${
                            isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            ♻️ Handed Off
                          </span>
                        )}
                        {row.event === 'spill' && (
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded border animate-pulse ${
                            isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-100 text-red-900 border-red-300'
                          }`}>
                            🚨 Spilled to RAM
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Compiler Analysis Box */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                isDark ? 'bg-slate-900/90 border-cyan-500/30 text-slate-300' : 'bg-cyan-50 border-cyan-200 text-cyan-950'
              }`}>
                <div className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compiler Operation at Line {currentLine}:</span>
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">{currentInfo.desc}</p>
              </div>
            </div>

            {/* Box 2: Compiler Liveness Gantt Radar */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    2. Liveness Timelines (Gantt Radar)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-900 border-purple-300'
                }`}>
                  {currentInfo.activeVars.length} Variables Alive Now
                </span>
              </div>

              {/* Gantt Matrix */}
              <div className="space-y-3 font-mono text-xs">
                {/* Timeline Axis */}
                <div className="grid grid-cols-6 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b pb-1 border-slate-200 dark:border-slate-800">
                  <span>Line 1</span>
                  <span>Line 2</span>
                  <span>Line 3</span>
                  <span>Line 4</span>
                  <span>Line 5</span>
                  <span>Line 6</span>
                </div>

                {/* Variable Lifespan Rows */}
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
                      className={`space-y-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        selectedVarId === v.id
                          ? isDark
                            ? 'border-purple-400/80 bg-purple-500/10'
                            : 'border-purple-400 bg-purple-50 shadow-sm'
                          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>{v.icon}</span>
                          <span className="text-slate-900 dark:text-white font-mono">{v.friendlyName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">({v.name})</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAlive
                            ? isDark
                              ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                            : 'text-slate-500'
                        }`}>
                          {isAlive ? 'ALIVE NOW' : `Lines ${v.start}–${v.end}`}
                        </span>
                      </div>

                      {/* Bar Container */}
                      <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-800/80 relative overflow-hidden">
                        {/* Moving vertical line cursor */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-cyan-500 z-10 shadow-sm transition-all duration-300"
                          style={{ left: `${((currentLine - 1) / 5) * 100}%` }}
                        />

                        {/* Interval Bar */}
                        <div
                          className="absolute top-0 bottom-0 rounded-lg transition-all duration-300"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(16, widthPercent)}%`,
                            backgroundColor: v.color,
                            opacity: isAlive ? 1 : 0.4,
                            boxShadow: isAlive ? `0 0 14px ${v.color}90` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Crucial Insight Banner */}
              <div className={`p-3.5 rounded-2xl border text-xs font-mono leading-relaxed ${
                isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950'
              }`}>
                <span className="font-bold text-purple-700 dark:text-purple-400">⚡ The Golden Rule: </span>
                Notice <strong className="text-slate-900 dark:text-white">Coins [2–3]</strong> dies at Line 3, and <strong className="text-slate-900 dark:text-white">Shield [4–6]</strong> is born at Line 4.
                Because their lifespans never overlap, they safely share <strong>Register R2</strong>!
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL (7 COLS): CONFLICT GRAPH & PHYSICAL SILICON   */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Box 3: The Conflict Graph Stage */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    3. Conflict Graph (The Compiler's Interference Map)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-950 border-amber-300'
                }`}>
                  Chromatic Number χ(G) = 3 Colors
                </span>
              </div>

              {/* SVG Conflict Graph Canvas (Zero Overlap ViewBox 460x280) */}
              <div className={`h-72 sm:h-80 rounded-2xl border relative flex items-center justify-center overflow-hidden select-none ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <svg viewBox="0 0 460 280" className="w-full h-full">
                  <defs>
                    <linearGradient id="laser-fire" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>

                  {/* Laser Conflict Edges */}
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
                          stroke={isClashingNow ? 'url(#laser-fire)' : isDark ? '#475569' : '#CBD5E1'}
                          strokeWidth={isClashingNow ? '4' : '1.5'}
                          strokeDasharray={isClashingNow ? '8 4' : 'none'}
                          className={isClashingNow ? 'animate-laser-dash' : ''}
                          opacity={isClashingNow ? 1 : 0.4}
                        />
                      </g>
                    );
                  })}

                  {/* Graph Nodes */}
                  {graphNodes.map((n) => {
                    const isAlive = currentInfo.activeVars.includes(n.id);
                    const isSelected = selectedVarId === n.id;

                    return (
                      <g
                        key={n.id}
                        className="cursor-pointer"
                        onClick={() => {
                          sounds.playPop();
                          setSelectedVarId(n.id);
                        }}
                      >
                        {/* Outer Glow Halo if Active */}
                        {isAlive && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r="28"
                            fill="none"
                            stroke={n.color}
                            strokeWidth="2.5"
                            strokeDasharray="4 3"
                            className="animate-spin"
                            style={{ animationDuration: '6s' }}
                          />
                        )}

                        {/* Node Circle */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r="22"
                          fill={isDark ? '#1E293B' : '#FFFFFF'}
                          stroke={n.color}
                          strokeWidth={isSelected ? '5' : '3.5'}
                          style={{ filter: isAlive ? `drop-shadow(0 0 10px ${n.color})` : isSelected ? 'drop-shadow(0 0 8px #06B6D4)' : 'none' }}
                        />

                        {/* Variable Icon */}
                        <text x={n.x} y={n.y + 6} textAnchor="middle" fontSize="16">
                          {n.icon}
                        </text>

                        {/* Register Badge (Directly below circle) */}
                        <rect
                          x={n.x - 20}
                          y={n.y + 25}
                          width="40"
                          height="18"
                          rx="9"
                          fill={n.color}
                        />
                        <text
                          x={n.x}
                          y={n.y + 37}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#FFFFFF"
                        >
                          {n.reg}
                        </text>

                        {/* Node Label (Above circle with clear separation) */}
                        <text
                          x={n.x}
                          y={n.y - 27}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill={isDark ? '#FFFFFF' : '#0F172A'}
                        >
                          {n.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Dedicated Graph Legend Bar (Placed completely OUTSIDE the SVG canvas - Zero Overlaps!) */}
              <div className={`flex flex-wrap items-center justify-between text-xs font-mono p-3 rounded-2xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-1.5 bg-red-500 rounded-full inline-block animate-pulse" />
                  <span className="font-bold text-red-600 dark:text-red-400">Red Laser = Simultaneous Conflict</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Nodes colored by Assigned Hardware Register</span>
              </div>
            </div>

            {/* Box 4: Inside The Computer (Physical CPU Silicon & RAM Memory) */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    4. What Actually Happens In The Computer (CPU Silicon vs RAM)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  Physical Register File (0.3ns)
                </span>
              </div>

              {/* The Physical Microarchitecture Board Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch font-mono">
                
                {/* CPU Die Container (8 cols) */}
                <div key={pulseKey} className={`md:col-span-8 p-4 rounded-2xl border-2 space-y-3 relative transition-all duration-300 ${
                  isDark ? 'bg-slate-950 border-emerald-500/40 text-white' : 'bg-slate-50 border-emerald-500/40 text-slate-900 shadow-sm'
                }`}>
                  {/* CPU Chip Header */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>CPU CORE SILICON (ALU & REGISTERS)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">3.3 GHz Turbo</span>
                  </div>

                  {/* ALU Banner */}
                  <div className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">ACTIVE ALU OP:</span>
                    <span className="text-cyan-700 dark:text-cyan-400 font-black animate-pulse">{currentInfo.aluOp}</span>
                  </div>

                  {/* 3 Physical Registers */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {/* Register R1 */}
                    <div className={`p-3 rounded-xl border-2 text-center space-y-1 ${
                      isDark ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-cyan-400 bg-cyan-50 shadow-sm'
                    }`}>
                      <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-black">REGISTER R1</div>
                      <div className="text-xs font-black text-slate-950 dark:text-white truncate">
                        {currentLine <= 5 ? '❤️ Health' : 'FREE'}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-800 dark:text-cyan-300 font-bold">
                        {currentLine <= 5 ? '100 (0x64)' : 'EMPTY'}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-block ${
                        isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                      }`}>
                        {currentLine <= 5 ? 'LOCKED' : 'IDLE'}
                      </span>
                    </div>

                    {/* Register R2 */}
                    <div className={`p-3 rounded-xl border-2 text-center space-y-1 ${
                      isDark ? 'border-purple-500/50 bg-purple-500/10' : 'border-purple-400 bg-purple-50 shadow-sm'
                    }`}>
                      <div className="text-[10px] text-purple-700 dark:text-purple-400 font-black">REGISTER R2</div>
                      <div className="text-xs font-black text-slate-950 dark:text-white truncate">
                        {currentLine <= 3
                          ? '🪙 Coins'
                          : registerBudget === 3
                          ? '🛡️ Shield'
                          : '🎯 Score'}
                      </div>
                      <div className="text-[10px] font-mono text-purple-800 dark:text-purple-300 font-bold">
                        {currentLine <= 3
                          ? '50 (0x32)'
                          : registerBudget === 3
                          ? '300 (0x12C)'
                          : '150 (0x96)'}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-block ${
                        currentLine >= 4 && registerBudget === 3
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : isDark
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {currentLine >= 4 && registerBudget === 3 ? '♻️ REUSED!' : 'OCCUPIED'}
                      </span>
                    </div>

                    {/* Register R3 */}
                    <div className={`p-3 rounded-xl border-2 text-center space-y-1 ${
                      registerBudget === 3
                        ? isDark
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-emerald-400 bg-emerald-50 shadow-sm'
                        : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 opacity-40'
                    }`}>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black">
                        {registerBudget === 3 ? 'REGISTER R3' : 'DISABLED'}
                      </div>
                      <div className="text-xs font-black text-slate-950 dark:text-white truncate">
                        {registerBudget === 3
                          ? currentLine <= 4
                            ? currentLine >= 3
                              ? '🎯 Score'
                              : 'IDLE'
                            : '⚡ Speed'
                          : 'OFFLINE'}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                        {registerBudget === 3
                          ? currentLine <= 4
                            ? currentLine >= 3
                              ? '150 (0x96)'
                              : 'EMPTY'
                            : '110 (0x6E)'
                          : 'OFFLINE'}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-block ${
                        registerBudget === 3 && currentLine >= 5
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : isDark
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {registerBudget === 3
                          ? currentLine >= 5
                            ? '♻️ REUSED!'
                            : currentLine >= 3
                            ? 'ACTIVE'
                            : 'IDLE'
                          : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System RAM Stack Module (4 cols) */}
                <div className={`md:col-span-4 p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 ${
                  isSpilledNow
                    ? 'bg-red-500/15 border-red-500 text-red-900 dark:text-red-300 shadow-lg shadow-red-500/20 animate-pulse'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200 dark:border-slate-800">
                    <span className={`font-bold flex items-center gap-1.5 ${isSpilledNow ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>SYSTEM DRAM RAM</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">60ns</span>
                  </div>

                  {isSpilledNow ? (
                    <div className="space-y-2 text-center py-1">
                      <div className="inline-block p-2 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 animate-bounce">
                        <AlertTriangle className="w-5 h-5 mx-auto" />
                      </div>
                      <div className="text-xs font-black text-red-700 dark:text-red-400">STACK SPILL: [rbp - 8]</div>
                      <div className="text-[11px] text-red-900 dark:text-red-200 font-medium">
                        Shield stored in RAM because hardware has only 2 registers!
                      </div>
                      <div className="p-1.5 rounded-lg bg-red-500 text-[10px] font-black text-white shadow-sm">
                        +200 CYCLE STALL PENALTY!
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-1.5">
                      <div className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">RAM IDLE (100% Cache Hit)</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                        Graph coloring keeps all variables inside 0.3ns CPU registers. Zero stalls to RAM!
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-800/80 pt-1 font-mono">
                    {isSpilledNow ? '⚠️ Memory Bus Throttled' : '⚡ 0.3ns Lightning Speed'}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* 4. Deep-Dive Pedagogical Explainer Tabs */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-xl space-y-6 ${
          isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-4">
            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('simulation');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'simulation'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>3. The Physical Penalty of Spilling (RAM vs Silicon)</span>
            </button>
          </div>

          {/* TAB 1: Core Concept */}
          {activeTab === 'simulation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-mono font-black">1</span>
                  <span>Infinite Code vs Finite Silicon</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Programmers write code with unlimited variables (`health`, `coins`, `shield`). But physical CPU chips only have 16 to 32 ultra-fast general purpose registers. How do we fit 100 variables into 32 pockets?
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-mono font-black">2</span>
                  <span>Liveness Analysis</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Variables only occupy space while alive. By calculating exact birth and death lines, the compiler proves that `coins` and `shield` never overlap, allowing them to share Register R2 with zero latency penalty.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-black">3</span>
                  <span>Vertex Coloring = Register Safety</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Vertices are variables; edges connect variables alive at the same time. If a graph is k-colorable, then every variable can run in hardware registers without ever overwriting each other's data!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Compiler Algorithm */}
          {activeTab === 'compiler-math' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-700 dark:text-purple-400 font-bold uppercase">1. Build Interference Graph</div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans">Compute live ranges and draw conflict edges between any two variables alive simultaneously.</p>
                </div>
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-700 dark:text-purple-400 font-bold uppercase">2. Simplify (Kempe Heuristic)</div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans">Find node with degree &lt; k. Remove it and push onto stack. It is guaranteed colorable!</p>
                </div>
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-700 dark:text-purple-400 font-bold uppercase">3. Spill Evaluation</div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans">If all nodes have degree &ge; k, compute spill cost = uses / degree. Evict lowest frequency candidate.</p>
                </div>
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-700 dark:text-purple-400 font-bold uppercase">4. Select Colors</div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans">Pop nodes from stack, assigning the first available physical register color not taken by neighbors.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Memory Speed Hierarchy */}
          {activeTab === 'memory-speed' && (
            <div className="space-y-4 text-xs font-mono">
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Physical Latency Hierarchy (Why Registers Matter So Much)</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">200× Penalty!</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-700 dark:text-cyan-400 font-bold">CPU Register File (On-Die Flip-Flops)</span>
                    <span className="text-cyan-700 dark:text-cyan-400 font-bold">0.3 ns (1 Clock Cycle) ⚡</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '1%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-purple-700 dark:text-purple-400 font-bold">L1 CPU Cache</span>
                    <span className="text-purple-700 dark:text-purple-400 font-bold">1.0 ns (4 Clock Cycles)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '3%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">System DRAM RAM (Memory Spill)</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">60.0 ns (200 Clock Cycles) 🐢</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-xs font-sans pt-2">
                  When registers run out, the CPU is forced to wait for hundreds of clock cycles for data to travel across external motherboard traces to RAM. Graph coloring maximizes in-register execution, keeping your phone and PC running at maximum speed.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
