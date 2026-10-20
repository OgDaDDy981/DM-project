import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CentralIdeaSimulation } from './components/CentralIdea/CentralIdeaSimulation';
import { OfficeDeskAnalogy } from './components/Analogy/OfficeDeskAnalogy';
import { SpeedGrandPrix } from './components/Race/SpeedGrandPrix';
import { TheRegisterProblem } from './components/TheRegisterProblem';
import { GraphSimulator } from './components/Simulator/GraphSimulator';
import { RegisterBankView } from './components/RegisterBank/RegisterBankView';
import { CompilerPipeline } from './components/Pipeline/CompilerPipeline';
import { MathExplorer } from './components/MathExplorer/MathExplorer';
import { SpillingDemo } from './components/Spilling/SpillingDemo';
import { ChallengeMode } from './components/Challenge/ChallengeMode';
import { PresentationMode } from './components/Presentation/PresentationMode';
import { Footer } from './components/Footer';
import { sounds } from './utils/soundEffects';

export const App: React.FC = () => {
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  
  // Theme state: defaults to false (Fresh, vibrant, eye-catching Daylight Pop!)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_theme');
      if (saved) return saved === 'dark';
    }
    return false; // Default bright & lively!
  });

  // Audience Mode: defaults to true (🧸 Story / Plain English Mode!)
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
    const sections = ['central-idea', 'analogy', 'race', 'problem', 'simulator', 'registers', 'pipeline', 'math', 'spilling', 'challenge'];
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
    const el = document.getElementById('simulator');
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

        {/* 2. THE CENTRAL MISSION, PURPOSE & LIVE SIMULATION */}
        <CentralIdeaSimulation
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 3. Real-World Analogy: How 5 People Work at 3 Desks */}
        <OfficeDeskAnalogy isDark={isDark} />

        {/* 3. The Nanosecond Drag Race: CPU Register vs System RAM */}
        <SpeedGrandPrix isDark={isDark} />

        {/* 4. Why Registers are Scarce */}
        <TheRegisterProblem
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 5. Core Interactive Graph Coloring Studio */}
        <GraphSimulator
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 6. Physical CPU Pockets & Variable Lifetimes */}
        <RegisterBankView
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 7. The 4-Step Journey: From Code to Silicon */}
        <CompilerPipeline
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 8. The Mathematics: Graph Theory, Chromatic Numbers, Complexity */}
        <MathExplorer
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 9. Disaster Room: Register Spilling to RAM */}
        <SpillingDemo
          isDark={isDark}
          isStoryMode={isStoryMode}
        />

        {/* 10. The Register Allocation Game Arcade */}
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
