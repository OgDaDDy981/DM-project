import React, { useState } from 'react';
import { Play, RotateCcw, Zap, AlertTriangle, Trophy, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEffects';

export const SpeedGrandPrix: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [rocketFinished, setRocketFinished] = useState<boolean>(false);
  const [snailFinished, setSnailFinished] = useState<boolean>(false);
  const [raceCount, setRaceCount] = useState<number>(0);

  const startRace = () => {
    sounds.playLaser();
    setIsRacing(true);
    setRocketFinished(false);
    setSnailFinished(false);
    setRaceCount((prev) => prev + 1);

    // Rocket finishes almost instantly (350ms)
    setTimeout(() => {
      setRocketFinished(true);
      sounds.playChime(1.5);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5, x: 0.8 },
        });
      } catch {}
    }, 400);

    // Snail takes ~4 seconds to crawl
    setTimeout(() => {
      setSnailFinished(true);
      setIsRacing(false);
      sounds.playPop();
    }, 4200);
  };

  const resetRace = () => {
    sounds.playPop();
    setIsRacing(false);
    setRocketFinished(false);
    setSnailFinished(false);
  };

  return (
    <section id="race" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-gradient-to-b from-blue-50/50 to-white border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-red-500/10 to-pink-500/10 border border-amber-500/30 text-xs font-bold uppercase tracking-wider text-amber-500 shadow-sm">
            <Flame className="w-4 h-4 text-red-500 animate-bounce" />
            <span>The Shocking Speed Difference</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            The Nanosecond Drag Race:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              CPU Register vs. System RAM
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Why do compilers go crazy trying to color graphs? Because CPU registers are like lightning, and RAM is like waiting in airport security!
          </p>
        </div>

        {/* Drag Strip Arena Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all duration-300 ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>The 200× Speed Showdown</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 font-mono font-bold">
                  1 Clock Cycle vs 200 Cycles{raceCount > 0 ? ` • Races: ${raceCount}` : ''}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Click "Start Drag Race" to see what happens when code runs out of registers!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startRace}
                disabled={isRacing}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 text-slate-950 shadow-xl shadow-red-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRacing ? 'Racing in Real-Time...' : 'START THE DRAG RACE! 🏁'}</span>
              </button>

              <button
                onClick={resetRace}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
                }`}
                title="Reset Race"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Race Track Lanes */}
          <div className="py-8 space-y-8">
            
            {/* Lane 1: CPU Register (Rocket) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-cyan-500 dark:text-cyan-400 flex items-center gap-1.5 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>RACER 1: CPU REGISTERS (The Fast Pockets)</span>
                </span>
                <span className="text-emerald-500 dark:text-emerald-400">
                  ⚡ 0.3 Nanoseconds (1 Cycle) — INSTANT SPEED
                </span>
              </div>

              <div className="relative h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-950/80 border-2 border-cyan-500/30 overflow-hidden flex items-center px-4">
                {/* Lane road marks */}
                <div className="absolute inset-x-0 h-[2px] border-b-2 border-dashed border-slate-300 dark:border-slate-800 pointer-events-none" />

                {/* Finish line checkerboard */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-emerald-500/20 border-l-2 border-dashed border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-500">
                  🏁
                </div>

                {/* Animated Rocket */}
                <div
                  className="flex items-center gap-2 transition-all"
                  style={{
                    transform: rocketFinished
                      ? 'translateX(calc(100% + 560px))'
                      : isRacing
                      ? 'translateX(calc(100% + 560px))'
                      : 'translateX(0px)',
                    transitionDuration: rocketFinished || isRacing ? '380ms' : '0ms',
                    transitionTimingFunction: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
                  }}
                >
                  <div className="text-3xl filter drop-shadow-md animate-pulse">🚀</div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] whitespace-nowrap shadow-md">
                    Direct Silicon!
                  </span>
                </div>

                {rocketFinished && (
                  <div className="absolute right-12 flex items-center gap-1.5 text-xs font-bold text-emerald-500 dark:text-emerald-400 animate-bounce">
                    <Trophy className="w-4 h-4" />
                    <span>FINISHED IN 0.3 ns! WINNER!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lane 2: RAM Memory Spill (Snail) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-red-500 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>RACER 2: SYSTEM RAM (When Variables Spill)</span>
                </span>
                <span className="text-red-500">
                  🐢 70+ Nanoseconds (200+ Cycles) — 200× SLOWER!
                </span>
              </div>

              <div className="relative h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-950/80 border-2 border-red-500/30 overflow-hidden flex items-center px-4">
                {/* Lane road marks */}
                <div className="absolute inset-x-0 h-[2px] border-b-2 border-dashed border-slate-300 dark:border-slate-800 pointer-events-none" />

                {/* Finish line checkerboard */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-red-500/20 border-l-2 border-dashed border-red-500 flex items-center justify-center font-bold text-xs text-red-500">
                  🏁
                </div>

                {/* Animated Snail */}
                <div
                  className="flex items-center gap-2 transition-all"
                  style={{
                    transform: snailFinished
                      ? 'translateX(calc(100% + 560px))'
                      : isRacing
                      ? 'translateX(calc(100% + 560px))'
                      : 'translateX(0px)',
                    transitionDuration: snailFinished || isRacing ? '4200ms' : '0ms',
                    transitionTimingFunction: 'linear',
                  }}
                >
                  <div className="text-3xl filter drop-shadow-md">🐌</div>
                  {isRacing && !snailFinished && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] whitespace-nowrap animate-pulse">
                      Waiting for memory bus...
                    </span>
                  )}
                </div>

                {snailFinished && (
                  <div className="absolute right-12 text-xs font-bold text-amber-500">
                    Finally crossed the line... 200 cycles later!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Why this matters explanation banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl font-black text-cyan-500 mb-1">0.3 ns</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">CPU Register Read</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Data is physically wired directly inside the CPU's brain. Zero delay.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl font-black text-red-500 mb-1">70 ns</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">System RAM (Spill)</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Data travels across external motherboard wires. The CPU stalls waiting!
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl font-black text-emerald-500 mb-1">200×</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">The Speed Penalty</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                If graph coloring saves your variables from spilling, your app runs 200× faster!
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
