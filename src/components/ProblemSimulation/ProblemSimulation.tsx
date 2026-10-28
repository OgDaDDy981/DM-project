import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  HardDrive,
  Cpu,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ProblemSimulationProps {
  isDark: boolean;
  onProceedToSolution: () => void;
}

export const ProblemSimulation: React.FC<ProblemSimulationProps> = ({
  isDark,
  onProceedToSolution,
}) => {
  // Step in the problem simulation (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Strategy: 'spill' (evict to RAM, causing stalls) or 'overwrite' (destroy previous variable, causing crash)
  const [failureMode, setFailureMode] = useState<'spill' | 'overwrite'>('spill');

  const problemLines = [
    {
      line: 1,
      code: 'a = 10;',
      desc: 'Create variable a. Put into Register R1.',
      r1: 'var a = 10',
      r2: 'EMPTY',
      status: 'Normal',
      spillActive: false,
      crashed: false,
      stalls: 0,
    },
    {
      line: 2,
      code: 'b = 20;',
      desc: 'Create variable b. Put into Register R2. All 2 registers are now 100% FULL!',
      r1: 'var a = 10',
      r2: 'var b = 20',
      status: 'Registers Full (2/2)',
      spillActive: false,
      crashed: false,
      stalls: 0,
    },
    {
      line: 3,
      code: 'c = a + b;',
      desc:
        failureMode === 'spill'
          ? 'CRITICAL BOTTLENECK: We need a and b, but where does c go? R1 & R2 are full! The CPU must SPILL variable a to slow RAM (+200 cycle freeze).'
          : 'FATAL OVERWRITE: With no free registers, c violently overwrites R1 (a is deleted!).',
      r1: failureMode === 'spill' ? 'var c = 30' : 'var c = 30 (a destroyed!)',
      r2: 'var b = 20',
      status: failureMode === 'spill' ? 'Memory Spill (+200 cycles)' : 'Data Corrupted!',
      spillActive: failureMode === 'spill',
      crashed: failureMode === 'overwrite',
      stalls: failureMode === 'spill' ? 200 : 0,
    },
    {
      line: 4,
      code: 'd = c * 2;',
      desc:
        failureMode === 'spill'
          ? 'Compute d = 30 * 2 = 60. Replaces c in R1.'
          : 'Compute d = 30 * 2 = 60. Placed in R1.',
      r1: 'var d = 60',
      r2: 'var b = 20 (still idle)',
      status: 'Running',
      spillActive: false,
      crashed: failureMode === 'overwrite',
      stalls: failureMode === 'spill' ? 200 : 0,
    },
    {
      line: 5,
      code: 'e = d + a;',
      desc:
        failureMode === 'spill'
          ? 'DISASTER AGAIN: Line 5 needs variable a! But a was evicted to RAM. CPU must freeze for another 200 cycles to fetch a back!'
          : 'PROGRAM CRASH: Line 5 reads a, but a was overwritten by c at Line 3! Output is GARBAGE.',
      r1: failureMode === 'spill' ? 'var e = 70' : 'GARBAGE DATA ❌',
      r2: failureMode === 'spill' ? 'var a (reloaded)' : 'var b (20)',
      status: failureMode === 'spill' ? 'Second Spill (+400 cycles total)' : 'Output Corrupted (Bug!)',
      spillActive: failureMode === 'spill',
      crashed: failureMode === 'overwrite',
      stalls: failureMode === 'spill' ? 400 : 0,
    },
  ];

  const current = problemLines[step - 1];

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setStep((prev) => {
          if (prev >= 5) {
            setIsPlaying(false);
            return 5;
          }
          sounds.playPop();
          return prev + 1;
        });
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  return (
    <section
      id="problem"
      className={`py-16 md:py-24 border-b transition-colors duration-300 relative overflow-hidden ${
        isDark ? 'bg-[#090D1A] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Background CAD Grid */}
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Stage 1: The Core Hardware Dilemma</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Why Registers Run Out{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-orange-500">
              And Freeze Computers
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            A program can use dozens of variables (<code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-cyan-600 dark:text-cyan-400">a, b, c, d, e</code>).
            However, physical CPU cores have very few ultra-fast hardware registers (here: <strong>only 2 registers: R1 and R2</strong>).
            Watch what happens when you run code without a smart compiler!
          </p>
        </div>

        {/* Interactive Problem Simulation Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: The Code and Execution Pointer (5 cols) */}
          <div className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-5 ${
            isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-red-500" />
                <span className="text-sm font-mono font-black uppercase text-slate-900 dark:text-white">
                  Program Code (5 Variables)
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
                Step {step} of 5
              </span>
            </div>

            {/* Code Lines Display */}
            <div className="space-y-2.5 font-mono text-xs">
              {problemLines.map((item) => {
                const isCurrent = item.line === step;
                const isPassed = item.line < step;
                return (
                  <div
                    key={item.line}
                    onClick={() => {
                      sounds.playPop();
                      setStep(item.line);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? isDark
                          ? 'bg-red-500/20 border-red-400 text-white shadow-lg ring-2 ring-red-500/40'
                          : 'bg-red-50 border-2 border-red-500 text-slate-950 font-black shadow-md ring-2 ring-red-400/40'
                        : isPassed
                        ? isDark
                          ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                        : isDark
                        ? 'bg-slate-900/20 border-slate-800/40 text-slate-600'
                        : 'bg-slate-50/50 border-slate-200/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-right font-mono font-bold ${isCurrent ? 'text-red-500' : 'text-slate-400'}`}>
                        {item.line}:
                      </span>
                      <span className={isCurrent ? 'font-black text-slate-950 dark:text-white text-sm' : 'font-medium'}>
                        {item.code}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm animate-pulse">
                        Executing
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Explanation Callout */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              current.spillActive || current.crashed
                ? 'bg-red-500/10 border-red-500/40 text-red-900 dark:text-red-200'
                : isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <div className="font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Line {step} Hardware Impact:</span>
              </div>
              <p className="font-medium">{current.desc}</p>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-red-600 text-white hover:bg-red-500 shadow-md'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setStep(1);
                    setIsPlaying(false);
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
                  }`}
                  title="Reset to Line 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Toggle: Spill vs Overwrite */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 hidden sm:inline">Failure Mode:</span>
                <div className={`p-1 rounded-xl border flex items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setFailureMode('spill');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                      failureMode === 'spill'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Memory Spill
                  </button>
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setFailureMode('overwrite');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                      failureMode === 'overwrite'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Crash
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: The Physical Hardware Collision (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Hardware Canvas */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-5 ${
              isDark ? 'bg-[#101628] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-mono font-black uppercase text-slate-900 dark:text-white">
                    Inside The Physical Machine (2 Registers vs DDR5 RAM)
                  </span>
                </div>
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  current.spillActive || current.crashed
                    ? 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse font-black'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                }`}>
                  {current.status}
                </span>
              </div>

              {/* Hardware Microarchitecture Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Fast CPU Die (2 Registers) */}
                <div className={`p-4 rounded-2xl border-2 space-y-3 ${
                  isDark ? 'bg-slate-950 border-cyan-500/40 text-white' : 'bg-slate-50 border-cyan-500/40 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>CPU REGISTERS (0.3 ns)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">Max 2 Slots</span>
                  </div>

                  {/* Register R1 */}
                  <div className={`p-3 rounded-xl border-2 text-center transition-all ${
                    current.crashed
                      ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
                      : isDark
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-cyan-50 border-cyan-400'
                  }`}>
                    <div className="text-[10px] font-mono font-black text-cyan-700 dark:text-cyan-400">REGISTER R1</div>
                    <div className="text-sm font-black text-slate-950 dark:text-white truncate py-0.5">
                      {current.r1}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">1 Clock Cycle Latency</div>
                  </div>

                  {/* Register R2 */}
                  <div className={`p-3 rounded-xl border-2 text-center transition-all ${
                    isDark ? 'bg-purple-500/10 border-purple-500/50' : 'bg-purple-50 border-purple-400'
                  }`}>
                    <div className="text-[10px] font-mono font-black text-purple-700 dark:text-purple-400">REGISTER R2</div>
                    <div className="text-sm font-black text-slate-950 dark:text-white truncate py-0.5">
                      {current.r2}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">1 Clock Cycle Latency</div>
                  </div>
                </div>

                {/* Slow System RAM Module */}
                <div className={`p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 ${
                  current.spillActive
                    ? 'bg-red-50 border-red-500 text-red-950 dark:bg-red-500/15 dark:border-red-500 dark:text-red-300 shadow-lg shadow-red-500/20 animate-pulse'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-300 dark:border-slate-800">
                    <span className="font-mono font-black text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>EXTERNAL RAM (60 ns)</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-500">200× Slower!</span>
                  </div>

                  {current.spillActive ? (
                    <div className="text-center py-2 space-y-2">
                      <div className="inline-block p-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 animate-bounce">
                        <AlertTriangle className="w-6 h-6 mx-auto" />
                      </div>
                      <div className="text-xs font-black text-red-800 dark:text-red-400">
                        SPILL PENALTY TRIGGERED!
                      </div>
                      <div className="text-[11px] font-medium leading-tight">
                        CPU bus frozen waiting for RAM access.
                      </div>
                      <div className="p-1.5 rounded-lg bg-red-600 text-white font-mono font-black text-xs shadow-md">
                        +200 CYCLES WASTED
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-1">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">RAM Stack Memory</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        {step >= 3 && failureMode === 'spill'
                          ? 'Holds evicted variables (var a) that did not fit into registers.'
                          : 'Idle. All active data currently fits on the CPU.'}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-center text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                    Memory Bus: {current.spillActive ? '⚠️ 100% Saturation / Stalled' : 'Ready'}
                  </div>
                </div>

              </div>

              {/* Latency Comparison Bar */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Total Execution Latency Stalls:</span>
                  <span className="text-red-500 font-black text-sm">
                    {failureMode === 'spill' ? `${current.stalls} Clock Cycles Wasted` : 'Data Loss!'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (current.stalls / 400) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 Cycles (Ideal Speed)</span>
                  <span>200 Cycles (1 Spill)</span>
                  <span>400 Cycles (2 Spills)</span>
                </div>
              </div>

            </div>

            {/* The Solution Teaser Callout */}
            <div className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
              isDark ? 'bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900 border-cyan-500/40' : 'bg-gradient-to-r from-cyan-50 via-purple-50 to-white border-cyan-200'
            }`}>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The Computer Science Breakthrough</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Notice that variable <code className="text-cyan-600 dark:text-cyan-400">b</code> is dead after Line 3, and variable <code className="text-purple-600 dark:text-purple-400">c</code> is dead after Line 4!
                  Can they reuse the same register without clashing?
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.playVictory();
                  onProceedToSolution();
                }}
                className="px-6 py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <span>Stage 2: The Discrete Math Solution</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
