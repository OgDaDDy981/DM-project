import React, { useState, useEffect } from 'react';
import { Cpu, Clock, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';
import { REGISTER_PALETTE } from '../../types/compiler';
import { sounds } from '../../utils/soundEffects';

interface RegisterBankViewProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const RegisterBankView: React.FC<RegisterBankViewProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [currentLine, setCurrentLine] = useState<number>(3);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  const instructions = [
    { line: 1, text: 'a = 2', desc: 'Initialize variable a', story: 'Health is spawned' },
    { line: 2, text: 'b = 3', desc: 'Initialize variable b (a still held)', story: 'Coins are collected (Health still alive)' },
    { line: 3, text: 'c = a + b', desc: 'Compute c; variable b is now dead!', story: 'Score calculated! Coins are no longer needed (Dead!)' },
    { line: 4, text: 'd = c * 2', desc: 'Compute d; variable c is dead! d reuses R2!', story: 'Shield activated! Score is dead, so Shield reuses Pocket 2!' },
    { line: 5, text: 'e = a + 1', desc: 'Compute e; variable a is dead! e reuses R3!', story: 'Speed boost activated! Health is dead, so Speed reuses Pocket 3!' },
    { line: 6, text: 'return d + e', desc: 'Final sum computed and returned', story: 'Final game frame rendered with Shield & Speed!' },
  ];

  // Active occupants per register at currentLine
  const getRegisterOccupants = (regId: number) => {
    if (regId === 1) {
      // R1 is allocated to 'a' (live lines 1 to 5)
      return {
        assignedVars: ['a (Health)'],
        currentActiveVar: currentLine <= 5 ? (isStoryMode ? 'Health (a)' : 'a') : null,
        valueAtLine: currentLine <= 5 ? '2' : 'DEAD',
        isHeld: currentLine <= 5,
        history: 'Holds "a" continuously from Line 1 to 5',
      };
    }
    if (regId === 2) {
      // R2 is shared between 'b' (lines 2-3) and 'd' (lines 4-6)
      let activeVar: string | null = null;
      let val = 'IDLE';
      if (currentLine === 2 || currentLine === 3) {
        activeVar = isStoryMode ? 'Coins (b)' : 'b';
        val = '3';
      } else if (currentLine >= 4) {
        activeVar = isStoryMode ? 'Shield (d)' : 'd';
        val = '10 (c*2)';
      }
      return {
        assignedVars: ['b (Coins)', 'd (Shield)'],
        currentActiveVar: activeVar,
        valueAtLine: val,
        isHeld: activeVar !== null,
        history: 'Shared: "b" (Lines 2–3) ➔ REUSED for "d" (Lines 4–6)',
      };
    }
    if (regId === 3) {
      // R3 is shared between 'c' (lines 3-4) and 'e' (lines 5-6)
      let activeVar: string | null = null;
      let val = 'IDLE';
      if (currentLine === 3 || currentLine === 4) {
        activeVar = isStoryMode ? 'Score (c)' : 'c';
        val = '5 (a+b)';
      } else if (currentLine >= 5) {
        activeVar = isStoryMode ? 'Speed (e)' : 'e';
        val = '3 (a+1)';
      }
      return {
        assignedVars: ['c (Score)', 'e (Speed)'],
        currentActiveVar: activeVar,
        valueAtLine: val,
        isHeld: activeVar !== null,
        history: 'Shared: "c" (Lines 3–4) ➔ REUSED for "e" (Lines 5–6)',
      };
    }
    return {
      assignedVars: [],
      currentActiveVar: null,
      valueAtLine: 'FREE',
      isHeld: false,
      history: 'Unused standby pocket',
    };
  };

  // Auto-play timeline loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlayingTimeline) {
      timer = setInterval(() => {
        sounds.playPop();
        setCurrentLine((prev) => (prev >= 6 ? 1 : prev + 1));
      }, 1600);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingTimeline]);

  return (
    <section id="registers" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#0B0F1C] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Cpu className="w-4 h-4" />
            <span>Silicon Hardware In Action</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Live CPU Pockets &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              Variable Lifetimes
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            See how graph coloring translates directly to physical CPU slots across execution time.
          </p>
        </div>

        {/* Big Highlight Principle Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 text-center shadow-xl ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-500 mb-1 font-black">
            The Golden Register Rule
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            “Different Variables. Different Moments.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              Same Hardware Pocket.
            </span>”
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
            Variable <strong className="text-purple-500">Coins (b)</strong> dies at line 3, liberating register <strong className="text-purple-500">R2</strong>. The computer immediately re-assigns <strong className="text-purple-500">R2</strong> to newly born variable <strong className="text-purple-500">Shield (d)</strong>!
          </p>
        </div>

        {/* Physical Register Bank UI */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">CPU Register Bank (Silicon Slots)</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Hardware Architecture: 3 Active Registers • Direct ALU Bus
              </p>
            </div>

            {/* Timeline Stepper Controls with generous spacing */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  sounds.playPop();
                  setIsPlayingTimeline(!isPlayingTimeline);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isPlayingTimeline ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlayingTimeline ? 'Pause Clock' : 'Step Clock'}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  setIsPlayingTimeline(false);
                  setCurrentLine(1);
                }}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
                }`}
                title="Reset to Line 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Physical Register Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {[1, 2, 3].map((regId) => {
              const regInfo = REGISTER_PALETTE[regId - 1];
              const occ = getRegisterOccupants(regId);

              return (
                <div
                  key={regId}
                  className={`rounded-3xl border-2 transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden ${
                    occ.isHeld
                      ? isDark
                        ? 'bg-slate-900/90 shadow-xl'
                        : 'bg-white shadow-xl'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                  style={{
                    borderColor: occ.isHeld ? regInfo.borderColor : undefined,
                  }}
                >
                  {/* Register Header */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-md"
                          style={{ backgroundColor: regInfo.color }}
                        />
                        <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                          POCKET {regInfo.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          occ.isHeld
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {occ.isHeld ? 'ACTIVE' : 'IDLE'}
                      </span>
                    </div>

                    {/* Active Variable Display */}
                    <div className="py-6 text-center">
                      <div className="text-xs font-mono text-slate-500 uppercase font-bold mb-1">
                        Current Occupant
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight flex items-center justify-center gap-2">
                        {occ.currentActiveVar ? (
                          <span
                            className="px-4 py-1.5 rounded-2xl shadow-lg animate-pulse text-white"
                            style={{
                              backgroundColor: regInfo.color,
                            }}
                          >
                            {occ.currentActiveVar}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-light text-xl">Empty</span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2">
                        Stored Value: <strong className="text-slate-900 dark:text-white">{occ.valueAtLine}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Register Lifetime History */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Assigned Variables:</span>
                      <span className="text-slate-900 dark:text-white">{occ.assignedVars.join(', ')}</span>
                    </div>
                    <div className="text-cyan-600 dark:text-cyan-400 font-bold">{occ.history}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Timeline & Program Stepper */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Program Execution Timeline (Click any line to scrub)</span>
              </h4>
            </div>

            {/* Instruction Line Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-3.5">
              {instructions.map((inst) => {
                const isCurrent = inst.line === currentLine;
                return (
                  <button
                    key={inst.line}
                    onClick={() => {
                      sounds.playPop();
                      setIsPlayingTimeline(false);
                      setCurrentLine(inst.line);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer font-mono shadow-sm hover:scale-102 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20 scale-102 font-bold'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-black ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                        LINE {inst.line}
                      </span>
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                    </div>
                    <div className="text-xs truncate">{inst.text}</div>
                  </button>
                );
              })}
            </div>

            {/* Explanation of current line */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-950'
            }`}>
              <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
              <div className="text-xs sm:text-sm font-medium">
                <strong className="font-bold">At Line {currentLine}: </strong>
                {isStoryMode ? instructions[currentLine - 1].story : instructions[currentLine - 1].desc}.{' '}
                {currentLine >= 4 ? (
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    Notice how R2 and R3 seamlessly switched occupants with zero memory spill!
                  </span>
                ) : (
                  'Variables are being allocated into empty hardware pockets.'
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
