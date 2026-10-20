import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sliders,
  AlertOctagon,
  Sparkles,
  Table,
} from 'lucide-react';
import { EXAMPLE_GRAPHS } from '../../data/examples';
import { sounds } from '../../utils/soundEffects';

interface ControlsBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  maxRegisters: number;
  onChangeMaxRegisters: (k: number) => void;
  selectedExampleId: string;
  onSelectExample: (exampleId: string) => void;
  showConflicts: boolean;
  onToggleShowConflicts: () => void;
  showAllocationTable: boolean;
  onToggleShowAllocationTable: () => void;
  onAutoLayout: () => void;
  canStepForward: boolean;
  canStepBack: boolean;
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  onReset,
  speed,
  onChangeSpeed,
  maxRegisters,
  onChangeMaxRegisters,
  selectedExampleId,
  onSelectExample,
  showConflicts,
  onToggleShowConflicts,
  showAllocationTable,
  onToggleShowAllocationTable,
  onAutoLayout,
  canStepForward,
  canStepBack,
  isDark = true,
  isStoryMode = true,
}) => {
  return (
    <div className={`p-5 sm:p-7 rounded-3xl border-2 space-y-6 shadow-2xl transition-all duration-300 ${
      isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
    }`}>
      
      {/* 1. Top Row: Story Scenario Selection Menu (Spacious buttons with generous gaps!) */}
      <div className="space-y-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Scenario Preset:</span>
          </span>

          {/* Auto Layout button */}
          <button
            onClick={() => {
              sounds.playPop();
              onAutoLayout();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono font-bold border shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/50'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:text-cyan-600 hover:border-cyan-400'
            }`}
            title="Reset nodes to neat geometric coordinates"
          >
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Rearrange Layout</span>
          </button>
        </div>

        {/* Preset Buttons with Generous Gaps (gap-3.5 sm:gap-4) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
          {EXAMPLE_GRAPHS.map((eg) => {
            const isSelected = eg.id === selectedExampleId;
            return (
              <button
                key={eg.id}
                onClick={() => {
                  sounds.playPop();
                  onSelectExample(eg.id);
                }}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 shadow-sm ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30 scale-105 ring-2 ring-cyan-400/50'
                    : isDark
                    ? 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700/90 hover:border-slate-600'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{isStoryMode ? eg.storyTitle : eg.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-black ${
                  isSelected
                    ? 'bg-black/30 text-cyan-200'
                    : 'bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                }`}>
                  {eg.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Controls: Playback, Speed, Registers, Toggles with Generous Spacing */}
      <div className="flex flex-wrap items-center justify-between gap-5 sm:gap-6">
        
        {/* Playback Button Group */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          {/* Previous Step Button */}
          <button
            onClick={() => {
              sounds.playPop();
              onPrevStep();
            }}
            disabled={!canStepBack}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] shadow-sm ${
              canStepBack
                ? isDark
                  ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:scale-105'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:scale-105'
                : 'opacity-35 cursor-not-allowed border-transparent'
            }`}
            title="Step backward"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Primary Play / Pause Button (Hero Action with generous padding) */}
          <button
            onClick={() => {
              sounds.playPop();
              onTogglePlay();
            }}
            className={`flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm cursor-pointer shadow-xl transition-all ${
              isPlaying
                ? 'bg-red-500 text-white shadow-red-500/35 hover:scale-105 active:scale-95 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-cyan-500/35 hover:scale-105 active:scale-95'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Play Simulation</span>
              </>
            )}
          </button>

          {/* Next Step Button */}
          <button
            onClick={() => {
              sounds.playChime(1.1);
              onNextStep();
            }}
            disabled={!canStepForward}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] shadow-sm ${
              canStepForward
                ? isDark
                  ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:scale-105'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:scale-105'
                : 'opacity-35 cursor-not-allowed border-transparent'
            }`}
            title="Step forward"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              sounds.playPop();
              onReset();
            }}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] shadow-sm ${
              isDark
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 text-slate-500 border-slate-300 hover:text-black hover:bg-slate-200'
            }`}
            title="Reset algorithm to start"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Speed Selector (Well spaced, comfortable buttons) */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border text-xs font-mono font-bold shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className="text-slate-400 px-2.5">Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => {
                sounds.playPop();
                onChangeSpeed(s);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer font-black text-xs ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Pocket / Register Count Selector (k = 1 to 6) - Spacious, 44px buttons with generous gaps! */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Pockets (k):</span>
          </span>
          
          <div className="flex items-center gap-2 sm:gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <button
                key={k}
                onClick={() => {
                  sounds.playPop();
                  onChangeMaxRegisters(k);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-mono font-black transition-all cursor-pointer flex items-center justify-center ${
                  maxRegisters === k
                    ? 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-110 ring-2 ring-purple-400'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200'
                }`}
                title={`Allocate using maximum ${k} pockets`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic Toggles (Comfortable padding & generous gaps) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Conflicts Toggle */}
          <button
            onClick={() => {
              sounds.playPop();
              onToggleShowConflicts();
            }}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-sm hover:scale-102 ${
              showConflicts
                ? 'bg-red-500/15 text-red-500 border-red-500/40 shadow-red-500/10'
                : isDark
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-black'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Show Conflicts</span>
          </button>

          {/* Allocation Table Toggle */}
          <button
            onClick={() => {
              sounds.playPop();
              onToggleShowAllocationTable();
            }}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-sm hover:scale-102 ${
              showAllocationTable
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40 shadow-emerald-500/10'
                : isDark
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-black'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Live Table</span>
          </button>
        </div>

      </div>
    </div>
  );
};
