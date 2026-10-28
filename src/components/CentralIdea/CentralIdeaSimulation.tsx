import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Lightbulb,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  Cpu,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEffects';

interface CentralIdeaSimulationProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const CentralIdeaSimulation: React.FC<CentralIdeaSimulationProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  // Active Question Tab (0 to 4)
  const [activeQuestion, setActiveQuestion] = useState<number>(0);

  // Simulation Stage (0: Timeline & Lifetimes, 1: Clash Laser Detection, 2: Graph Coloring, 3: CPU Pocket Allocation)
  const [simStage, setSimStage] = useState<number>(0);

  // Time scrubber (0 to 9 seconds)
  const [currentTime, setCurrentTime] = useState<number>(2);
  const [isPlayingTime, setIsPlayingTime] = useState<boolean>(false);

  // Selected variable for inspector
  const [selectedVarId, setSelectedVarId] = useState<string | null>('health');

  // 5 Game Variables with distinct lifetime intervals
  const simulationVariables = [
    {
      id: 'health',
      name: 'Cat Health',
      rawName: 'var health',
      icon: '🐱',
      start: 0,
      end: 4,
      color: '#06B6D4', // Cyan
      colorName: 'Cyan',
      pocket: 'Pocket R1',
      desc: 'Monitors the cat player health during early level',
      x: 90,
      y: 90,
    },
    {
      id: 'coins',
      name: 'Coin Score',
      rawName: 'var coins',
      icon: '🪙',
      start: 1,
      end: 3,
      color: '#8B5CF6', // Purple
      colorName: 'Purple',
      pocket: 'Pocket R2',
      desc: 'Counts coins collected in the first room',
      x: 270,
      y: 75,
    },
    {
      id: 'shield',
      name: 'Iron Shield',
      rawName: 'var shield',
      icon: '🛡️',
      start: 4,
      end: 7,
      color: '#8B5CF6', // Purple (REUSED FROM COINS!)
      colorName: 'Purple',
      pocket: 'Pocket R2',
      desc: 'Active shield buff in the boss room (Reuses R2!)',
      x: 90,
      y: 220,
    },
    {
      id: 'speed',
      name: 'Rocket Boost',
      rawName: 'var speed',
      icon: '⚡',
      start: 5,
      end: 8,
      color: '#10B981', // Lime
      colorName: 'Lime',
      pocket: 'Pocket R3',
      desc: 'High-speed dodge propulsion',
      x: 270,
      y: 210,
    },
    {
      id: 'trophy',
      name: 'Victory Bonus',
      rawName: 'var trophy',
      icon: '🏆',
      start: 7,
      end: 9,
      color: '#06B6D4', // Cyan (REUSED FROM HEALTH!)
      colorName: 'Cyan',
      pocket: 'Pocket R1',
      desc: 'Calculates end-of-stage multipliers (Reuses R1!)',
      x: 180,
      y: 290,
    },
  ];

  // Laser Clash Edges (Variables alive at overlapping times)
  const clashEdges = [
    { from: 'health', to: 'coins', overlap: 'Overlaps from t=1 to t=3 (Both alive!)' },
    { from: 'health', to: 'shield', overlap: 'Touches at t=4 (Hand-off clash)' },
    { from: 'shield', to: 'speed', overlap: 'Overlaps from t=5 to t=7 (Both alive!)' },
    { from: 'speed', to: 'trophy', overlap: 'Overlaps from t=7 to t=8 (Both alive!)' },
  ];

  // Auto-play time scrubber
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlayingTime) {
      timer = setInterval(() => {
        sounds.playPop();
        setCurrentTime((prev) => (prev >= 9 ? 0 : prev + 1));
      }, 1400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingTime]);

  const questions = [
    {
      id: 'topic',
      icon: <HelpCircle className="w-5 h-5 text-cyan-400" />,
      badge: 'TOPIC',
      q: 'What is this website about?',
      title: 'How Computers Run Mega Software on Tiny Hardware',
      summary:
        'When you play a video game, scroll social media, or open an app, the software creates hundreds of numbers (health, scores, images, coordinates). But a computer processor (CPU) only has a tiny handful of ultra-fast pockets called Registers (usually only 3 to 16!). This website explains how computers organize them so programs run at lightning speed without crashing.',
      highlight: 'Every phone, PC, and game console uses this exact logic every millisecond.',
    },
    {
      id: 'focus',
      icon: <Target className="w-5 h-5 text-purple-400" />,
      badge: 'FOCUS',
      q: 'What are we focusing on?',
      title: 'Register Allocation: The Golden Scheduling Puzzle',
      summary:
        'We are focusing on the Register Allocation Problem solved by compilers (the smart programs that translate human code into CPU instructions). The problem is: how do you assign an infinite number of software variables into a strictly fixed number of hardware registers without any two conflicting variables overwriting each other?',
      highlight: 'The Goal: 100% speed (0.3ns register access) and 0% slowdown (avoiding slow RAM).',
    },
    {
      id: 'purpose',
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
      badge: 'PURPOSE',
      q: 'What is the purpose of this website?',
      title: 'Making Invisible Computer Science Playable for Everyone',
      summary:
        'Most computer science courses hide this topic inside dry 1,000-page textbooks full of terrifying equations. The purpose of this website is to make this brilliant concept 100% visual, hands-on, and accessible to anyone—even if you have zero background in coding or math.',
      highlight: 'Learn by playing with real interactive simulations, sliders, and games.',
    },
    {
      id: 'problem',
      icon: <AlertTriangle className="w-5 h-5 text-pink-400" />,
      badge: 'PROBLEM STATEMENT',
      q: 'What is the problem statement?',
      title: 'The Scarcity Bottleneck & Clash Rule',
      summary:
        'Here are the 4 core ideas of the problem statement: (1) Hardware is scarce (only a few CPU pockets exist). (2) Variables have lifetimes (they are born, used, and discarded). (3) The Collision Rule: Two variables alive at the same second CANNOT share a pocket or they will corrupt each other. (4) The Consequence: If you run out of pockets, the CPU must dump variables into slow RAM (taking 200x longer!).',
      highlight: 'Problem: Fit 5 variables into 3 pockets without a single time collision!',
    },
    {
      id: 'central-idea',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      badge: 'CENTRAL IDEA',
      q: 'What is the central idea?',
      title: 'Graph Coloring: The Beautiful Mathematical Solution',
      summary:
        'The eureka moment: Variables that are never needed at the same time can share the EXACT same pocket! If Variable A dies at 2:00 PM, Variable B can take its chair at 2:01 PM. To do this, we draw laser lines between variables that overlap in time (a Conflict Graph). Then we color each circle so no connected circles share a color. Each color is one hardware pocket!',
      highlight: 'Discrete Math graph coloring solves hardware processor memory management!',
    },
  ];

  const handleStageSelect = (stageIdx: number) => {
    setSimStage(stageIdx);
    if (stageIdx === 1) {
      sounds.playConflict();
    } else if (stageIdx === 2) {
      sounds.playRegisterAssign(1);
      sounds.playVictory();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
        });
      } catch {}
    } else if (stageIdx === 3) {
      sounds.playHandoff();
    } else {
      sounds.playPop();
    }
  };

  const selectedVariable = simulationVariables.find((v) => v.id === selectedVarId);

  // Active variables at current time
  const activeVariablesNow = simulationVariables.filter(
    (v) => currentTime >= v.start && currentTime <= v.end
  );

  return (
    <section
      id="central-idea"
      className={`py-16 md:py-24 border-b transition-colors duration-300 relative overflow-hidden ${
        isDark ? 'bg-[#090D1A] border-slate-800 text-white' : 'bg-slate-50/90 border-slate-200 text-slate-900'
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
        {/* Section Master Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 border border-purple-500/30 text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              THE MISSION, PURPOSE & CENTRAL IDEA
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Everything You Need To Know{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              In 60 Seconds
            </span>
          </h2>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Never heard of a "Register" or "Graph Coloring" before? No problem! Explore the 5 foundational
            questions below, then watch the live simulation solve it step-by-step.
          </p>
        </div>

        {/* 1. The Big 5 Questions Selection Bar */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 text-center sm:text-left">
            Step 1: Choose a Question To Understand The Core Concept
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {questions.map((item, idx) => {
              const isSelected = activeQuestion === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playPop();
                    setActiveQuestion(idx);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-500/15 to-purple-500/15 border-cyan-400 shadow-xl shadow-cyan-500/15 scale-[1.02]'
                      : isDark
                      ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">{item.icon}</div>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <div className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                      {item.q}
                    </div>
                  </div>

                  <div
                    className={`mt-3 pt-2 border-t text-[11px] font-bold flex items-center justify-between ${
                      isSelected
                        ? 'border-cyan-400/30 text-cyan-500 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{isSelected ? 'Reading Now' : 'Click to Read'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Question Answer Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all duration-300 ${
              isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase tracking-widest text-cyan-400">
                    Question Answer:
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {questions[activeQuestion].badge}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {questions[activeQuestion].title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {questions[activeQuestion].summary}
                </p>

                <div
                  className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-xs sm:text-sm ${
                    isDark
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Key Takeaway: {questions[activeQuestion].highlight}</span>
                </div>
              </div>

              {/* Quick Jump CTA */}
              <div className="shrink-0 flex flex-col justify-center gap-3">
                <button
                  onClick={() => {
                    sounds.playPop();
                    handleStageSelect(2);
                  }}
                  className="px-5 py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 justify-center"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>See Coloring Magic</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE INTERACTIVE CENTRAL IDEA SIMULATION ARENA */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-8 ${
            isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
          }`}
        >
          {/* Simulation Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest">
                  Live Interactive Walkthrough Simulation
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                From Time Clashes to Hardware Pockets
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Follow the 4 steps to see how 5 game variables safely cram into 3 CPU pockets with zero crashes.
              </p>
            </div>

            {/* Stage Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {[
                { label: '1. Variable Lifetimes', icon: '⏱️' },
                { label: '2. Clash Lasers', icon: '⚡' },
                { label: '3. Graph Coloring', icon: '🎨' },
                { label: '4. CPU Pockets', icon: '💾' },
              ].map((st, sIdx) => {
                const isActive = simStage === sIdx;
                return (
                  <button
                    key={sIdx}
                    onClick={() => handleStageSelect(sIdx)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/25 scale-102'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Hardware Telemetry HUD Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Simulated Time</span>
              </div>
              <div className="text-base sm:text-lg font-black text-cyan-400 font-mono mt-0.5">
                t = {currentTime}s / 9s
              </div>
              <div className="text-[10px] text-slate-500">
                {activeVariablesNow.length} variables concurrently alive
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 text-purple-400" />
                <span>Interference Edges</span>
              </div>
              <div className="text-base sm:text-lg font-black text-purple-400 font-mono mt-0.5">
                |E| = {simStage >= 1 ? '4 Clashes' : 'Pending'}
              </div>
              <div className="text-[10px] text-slate-500">Overlapping active intervals</div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Chromatic Number</span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
                χ(G) = 3 Colors
              </div>
              <div className="text-[10px] text-slate-500">Minimal hardware limit</div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-pink-400" />
                <span>Memory Stalls</span>
              </div>
              <div className="text-base sm:text-lg font-black text-pink-400 font-mono mt-0.5">
                0.0 ns (0 Spills)
              </div>
              <div className="text-[10px] text-slate-500">All data held in L1 registers</div>
            </div>
          </div>

          {/* Interactive Arena: Grid of Timeline (Left) & Graph/Hardware (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: The Variable Timeline & Scrubber */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Active Program Lifetimes</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                      5 Variables
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click any variable bar below to inspect its conflict neighbors!
                  </p>
                </div>

                {/* Time Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setIsPlayingTime(!isPlayingTime);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlayingTime ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlayingTime ? 'Pause Time' : 'Play Time'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      setIsPlayingTime(false);
                      setCurrentTime(0);
                    }}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                    title="Reset to 0s"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Timeline Bars */}
              <div
                className={`p-5 rounded-3xl border-2 space-y-4 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Time ruler ticks */}
                <div className="grid grid-cols-10 gap-1 text-[11px] font-mono font-bold text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800 text-center">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
                    <div
                      key={t}
                      onClick={() => {
                        sounds.playPop();
                        setCurrentTime(t);
                      }}
                      className={`cursor-pointer rounded py-0.5 transition-all ${
                        currentTime === t
                          ? 'bg-cyan-500 text-slate-950 font-black scale-110 shadow-sm'
                          : 'hover:text-cyan-400'
                      }`}
                    >
                      {t}s
                    </div>
                  ))}
                </div>

                {/* Variable Lifespan Rows */}
                <div className="space-y-3 relative">
                  {/* Current Time Indicator Red Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10 transition-all duration-300"
                    style={{ left: `${(currentTime / 9) * 100}%` }}
                  >
                    <div className="absolute -top-3 -left-3 px-1.5 py-0.5 rounded bg-red-500 text-white font-mono font-black text-[9px] shadow-md">
                      {currentTime}s
                    </div>
                  </div>

                  {simulationVariables.map((v) => {
                    const isAliveNow = currentTime >= v.start && currentTime <= v.end;
                    const leftPercent = (v.start / 9) * 100;
                    const widthPercent = ((v.end - v.start) / 9) * 100;
                    const isColored = simStage >= 2;
                    const isSelected = selectedVarId === v.id;

                    return (
                      <div
                        key={v.id}
                        className={`space-y-1 p-1.5 rounded-xl transition-all cursor-pointer ${
                          isSelected ? 'bg-slate-800/80 ring-1 ring-cyan-400' : ''
                        }`}
                        onClick={() => {
                          sounds.playPop();
                          setSelectedVarId(v.id);
                        }}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            <span>{v.icon}</span>
                            <span>{isStoryMode ? v.name : v.rawName}</span>
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              isAliveNow
                                ? 'bg-emerald-500/20 text-emerald-400 font-black animate-pulse'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isAliveNow ? 'ALIVE NOW' : `${v.start}s – ${v.end}s`}
                          </span>
                        </div>

                        {/* Bar Track */}
                        <div className="h-6 w-full rounded-xl bg-slate-200/60 dark:bg-slate-800/60 relative overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 rounded-xl transition-all duration-300 flex items-center px-2 text-[10px] font-black text-white shadow-md"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              backgroundColor: isColored ? v.color : isAliveNow ? '#3B82F6' : '#64748B',
                              opacity: isAliveNow ? 1 : 0.75,
                              transform: isAliveNow ? 'scaleY(1.08)' : 'scaleY(1)',
                            }}
                          >
                            <span className="truncate">{v.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline scrubber slider */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    <span>Scrub Execution Time:</span>
                    <span className="text-cyan-400 font-black">Time = {currentTime}s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={9}
                    step={1}
                    value={currentTime}
                    onChange={(e) => {
                      sounds.playPop();
                      setCurrentTime(parseInt(e.target.value, 10));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Selected Node Telemetry Inspector */}
              {selectedVariable && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <span>{selectedVariable.icon}</span>
                      <span>Selected: {selectedVariable.name} ({selectedVariable.rawName})</span>
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-black text-slate-950 uppercase"
                      style={{ backgroundColor: selectedVariable.color }}
                    >
                      {selectedVariable.pocket}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div>Lifetime: [{selectedVariable.start}s, {selectedVariable.end}s]</div>
                    <div>Duration: {selectedVariable.end - selectedVariable.start} seconds</div>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                    {selectedVariable.desc}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: The Graph Transformation & CPU Hardware View */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {simStage <= 1 && 'Interference Graph (Clash Laser Network)'}
                    {simStage === 2 && 'Graph Vertex Coloring (3 Colors!)'}
                    {simStage === 3 && 'Silicon Hardware Pockets (Zero Stalls!)'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {simStage === 0 && 'Variables are represented as circles waiting to detect conflicts.'}
                    {simStage === 1 && 'Laser lines connect variables that overlap in time (cannot share a pocket!).'}
                    {simStage === 2 && 'Colored so no two connected circles share a color!'}
                    {simStage === 3 && 'Colors map 1:1 to physical CPU registers! Notice pocket reuse!'}
                  </p>
                </div>

                <div className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {simStage === 3 ? '3 CPU Registers' : '5 Variable Vertices'}
                </div>
              </div>

              {/* View Container: SVG or Hardware Pockets */}
              {simStage < 3 ? (
                <div
                  className={`relative h-[340px] rounded-3xl border-2 flex items-center justify-center overflow-hidden select-none shadow-inner ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <svg viewBox="0 0 360 340" className="w-full h-full">
                    {/* Clash Edges */}
                    {clashEdges.map((e, idx) => {
                      const u = simulationVariables.find((v) => v.id === e.from);
                      const v = simulationVariables.find((v) => v.id === e.to);
                      if (!u || !v) return null;

                      const isClashStage = simStage >= 1;
                      const isColoredStage = simStage === 2;
                      const isBothAlive =
                        currentTime >= u.start &&
                        currentTime <= u.end &&
                        currentTime >= v.start &&
                        currentTime <= v.end;

                      return (
                        <g key={idx}>
                          <line
                            x1={u.x}
                            y1={u.y}
                            x2={v.x}
                            y2={v.y}
                            stroke={
                              isClashStage
                                ? isColoredStage
                                  ? '#38BDF8'
                                  : isBothAlive
                                  ? '#EF4444'
                                  : '#F87171'
                                : '#94A3B8'
                            }
                            strokeWidth={isBothAlive ? 4 : isClashStage ? 3 : 2}
                            strokeDasharray={isClashStage && !isColoredStage ? '6 4' : 'none'}
                            className={isClashStage && !isColoredStage ? 'animate-laser-dash' : ''}
                          />

                          {/* Clash badge icon in stage 1 */}
                          {isClashStage && !isColoredStage && (
                            <g transform={`translate(${(u.x + v.x) / 2}, ${(u.y + v.y) / 2})`}>
                              <circle
                                r={12}
                                fill="#EF4444"
                                className={isBothAlive ? 'animate-ping opacity-75' : 'opacity-40'}
                              />
                              <circle r={10} fill="#EF4444" />
                              <text
                                textAnchor="middle"
                                dy="3.5"
                                fill="#FFFFFF"
                                fontSize="9"
                                fontWeight="bold"
                              >
                                ⚡
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {simulationVariables.map((node) => {
                      const isColored = simStage === 2;
                      const isAliveAtTime = currentTime >= node.start && currentTime <= node.end;
                      const isSelected = selectedVarId === node.id;

                      return (
                        <g
                          key={node.id}
                          className="transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            sounds.playPop();
                            setSelectedVarId(node.id);
                          }}
                        >
                          {/* Pulsing halo if colored */}
                          {isColored && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={32}
                              fill={node.color}
                              opacity={0.25}
                              className="animate-pulse"
                            />
                          )}

                          {/* Selection ring */}
                          {isSelected && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={28}
                              fill="none"
                              stroke="#38BDF8"
                              strokeWidth={2}
                              strokeDasharray="3 3"
                            />
                          )}

                          {/* Node circle */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={24}
                            fill={isColored ? node.color : isDark ? '#1E293B' : '#E2E8F0'}
                            stroke={isAliveAtTime ? '#38BDF8' : isColored ? '#FFFFFF' : '#64748B'}
                            strokeWidth={isAliveAtTime ? 4 : 2.5}
                            className="transition-colors duration-300"
                          />

                          {/* Emoji */}
                          <text
                            x={node.x}
                            y={node.y + 7}
                            textAnchor="middle"
                            fontSize="18"
                            pointerEvents="none"
                          >
                            {node.icon}
                          </text>

                          {/* Variable Label Below */}
                          <text
                            x={node.x}
                            y={node.y + 38}
                            textAnchor="middle"
                            fill={isDark ? '#F1F5F9' : '#0F172A'}
                            fontSize="11"
                            fontWeight="bold"
                            pointerEvents="none"
                          >
                            {isStoryMode ? node.name : node.rawName}
                          </text>

                          {/* Assigned Pocket Badge when colored */}
                          {isColored && (
                            <g transform={`translate(${node.x}, ${node.y - 32})`}>
                              <rect
                                x="-32"
                                y="-9"
                                width="64"
                                height="18"
                                rx="9"
                                fill="#0F172A"
                                stroke={node.color}
                                strokeWidth="1.5"
                              />
                              <text
                                x="0"
                                y="3.5"
                                textAnchor="middle"
                                fill={node.color}
                                fontSize="9"
                                fontWeight="bold"
                              >
                                {node.pocket}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Stage description overlay banner */}
                  <div
                    className={`absolute bottom-3 left-4 right-4 p-3 rounded-2xl border text-xs font-mono font-bold flex items-center justify-between backdrop-blur-md ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                        : 'bg-white/90 border-slate-300 text-slate-800'
                    }`}
                  >
                    {simStage === 0 && (
                      <>
                        <span>5 circles ready. None know who collides yet.</span>
                        <button
                          onClick={() => handleStageSelect(1)}
                          className="text-cyan-400 hover:underline font-black cursor-pointer"
                        >
                          Find Clashes ➔
                        </button>
                      </>
                    )}
                    {simStage === 1 && (
                      <>
                        <span className="text-red-400 animate-pulse">
                          ⚡ Laser lines connect variables alive at the same second!
                        </span>
                        <button
                          onClick={() => handleStageSelect(2)}
                          className="text-cyan-400 hover:underline font-black cursor-pointer"
                        >
                          Color Graph ➔
                        </button>
                      </>
                    )}
                    {simStage === 2 && (
                      <>
                        <span className="text-emerald-400 font-black">
                          ✨ 3 Colors used! Notice Coins & Shield share Purple!
                        </span>
                        <button
                          onClick={() => handleStageSelect(3)}
                          className="text-purple-400 hover:underline font-black cursor-pointer"
                        >
                          See CPU Pockets ➔
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Stage 3: The 3 Silicon Hardware Pockets */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Pocket R1 */}
                    <div
                      className={`p-5 rounded-3xl border-2 space-y-3 ${
                        isDark ? 'bg-slate-900/90 border-cyan-500/50' : 'bg-white border-cyan-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-mono font-black text-cyan-400">POCKET R1 (Cyan)</span>
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-md" />
                      </div>
                      <div className="text-xs space-y-2">
                        <div
                          className={`p-2.5 rounded-xl border font-bold transition-all ${
                            currentTime >= 0 && currentTime <= 4
                              ? 'bg-cyan-500/25 border-cyan-400 ring-2 ring-cyan-400 text-white'
                              : 'bg-cyan-500/10 border-cyan-500/20 text-slate-300'
                          }`}
                        >
                          <div>🐱 Cat Health</div>
                          <div className="text-[10px] text-slate-400 font-mono">Runs from t=0s to t=4s</div>
                        </div>
                        <div className="text-[10px] font-mono text-center text-cyan-400 font-bold">
                          ⬇️ Dies at 4s! Reused for:
                        </div>
                        <div
                          className={`p-2.5 rounded-xl border font-bold transition-all ${
                            currentTime >= 7 && currentTime <= 9
                              ? 'bg-cyan-500/25 border-cyan-400 ring-2 ring-cyan-400 text-white'
                              : 'bg-cyan-500/10 border-cyan-500/20 text-slate-300'
                          }`}
                        >
                          <div>🏆 Victory Bonus</div>
                          <div className="text-[10px] text-slate-400 font-mono">Runs from t=7s to t=9s</div>
                        </div>
                      </div>
                    </div>

                    {/* Pocket R2 */}
                    <div
                      className={`p-5 rounded-3xl border-2 space-y-3 ${
                        isDark ? 'bg-slate-900/90 border-purple-500/50' : 'bg-white border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-mono font-black text-purple-400">POCKET R2 (Purple)</span>
                        <span className="w-3 h-3 rounded-full bg-purple-400 shadow-md" />
                      </div>
                      <div className="text-xs space-y-2">
                        <div
                          className={`p-2.5 rounded-xl border font-bold transition-all ${
                            currentTime >= 1 && currentTime <= 3
                              ? 'bg-purple-500/25 border-purple-400 ring-2 ring-purple-400 text-white'
                              : 'bg-purple-500/10 border-purple-500/20 text-slate-300'
                          }`}
                        >
                          <div>🪙 Coin Score</div>
                          <div className="text-[10px] text-slate-400 font-mono">Runs from t=1s to t=3s</div>
                        </div>
                        <div className="text-[10px] font-mono text-center text-purple-400 font-bold">
                          ⬇️ Dies at 3s! Reused for:
                        </div>
                        <div
                          className={`p-2.5 rounded-xl border font-bold transition-all ${
                            currentTime >= 4 && currentTime <= 7
                              ? 'bg-purple-500/25 border-purple-400 ring-2 ring-purple-400 text-white'
                              : 'bg-purple-500/10 border-purple-500/20 text-slate-300'
                          }`}
                        >
                          <div>🛡️ Iron Shield</div>
                          <div className="text-[10px] text-slate-400 font-mono">Runs from t=4s to t=7s</div>
                        </div>
                      </div>
                    </div>

                    {/* Pocket R3 */}
                    <div
                      className={`p-5 rounded-3xl border-2 space-y-3 ${
                        isDark ? 'bg-slate-900/90 border-emerald-500/50' : 'bg-white border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-mono font-black text-emerald-400">POCKET R3 (Lime)</span>
                        <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-md" />
                      </div>
                      <div className="text-xs space-y-2">
                        <div
                          className={`p-2.5 rounded-xl border font-bold transition-all ${
                            currentTime >= 5 && currentTime <= 8
                              ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400 text-white'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-slate-300'
                          }`}
                        >
                          <div>⚡ Rocket Boost</div>
                          <div className="text-[10px] text-slate-400 font-mono">Runs from t=5s to t=8s</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-center font-mono text-[10px]">
                          Free Standby Silicon
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Victory Banner */}
                  <div
                    className={`p-5 rounded-3xl border-2 flex items-start gap-4 ${
                      isDark
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-black text-base">The Central Idea In Full Glory:</h5>
                      <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                        We squeezed <strong>5 different variables</strong> into only{' '}
                        <strong>3 hardware pockets</strong>! Because Coins & Shield never overlap in time, they share
                        Pocket R2 safely. Because Health & Victory never overlap in time, they share Pocket R1 safely.
                        The CPU never runs out of space, and your game stays at 120 FPS!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Educational Summary Callout */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-black shrink-0">
                1
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Variables = Graph Vertices</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Every variable in source code is modeled as a mathematical node.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-black shrink-0">
                2
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Time Overlap = Laser Clash Edge</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  If two variables are alive concurrently, an interference edge forbids them sharing a pocket.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-black shrink-0">
                3
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Colors = Physical CPU Registers</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Connected dots get different colors. Same color = safe zero-cost hardware reuse!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
