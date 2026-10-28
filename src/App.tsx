import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UnifiedCompilerSiliconSimulation } from './components/UnifiedSimulation/UnifiedCompilerSiliconSimulation';
import { ChallengeMode } from './components/Challenge/ChallengeMode';
import { PresentationMode } from './components/Presentation/PresentationMode';
import { Footer } from './components/Footer';
import { sounds } from './utils/soundEffects';

export const App: React.FC = () => {
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('simulation');
  
  // Theme state: defaults to false (Fresh, vibrant daylight mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_theme');
      if (saved) return saved === 'dark';
    }
    return false; // Default bright & lively!
  });

  // Audience Mode: defaults to true (🧸 Story / Plain English Mode)
  const [isStoryMode, setIsStoryMode] = useState<boolean>(true);

  // Sound FX State
  const [isMuted, setIsMuted] = useState<boolean>(!sounds.enabled);

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleToggleAudienceMode = () => {
    setIsStoryMode((prev) => !prev);
  };

  const handleToggleSound = () => {
    const nextEnabled = sounds.toggle();
    setIsMuted(!nextEnabled);
  };

  // Keyboard shortcut: Press 'P' or 'p' to open classroom presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'p' || e.key === 'P') && !isPresentationOpen) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          sounds.playPop();
          setIsPresentationOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationOpen]);

  // Scroll spy to highlight active section in navbar
  useEffect(() => {
    const sections = ['hero', 'simulation', 'challenge'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToSimulator = () => {
    const el = document.getElementById('simulation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans selection:bg-cyan-400 selection:text-slate-950 ${
      isDark ? 'bg-[#080B14] text-[#F1F5F9]' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Sticky Header */}
      <Header
        onOpenPresentation={() => setIsPresentationOpen(true)}
        activeSection={activeSection}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isStoryMode={isStoryMode}
        onToggleAudienceMode={handleToggleAudienceMode}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with 3-Step Interactive Toy */}
        <Hero
          onStartTour={() => setIsPresentationOpen(true)}
          onExploreSimulation={handleScrollToSimulator}
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 2. Unified Master Compiler & Physical Silicon Simulation Studio */}
        <UnifiedCompilerSiliconSimulation
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 3. The Register Allocation Game Arcade */}
        <ChallengeMode
          isDark={isDark}
          isStoryMode={isStoryMode}
        />
      </main>

      {/* Educational Footer with Takeaways & 1-Sentence Summary */}
      <Footer
        isDark={isDark}
        isStoryMode={isStoryMode}
      />

      {/* Classroom Projector Presentation Mode Overlay */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        isDark={isDark}
      />
    </div>
  );
};

export default App;
