import React, { useState } from 'react';
import { Play, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
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

  const heroItems = [
    {
      id: 'health',
      name: isStoryMode ? 'Cat Health' : 'var health',
      icon: '❤️',
      x: 75,
      y: 75,
      color: heroState === 2 ? '#06B6D4' : '#64748B', // Cyan
      pocket: 'Pocket 1 (Cyan)',
      timing: 'Lines 1-5',
    },
    {
      id: 'coins',
      name: isStoryMode ? 'Gold Coins' : 'var coins',
      icon: '🪙',
      x: 235,
      y: 65,
      color: heroState === 2 ? '#8B5CF6' : '#64748B', // Purple
      pocket: 'Pocket 2 (Purple)',
      timing: 'Lines 2-3',
    },
    {
      id: 'shield',
      name: isStoryMode ? 'Iron Shield' : 'var shield',
      icon: '🛡️',
      x: 75,
      y: 215,
      color: heroState === 2 ? '#8B5CF6' : '#64748B', // Purple (REUSES COINS POCKET!)
      pocket: 'Pocket 2 (Purple)',
      timing: 'Lines 4-6 (Reuses!)',
    },
    {
      id: 'speed',
      name: isStoryMode ? 'Rocket Speed' : 'var speed',
      icon: '⚡',
      x: 235,
      y: 205,
      color: heroState === 2 ? '#10B981' : '#64748B', // Lime
      pocket: 'Pocket 3 (Lime)',
      timing: 'Lines 5-6',
    },
  ];

  const heroEdges = [
    { from: 0, to: 1, label: 'Both alive at Line 2!' }, // health - coins
    { from: 0, to: 2, label: 'Both alive at Line 4!' }, // health - shield
    { from: 2, to: 3, label: 'Both alive at Line 5!' }, // shield - speed
  ];

  const handleNextHeroStep = () => {
    if (heroState === 0) {
      sounds.playConflict();
      setHeroState(1);
    } else if (heroState === 1) {
      sounds.playVictory();
      setHeroState(2);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6, x: 0.75 },
        });
      } catch {}
    } else {
      sounds.playPop();
      setHeroState(0);
    }
  };

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

            {/* CTAs with generous spacing and direct Central Idea link */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-2">
              <a
                href="#central-idea"
                onClick={() => sounds.playPop()}
                className="flex items-center gap-2.5 px-6 sm:px-7 py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 fill-current" />
                <span>The Problem & Central Idea</span>
              </a>

              <button
                onClick={() => {
                  sounds.playPop();
                  onExploreSimulation();
                }}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Coloring Studio</span>
              </button>

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

          {/* Right Column: Eye-Catchy Interactive 3-Step Hero Toy */}
          <div className="lg:col-span-5">
            <div className={`relative rounded-3xl border-2 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
              isDark ? 'bg-[#121829]/95 border-slate-700/80' : 'bg-white/95 border-slate-200'
            }`}>
              
              {/* Header inside toy */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 ml-2">
                    {heroState === 0 && 'Step 1: 4 Game Stats'}
                    {heroState === 1 && 'Step 2: Red Clash Lines!'}
                    {heroState === 2 && 'Step 3: Magic Coloring! ✨'}
                  </span>
                </div>

                <button
                  onClick={handleNextHeroStep}
                  className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {heroState === 0 && 'Find Clashes ⚡'}
                    {heroState === 1 && 'Apply Colors 🎨'}
                    {heroState === 2 && 'Restart Toy ↺'}
                  </span>
                </button>
              </div>

              {/* Interactive SVG Display */}
              <div className="relative h-72 w-full mt-2 flex items-center justify-center select-none">
                <svg className="w-full h-full" viewBox="0 0 310 280">
                  <defs>
                    <filter id="glow-laser" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Edges / Clash Lines */}
                  {heroEdges.map((e, idx) => {
                    const fromNode = heroItems[e.from];
                    const toNode = heroItems[e.to];
                    const isConflicted = heroState === 1;
                    const isSolved = heroState === 2;

                    return (
                      <g key={idx}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={isConflicted ? '#EF4444' : isSolved ? '#06B6D4' : '#CBD5E1'}
                          strokeWidth={isConflicted ? 4 : isSolved ? 3 : 2}
                          strokeDasharray={isConflicted ? '6 4' : 'none'}
                          className={`transition-all duration-500 ${isConflicted ? 'animate-laser-dash' : ''}`}
                        />
                        {isConflicted && (
                          <g transform={`translate(${(fromNode.x + toNode.x) / 2}, ${(fromNode.y + toNode.y) / 2})`}>
                            <circle r={12} fill="#EF4444" className="animate-ping opacity-75" />
                            <circle r={10} fill="#EF4444" />
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
                    return (
                      <g key={n.id} className="transition-all duration-500 cursor-pointer">
                        {isColored && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={28}
                            fill={n.color}
                            opacity={0.3}
                            className="animate-pulse"
                          />
                        )}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={22}
                          fill={isColored ? n.color : isDark ? '#1E293B' : '#E2E8F0'}
                          stroke={isColored ? '#FFFFFF' : '#94A3B8'}
                          strokeWidth={isColored ? 3 : 2}
                          className="transition-colors duration-500"
                        />
                        {/* Emoji icon */}
                        <text
                          x={n.x}
                          y={n.y + 7}
                          textAnchor="middle"
                          fontSize="18"
                        >
                          {n.icon}
                        </text>

                        {/* Label */}
                        <text
                          x={n.x}
                          y={n.y + 36}
                          textAnchor="middle"
                          fill={isDark ? '#F1F5F9' : '#0F172A'}
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="system-ui, sans-serif"
                        >
                          {n.name}
                        </text>

                        {/* Pocket Badge if colored */}
                        {isColored && (
                          <g transform={`translate(${n.x}, ${n.y - 30})`}>
                            <rect
                              x="-26"
                              y="-9"
                              width="52"
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
                            >
                              {n.pocket.split(' ')[0]} {n.pocket.split(' ')[1]}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Status explanation pill */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                {heroState === 0 && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>4 items waiting for CPU pockets</span>
                    <span className="font-bold text-cyan-500">Click "Find Clashes ⚡"</span>
                  </div>
                )}
                {heroState === 1 && (
                  <div className="flex items-center justify-between text-red-500 font-bold animate-pulse">
                    <span>Laser lines show who is alive at the same time!</span>
                    <span>Click "Apply Colors 🎨"</span>
                  </div>
                )}
                {heroState === 2 && (
                  <div className="flex items-center justify-between text-emerald-500 font-bold">
                    <span>🎉 4 Items fit into 3 Pockets! 0 Collisions!</span>
                    <span className="text-purple-500">Notice Coins & Shield share Purple!</span>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
