import React, { useState } from 'react';
import {
  Zap,
  HelpCircle,
  CheckCircle2,
  Layers,
  Activity,
  Flame,
  Binary,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TheRegisterProblemProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const TheRegisterProblem: React.FC<TheRegisterProblemProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [variableCount, setVariableCount] = useState<number>(18);
  const [activeHierarchyLevel, setActiveHierarchyLevel] = useState<number>(0);
  const [activeArchitecturalReason, setActiveArchitecturalReason] = useState<number>(0);

  // Hardware Memory Pyramid Levels
  const memoryHierarchy = [
    {
      level: 'Registers',
      symbol: 'R0–R15',
      latency: '0.3 ns',
      cycles: '1 cycle',
      capacity: '~256 Bytes',
      distance: '0.05 mm (Inside ALU)',
      color: '#06B6D4', // Cyan
      desc: 'Flip-flops built directly on the ALU compute pipeline. Maximum clock frequency speed with zero wait states.',
    },
    {
      level: 'L1 Cache',
      symbol: 'L1 D-Cache',
      latency: '1.0 ns',
      cycles: '4 cycles',
      capacity: '32–64 KB',
      distance: '0.5 mm (On-Core)',
      color: '#8B5CF6', // Purple
      desc: 'Ultra-tight on-core SRAM. Stores recently read variables and stack pointers.',
    },
    {
      level: 'L2 Cache',
      symbol: 'L2 Cache',
      latency: '3.5 ns',
      cycles: '14 cycles',
      capacity: '512 KB–1 MB',
      distance: '2.0 mm (Dedicated Core)',
      color: '#3B82F6', // Blue
      desc: 'Dedicated intermediate SRAM buffer bridging single cores to shared interconnects.',
    },
    {
      level: 'L3 Cache',
      symbol: 'L3 Shared',
      latency: '12.0 ns',
      cycles: '45–50 cycles',
      capacity: '16–64 MB',
      distance: '8.0 mm (Shared Die)',
      color: '#10B981', // Emerald
      desc: 'Large pool shared across all CPU cores. Prevents motherboard bus requests when possible.',
    },
    {
      level: 'System RAM',
      symbol: 'DDR5 DRAM',
      latency: '70.0 ns',
      cycles: '200–250 cycles',
      capacity: '16–64 GB',
      distance: '150 mm (External Sticks)',
      color: '#EF4444', // Red
      desc: 'External motherboard DIMMs. Every spill to RAM forces the CPU to wait hundreds of idle cycles!',
    },
    {
      level: 'NVMe SSD',
      symbol: 'PCIe 4.0 Storage',
      latency: '10,000 ns',
      cycles: '30,000+ cycles',
      capacity: '1–4 TB',
      distance: 'External Drive Bus',
      color: '#F59E0B', // Amber
      desc: 'Persistent flash disk memory. Used for virtual memory paging when physical RAM overflows.',
    },
  ];

  // The 3 Architectural Bottlenecks (Why 1,000 registers is physically impossible)
  const architecturalReasons = [
    {
      id: 'instruction-encoding',
      title: '1. Instruction Word Bit Budget',
      subtitle: 'Opcode Space Starvation',
      icon: <Binary className="w-5 h-5 text-cyan-400" />,
      badge: 'Bit Budget Limit',
      summary:
        'In fixed 32-bit instructions (ARM64, RISC-V), arithmetic commands need 3 register fields: Destination, Source 1, Source 2 (e.g. ADD Rd, Rs1, Rs2).',
      mathHighlight:
        'With 32 registers: 3 × 5 bits = 15 bits used (leaving 17 bits for opcodes). With 1,024 registers: 3 × 10 bits = 30 bits consumed! Only 2 bits remain for the entire CPU instruction set!',
      takeaway: 'Hardware registers must stay small so machine instructions fit within 32 bits.',
    },
    {
      id: 'crossbar-capacitance',
      title: '2. Multi-Port SRAM Crossbar Area',
      subtitle: 'Parasitic Capacitance & Clock Frequency',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      badge: 'Silicon Physics',
      summary:
        'A CPU register file requires multiple read and write ports so multiple ALUs can access operands in parallel during superscalar execution.',
      mathHighlight:
        'Silicon area scales quadratically: Area ≈ O(Ports² × Registers). A 1,024-register multi-ported file creates enormous parasitic wire capacitance, dropping the CPU clock frequency from 5.0 GHz down below 1.2 GHz!',
      takeaway: 'More registers would make the entire processor run 4× slower on every cycle.',
    },
    {
      id: 'context-switching',
      title: '3. Operating System Context Switch Cost',
      subtitle: 'Process & Interrupt State Latency',
      icon: <Layers className="w-5 h-5 text-pink-400" />,
      badge: 'OS State Bloat',
      summary:
        'Every time an operating system switches between threads (e.g., from your browser to your music player or mouse interrupt), it must save all register values to RAM.',
      mathHighlight:
        'With 16 registers: Saving state takes 16 × 8 bytes = 128 bytes (instant L1 write). With 1,024 registers: 8,192 bytes must be dumped to RAM on every single timer interrupt (thousands of times per second)!',
      takeaway: '1,024 registers would make multitasking and audio/mouse latency crawl to a halt.',
    },
  ];

  // Pressure calculations based on 4 hardware registers
  const hardwareRegisters = 4;
  const ratio = (variableCount / hardwareRegisters).toFixed(1);
  const pressurePercent = Math.min(250, Math.round((variableCount / (hardwareRegisters * 3)) * 100));

  let pressureStatus = 'Normal (Interval Coloring Optimal)';
  let pressureColor = 'text-emerald-400';
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  if (variableCount > 24) {
    pressureStatus = 'Critical (Heavy Memory Spills Expected)';
    pressureColor = 'text-red-500';
    badgeColor = 'bg-red-500/20 text-red-500 border-red-500/30';
  } else if (variableCount > 12) {
    pressureStatus = 'Elevated (Liveness Analysis Essential)';
    pressureColor = 'text-amber-400';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }

  const selectedLevel = memoryHierarchy[activeHierarchyLevel];

  return (
    <section
      id="problem"
      className={`py-16 md:py-24 border-b transition-colors duration-300 relative overflow-hidden ${
        isDark ? 'bg-[#0B0F1C] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>The Fundamental Hardware Bottleneck</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Why Can't Silicon Just Give Every Variable{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              Its Own Pocket?
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {isStoryMode
              ? 'Programmers write software with hundreds of variables (health, score, camera, physics). But a physical computer processor only has a handful of ultra-fast registers. Here is the microarchitecture reality!'
              : 'High-level programming languages provide an unbounded symbolic variable namespace, while physical target execution microarchitectures provide bounded general-purpose register files (GPRs).'}
          </p>
        </div>

        {/* 1. Interactive Memory Hierarchy Latency Ladder */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-6 ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-black text-cyan-500 uppercase tracking-widest">
                  The Physics Latency Gradient
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                The Computer Memory Hierarchy Ladder
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Click any tier below to inspect silicon physics & latency
            </span>
          </div>

          {/* Interactive Tier Stack */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {memoryHierarchy.map((tier, idx) => {
              const isSelected = activeHierarchyLevel === idx;
              return (
                <button
                  key={tier.level}
                  onClick={() => {
                    sounds.playPop();
                    setActiveHierarchyLevel(idx);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 scale-105 shadow-xl font-black'
                      : isDark
                      ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  style={{
                    borderColor: isSelected ? tier.color : undefined,
                    backgroundColor: isSelected ? `${tier.color}18` : undefined,
                  }}
                >
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Tier {idx + 1}
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {tier.level}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono">
                    <span className="font-black" style={{ color: tier.color }}>
                      {tier.latency}
                    </span>
                    <div className="text-[10px] text-slate-400">{tier.cycles}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Tier Microarchitecture Deep-Dive Card */}
          <div
            className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full font-mono text-xs font-black text-slate-950 uppercase"
                  style={{ backgroundColor: selectedLevel.color }}
                >
                  {selectedLevel.level} ({selectedLevel.symbol})
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Physical Distance: {selectedLevel.distance}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {selectedLevel.desc}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Latency</div>
                <div className="text-base font-black text-cyan-400">{selectedLevel.latency}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Capacity</div>
                <div className="text-base font-black text-purple-400">{selectedLevel.capacity}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Register Pressure & Scarcity Workbench */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                <span>Compiler Register Pressure Simulator</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Squeezing {variableCount} Variables Into 4 Physical Pockets
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Drag the demand slider! Notice that while human software creates arbitrarily large numbers of variables, the CPU core hardware remains fixed at{' '}
                <strong className="text-cyan-400">k = 4 registers</strong>.
              </p>

              {/* Status Banner */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${badgeColor}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>State: {pressureStatus}</span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Demand Ratio: <strong className={pressureColor}>{ratio}×</strong>
                </div>
              </div>
            </div>

            {/* Interactive Control & Pressure Gauge */}
            <div
              className={`lg:col-span-5 p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex justify-between font-bold">
                <span>
                  Program Variables: <strong className="text-slate-900 dark:text-white text-base">{variableCount}</strong>
                </span>
                <span>
                  Registers: <strong className="text-cyan-400 text-base">{hardwareRegisters}</strong>
                </span>
              </div>

              <input
                type="range"
                min="4"
                max="48"
                step="1"
                value={variableCount}
                onChange={(e) => {
                  sounds.playPop();
                  setVariableCount(Number(e.target.value));
                }}
                className="w-full h-2.5 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              {/* Pressure Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Register Pressure Meter:</span>
                  <span className={pressureColor}>{pressurePercent}% Capacity</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (pressurePercent / 200) * 100)}%`,
                      backgroundColor:
                        pressurePercent > 130 ? '#EF4444' : pressurePercent > 80 ? '#F59E0B' : '#10B981',
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Graph coloring maps non-overlapping variables into identical registers!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Deep Architectural Explainer: Why Not 1,000 Registers? */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-6 ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <span>The Engineering Paradox: Why Not Build 1,000 Registers?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Three physical reasons why chip designers at Apple, Intel, and AMD keep register counts small.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {architecturalReasons.map((item, idx) => {
              const isSelected = activeArchitecturalReason === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sounds.playPop();
                    setActiveArchitecturalReason(idx);
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg scale-[1.02]'
                      : isDark
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-slate-800">{item.icon}</div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      <div className="text-[11px] font-mono text-purple-400 mt-0.5">{item.subtitle}</div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 leading-snug">
                    <strong className="text-cyan-400">Takeaway: </strong>
                    {item.takeaway}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Reason Math Detail Callout */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm font-mono leading-relaxed ${
              isDark
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}
          >
            <Binary className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-400 font-bold">Mathematical & Silicon Proof: </strong>
              <span>{architecturalReasons[activeArchitecturalReason].mathHighlight}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
