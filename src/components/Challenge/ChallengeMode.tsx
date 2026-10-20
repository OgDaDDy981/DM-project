import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { CHALLENGE_LEVELS } from '../../data/examples';
import { REGISTER_PALETTE } from '../../types/compiler';
import { validateColoring } from '../../algorithms/graphColoring';
import { sounds } from '../../utils/soundEffects';

interface ChallengeModeProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const currentLevel = CHALLENGE_LEVELS[levelIndex];

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [userColors, setUserColors] = useState<Record<string, number | null>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  // Initialize colors when level changes
  useEffect(() => {
    const initial: Record<string, number | null> = {};
    for (const n of currentLevel.nodes) {
      initial[n.id] = null;
    }
    setUserColors(initial);
    setSelectedNodeId(null);
    setShowHint(false);
    setHasWon(false);
  }, [levelIndex]);

  // Validation
  const validation = validateColoring(currentLevel.edges, userColors);
  const totalAssigned = Object.values(userColors).filter((c) => c !== null).length;
  const isFullyColored = totalAssigned === currentLevel.nodes.length;
  const isSolved = isFullyColored && validation.isValid;

  // Trigger win effects
  useEffect(() => {
    if (isSolved && !hasWon) {
      setHasWon(true);
      sounds.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isSolved, hasWon]);

  // Assign color to selected node
  const handleAssignRegister = (regId: number) => {
    if (!selectedNodeId) return;
    sounds.playChime(1.2);
    setUserColors((prev) => ({
      ...prev,
      [selectedNodeId]: regId,
    }));
  };

  const handleClearSelected = () => {
    if (!selectedNodeId) return;
    sounds.playPop();
    setUserColors((prev) => ({
      ...prev,
      [selectedNodeId]: null,
    }));
  };

  const handleReset = () => {
    sounds.playPop();
    const initial: Record<string, number | null> = {};
    for (const n of currentLevel.nodes) {
      initial[n.id] = null;
    }
    setUserColors(initial);
    setSelectedNodeId(null);
    setShowHint(false);
    setHasWon(false);
  };

  const handleAutoSolve = () => {
    sounds.playVictory();
    if (levelIndex === 0) {
      setUserColors({ A: 1, B: 2, C: 1, D: 2 });
    } else if (levelIndex === 1) {
      setUserColors({ A: 1, B: 2, C: 1, D: 2, E: 3 });
    } else if (levelIndex === 2) {
      setUserColors({ W: 1, X: 2, Y: 3, Z: 4, P: 3, Q: 1 });
    }
  };

  return (
    <section id="challenge" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#0B0F1C] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span>Interactive Game Arcade</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Can You Outsmart{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500">
              The Computer?
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isStoryMode
              ? "Put on the compiler engineer's hat! Click on the friends below and assign colored pockets so that no two connected friends ever share the same color!"
              : "Solve vertex k-coloring on the interference graph. Ensure that for all edges (u, v), Color(u) ≠ Color(v)."}
          </p>
        </div>

        {/* Level Selector Tabs with Generous Spacing */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {CHALLENGE_LEVELS.map((lvl, idx) => {
            const isCurrent = levelIndex === idx;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  sounds.playPop();
                  setLevelIndex(idx);
                }}
                className={`px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-3 shadow-md ${
                  isCurrent
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-xl shadow-emerald-500/30 scale-105 font-black ring-2 ring-emerald-400'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700/80'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <span>Level {lvl.levelNumber}: {lvl.difficulty}</span>
                <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full ${
                  isCurrent ? 'bg-black/30 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}>
                  {lvl.maxRegisters} Pockets
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Challenge Arena Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-6 ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          
          {/* Header of current level */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-wider">
                  Level {currentLevel.levelNumber} — {currentLevel.difficulty}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-mono font-bold text-cyan-500">
                  Allowed Pockets: 1 to {currentLevel.maxRegisters}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentLevel.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{currentLevel.scenario}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  sounds.playPop();
                  setShowHint(!showHint);
                }}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer shadow-sm ${
                  isDark
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{showHint ? 'Hide Hint' : 'Get Hint'}</span>
              </button>

              <button
                onClick={handleAutoSolve}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-all cursor-pointer shadow-sm hover:scale-102"
              >
                <Sparkles className="w-4 h-4" />
                <span>Show Solution</span>
              </button>

              <button
                onClick={handleReset}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                  isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-black'
                }`}
                title="Reset Challenge"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hint Drawer */}
          {showHint && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
              isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong className="font-bold">Helpful Tip: </strong>
                {currentLevel.hint}
              </div>
            </div>
          )}

          {/* Interactive Graph Canvas for Challenge */}
          <div className={`relative h-[340px] sm:h-[380px] rounded-3xl border-2 overflow-hidden select-none shadow-inner ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <svg viewBox="0 0 540 360" className="w-full h-full">
              {/* Edges */}
              {currentLevel.edges.map((e) => {
                const u = currentLevel.nodes.find((n) => n.id === e.source);
                const v = currentLevel.nodes.find((n) => n.id === e.target);
                if (!u || !v) return null;

                const c1 = userColors[u.id];
                const c2 = userColors[v.id];
                const isConflict = c1 !== null && c2 !== null && c1 === c2;

                return (
                  <g key={e.id}>
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke={isConflict ? '#EF4444' : isDark ? '#334155' : '#CBD5E1'}
                      strokeWidth={isConflict ? 4 : 2.5}
                      strokeDasharray={isConflict ? '6 4' : 'none'}
                      className="transition-colors duration-300"
                    />
                    {isConflict && (
                      <g transform={`translate(${(u.x + v.x) / 2}, ${(u.y + v.y) / 2})`}>
                        <circle r={11} fill="#EF4444" className="animate-ping opacity-75" />
                        <circle r={11} fill="#EF4444" />
                        <text textAnchor="middle" dy="4" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                          ✕
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {currentLevel.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const regId = userColors[node.id];
                const regInfo = regId ? REGISTER_PALETTE[regId - 1] : null;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => {
                      sounds.playPop();
                      setSelectedNodeId(node.id);
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={34}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        className="animate-spin-slow origin-center"
                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill={regInfo ? regInfo.color : isDark ? '#1E293B' : '#E2E8F0'}
                      stroke={isSelected ? '#10B981' : isDark ? '#475569' : '#94A3B8'}
                      strokeWidth={isSelected ? 3.5 : 2}
                      className="filter drop-shadow-md transition-colors duration-300"
                    />

                    {/* Icon or Label */}
                    {node.icon ? (
                      <text
                        x={node.x}
                        y={node.y + 6}
                        textAnchor="middle"
                        fontSize="17"
                        pointerEvents="none"
                      >
                        {node.icon}
                      </text>
                    ) : (
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        fill={regInfo ? '#FFFFFF' : isDark ? '#FFFFFF' : '#0F172A'}
                        fontSize="14"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {node.label}
                      </text>
                    )}

                    {/* Label below */}
                    <text
                      x={node.x}
                      y={node.y + 38}
                      textAnchor="middle"
                      fill={isDark ? '#CBD5E1' : '#1E293B'}
                      fontSize="11"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {node.friendlyName || node.label}
                    </text>

                    {/* Pocket badge */}
                    {regInfo && (
                      <g transform={`translate(${node.x}, ${node.y - 30})`}>
                        <rect x="-18" y="-9" width="36" height="18" rx="9" fill="#0F172A" stroke={regInfo.color} strokeWidth="1.5" />
                        <text x="0" y="3.5" textAnchor="middle" fill={regInfo.color} fontSize="9" fontWeight="bold">
                          {regInfo.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Instruction Banner at Canvas Bottom */}
            <div className={`absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono font-bold px-4 py-2.5 rounded-2xl border shadow-md backdrop-blur-md ${
              isDark ? 'bg-slate-900/90 text-slate-200 border-slate-700' : 'bg-white/90 text-slate-800 border-slate-200'
            }`}>
              <span>
                {selectedNodeId
                  ? `Selected: "${selectedNodeId}". Click a color button below!`
                  : 'Click any circle to choose its color.'}
              </span>
              <span>
                Colored: {totalAssigned} / {currentLevel.nodes.length}
              </span>
            </div>
          </div>

          {/* Palette of Registers (Spacious layout with generous gap-3.5 sm:gap-4) */}
          <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-xs font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pick Pocket:
              </span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
                {Array.from({ length: currentLevel.maxRegisters }, (_, i) => i + 1).map((rNum) => {
                  const reg = REGISTER_PALETTE[rNum - 1];
                  return (
                    <button
                      key={rNum}
                      onClick={() => handleAssignRegister(rNum)}
                      disabled={!selectedNodeId}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-mono font-black text-xs sm:text-sm text-white shadow-md transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95"
                      style={{ backgroundColor: reg.color }}
                    >
                      <span>{reg.name}</span>
                    </button>
                  );
                })}

                <button
                  onClick={handleClearSelected}
                  disabled={!selectedNodeId || userColors[selectedNodeId] === null}
                  className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold border transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-300 hover:text-black hover:bg-slate-100'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Status Feedback */}
            <div className="text-xs font-mono font-bold">
              {validation.conflicts.length > 0 ? (
                <span className="text-red-500 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Clash on line ({validation.conflicts[0][0]}, {validation.conflicts[0][1]})!
                  </span>
                </span>
              ) : isSolved ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PERFECT! All constraints satisfied!</span>
                </span>
              ) : (
                <span className="text-slate-400">No clashes so far</span>
              )}
            </div>
          </div>

          {/* Victory Banner */}
          {isSolved && (
            <div className="p-6 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/40 space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg">
                  ✓
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Level {currentLevel.levelNumber} Completed! You Are A Compiler Master! 🎉
                </h4>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {currentLevel.solutionExplanation}
              </p>
              {levelIndex < CHALLENGE_LEVELS.length - 1 && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setLevelIndex((prev) => prev + 1);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-mono font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
                  >
                    <span>Advance to Level {currentLevel.levelNumber + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
