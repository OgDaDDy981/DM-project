import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Zap, AlertTriangle, Trophy, Flame, Activity, Clock, Gauge, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEffects';

interface SpeedGrandPrixProps {
  isDark: boolean;
}

export const SpeedGrandPrix: React.FC<SpeedGrandPrixProps> = ({ isDark }) => {
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [rocketFinished, setRocketFinished] = useState<boolean>(false);
  const [snailFinished, setSnailFinished] = useState<boolean>(false);
  const [raceCount, setRaceCount] = useState<number>(0);

  // Frequency selector: 3.2 GHz, 4.0 GHz, 5.0 GHz
  const [cpuFreqGhz, setCpuFreqGhz] = useState<number>(4.0);

  // Dynamic progress: 0 to 100%
  const [rocketProgress, setRocketProgress] = useState<number>(0);
  const [snailProgress, setSnailProgress] = useState<number>(0);
  const [elapsedCycles, setElapsedCycles] = useState<number>(1);
  const [memoryPhase, setMemoryPhase] = useState<string>('Standby (Idle)');

  // Selected view mode: 'drag-strip' | 'oscilloscope'
  const [viewMode, setViewMode] = useState<'drag-strip' | 'oscilloscope'>('drag-strip');

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Derived metrics
  const cycleTimeNs = (1 / cpuFreqGhz).toFixed(3);
  const registerLatencyNs = (1 * (1 / cpuFreqGhz)).toFixed(2);
  const ramLatencyNs = (200 * (1 / cpuFreqGhz)).toFixed(1);
  const wastedInstructions = elapsedCycles * 4; // 4-way superscalar pipeline

  const startRace = () => {
    sounds.playLaser();
    setIsRacing(true);
    setRocketFinished(false);
    setSnailFinished(false);
    setRocketProgress(0);
    setSnailProgress(0);
    setElapsedCycles(1);
    setRaceCount((prev) => prev + 1);

    // Rocket sprints to finish in 350ms (representing 1 cycle)
    const rocketStartTime = performance.now();
    const animateRocket = (now: number) => {
      const elapsed = now - rocketStartTime;
      const progress = Math.min(100, (elapsed / 350) * 100);
      setRocketProgress(progress);
      if (progress < 100) {
        requestAnimationFrame(animateRocket);
      } else {
        setRocketFinished(true);
        sounds.playChime(1.5);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.5, x: 0.8 },
          });
        } catch {}
      }
    };
    requestAnimationFrame(animateRocket);

    // Snail crawl: ~4000ms duration, spanning 200 cycles
    startTimeRef.current = performance.now();
    const totalDuration = 4000;

    const animateSnail = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      setSnailProgress(progress);

      // Cycle accumulation: 1 to 200
      const currentCycles = Math.min(200, Math.floor(1 + (progress / 100) * 199));
      setElapsedCycles(currentCycles);

      // DRAM hardware phase telemetry
      if (currentCycles <= 25) {
        setMemoryPhase('Phase 1: Bus Arbitration & Command Issue');
      } else if (currentCycles <= 80) {
        setMemoryPhase('Phase 2: Row Address Strobe (t_RCD row activate)');
      } else if (currentCycles <= 140) {
        setMemoryPhase('Phase 3: Column Address Strobe (t_CAS latency)');
      } else if (currentCycles <= 180) {
        setMemoryPhase('Phase 4: DRAM Capacitor Sense-Amp Precharge');
      } else {
        setMemoryPhase('Phase 5: 64-Byte Burst Transfer to L1 Cache');
      }

      if (progress < 100) {
        animationFrameRef.current = requestAnimationFrame(animateSnail);
      } else {
        setSnailFinished(true);
        setIsRacing(false);
        sounds.playPop();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateSnail);
  };

  const resetRace = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    sounds.playPop();
    setIsRacing(false);
    setRocketFinished(false);
    setSnailFinished(false);
    setRocketProgress(0);
    setSnailProgress(0);
    setElapsedCycles(1);
    setMemoryPhase('Standby (Idle)');
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section
      id="race"
      className={`py-16 md:py-24 border-b transition-colors duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-[#080B14] border-slate-800 text-white'
          : 'bg-gradient-to-b from-blue-50/50 to-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Background CAD grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-red-500/10 to-pink-500/10 border border-amber-500/30 text-xs font-bold uppercase tracking-wider text-amber-500 shadow-sm">
            <Flame className="w-4 h-4 text-red-500 animate-bounce" />
            <span>The 200× Physical Speed Disparity</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            The Nanosecond Drag Race:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              CPU Register vs. System RAM
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Why do compilers go crazy trying to color graphs? Because CPU registers access data in{' '}
            <strong className="text-cyan-400">1 single clock cycle</strong> directly inside silicon, while RAM
            stalls the execution pipeline for <strong className="text-red-500">over 200 cycles</strong>!
          </p>
        </div>

        {/* Drag Strip Arena Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all duration-300 relative ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}
        >
          {/* Top Controls Bar & Telemetry HUD */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Hardware Latency Benchmarker</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 font-mono font-bold">
                    1 Cycle vs 200 Cycles {raceCount > 0 ? `• Runs: ${raceCount}` : ''}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time physics clock showing cycle accumulation and pipeline starvation.
              </p>
            </div>

            {/* Microarchitecture Frequency & View Toggles */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Frequency Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <span className="px-2 text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>CPU:</span>
                </span>
                {[3.2, 4.0, 5.0].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => {
                      sounds.playPop();
                      setCpuFreqGhz(freq);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      cpuFreqGhz === freq
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-white'
                    }`}
                  >
                    {freq} GHz
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <button
                  onClick={() => {
                    sounds.playPop();
                    setViewMode('drag-strip');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'drag-strip'
                      ? 'bg-purple-600 text-white font-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Race Track</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playPop();
                    setViewMode('oscilloscope');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'oscilloscope'
                      ? 'bg-purple-600 text-white font-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Signal Waveform</span>
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={startRace}
                disabled={isRacing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 text-slate-950 shadow-xl shadow-red-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRacing ? 'Clock Ticking...' : 'FIRE DRAG RACE! 🏁'}</span>
              </button>

              <button
                onClick={resetRace}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
                }`}
                title="Reset Race"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Hardware Telemetry HUD Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Clock Period</span>
              </div>
              <div className="text-base sm:text-lg font-black text-cyan-400 font-mono mt-0.5">
                {cycleTimeNs} ns
              </div>
              <div className="text-[10px] text-slate-500">1 cycle duration @ {cpuFreqGhz} GHz</div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Register Access</span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
                {registerLatencyNs} ns (1 cycle)
              </div>
              <div className="text-[10px] text-slate-500">Zero pipeline stall</div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span>RAM Spill Penalty</span>
              </div>
              <div className="text-base sm:text-lg font-black text-red-500 font-mono mt-0.5">
                {ramLatencyNs} ns ({elapsedCycles}/200 cyc)
              </div>
              <div className="text-[10px] text-slate-500">200 clock cycles delay</div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span>Wasted Instructions</span>
              </div>
              <div className="text-base sm:text-lg font-black text-purple-400 font-mono mt-0.5">
                {wastedInstructions} slots
              </div>
              <div className="text-[10px] text-slate-500">4-way superscalar starvation</div>
            </div>
          </div>

          {/* View Mode: Drag Strip Track */}
          {viewMode === 'drag-strip' ? (
            <div className="py-4 space-y-6">
              {/* Lane 1: CPU Register (Rocket) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-cyan-400 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>RACER 1: CPU REGISTERS (Direct On-Chip Silicon)</span>
                  </span>
                  <span className="text-emerald-400 font-mono">
                    ⚡ {registerLatencyNs} ns (1 Cycle) — INSTANT EXECUTION
                  </span>
                </div>

                <div className="relative h-20 w-full rounded-2xl bg-slate-950 border-2 border-cyan-500/40 overflow-hidden flex items-center px-4 shadow-inner">
                  {/* Subtle speed laser streaks */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

                  {/* Lane center dashed guide wire */}
                  <div className="absolute inset-x-0 h-[2px] border-b-2 border-dashed border-cyan-500/20 pointer-events-none" />

                  {/* Finish line checkerboard flag */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-emerald-500/20 border-l-2 border-dashed border-emerald-400 flex items-center justify-center font-bold text-base text-emerald-400 z-10">
                    🏁
                  </div>

                  {/* Accurate percentage track progress positioning */}
                  <div
                    className="absolute flex items-center gap-2 z-20"
                    style={{
                      left: `calc(1rem + ${rocketProgress * 0.82}%)`,
                      transition: isRacing ? 'left 350ms cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none',
                    }}
                  >
                    <div className="text-3xl filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse">
                      🚀
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] whitespace-nowrap shadow-md uppercase tracking-wider">
                      On-Chip ALU Bus
                    </span>
                  </div>

                  {rocketFinished && (
                    <div className="absolute right-16 flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/50 shadow-lg animate-bounce z-30">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span>FINISHED IN {registerLatencyNs} ns (1 Cycle)!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lane 2: System RAM (Snail) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-red-400 flex items-center gap-1.5 text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>RACER 2: SYSTEM RAM (Motherboard DRAM Bus Spill)</span>
                  </span>
                  <span className="text-red-500 font-mono">
                    🐢 {ramLatencyNs} ns (200 Cycles) — 200× DELAY
                  </span>
                </div>

                <div className="relative h-20 w-full rounded-2xl bg-slate-950 border-2 border-red-500/40 overflow-hidden flex items-center px-4 shadow-inner">
                  {/* Stalling hazard warning stripes */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)] pointer-events-none" />

                  {/* Lane center dashed guide wire */}
                  <div className="absolute inset-x-0 h-[2px] border-b-2 border-dashed border-red-500/20 pointer-events-none" />

                  {/* Finish line */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-red-500/20 border-l-2 border-dashed border-red-500 flex items-center justify-center font-bold text-base text-red-500 z-10">
                    🏁
                  </div>

                  {/* Snail accurately tracking progress */}
                  <div
                    className="absolute flex items-center gap-2 z-20"
                    style={{
                      left: `calc(1rem + ${snailProgress * 0.82}%)`,
                    }}
                  >
                    <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                      🐌
                    </div>
                    {isRacing && !snailFinished && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-500/60 text-red-400 font-mono font-bold text-[10px] whitespace-nowrap animate-pulse">
                        Cycle {elapsedCycles}/200
                      </span>
                    )}
                  </div>

                  {snailFinished ? (
                    <div className="absolute right-16 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-500/50 shadow-lg z-30">
                      Finally arrived after {elapsedCycles} clock cycles!
                    </div>
                  ) : isRacing ? (
                    <div className="absolute right-16 text-[11px] font-mono font-bold text-slate-400 z-10">
                      CPU Stalled: {wastedInstructions} dead instruction slots
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Memory Phase Status Readout */}
              <div
                className={`p-3 rounded-2xl border text-xs font-mono font-bold flex flex-col sm:flex-row items-center justify-between gap-2 ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Current Hardware Event:</span>
                  <span className="text-amber-400">{memoryPhase}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {snailFinished
                    ? 'Bus transaction complete.'
                    : isRacing
                    ? 'Capacitor refresh & row buffer decode active'
                    : 'Click "FIRE DRAG RACE" to watch hardware clock cycles.'}
                </div>
              </div>
            </div>
          ) : (
            /* View Mode: Signal Oscilloscope Waveforms */
            <div className="py-4 space-y-4">
              <div
                className={`p-5 rounded-2xl border-2 space-y-4 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 text-white'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>Oscilloscope: Silicon Signal Rise Time & Bus Impedance</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Time Base: 0.1 ns / div</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Waveform 1: CPU Register */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                    <div className="flex justify-between text-xs font-mono font-bold text-cyan-400">
                      <span>CH1: On-Die Register Flip-Flop</span>
                      <span>Rise: 40 ps (Sharp Square Wave)</span>
                    </div>
                    <svg viewBox="0 0 300 100" className="w-full h-24 bg-slate-950 rounded-lg">
                      {/* Grid lines */}
                      <path d="M 0 25 H 300 M 0 50 H 300 M 0 75 H 300" stroke="#1E293B" strokeWidth="1" />
                      <path d="M 50 0 V 100 M 100 0 V 100 M 150 0 V 100 M 200 0 V 100 M 250 0 V 100" stroke="#1E293B" strokeWidth="1" />
                      {/* Sharp clean square wave */}
                      <polyline
                        points="0,80 30,80 32,20 90,20 92,80 150,80 152,20 210,20 212,80 270,80 272,20 300,20"
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="3"
                      />
                    </svg>
                    <p className="text-[10px] font-mono text-slate-400">
                      Direct copper wire (&lt; 0.5 mm length). Zero transmission loss. Data latched in 1 clock.
                    </p>
                  </div>

                  {/* Waveform 2: RAM Memory Bus */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-900/90 border border-red-500/30">
                    <div className="flex justify-between text-xs font-mono font-bold text-red-400">
                      <span>CH2: Motherboard External PCB Trace</span>
                      <span>Delay: 200 Cycles (Capacitive Stalls)</span>
                    </div>
                    <svg viewBox="0 0 300 100" className="w-full h-24 bg-slate-950 rounded-lg">
                      {/* Grid lines */}
                      <path d="M 0 25 H 300 M 0 50 H 300 M 0 75 H 300" stroke="#1E293B" strokeWidth="1" />
                      <path d="M 50 0 V 100 M 100 0 V 100 M 150 0 V 100 M 200 0 V 100 M 250 0 V 100" stroke="#1E293B" strokeWidth="1" />
                      {/* Ringing, slow attenuated wave */}
                      <path
                        d="M 0,80 Q 40,80 80,75 T 160,60 T 220,35 Q 240,15 250,25 T 265,18 T 280,22 L 300,20"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeDasharray={isRacing ? '4 2' : 'none'}
                        className={isRacing ? 'animate-laser-dash' : ''}
                      />
                    </svg>
                    <p className="text-[10px] font-mono text-slate-400">
                      External PCB trace (~15 cm length) through memory controller, PHY layer, and capacitive refresh.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Impact Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <div
              className={`p-4 rounded-2xl border transition-transform hover:scale-[1.02] ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-2xl font-black text-cyan-400 mb-1 font-mono">
                {registerLatencyNs} ns
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Direct Silicon Latency
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Registers sit inside the ALU. Electrical signals travel microns with zero wait states.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border transition-transform hover:scale-[1.02] ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-2xl font-black text-red-500 mb-1 font-mono">
                {ramLatencyNs} ns
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                System Memory Latency
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Spilled variables travel through DDR memory channels, causing the CPU pipeline to halt.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border transition-transform hover:scale-[1.02] ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-2xl font-black text-emerald-400 mb-1 font-mono">
                200×
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Graph Coloring Benefit
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                A good graph coloring algorithm keeps variables in fast silicon, preventing 200-cycle frame stutters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
