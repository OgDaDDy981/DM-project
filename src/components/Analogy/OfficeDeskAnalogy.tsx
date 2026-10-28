import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Users,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Worker {
  id: string;
  name: string;
  icon: string;
  role: string;
  startHour: number; // 9 to 17
  endHour: number;
  assignedDesk: number; // 1, 2, or 3
  deskColor: string;
}

export const OfficeDeskAnalogy: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [currentHour, setCurrentHour] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const showColoredDesks = true;

  const workers: Worker[] = [
    {
      id: 'alice',
      name: 'Alice',
      icon: '🐱',
      role: 'Morning Designer',
      startHour: 9,
      endHour: 13,
      assignedDesk: 1,
      deskColor: '#06B6D4', // Cyan
    },
    {
      id: 'bob',
      name: 'Bob',
      icon: '🐶',
      role: 'Full-Day Manager',
      startHour: 10,
      endHour: 16,
      assignedDesk: 2,
      deskColor: '#8B5CF6', // Purple
    },
    {
      id: 'charlie',
      name: 'Charlie',
      icon: '🦊',
      role: 'Noon Developer',
      startHour: 12,
      endHour: 15,
      assignedDesk: 3,
      deskColor: '#10B981', // Lime
    },
    {
      id: 'diana',
      name: 'Diana',
      icon: '🐰',
      role: 'Afternoon Writer',
      startHour: 13,
      endHour: 17,
      assignedDesk: 1, // REUSES ALICE'S DESK!
      deskColor: '#06B6D4',
    },
    {
      id: 'ethan',
      name: 'Ethan',
      icon: '🐼',
      role: 'Evening Support',
      startHour: 15,
      endHour: 17,
      assignedDesk: 3, // REUSES CHARLIE'S DESK!
      deskColor: '#10B981',
    },
  ];

  const desks = [
    {
      id: 1,
      name: 'Workstation 1 (Cyan / R1)',
      color: '#06B6D4',
      occupants: 'Alice (9:00–13:00) ➔ Diana (13:00–17:00)',
      description: 'Zero overlap handoff at 13:00! Desk 1 reallocated flawlessly.',
    },
    {
      id: 2,
      name: 'Workstation 2 (Purple / R2)',
      color: '#8B5CF6',
      occupants: 'Bob (10:00–16:00)',
      description: 'Continuous long-lived live range. Holds register R2 all day.',
    },
    {
      id: 3,
      name: 'Workstation 3 (Lime / R3)',
      color: '#10B981',
      occupants: 'Charlie (12:00–15:00) ➔ Ethan (15:00–17:00)',
      description: 'Zero overlap handoff at 15:00! Desk 3 reallocated flawlessly.',
    },
  ];

  // Auto timeline scrubber
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentHour((prev) => {
          if (prev >= 17) {
            setIsPlaying(false);
            return 9;
          }
          const next = prev + 1;
          if (next === 13 || next === 15) {
            sounds.playHandoff();
          } else {
            sounds.playPop();
          }
          return next;
        });
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  // Which workers are in the office at currentHour?
  const activeWorkers = workers.filter(
    (w) => currentHour >= w.startHour && currentHour < w.endHour
  );

  const formatHour = (h: number) => {
    if (h === 12) return '12:00 PM';
    if (h > 12) return `${h - 12}:00 PM`;
    return `${h}:00 AM`;
  };

  const handleTogglePlay = () => {
    sounds.playPop();
    setIsPlaying(!isPlaying);
  };

  const handleHourChange = (newHour: number) => {
    if (newHour === 13 || newHour === 15) {
      sounds.playHandoff();
    } else {
      sounds.playPop();
    }
    setIsPlaying(false);
    setCurrentHour(newHour);
  };

  // Detect whether current hour is an active handoff
  const isHandoffHour = currentHour === 13 || currentHour === 15;

  return (
    <section
      id="analogy"
      className={`py-16 md:py-24 border-b transition-colors duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-[#0B0F1C] border-slate-800 text-white'
          : 'bg-gradient-to-b from-white to-blue-50/50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Background CAD grid */}
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-emerald-500/10 border border-purple-500/30 text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 shadow-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>The 30-Second Real-World Intuition</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            How 5 People Work at{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              Only 3 Desks!
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Forget complex compiler theory for a moment. Think of an office with{' '}
            <strong className="text-cyan-400">5 employees</strong>, but{' '}
            <strong className="text-purple-400">only 3 physical desks</strong>. Can everyone do their job without
            buying extra furniture? <span className="text-emerald-400 font-bold">YES!</span> As long as they don't
            overlap at the exact same hour!
          </p>
        </div>

        {/* Big Interactive Office Arena Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all duration-300 relative ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white/95 border-slate-200'
          }`}
        >
          {/* Top Clock Bar & Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl shadow-inner">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">
                  Program Execution Timeline
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{formatHour(currentHour)}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    {activeWorkers.length} {activeWorkers.length === 1 ? 'Variable' : 'Variables'} Active
                  </span>
                  {isHandoffHour && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold animate-pulse">
                      ⚡ Desk Handoff Event!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Time Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause Timeline' : 'Auto Play Day'}</span>
              </button>

              <button
                onClick={() => handleHourChange(9)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
                }`}
                title="Reset to 9:00 AM"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Hour Scrubber Buttons */}
          <div className="pt-6">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-2 flex justify-between">
              <span>Scrub Operating Hours:</span>
              <span className="text-cyan-400">Click any hour (notice 1:00 PM & 3:00 PM handoffs)</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
              {[9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => {
                const isSelected = currentHour === h;
                const isSpecial = h === 13 || h === 15;
                return (
                  <button
                    key={h}
                    onClick={() => handleHourChange(h)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs font-mono transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/30 scale-105 ring-2 ring-cyan-400'
                        : isDark
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{formatHour(h)}</span>
                    {isSpecial && !isSelected && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gantt Timeline Visual with Handoff Markers */}
          <div className="my-8 space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold flex justify-between items-center">
              <span>Active Variable Lifespans (Gantt Interval Schedule)</span>
              <span className="text-emerald-400 font-bold">Max Concurrent Occupants = 3</span>
            </div>

            <div className="space-y-2.5">
              {workers.map((w) => {
                const isWorkingNow = currentHour >= w.startHour && currentHour < w.endHour;
                const totalHours = 8; // 9 to 17
                const leftPercent = ((w.startHour - 9) / totalHours) * 100;
                const widthPercent = ((w.endHour - w.startHour) / totalHours) * 100;

                return (
                  <div
                    key={w.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                      isWorkingNow
                        ? isDark
                          ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10'
                          : 'bg-cyan-50/80 border-cyan-400 shadow-md shadow-cyan-100'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-800 opacity-60'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2 gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{w.icon}</span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white">
                          {w.name}
                        </strong>
                        <span className="text-slate-500 dark:text-slate-400">({w.role})</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400">
                          {formatHour(w.startHour)} – {formatHour(w.endHour)}
                        </span>
                        {showColoredDesks && (
                          <span
                            className="px-2.5 py-0.5 rounded-full font-black text-[10px] text-slate-950 uppercase"
                            style={{ backgroundColor: w.deskColor }}
                          >
                            Desk {w.assignedDesk}
                          </span>
                        )}
                        {isWorkingNow ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] animate-pulse">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Inactive</span>
                        )}
                      </div>
                    </div>

                    {/* Timeline bar with track */}
                    <div className="h-5 w-full rounded-full bg-slate-200 dark:bg-slate-800/90 overflow-hidden relative shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-300 flex items-center justify-center text-[10px] font-black text-slate-950 shadow-sm"
                        style={{
                          marginLeft: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          backgroundColor: w.deskColor,
                        }}
                      >
                        {w.name}
                      </div>

                      {/* Current Hour Laser Pointer Line */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-lg shadow-red-500/80 z-10 transition-all duration-300"
                        style={{ left: `${((currentHour - 9) / totalHours) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* The 3 Physical Desks Visual */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center mb-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                The 3 Physical Workstations (CPU Registers R1, R2, R3)
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-2 text-slate-900 dark:text-white">
                Who Is Sitting In Which Chair Right Now?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {desks.map((d) => {
                const currentOccupant = workers.find(
                  (w) => w.assignedDesk === d.id && currentHour >= w.startHour && currentHour < w.endHour
                );

                return (
                  <div
                    key={d.id}
                    className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                      currentOccupant
                        ? isDark
                          ? 'bg-slate-800/95 shadow-xl'
                          : 'bg-white shadow-xl'
                        : isDark
                        ? 'bg-slate-900/40 border-slate-800'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                    style={{
                      borderColor: currentOccupant ? d.color : undefined,
                    }}
                  >
                    <div>
                      {/* Desk Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-md"
                            style={{ backgroundColor: d.color }}
                          />
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{d.name}</h4>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            currentOccupant
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {currentOccupant ? 'OCCUPIED' : 'STANDBY / IDLE'}
                        </span>
                      </div>

                      {/* Who is sitting right now */}
                      <div className="py-6 text-center">
                        {currentOccupant ? (
                          <div className="space-y-2 animate-fade-in">
                            <div className="text-4xl filter drop-shadow-md animate-bounce">
                              {currentOccupant.icon}
                            </div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                              {currentOccupant.name}
                            </div>
                            <p className="text-xs text-slate-400">{currentOccupant.role}</p>
                          </div>
                        ) : (
                          <div className="space-y-1 py-4 text-slate-500">
                            <div className="text-3xl opacity-50">🪑</div>
                            <div className="text-xs font-semibold">Chair is empty</div>
                            <p className="text-[10px]">Awaiting next variable arrival</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desk sharing history */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-400 space-y-1">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Occupants:</span>
                      </div>
                      <div className="font-mono text-[11px] text-cyan-400">{d.occupants}</div>
                      <p className="text-[11px] leading-snug">{d.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The Formal Interval Graph Theorem Callout */}
            <div
              className={`mt-8 p-5 rounded-3xl border-2 flex items-start gap-4 ${
                isDark
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="font-black text-sm sm:text-base flex items-center gap-2">
                  <span>The Mathematical Theorem: Interval Graph Perfect Coloring</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    χ(G) = ω(G) = 3
                  </span>
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed font-normal">
                  In graph theory, when lifespans form continuous time intervals on a line, the conflict graph is an{' '}
                  <strong>Interval Graph</strong>. A famous theorem proves that for all interval graphs, the chromatic
                  number $\chi(G)$ is strictly equal to the maximum clique size $\omega(G)$ (the maximum number of people
                  working at the exact same moment). Because at most 3 people ever work simultaneously,{' '}
                  <strong>3 desks will ALWAYS suffice</strong> with zero conflicts!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
