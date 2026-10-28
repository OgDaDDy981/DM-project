import React from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Presentation,
  Trophy,
  Cpu,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  onOpenPresentation: () => void;
  activeSection: string;
  isDark: boolean;
  onToggleTheme: () => void;
  isStoryMode: boolean;
  onToggleAudienceMode: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPresentation,
  activeSection,
  isDark,
  onToggleTheme,
  isStoryMode,
  onToggleAudienceMode,
  isMuted,
  onToggleSound,
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-all duration-300 ${
      isDark ? 'bg-[#080B14]/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-[2.5px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
              isDark ? 'bg-[#080B14]' : 'bg-white'
            }`}>
              <Sparkles className="w-5 h-5 text-cyan-500 group-hover:rotate-12 transition-transform" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white tracking-widest uppercase shadow-sm">
                CHROMA CODE
              </span>
              <span className="text-[10px] font-bold text-slate-400">Interactive Lab</span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              <span>Why Computers</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
                Need Colors!
              </span>
            </h1>
          </div>
        </a>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <a
            href="#simulation"
            className={`px-4 py-2 rounded-xl transition-all hover:text-cyan-400 flex items-center gap-2 ${
              activeSection === 'simulation' ? 'bg-cyan-500/15 text-cyan-400 font-extrabold shadow-sm' : ''
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Compiler & Silicon Simulation</span>
          </a>

          <a
            href="#challenge"
            className={`px-4 py-2 rounded-xl transition-all hover:text-amber-500 flex items-center gap-2 ${
              activeSection === 'challenge' ? 'bg-amber-500/15 text-amber-500 font-extrabold shadow-sm' : ''
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Register Arcade</span>
          </a>
        </nav>

        {/* Global Controls: Mode Toggle, Theme Toggle, Sound Toggle, Presentation with Generous Spacing */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Audience Mode Toggle: Story Mode vs Pro Mode */}
          <button
            onClick={() => {
              sounds.playPop();
              onToggleAudienceMode();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all border shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${
              isStoryMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400'
            }`}
            title="Toggle between Easy Story Mode and Technical Pro Mode"
          >
            <span>{isStoryMode ? '🧸 Story Mode' : '⚡ Pro Mode'}</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-black'
            }`}
            title={isMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>

          {/* Theme Switcher: Daylight vs Neon Dark */}
          <button
            onClick={() => {
              sounds.playPop();
              onToggleTheme();
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300'
                : 'bg-slate-100 border-slate-300 text-purple-600 hover:text-purple-800'
            }`}
            title={isDark ? 'Switch to Bright Mode' : 'Switch to Neon Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Classroom Presentation Mode Button */}
          <button
            onClick={() => {
              sounds.playPop();
              onOpenPresentation();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Classroom Presentation Mode (Press 'P' on keyboard)"
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">Present</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] bg-black/30 rounded border border-white/20 font-mono">
              P
            </kbd>
          </button>

        </div>

      </div>
    </header>
  );
};
