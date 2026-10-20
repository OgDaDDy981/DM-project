import React, { useState } from 'react';
import {
  Shuffle,
  HardDrive,
  Cpu,
  ArrowDown,
  RotateCcw,
  Play,
  Clock,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface SpillingDemoProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const SpillingDemo: React.FC<SpillingDemoProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [availableRegisters, setAvailableRegisters] = useState<number>(2);

  const steps = [
    {
      title: 'Step 1: 3 Items Clash At Once',
      desc: '3 mutually clashing variables (Health, Coins, Shield) approach the CPU.',
      badge: 'Check Clashes',
    },
    {
      title: 'Step 2: Overflow Warning! 🚨',
      desc: 'All 3 items are needed at the same time! But the CPU only has 2 fast pockets. It is mathematically impossible to color them without a collision!',
      badge: 'Register Overflow',
    },
    {
      title: 'Step 3: Choosing Who Gets Evicted',
      desc: 'The computer checks which variable is used least often. "Shield" is chosen to be evicted to the slow basement storage (RAM).',
      badge: 'Candidate Picked',
    },
    {
      title: 'Step 4: Dropped Into the Slow Basement (RAM)',
      desc: 'Variable "Shield" is sent down the chute into System RAM. It is safe, but accessing it will take 200× longer!',
      badge: 'Evacuated to RAM',
    },
    {
      title: 'Step 5: Remaining 2 Fit at Full Speed',
      desc: 'With Shield in the basement, Health and Coins fit smoothly into Pocket 1 and Pocket 2! Whenever Shield is needed, the CPU must stop and wait for RAM.',
      badge: 'Allocation Complete',
    },
  ];

  const handleNext = () => {
    sounds.playPop();
    setCurrentStep((prev) => {
      const next = Math.min(steps.length - 1, prev + 1);
      if (next === 1 || next === 3) sounds.playConflict();
      if (next === 4) sounds.playVictory();
      return next;
    });
  };

  const handlePrev = () => {
    sounds.playPop();
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    sounds.playPop();
    setCurrentStep(0);
  };

  return (
    <section id="spilling" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Shuffle className="w-4 h-4" />
            <span>The Reality of Register Pressure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Memory Spilling:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400">
              When Pockets Run Out!
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isStoryMode
              ? "What happens when your code has more simultaneous variables than the CPU physically has pockets? The computer spills excess variables to slow RAM!"
              : "When the chromatic number χ(G) exceeds the target register count k, the compiler must spill variables to Stack Memory, inserting LOAD and STORE instructions."}
          </p>
        </div>

        {/* Stepper Controls Bar */}
        <div className={`p-5 rounded-3xl border-2 flex flex-wrap items-center justify-between gap-4 shadow-xl ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-red-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{currentStep === 0 ? 'Start Spilling Demonstration' : 'Next Spilling Step →'}</span>
            </button>

            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                isDark ? 'bg-slate-800 text-white border-slate-700 disabled:opacity-40' : 'bg-slate-100 text-slate-800 border-slate-300 disabled:opacity-40'
              }`}
            >
              ← Prev
            </button>

            <button
              onClick={handleReset}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-black'
              }`}
              title="Reset Spilling Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              CPU Hardware Pockets:
            </span>
            <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => {
                  sounds.playPop();
                  setAvailableRegisters(2);
                  setCurrentStep(0);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  availableRegisters === 2
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                k = 2 (Forces Spill)
              </button>
              <button
                onClick={() => {
                  sounds.playPop();
                  setAvailableRegisters(3);
                  setCurrentStep(0);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  availableRegisters === 3
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                k = 3 (Fits 100%)
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Spilling Visualization Arena */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-8 ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          
          {/* Active Step Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-500 border border-red-500/40">
                {steps[currentStep].badge}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Stage {currentStep + 1} of 5
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-500">
              Triangle K3 • Needs 3 Pockets
            </span>
          </div>

          {/* Dynamic Graphic Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: CPU Registers & Memory Stack */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* CPU Core & Register Bank */}
              <div className={`p-6 rounded-3xl border-2 space-y-3 ${
                isDark ? 'bg-slate-900 border-cyan-500/40' : 'bg-cyan-50/50 border-cyan-300'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                    <Cpu className="w-5 h-5 text-cyan-500" />
                    <span>CPU FAST POCKETS (Lightning Silicon)</span>
                  </span>
                  <span className="text-emerald-500 font-bold">0.3 ns Speed</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Register R1 */}
                  <div className={`p-5 rounded-2xl border-2 text-center transition-all ${
                    isDark ? 'bg-slate-950 border-cyan-500/40' : 'bg-white border-cyan-300 shadow-sm'
                  }`}>
                    <div className="text-xs font-mono text-cyan-500 font-bold">POCKET 1 (R1)</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {currentStep >= 4 ? '❤️ Health' : currentStep >= 1 ? '❤️ Health' : 'Empty'}
                    </div>
                  </div>

                  {/* Register R2 */}
                  <div className={`p-5 rounded-2xl border-2 text-center transition-all ${
                    isDark ? 'bg-slate-950 border-purple-500/40' : 'bg-white border-purple-300 shadow-sm'
                  }`}>
                    <div className="text-xs font-mono text-purple-500 font-bold">POCKET 2 (R2)</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {currentStep >= 4 ? '🪙 Coins' : currentStep >= 1 ? '🪙 Coins' : 'Empty'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spill Chute / Data Flow Animation */}
              <div className="flex items-center justify-center py-2">
                <div className="flex flex-col items-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  <ArrowDown
                    className={`w-7 h-7 transition-colors duration-500 ${
                      currentStep >= 3 ? 'text-red-500 animate-bounce' : 'text-slate-400'
                    }`}
                  />
                  <span>
                    {currentStep >= 3 ? 'SPILL CHUTE DOWN TO SLOW RAM' : 'Standby Spill Chute'}
                  </span>
                </div>
              </div>

              {/* Main Memory Stack (RAM) */}
              <div className={`p-6 rounded-3xl border-2 space-y-3 ${
                isDark ? 'bg-slate-900 border-red-500/40' : 'bg-red-50/50 border-red-300'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-red-500 flex items-center gap-1.5 text-sm">
                    <HardDrive className="w-5 h-5 text-red-500" />
                    <span>SYSTEM RAM (The Slow Basement)</span>
                  </span>
                  <span className="text-red-500 font-bold">70 ns Latency (200× Penalty)</span>
                </div>

                <div className={`p-5 rounded-2xl border flex items-center justify-between font-mono text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div>
                    <span className="text-slate-400 font-bold">Stack Address [RBP - 8]: </span>
                    {currentStep >= 3 ? (
                      <span className="text-red-500 font-black text-base ml-2 animate-pulse">
                        🛡️ Shield (Spilled Down Here!)
                      </span>
                    ) : (
                      <span className="text-slate-400 italic ml-2">Empty Stack Frame</span>
                    )}
                  </div>
                  {currentStep >= 3 && (
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 font-bold text-[10px]">
                      Requires Slow LOAD/STORE
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Explanation & Cost Comparison */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className={`p-6 rounded-3xl border-2 space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">{steps[currentStep].title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {steps[currentStep].desc}
                </p>
              </div>

              {/* Tradeoff Alert Card */}
              <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm leading-relaxed font-medium">
                  <strong className="font-bold">The Takeaway:</strong> Spilling prevents computer crashes, but it makes the CPU crawl! That's why smart graph coloring is the most valuable part of any modern compiler!
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
