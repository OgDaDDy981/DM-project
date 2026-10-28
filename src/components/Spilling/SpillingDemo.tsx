import React, { useState } from 'react';
import {
  Shuffle,
  HardDrive,
  Cpu,
  ArrowDown,
  RotateCcw,
  Play,
  Clock,
  AlertTriangle,
  Calculator,
  Activity,
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
      title: 'Step 1: 3 Mutually Conflicting Variables',
      desc: '3 mutually clashing variables (Health, Coins, Shield) are all alive at the same execution cycle.',
      badge: 'Register Pressure Check',
    },
    {
      title: 'Step 2: Capacity Exhaustion! 🚨',
      desc: 'All 3 items are needed simultaneously! But the hardware budget is strictly k = 2 registers. By pigeonhole principle & K3 chromatic number χ(G)=3, a spill is mathematically unavoidable!',
      badge: 'Register Overflow',
    },
    {
      title: 'Step 3: Chaitin Heuristic Cost Evaluation',
      desc: 'The compiler computes SpillCost(v) for each candidate. "Shield" has the lowest access frequency (cost = 1.0), so it is selected for stack eviction.',
      badge: 'Heuristic Selected',
    },
    {
      title: 'Step 4: Eviction Down the Chute to RAM',
      desc: 'Variable "Shield" is evicted from the fast register file into System DRAM stack memory [rbp - 8]. An animated spill chute stores its value.',
      badge: 'Evacuated to Stack',
    },
    {
      title: 'Step 5: High-Speed Execution + 200× Memory Penalty',
      desc: 'Health and Coins run at 0.3ns inside R1 and R2. However, whenever Shield is read, the CPU must stall for ~200 clock cycles to fetch from RAM!',
      badge: 'Spill Complete',
    },
  ];

  const spillCandidates = [
    { id: 'health', name: 'Health', icon: '❤️', uses: 5, loopWeight: 2, deg: 2, cost: 5.0, status: 'STAYS IN R1' },
    { id: 'coins', name: 'Coins', icon: '🪙', uses: 4, loopWeight: 2, deg: 2, cost: 4.0, status: 'STAYS IN R2' },
    { id: 'shield', name: 'Shield', icon: '🛡️', uses: 1, loopWeight: 1, deg: 2, cost: 0.5, status: 'EVICTED TO RAM (Lowest Cost!)' },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => {
      const next = Math.min(steps.length - 1, prev + 1);
      if (next === 1) sounds.playConflict();
      else if (next === 3) sounds.playSpill();
      else if (next === 4) sounds.playVictory();
      else sounds.playPop();
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: CPU Registers, Eviction Chute & DRAM Stack */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Register Pressure Meter */}
              <div className={`p-4 rounded-2xl border font-mono text-xs ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5 font-bold">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Register Pressure</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    availableRegisters === 2 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {availableRegisters === 2 ? '150% PRESSURE • OVERFLOW' : '100% PRESSURE • STABLE'}
                  </span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      availableRegisters === 2 ? 'bg-gradient-to-r from-amber-500 to-red-500 w-full' : 'bg-emerald-500 w-2/3'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>3 Active Variables (K3 Clique)</span>
                  <span>Budget k = {availableRegisters} Hardware Slots</span>
                </div>
              </div>

              {/* CPU Core & Register Bank */}
              <div className={`p-6 rounded-3xl border-2 space-y-3 relative overflow-hidden ${
                isDark ? 'bg-slate-900 border-cyan-500/40' : 'bg-cyan-50/50 border-cyan-300'
              }`}>
                <div className="hud-corner-tl opacity-75" />
                <div className="hud-corner-tr opacity-75" />

                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <span>L1 CPU REGISTER FILE (Zero Latency Silicon)</span>
                  </span>
                  <span className="text-emerald-400 font-black">0.3 ns • 1 Clock Cycle</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 font-mono">
                  {/* Register R1 */}
                  <div className={`p-5 rounded-2xl border-2 text-center transition-all ${
                    isDark ? 'bg-slate-950 border-cyan-500/40' : 'bg-white border-cyan-300 shadow-sm'
                  }`}>
                    <div className="text-xs text-cyan-400 font-bold">HARDWARE SLOT R1</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentStep >= 1 ? '❤️ Health' : 'Empty'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">100% Core Speed</div>
                  </div>

                  {/* Register R2 */}
                  <div className={`p-5 rounded-2xl border-2 text-center transition-all ${
                    isDark ? 'bg-slate-950 border-purple-500/40' : 'bg-white border-purple-300 shadow-sm'
                  }`}>
                    <div className="text-xs text-purple-400 font-bold">HARDWARE SLOT R2</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentStep >= 1 ? '🪙 Coins' : 'Empty'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">100% Core Speed</div>
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
                    {currentStep >= 3 ? 'EVICTION BUS: SPILL DOWN TO SYSTEM RAM' : 'Standby Spill Chute (Awaiting Memory Overflow)'}
                  </span>
                </div>
              </div>

              {/* Main Memory Stack (DRAM) */}
              <div className={`p-6 rounded-3xl border-2 space-y-3 relative overflow-hidden ${
                isDark ? 'bg-slate-900 border-red-500/40' : 'bg-red-50/50 border-red-300'
              }`}>
                <div className="hud-corner-bl opacity-75" />
                <div className="hud-corner-br opacity-75" />

                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-red-400 flex items-center gap-1.5 text-sm">
                    <HardDrive className="w-5 h-5 text-red-500" />
                    <span>SYSTEM DRAM STACK (Memory Bus)</span>
                  </span>
                  <span className="text-red-400 font-black">70 ns • 200× Latency Penalty</span>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between font-mono text-xs gap-3 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div>
                    <span className="text-slate-400 font-bold">Stack Offset [rbp - 0x08]: </span>
                    {currentStep >= 3 ? (
                      <span className="text-red-400 font-black text-sm ml-2 animate-pulse">
                        🛡️ Shield (Evicted from Register File!)
                      </span>
                    ) : (
                      <span className="text-slate-500 italic ml-2">Empty Stack Frame Slot</span>
                    )}
                  </div>
                  {currentStep >= 3 && (
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-[10px] border border-red-500/40">
                      Inserted: MOV [rbp - 8], r2
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Chaitin Cost Evaluation & Latency Tachometer */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className={`p-6 rounded-3xl border-2 space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>{steps[currentStep].title}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {steps[currentStep].desc}
                </p>
              </div>

              {/* Chaitin Mathematical Cost Formula Table */}
              <div className={`p-5 rounded-3xl border space-y-3 font-mono text-xs ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase">
                  <Calculator className="w-4 h-4" />
                  <span>Chaitin Spill Cost Heuristic:</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-slate-300 border border-slate-800 text-center font-bold">
                  SpillCost(v) = (Uses × LoopWeight) / Degree(v)
                </div>

                <div className="space-y-2 pt-1">
                  {spillCandidates.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        c.id === 'shield' && currentStep >= 2
                          ? 'bg-red-500/15 border-red-500/40 text-red-300 font-bold'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{c.icon}</span>
                        <span>{c.name}</span>
                      </span>
                      <span className="text-slate-400">Cost: {c.cost}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        c.id === 'shield' && currentStep >= 2 ? 'bg-red-500/20 text-red-400' : 'text-slate-500'
                      }`}>
                        {c.id === 'shield' && currentStep >= 2 ? 'EVICT' : 'KEEP'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory Penalty Comparison Card */}
              <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed font-medium">
                  <strong className="font-bold text-amber-300">The 200× Stall Penalty: </strong>
                  Spilling prevents compiler crashes, but each memory fetch costs ~200 CPU cycles.
                  In our loop, spilling "Shield" creates a <span className="font-bold text-red-400">+400 clock cycle penalty</span>!
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
