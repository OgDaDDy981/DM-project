import React, { useState } from 'react';
import { Cpu, Zap, AlertTriangle, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TheRegisterProblemProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const TheRegisterProblem: React.FC<TheRegisterProblemProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [variableCount, setVariableCount] = useState<number>(16);

  return (
    <section id="problem" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#0B0F1C] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider shadow-sm">
            <HelpCircle className="w-4 h-4" />
            <span>The Big Mystery</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Why Can't a Computer Just Give Every Variable{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              Its Own Pocket?
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isStoryMode
              ? "Programmers create as many variables as they want (coins, health, speed). But the CPU only has 8 to 16 ultra-fast registers. Here is why!"
              : "Source code constructs contain unbound quantities of symbolic identifiers, whereas physical target microarchitectures provide bounded register files (e.g. 16 to 32 GPRs)."}
          </p>
        </div>

        {/* 3 Foundation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: What is a Variable? */}
          <div className={`p-6 sm:p-7 rounded-3xl border-2 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center mb-5 font-bold text-xl shadow-inner">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                1. What Variables Are
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                When people write software (like TikTok, Minecraft, or WhatsApp), they create human-friendly names like <code className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono font-bold">score</code>, <code className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 font-mono font-bold">playerSpeed</code>, or <code className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">batteryPercent</code>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
              Human Names → Program Storage
            </div>
          </div>

          {/* Card 2: What are CPU Registers? */}
          <div className={`p-6 sm:p-7 rounded-3xl border-2 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center mb-5 font-bold text-xl shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                2. What Are CPU Registers?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Registers are tiny storage pockets built directly onto the CPU's calculating brain.
                Reading or writing a register takes <strong>less than 1 nanosecond (0.3 ns)</strong>—literally the fastest speed physically possible in the universe!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              0.3 Nanoseconds • Direct Silicon Wiring
            </div>
          </div>

          {/* Card 3: The Bottleneck */}
          <div className={`p-6 sm:p-7 rounded-3xl border-2 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center mb-5 font-bold text-xl shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                3. Why Are They So Scarce?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Why not build 10,000 registers? Because each one requires thousands of transistors, massive wire trees, and electrical heat.
                CPUs only have <strong>8 to 32 registers</strong>. If you run out, data drops to RAM, slowing execution down by <strong>200×</strong>!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
              Physical Silicon Limitations
            </div>
          </div>

        </div>

        {/* Interactive Variable vs Register Slider */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-xl ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 font-bold uppercase">
                The Puzzle We Must Solve
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                "How to squeeze {variableCount} variables into only 4 physical registers?"
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Try dragging the slider! Notice how the variables grow, while the physical hardware stays strictly at 4 registers.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>The Answer: Variables that are active at different times reuse the same register!</span>
              </div>
            </div>

            {/* Interactive Slider box */}
            <div className={`lg:col-span-5 p-6 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3 flex justify-between font-bold">
                <span>Variables in Your Program: <strong className="text-slate-900 dark:text-white text-base">{variableCount}</strong></span>
                <span>CPU Registers: <strong className="text-cyan-500 text-base">4</strong></span>
              </div>

              <input
                type="range"
                min="4"
                max="40"
                value={variableCount}
                onChange={(e) => {
                  sounds.playPop();
                  setVariableCount(Number(e.target.value));
                }}
                className="w-full h-2.5 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-4"
              />

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Ratio: <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{(variableCount / 4).toFixed(1)}×</strong> more variables than hardware slots!
                </div>
                <div className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1.5">
                  <span>Solved automatically using Graph Coloring!</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
