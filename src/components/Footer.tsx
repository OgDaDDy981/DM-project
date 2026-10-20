import React from 'react';
import { Cpu, ArrowUp, BookOpen, CheckCircle2, Sparkles, Heart } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface FooterProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const scrollToTop = () => {
    sounds.playPop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const keyTakeaways = [
    { num: '01', title: 'What is a Variable?', text: 'Human names for calculations (Health, Coins, Scores).' },
    { num: '02', title: 'What are CPU Registers?', text: 'Ultra-fast memory pockets built directly on the CPU chip (0.3 nanoseconds speed).' },
    { num: '03', title: 'Why Are They Limited?', text: 'Physical silicon area and heat restrict chips to only 8–32 fast hardware pockets.' },
    { num: '04', title: 'Why Do Variables Clash?', text: 'Variables active at the exact same moment cannot share a pocket or they destroy each other.' },
    { num: '05', title: 'The Clash Map (Graph)', text: 'Every variable is a dot; every simultaneous conflict is a laser line.' },
    { num: '06', title: 'Graph Coloring Solution', text: 'Color every dot so touching dots have different colors. Each color is a physical register!' },
    { num: '07', title: 'The Chromatic Number χ(G)', text: 'The absolute minimum number of colors mathematically required by the code.' },
    { num: '08', title: 'Memory Spilling', text: 'If variables exceed pockets, excess items are evicted to slow RAM (200× slower).' },
    { num: '09', title: 'Real-World Superpower', text: 'Powers every iPhone, Android, game engine, and web browser on Earth!' },
  ];

  return (
    <footer className={`border-t pt-16 pb-12 transition-colors duration-300 ${
      isDark ? 'bg-[#05070D] border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1-Sentence Summary for Everyone */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 text-center max-w-4xl mx-auto shadow-xl ${
          isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-mono font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isStoryMode ? 'How To Explain This To Anyone In 10 Seconds' : 'Executive Architectural Summary'}</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            "Your phone has 100 game stats, but only 3 memory pockets. By coloring a conflict map so no two clashing items share a pocket, your phone runs at lightning speed with zero slowdown!"
          </p>
        </div>

        {/* Key Takeaways Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Core Takeaways: The 9 Essential Concepts</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              Discrete Mathematics & Computer Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {keyTakeaways.map((item) => (
              <div
                key={item.num}
                className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                  isDark ? 'bg-[#090D1A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-500">
                  <span>{item.num}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{item.title}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Literature References */}
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
          isDark ? 'bg-[#090D1A] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>Foundational Research Literature</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Based on Gregory J. Chaitin’s 1981 breakthrough paper <em>“Register Allocation & Spilling via Graph Coloring”</em> (IBM Research) and Preston Briggs’ 1994 dissertation <em>“Register Allocation via Coloring”</em> (Rice University).
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <span>Interactive Educational Web Application • Graph Coloring for CPU Register Allocation</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for curious minds and students</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
