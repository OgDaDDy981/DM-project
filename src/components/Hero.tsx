import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap, CheckCircle2, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

interface HeroProps {
  onStartTour: () => void;
  onExploreSimulation: () => void;
  isDark: boolean;
  isStoryMode: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onStartTour,
  onExploreSimulation,
  isDark,
  isStoryMode,
}) => {
  // 3-step interactive state in hero
  // 0: Initial clean items
  // 1: Clashes spotted (red laser lines)
  // 2: Color magic applied (pockets assigned!)
  const [heroState, setHeroState] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [selectedHeroNode, setSelectedHeroNode] = useState<string | null>(null);

  const heroItems = [
    {
      id: 'health',
      name: isStoryMode ? 'Cat Health' : 'var health',
      icon: '❤️',
      x: 75,
      y: 75,
      color: heroState === 2 ? '#06B6D4' : '#64748B', // Cyan
      pocket: 'R1 (Cyan)',
      timing: 'Lines 1-5',
      lifetime: [1, 5],
    },
    {
      id: 'coins',
      name: isStoryMode ? 'Gold Coins' : 'var coins',
      icon: '🪙',
      x: 235,
      y: 65,
      color: heroState === 2 ? '#8B5CF6' : '#64748B', // Purple
      pocket: 'R2 (Purple)',
      timing: 'Lines 2-3',
      lifetime: [2, 3],
    },
    {
      id: 'shield',
      name: isStoryMode ? 'Iron Shield' : 'var shield',
      icon: '🛡️',
      x: 75,
      y: 215,
      color: heroState === 2 ? '#8B5CF6' : '#64748B', // Purple (REUSES COINS POCKET!)
      pocket: 'R2 (Purple)',
      timing: 'Lines 4-6 (Reuses R2!)',
      lifetime: [4, 6],
    },
    {
      id: 'speed',
      name: isStoryMode ? 'Rocket Speed' : 'var speed',
      icon: '⚡',
      x: 235,
      y: 205,
      color: heroState === 2 ? '#10B981' : '#64748B', // Lime
      pocket: 'R3 (Lime)',
      timing: 'Lines 5-6',
      lifetime: [5, 6],
    },
  ];

  const heroEdges = [
    { from: 0, to: 1, label: 'Both alive at Line 2!' }, // health - coins
    { from: 0, to: 2, label: 'Both alive at Line 4!' }, // health - shield
    { from: 2, to: 3, label: 'Both alive at Line 5!' }, // shield - speed
  ];

  // Auto-play loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setHeroState((prev) => {
          const next = (prev + 1) % 3;
          if (next === 1) sounds.playConflict();
          else if (next === 2) {
            sounds.playVictory();
            try {
              confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.55, x: 0.75 },
              });
            } catch {}
          } else {
            sounds.playPop();
          }
          return next;
        });
      }, 2600);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying]);

  const handleNextHeroStep = () => {
    setIsAutoPlaying(false);
    if (heroState === 0) {
      sounds.playConflict();
      setHeroState(1);
    } else if (heroState === 1) {
      sounds.playRegisterAssign(2);
      sounds.playVictory();
      setHeroState(2);
      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6, x: 0.75 },
        });
      } catch {}
    } else {
      sounds.playPop();
      setHeroState(0);
    }
  };

  const activeNodeObj = heroItems.find((n) => n.id === selectedHeroNode);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24 transition-colors duration-300">
      
      {/* Background ambient lighting orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Big Friendly Hook & Explanation */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 border border-purple-500/30 shadow-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider">
                {isStoryMode ? '🎮 Plain English • Fun Interactive Science' : '⚡ Discrete Math × CPU Architecture'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              How Does Your Phone Fit 100 Things Into Only{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                3 Pockets?
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              When you play a video game, the computer tracks dozens of variables (Health, Coins, Scores, Ammo).
              But the CPU only has a <strong>tiny handful of ultra-fast memory pockets (Registers)</strong>.
              How does it fit everything without slowing down? <strong className="text-cyan-500 dark:text-cyan-400">By coloring them like a puzzle!</strong>
            </p>

            {/* The 10-Second Principle Box */}
            <div className={`p-5 rounded-2xl border-2 flex items-start gap-3.5 shadow-lg ${
              isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  The Golden Rule Anyone Can Understand:
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Variables needed at the <strong>exact same moment</strong> cannot share a pocket.
                  Variables needed at <strong>different moments</strong> share the same pocket without any problems!
                </p>
              </div>
            </div>

            {/* CTAs with generous spacing and direct Simulation link */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-2">
              <a
                href="#simulation"
                onClick={() => {
                  sounds.playLaser();
                  onExploreSimulation();
                }}
                className="flex items-center gap-2.5 px-6 sm:px-7 py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>Launch Live Simulation</span>
              </a>

              <a
                href="#challenge"
                onClick={() => sounds.playPop()}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Register Arcade</span>
              </a>

              <button
                onClick={() => {
                  sounds.playPop();
                  onStartTour();
                }}
                className={`flex items-center gap-2.5 px-5 py-4 rounded-2xl font-bold text-sm sm:text-base border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Slides (P)</span>
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Zero Latency
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Real-Time Drag & Drop
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Sound & Confetti Effects
              </span>
            </div>

          </div>

          {/* Right Column: Premium Scientific Interactive Hero Toy */}
          <div className="lg:col-span-5">
            <div className={`relative rounded-3xl border-2 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
              isDark ? 'bg-[#0F1424]/95 border-slate-700/80 shadow-cyan-950/20' : 'bg-white/95 border-slate-200'
            }`}>
              {/* Corner HUD accent ticks */}
              <div className="hud-corner-tl opacity-75" />
              <div className="hud-corner-tr opacity-75" />
              <div className="hud-corner-bl opacity-75" />
              <div className="hud-corner-br opacity-75" />

              {/* Header inside toy */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors ${heroState === 0 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors ${heroState === 1 ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors ${heroState === 2 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  </div>
                  <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 ml-2">
                    {heroState === 0 && 'STAGE 1: 4 LEXICAL VARIABLES'}
                    {heroState === 1 && 'STAGE 2: CLASH LASER RADAR ⚡'}
                    {heroState === 2 && 'STAGE 3: REGISTER POCKET LOCK ✨'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Auto-play toggle */}
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setIsAutoPlaying(!isAutoPlaying);
                    }}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isAutoPlaying
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 font-bold'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                    title={isAutoPlaying ? 'Pause automatic simulation' : 'Auto-run simulation loop'}
                  >
                    {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  {/* Manual Step Button */}
                  <button
                    onClick={handleNextHeroStep}
                    className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>
                      {heroState === 0 && 'Find Clashes ⚡'}
                      {heroState === 1 && 'Allocate Colors 🎨'}
                      {heroState === 2 && 'Reset Simulation ↺'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Scientific Telemetry Ribbon */}
              <div className="grid grid-cols-4 gap-2 py-2.5 border-b border-slate-200 dark:border-slate-800/80 text-center font-mono">
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Variables |V|</div>
                  <div className="text-xs font-black text-cyan-400">4 Nodes</div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Clashes |E|</div>
                  <div className={`text-xs font-black ${heroState >= 1 ? 'text-red-400' : 'text-slate-400'}`}>
                    {heroState === 0 ? 'Scanning...' : '3 Edges'}
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Chromatic χ</div>
                  <div className="text-xs font-black text-purple-400">χ(G) = 3</div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Spill Delay</div>
                  <div className="text-xs font-black text-emerald-400">0.0 ns (0%)</div>
                </div>
              </div>

              {/* Interactive SVG Display */}
              <div className="relative h-72 w-full mt-2 flex items-center justify-center select-none">
                <svg className="w-full h-full" viewBox="0 0 310 280">
                  <defs>
                    <filter id="glow-laser" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="laser-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#F43F5E" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="solved-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>

                  {/* Edges / Clash Lines */}
                  {heroEdges.map((e, idx) => {
                    const fromNode = heroItems[e.from];
                    const toNode = heroItems[e.to];
                    const isConflicted = heroState === 1;
                    const isSolved = heroState === 2;
                    const isHighlighted =
                      selectedHeroNode === fromNode.id || selectedHeroNode === toNode.id;

                    return (
                      <g key={idx}>
                        {/* Glow halo behind laser line */}
                        {(isConflicted || isSolved) && (
                          <line
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={isConflicted ? '#EF4444' : '#06B6D4'}
                            strokeWidth={isConflicted ? 6 : 4}
                            opacity={0.35}
                            filter="url(#glow-laser)"
                          />
                        )}

                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={
                            isConflicted
                              ? 'url(#laser-grad)'
                              : isSolved
                              ? 'url(#solved-grad)'
                              : isDark
                              ? '#334155'
                              : '#CBD5E1'
                          }
                          strokeWidth={isHighlighted ? 4 : isConflicted ? 3.5 : isSolved ? 2.5 : 2}
                          strokeDasharray={isConflicted ? '6 4' : 'none'}
                          className={`transition-all duration-500 ${isConflicted ? 'animate-laser-dash' : ''}`}
                        />

                        {/* Midpoint conflict spark when in conflict mode */}
                        {isConflicted && (
                          <g transform={`translate(${(fromNode.x + toNode.x) / 2}, ${(fromNode.y + toNode.y) / 2})`}>
                            <circle r={12} fill="#EF4444" className="animate-ping opacity-70" />
                            <circle r={9} fill="#EF4444" />
                            <text textAnchor="middle" dy="3.5" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                              ⚡
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {heroItems.map((n) => {
                    const isColored = heroState === 2;
                    const isSelected = selectedHeroNode === n.id;

                    return (
                      <g
                        key={n.id}
                        className="transition-all duration-500 cursor-pointer"
                        onClick={() => {
                          sounds.playPop();
                          setSelectedHeroNode(selectedHeroNode === n.id ? null : n.id);
                        }}
                      >
                        {/* Selected target reticle ring */}
                        {isSelected && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={36}
                            fill="none"
                            stroke="#06B6D4"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            className="animate-spin-slow origin-center"
                            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                          />
                        )}

                        {/* Colored pulsing halo */}
                        {isColored && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={30}
                            fill={n.color}
                            opacity={0.3}
                            className="animate-pulse"
                          />
                        )}

                        {/* Node circle body */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={23}
                          fill={isColored ? n.color : isDark ? '#1E293B' : '#E2E8F0'}
                          stroke={isSelected ? '#38BDF8' : isColored ? '#FFFFFF' : '#64748B'}
                          strokeWidth={isSelected ? 3 : isColored ? 2.5 : 2}
                          className="transition-colors duration-500 shadow-lg"
                        />

                        {/* Emoji icon */}
                        <text
                          x={n.x}
                          y={n.y + 7}
                          textAnchor="middle"
                          fontSize="18"
                          pointerEvents="none"
                        >
                          {n.icon}
                        </text>

                        {/* Label */}
                        <text
                          x={n.x}
                          y={n.y + 37}
                          textAnchor="middle"
                          fill={isDark ? '#F1F5F9' : '#0F172A'}
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="system-ui, sans-serif"
                          pointerEvents="none"
                        >
                          {n.name}
                        </text>

                        {/* Pocket Badge if colored */}
                        {isColored && (
                          <g transform={`translate(${n.x}, ${n.y - 32})`} className="animate-quantum-lock">
                            <rect
                              x="-30"
                              y="-9"
                              width="60"
                              height="18"
                              rx="9"
                              fill="#0F172A"
                              stroke={n.color}
                              strokeWidth="1.5"
                            />
                            <text
                              x="0"
                              y="3.5"
                              textAnchor="middle"
                              fill={n.color}
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {n.pocket.split(' ')[0]}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Status explanation pill & inspector */}
              <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                {activeNodeObj ? (
                  <div className="flex items-center justify-between text-cyan-400 bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/30">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>{activeNodeObj.icon}</span>
                      <span>{activeNodeObj.name}</span>
                      <span className="text-slate-400">({activeNodeObj.timing})</span>
                    </span>
                    <span className="font-black text-emerald-400">
                      {heroState === 2 ? `Allocated to ${activeNodeObj.pocket}` : 'Waiting for Color'}
                    </span>
                  </div>
                ) : (
                  <>
                    {heroState === 0 && (
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span>4 software variables initialized. Click any node to inspect.</span>
                        </span>
                        <span className="font-bold text-cyan-500">Click "Find Clashes ⚡"</span>
                      </div>
                    )}
                    {heroState === 1 && (
                      <div className="flex items-center justify-between text-red-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span>Red clash lasers = Variables alive at the exact same moment!</span>
                        </span>
                        <span className="text-amber-400 font-black">Needs 3 distinct colors</span>
                      </div>
                    )}
                    {heroState === 2 && (
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Pockets locked: Coins & Shield safely share Pocket R2!</span>
                        </span>
                        <span className="text-cyan-400">100% In-Register Speed 🚀</span>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
