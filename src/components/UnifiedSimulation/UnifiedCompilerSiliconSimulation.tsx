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
  isStoryMode: _isStoryMode = true,
}) => {
  // Master execution line: 1 to 6
  const [currentLine, setCurrentLine] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1800); // ms per step
  
  // Hardware Register Budget: 2 (Optimal Fit χ(G)=2, 0 Spills) or 1 (Constrained, Spills to RAM)
  const [registerBudget, setRegisterBudget] = useState<number>(2);

  // Active Deep Dive Tab: 'simulation' | 'compiler-math' | 'memory-speed'
  const [activeTab, setActiveTab] = useState<'simulation' | 'compiler-math' | 'memory-speed'>('simulation');

  // Selected variable for inspector
  const [selectedVarId, setSelectedVarId] = useState<string>('c');

  // Pulse key for microarchitecture animations
  const [pulseKey, setPulseKey] = useState<number>(0);

  // 5 Clean program variables with compiler & silicon metadata
  const variables = [
    {
      id: 'a',
      name: 'var a',
      friendlyName: 'Operand A',
      start: 1,
      end: 5,
      regK2: 'R1',
      regK1: 'R1',
      valAtEnd: '10',
      hexVal: '0x000A',
      color: '#06B6D4', // Cyan
      desc: 'Base operand. Created at Line 1, read until Line 5. Holds R1.',
      assembly: 'mov r1, 10',
    },
    {
      id: 'b',
      name: 'var b',
      friendlyName: 'Operand B',
      start: 2,
      end: 3,
      regK2: 'R2',
      regK1: 'RAM [rbp-8]',
      valAtEnd: '20',
      hexVal: '0x0014',
      color: '#8B5CF6', // Purple
      desc: 'Second operand. Created at Line 2, consumed at Line 3. Dead after Line 3!',
      assembly: 'mov r2, 20',
    },
    {
      id: 'c',
      name: 'var c',
      friendlyName: 'Sum C',
      start: 3,
      end: 4,
      regK2: 'R2', // REUSES R2 since b died!
      regK1: 'RAM [rbp-8]',
      valAtEnd: '30',
      hexVal: '0x001E',
      color: '#8B5CF6', // Purple (Reuses R2!)
      desc: 'Intermediate sum = a + b. Safely reuses Register R2 because b is dead!',
      assembly: 'add r2, r1, r2',
    },
    {
      id: 'd',
      name: 'var d',
      friendlyName: 'Scaled D',
      start: 4,
      end: 5,
      regK2: 'R2', // REUSES R2 since c died!
      regK1: 'RAM [rbp-8]',
      valAtEnd: '60',
      hexVal: '0x003C',
      color: '#8B5CF6', // Purple (Reuses R2!)
      desc: 'Scaled product = c * 2. Safely reuses Register R2 because c is dead!',
      assembly: 'shl r2, 1',
    },
    {
      id: 'e',
      name: 'var e',
      friendlyName: 'Result E',
      start: 5,
      end: 6,
      regK2: 'R1', // REUSES R1 since a died!
      regK1: 'R1',
      valAtEnd: '70',
      hexVal: '0x0046',
      color: '#06B6D4', // Cyan (Reuses R1!)
      desc: 'Final result = d + a. Both a and d finish here. Safely reuses Register R1!',
      assembly: 'add r1, r2, r1',
    },
  ];

  // 6 lines of code with detailed compiler metadata
  const codeLines = [
    {
      line: 1,
      code: 'a = 10;',
      asm: 'mov r1, 10',
      varsBorn: ['a'],
      varsDying: [],
      activeVars: ['a'],
      desc: 'Variable a initialized to 10. Stored directly in Hardware Register R1.',
      event: 'birth',
      aluOp: 'LOAD CONSTANT 10',
    },
    {
      line: 2,
      code: 'b = 20;',
      asm: registerBudget === 2 ? 'mov r2, 20' : 'mov [rbp-8], 20 ; SPILLED TO RAM!',
      varsBorn: ['b'],
      varsDying: [],
      activeVars: ['a', 'b'],
      desc: registerBudget === 2
        ? 'Variable b initialized to 20. Stored in Hardware Register R2. Both a and b fit perfectly!'
        : '🚨 HARDWARE EXHAUSTED: Only 1 register available! Variable b must spill to slow RAM.',
      event: registerBudget === 2 ? 'birth' : 'spill',
      aluOp: registerBudget === 2 ? 'LOAD CONSTANT 20' : 'BUS SPILL: STORE [rbp-8]',
    },
    {
      line: 3,
      code: 'c = a + b;',
      asm: registerBudget === 2 ? 'add r2, r1, r2 ; b dies, c reuses R2!' : 'add r1, [rbp-8] ; RAM Stall (+200 cycles)',
      varsBorn: ['c'],
      varsDying: ['b'],
      activeVars: ['a', 'c'],
      desc: 'ALU computes 10 + 20 = 30. Variable b is consumed for the last time (b DIES!). Variable c immediately takes over Register R2 with 0 latency!',
      event: 'handoff',
      aluOp: 'ALU ADD: 10 + 20 = 30',
    },
    {
      line: 4,
      code: 'd = c * 2;',
      asm: registerBudget === 2 ? 'shl r2, 1       ; c dies, d reuses R2!' : 'shl r1, 1',
      varsBorn: ['d'],
      varsDying: ['c'],
      activeVars: ['a', 'd'],
      desc: 'ALU shifts 30 * 2 = 60. Variable c is consumed for the last time (c DIES!). Variable d immediately takes over Register R2!',
      event: 'handoff',
      aluOp: 'ALU SHL: 30 * 2 = 60',
    },
    {
      line: 5,
      code: 'e = d + a;',
      asm: 'add r1, r2, r1 ; a & d die, e reuses R1!',
      varsBorn: ['e'],
      varsDying: ['a', 'd'],
      activeVars: ['e'],
      desc: 'Final sum computed. Both a and d finish their lifespans (both DIE!). Variable e takes over Register R1!',
      event: 'handoff',
      aluOp: 'ALU ADD: 60 + 10 = 70',
    },
    {
      line: 6,
      code: 'return e;',
      asm: 'ret r1         ; Return result from R1',
      varsBorn: [],
      varsDying: ['e'],
      activeVars: ['e'],
      desc: 'Program return. Final value 70 successfully produced from Register R1. 100% in-register throughput!',
      event: 'finish',
      aluOp: 'RETURN VALUE 70',
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
          if (next === 2 && registerBudget === 1) {
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
      if (next === 2 && registerBudget === 1) {
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

  // Graph Nodes & Edges (spacious 500x320 coordinate system with 100% zero overlap)
  const graphNodes = [
    { id: 'a', name: 'var a', x: 250, y: 70, reg: 'R1', color: '#06B6D4' },
    { id: 'b', name: 'var b', x: 100, y: 160, reg: registerBudget === 2 ? 'R2' : 'RAM', color: registerBudget === 2 ? '#8B5CF6' : '#EF4444' },
    { id: 'c', name: 'var c', x: 150, y: 260, reg: registerBudget === 2 ? 'R2' : 'RAM', color: registerBudget === 2 ? '#8B5CF6' : '#EF4444' },
    { id: 'd', name: 'var d', x: 350, y: 260, reg: registerBudget === 2 ? 'R2' : 'RAM', color: registerBudget === 2 ? '#8B5CF6' : '#EF4444' },
    { id: 'e', name: 'var e', x: 400, y: 160, reg: 'R1', color: '#06B6D4' },
  ];

  const graphEdges = [
    { u: 'a', v: 'b', activeLines: [2] },
    { u: 'a', v: 'c', activeLines: [3] },
    { u: 'a', v: 'd', activeLines: [4] },
  ];

  // Cycle & Latency calculation
  const isSpilledNow = registerBudget === 1 && currentLine >= 2;
  const totalCycles = registerBudget === 2 ? currentLine : currentLine + 200;
  const totalLatencyNs = registerBudget === 2 ? (currentLine * 0.3).toFixed(1) : (60.0 + currentLine * 0.3).toFixed(1);

  return (
    <section id="compiler-silicon" className={`py-12 md:py-20 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-[#F8FAFC] border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Header Banner */}
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-sm border ${
            isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold'
          }`}>
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Stage 3: The Compiled Machine Execution & Physical Silicon</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            From Graph Colors to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-purple-600 to-emerald-600 dark:from-cyan-400 dark:via-purple-500 dark:to-emerald-400">
              Physical CPU Silicon
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium">
            Watch how the compiler transforms the graph coloring solution into real machine instructions.
            Because <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-mono font-bold">b, c, d</code> share Color 2,
            they sequentially reuse <strong>Register R2</strong> with zero memory stalls!
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
                <span>{isPlaying ? 'Pause' : 'Auto Play Silicon'}</span>
              </button>

              <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'
              }`}>
                <button
                  onClick={handleStepBack}
                  disabled={currentLine <= 1}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    currentLine <= 1
                      ? 'text-slate-400 opacity-40 cursor-not-allowed'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-slate-700 hover:text-black hover:bg-slate-200'
                  }`}
                  title="Previous Line"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handleStepForward}
                  disabled={currentLine >= 6}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    currentLine >= 6
                      ? 'text-slate-400 opacity-40 cursor-not-allowed'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-slate-700 hover:text-black hover:bg-slate-200'
                  }`}
                  title="Next Line"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-700 hover:text-black hover:bg-slate-200'
                  }`}
                  title="Reset to Line 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  sounds.playPop();
                  setPlaybackSpeed((prev) => (prev === 1800 ? 900 : 1800));
                }}
                className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  playbackSpeed === 900
                    ? isDark
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-sm'
                      : 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm font-black'
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
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400 hidden sm:inline">Hardware Registers:</span>
              <div className={`flex items-center p-1 rounded-2xl border ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'
              }`}>
                <button
                  onClick={() => {
                    sounds.playPop();
                    setRegisterBudget(2);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    registerBudget === 2
                      ? 'bg-emerald-600 text-white shadow-md font-black'
                      : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  k = 2 (Perfect Fit ✨)
                </button>
                <button
                  onClick={() => {
                    sounds.playSpill();
                    setRegisterBudget(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    registerBudget === 1
                      ? 'bg-red-600 text-white shadow-md animate-pulse font-black'
                      : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>k = 1 (Forced Spill! 🚨)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scrubber Line Track Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-400 pb-1.5">
              <span className="font-bold">Execution Timeline Scrubber (Click any step to jump)</span>
              <span className="text-cyan-700 dark:text-cyan-400 font-extrabold">Active: Line {currentLine} — {codeLines[currentLine - 1].code}</span>
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
                          : 'bg-cyan-100 border-2 border-cyan-500 text-cyan-950 font-black shadow-md ring-2 ring-cyan-400/50 scale-[1.02]'
                        : isPassed
                        ? isDark
                          ? 'bg-slate-800/70 border-emerald-500/40 text-slate-300 hover:bg-slate-800'
                          : 'bg-emerald-50 border border-emerald-300 text-slate-800 hover:bg-emerald-100'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-850 hover:text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className={isCurrent ? 'text-cyan-800 dark:text-cyan-400 font-black' : ''}>L{item.line}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-ping" />}
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
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl border text-xs font-mono ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">Total Elapsed Clock</div>
                <div className="font-extrabold text-slate-900 dark:text-white">{totalCycles} Cycles</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">Execution Latency</div>
                <div className="font-extrabold text-emerald-700 dark:text-emerald-400">{totalLatencyNs} ns</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">Hardware Budget</div>
                <div className="font-extrabold text-purple-700 dark:text-purple-400">
                  {registerBudget === 2 ? 'k = 2 (Optimal χ(G))' : 'k = 1 (Constrained)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HardDrive className={`w-4 h-4 shrink-0 ${isSpilledNow ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">RAM Memory Spills</div>
                <div className={`font-extrabold ${isSpilledNow ? 'text-red-500 font-black' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isSpilledNow ? '1 SPILL (+200 cycles)' : '0 Spills (100% Speed)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. The 4-Box Master Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL (5 COLS): CODE & LIVENESS RADAR */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Box 1: Interactive Code Terminal */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-sm font-mono font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    1. Compiled Assembly Stream
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-900 border-cyan-300 font-extrabold'
                }`}>
                  Pointer: L{currentLine}
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
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isCurrent
                          ? isDark
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg ring-2 ring-cyan-400/50'
                            : 'bg-cyan-100/90 border-cyan-500 text-slate-950 font-black shadow-md ring-2 ring-cyan-400/40'
                          : isDark
                          ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 text-right font-mono ${isCurrent ? 'text-cyan-800 dark:text-cyan-400 font-black' : 'text-slate-400'}`}>
                            {row.line}:
                          </span>
                          <span className={isCurrent ? 'text-slate-950 dark:text-white font-black' : 'text-slate-800 dark:text-slate-200'}>
                            {row.code}
                          </span>
                        </div>
                        {isCurrent && (
                          <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md shadow-sm ${
                            isDark ? 'bg-cyan-500/30 text-cyan-300' : 'bg-cyan-600 text-white'
                          }`}>
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pl-7">
                        <span className="text-purple-800 dark:text-purple-300 font-mono font-extrabold">{row.asm}</span>
                        {row.event === 'handoff' && (
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${
                            isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                          }`}>
                            ♻️ Register Reused
                          </span>
                        )}
                        {row.event === 'spill' && (
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded border animate-pulse ${
                            isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-100 text-red-900 border-red-300 font-black'
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
                <div className="font-bold text-cyan-800 dark:text-cyan-400 flex items-center gap-1.5 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compiler Operation at Line {currentLine}:</span>
                </div>
                <p className="font-medium text-slate-800 dark:text-slate-300">{currentInfo.desc}</p>
              </div>
            </div>

            {/* Box 2: Compiler Liveness Radar */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-mono font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    2. Liveness Timelines (Gantt Radar)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold'
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
                          <span className="text-slate-900 dark:text-white font-mono font-bold">{v.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">({v.friendlyName})</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAlive
                            ? isDark
                              ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                              : 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-black animate-pulse'
                            : 'text-slate-500'
                        }`}>
                          {isAlive ? 'ALIVE NOW' : `Lines ${v.start}–${v.end}`}
                        </span>
                      </div>

                      {/* Bar Container */}
                      <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-800/80 relative overflow-hidden">
                        {/* Moving vertical line cursor */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-cyan-600 dark:bg-cyan-400 z-10 shadow-sm transition-all duration-300"
                          style={{ left: `${((currentLine - 1) / 5) * 100}%` }}
                        />

                        {/* Interval Bar */}
                        <div
                          className="absolute top-0 bottom-0 rounded-lg transition-all duration-300"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(16, widthPercent)}%`,
                            backgroundColor: v.color,
                            opacity: isAlive ? 1 : 0.45,
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
                isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950 font-medium'
              }`}>
                <span className="font-black text-purple-800 dark:text-purple-400">⚡ The Golden Rule: </span>
                Notice <strong className="text-slate-900 dark:text-white">var b [2–3]</strong> dies at Line 3, and <strong className="text-slate-900 dark:text-white">var c [3–4]</strong> is born at Line 3.
                Because their lifespans never overlap, they safely share <strong>Register R2</strong>!
              </div>
            </div>

          </div>

          {/* RIGHT PANEL (7 COLS): CONFLICT GRAPH & PHYSICAL SILICON */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Box 3: The Interference Graph Stage */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-mono font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    3. Conflict Graph (The Compiler's Interference Map)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black border ${
                  isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-950 border-amber-300'
                }`}>
                  Chromatic Number χ(G) = 2 Colors
                </span>
              </div>

              {/* SVG Conflict Graph Canvas (Zero Overlap ViewBox 500x320) */}
              <div className={`h-[330px] sm:h-[350px] rounded-2xl border-2 relative flex items-center justify-center select-none ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <svg viewBox="0 0 500 320" className="w-full h-full">
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
                          strokeWidth={isClashingNow ? '4.5' : '2'}
                          strokeDasharray={isClashingNow ? '8 4' : 'none'}
                          className={isClashingNow ? 'animate-laser-dash' : ''}
                          opacity={isClashingNow ? 1 : 0.45}
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
                            r="30"
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
                          r="24"
                          fill={isDark ? '#1E293B' : '#FFFFFF'}
                          stroke={n.color}
                          strokeWidth={isSelected ? '5' : '3.5'}
                          style={{ filter: isAlive ? `drop-shadow(0 0 12px ${n.color})` : isSelected ? 'drop-shadow(0 0 10px #06B6D4)' : 'none' }}
                        />

                        {/* Variable Name inside circle */}
                        <text
                          x={n.x}
                          y={n.y + 6}
                          textAnchor="middle"
                          fontSize="14"
                          fontWeight="bold"
                          fill={isDark ? '#FFFFFF' : '#0F172A'}
                        >
                          {n.id}
                        </text>

                        {/* Register Badge (Cleanly spaced below circle) */}
                        <rect
                          x={n.x - 22}
                          y={n.y + 27}
                          width="44"
                          height="20"
                          rx="10"
                          fill={n.color}
                          stroke="#FFFFFF"
                          strokeWidth="1"
                        />
                        <text
                          x={n.x}
                          y={n.y + 41}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#FFFFFF"
                        >
                          {n.reg}
                        </text>

                        {/* Node Label (Cleanly spaced above circle) */}
                        <text
                          x={n.x}
                          y={n.y - 30}
                          textAnchor="middle"
                          fontSize="12"
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

              {/* Dedicated Graph Legend Bar (Completely OUTSIDE the SVG Canvas) */}
              <div className={`flex flex-wrap items-center justify-between text-xs font-mono p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1.5 bg-red-500 rounded-full inline-block animate-pulse" />
                  <span className="font-extrabold text-red-700 dark:text-red-400">Red Laser = Active Collision</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-bold">Cyan = Register R1 | Purple = Register R2</span>
              </div>
            </div>

            {/* Box 4: Inside The Computer (Physical CPU Silicon & RAM Memory) */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-mono font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    4. Physical CPU Silicon (ALU & Register File)
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black border ${
                  isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}>
                  Register Speed: 0.3 ns
                </span>
              </div>

              {/* Physical Microarchitecture Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch font-mono">
                
                {/* CPU Die Container (8 cols) */}
                <div key={pulseKey} className={`md:col-span-8 p-4 rounded-2xl border-2 space-y-3 relative transition-all duration-300 ${
                  isDark ? 'bg-slate-950 border-emerald-500/40 text-white' : 'bg-slate-50 border-emerald-500/40 text-slate-900 shadow-sm'
                }`}>
                  {/* CPU Header */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-emerald-700 dark:text-emerald-400 font-black flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>CPU CORE SILICON (ALU & REGISTERS)</span>
                    </span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">3.3 GHz Clock</span>
                  </div>

                  {/* ALU Banner */}
                  <div className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                  }`}>
                    <span className="text-slate-600 dark:text-slate-400 font-bold">ACTIVE ALU OP:</span>
                    <span className="text-cyan-800 dark:text-cyan-400 font-black animate-pulse">{currentInfo.aluOp}</span>
                  </div>

                  {/* 2 Physical Registers */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Register R1 */}
                    <div className={`p-3 rounded-xl border-2 text-center space-y-1 ${
                      isDark ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-cyan-500 bg-cyan-50 shadow-sm'
                    }`}>
                      <div className="text-[10px] text-cyan-800 dark:text-cyan-400 font-black">REGISTER R1 (Cyan)</div>
                      <div className="text-sm font-black text-slate-950 dark:text-white truncate">
                        {currentLine <= 4 ? 'var a = 10' : 'var e = 70'}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-900 dark:text-cyan-300 font-black">
                        {currentLine <= 4 ? '0x000A' : '0x0046'}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-block ${
                        currentLine >= 5
                          ? 'bg-emerald-600 text-white animate-pulse font-black'
                          : isDark
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-cyan-200 text-cyan-950 border border-cyan-300 font-black'
                      }`}>
                        {currentLine >= 5 ? '♻️ REUSED BY E!' : 'OCCUPIED'}
                      </span>
                    </div>

                    {/* Register R2 */}
                    <div className={`p-3 rounded-xl border-2 text-center space-y-1 ${
                      registerBudget === 2
                        ? isDark
                          ? 'border-purple-500/50 bg-purple-500/10'
                          : 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 opacity-40'
                    }`}>
                      <div className="text-[10px] text-purple-800 dark:text-purple-400 font-black">
                        {registerBudget === 2 ? 'REGISTER R2 (Purple)' : 'DISABLED'}
                      </div>
                      <div className="text-sm font-black text-slate-950 dark:text-white truncate">
                        {registerBudget === 2
                          ? currentLine === 2
                            ? 'var b = 20'
                            : currentLine === 3
                            ? 'var c = 30'
                            : currentLine === 4
                            ? 'var d = 60'
                            : 'FREE'
                          : 'OFFLINE'}
                      </div>
                      <div className="text-[10px] font-mono text-purple-900 dark:text-purple-300 font-black">
                        {registerBudget === 2
                          ? currentLine === 2
                            ? '0x0014'
                            : currentLine === 3
                            ? '0x001E'
                            : currentLine === 4
                            ? '0x003C'
                            : 'EMPTY'
                          : 'OFFLINE'}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-block ${
                        registerBudget === 2 && currentLine >= 3 && currentLine <= 4
                          ? 'bg-emerald-600 text-white animate-pulse font-black'
                          : isDark
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-purple-200 text-purple-950 border border-purple-300 font-black'
                      }`}>
                        {registerBudget === 2 && currentLine >= 3 && currentLine <= 4 ? '♻️ REUSED!' : 'OCCUPIED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System RAM Stack Module (4 cols) */}
                <div className={`md:col-span-4 p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 ${
                  isSpilledNow
                    ? 'bg-red-50 border-red-500 text-red-950 dark:bg-red-500/15 dark:border-red-500 dark:text-red-300 shadow-lg shadow-red-500/20 animate-pulse'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-300 dark:border-slate-800">
                    <span className={`font-black flex items-center gap-1.5 ${isSpilledNow ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-400'}`}>
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>SYSTEM DRAM RAM</span>
                    </span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-500 font-mono font-bold">60ns</span>
                  </div>

                  {isSpilledNow ? (
                    <div className="space-y-2 text-center py-1">
                      <div className="inline-block p-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 animate-bounce">
                        <AlertTriangle className="w-5 h-5 mx-auto" />
                      </div>
                      <div className="text-xs font-black text-red-800 dark:text-red-400">STACK SPILL: [rbp - 8]</div>
                      <div className="text-[11px] text-red-950 dark:text-red-200 font-medium leading-tight">
                        Variables forced to RAM because hardware only has 1 register!
                      </div>
                      <div className="p-1.5 rounded-lg bg-red-600 text-[10px] font-black text-white shadow-sm">
                        +200 CYCLE STALL PENALTY!
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-1.5">
                      <div className="text-emerald-800 dark:text-emerald-400 text-xs font-black">RAM IDLE (100% Cache Hit)</div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-relaxed font-sans font-medium">
                        Graph coloring keeps all 5 variables inside 0.3ns CPU registers. Zero stalls to RAM!
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-600 dark:text-slate-400 text-center border-t border-slate-300 dark:border-slate-800/80 pt-1 font-mono font-bold">
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
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 font-black'
                  : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>1. How Graph Coloring Prevents Stalls</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('compiler-math');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'compiler-math'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                  : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. The Chaitin-Briggs Compiler Algorithm</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('memory-speed');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'memory-speed'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-black'
                  : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>3. The Physical Penalty of Memory Spilling</span>
            </button>
          </div>

          {/* TAB 1: Core Concept */}
          {activeTab === 'simulation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className={`p-5 rounded-2xl border-2 space-y-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
              }`}>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center text-xs font-mono font-black">1</span>
                  <span>Infinite Code vs Finite Silicon</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  Programmers write code with unlimited variables (a, b, c, d, e). But physical CPU chips only have 16 to 32 ultra-fast general purpose registers. Graph coloring fits any number of variables into finite registers.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border-2 space-y-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
              }`}>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center text-xs font-mono font-black">2</span>
                  <span>Liveness Analysis</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  Variables only occupy space while alive. By calculating exact birth and death lines, the compiler proves that b, c, and d never overlap, allowing them to sequentially share Register R2 with zero latency penalty.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border-2 space-y-2 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
              }`}>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-black">3</span>
                  <span>Vertex Coloring = Register Safety</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  Vertices are variables; edges connect variables alive at the same time. If a graph is k-colorable, then every variable can run in hardware registers without ever overwriting each other's data!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Compiler Algorithm */}
          {activeTab === 'compiler-math' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border-2 space-y-1.5 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-800 dark:text-purple-400 font-black uppercase text-xs">1. Build Interference Graph</div>
                  <p className="text-slate-700 dark:text-slate-400 font-sans font-medium">Compute live ranges and draw conflict edges between any two variables alive simultaneously.</p>
                </div>
                <div className={`p-4 rounded-xl border-2 space-y-1.5 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-800 dark:text-purple-400 font-black uppercase text-xs">2. Simplify (Kempe Heuristic)</div>
                  <p className="text-slate-700 dark:text-slate-400 font-sans font-medium">Find node with degree &lt; k. Remove it and push onto stack. It is guaranteed colorable!</p>
                </div>
                <div className={`p-4 rounded-xl border-2 space-y-1.5 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-800 dark:text-purple-400 font-black uppercase text-xs">3. Spill Evaluation</div>
                  <p className="text-slate-700 dark:text-slate-400 font-sans font-medium">If all nodes have degree &ge; k, compute spill cost = uses / degree. Evict lowest frequency candidate.</p>
                </div>
                <div className={`p-4 rounded-xl border-2 space-y-1.5 ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30 text-slate-300' : 'bg-purple-50 border-purple-200 text-purple-950 shadow-sm'
                }`}>
                  <div className="text-purple-800 dark:text-purple-400 font-black uppercase text-xs">4. Select Colors</div>
                  <p className="text-slate-700 dark:text-slate-400 font-sans font-medium">Pop nodes from stack, assigning the first available physical register color not taken by neighbors.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Memory Speed Hierarchy */}
          {activeTab === 'memory-speed' && (
            <div className="space-y-4 text-xs font-mono">
              <div className={`p-5 rounded-2xl border-2 space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Physical Latency Hierarchy (Why Registers Matter So Much)</span>
                  <span className="text-red-700 dark:text-red-400 font-black">200× Penalty!</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-cyan-800 dark:text-cyan-400">CPU Register File (On-Die Flip-Flops)</span>
                    <span className="text-cyan-800 dark:text-cyan-400">0.3 ns (1 Clock Cycle) ⚡</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '1%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-2 font-bold">
                    <span className="text-purple-800 dark:text-purple-400">L1 CPU Cache</span>
                    <span className="text-purple-800 dark:text-purple-400">1.0 ns (4 Clock Cycles)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '3%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-2 font-bold">
                    <span className="text-red-700 dark:text-red-400">System DRAM RAM (Memory Spill)</span>
                    <span className="text-red-700 dark:text-red-400">60.0 ns (200 Clock Cycles) 🐢</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-400 text-xs font-sans pt-2 font-medium">
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
