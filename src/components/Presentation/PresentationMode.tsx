import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  Users,
  Cpu,
  Layers,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  isOpen,
  onClose,
  isDark = true,
}) => {
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const slides = [
    {
      number: 1,
      title: 'The Real-World Dilemma: Too Many Variables, Too Few Pockets',
      tag: 'Hardware Reality',
      bigHeadline: 'Why Can\'t the CPU Just Store Everything in Registers?',
      bulletPoints: [
        'Programmers freely create hundreds of variables (scores, positions, video pixels, calculations).',
        'Physical CPU silicon only has 8 to 16 ultra-fast general-purpose registers.',
        'Registers read data in 0.3 nanoseconds (1 clock cycle directly inside the CPU ALU).',
        'System RAM is 200× slower (~70 nanoseconds). If variables drop to RAM, the execution pipeline stalls!',
      ],
      takeaway: 'THE CORE QUESTION: How can a compiler pack 100 variables into only 8 physical registers?',
      visualBadge: '1 Cycle vs 200 Cycles',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      miniVisual: (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center text-cyan-400 font-bold">
            <span>CPU Register</span>
            <span>0.3 ns (1 cycle)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-cyan-400" />
          <div className="flex justify-between items-center text-red-400 font-bold pt-2">
            <span>System RAM</span>
            <span>70.0 ns (200 cycles)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-red-500" />
        </div>
      ),
    },
    {
      number: 2,
      title: 'The Big Idea: Variable Lifetimes & The Office Desk Analogy',
      tag: 'The Secret Discovery',
      bigHeadline: 'Variables Don\'t Live Forever!',
      bulletPoints: [
        'A variable is only "ALIVE" from when it is computed until its final read.',
        'Like workers sharing an office desk: Alice works from 9am to 1pm, Diana arrives at 1pm.',
        'Because their shifts never overlap, Alice and Diana can share the EXACT same desk!',
        'In a program: Variables active at disjoint times share the exact same physical CPU register.',
      ],
      takeaway: 'GOLDEN PRINCIPLE: Different Variables. Different Moments. Same Hardware Register.',
      visualBadge: 'Zero Data Collisions',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      miniVisual: (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-emerald-400 font-bold">Desk 1 (Cyan / R1):</div>
          <div className="text-slate-300">Alice (9:00–13:00) ➔ Diana (13:00–17:00)</div>
          <div className="text-[11px] text-slate-400 pt-1">
            Zero overlap = 100% safe reuse. No extra hardware needed!
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: 'The Mathematical Bridge: Discrete Graph Vertex Coloring',
      tag: 'Discrete Mathematics',
      bigHeadline: 'Mapping Colors to Machine Registers',
      bulletPoints: [
        'Draw an Interference Graph: Every variable is a Vertex (dot).',
        'Whenever two variables are active at the same time, draw an Edge (clash line) between them.',
        'VERTEX COLORING RULE: For every edge (u, v), Color(u) ≠ Color(v).',
        'Each unique color corresponds to a hardware CPU register: Cyan = R1, Purple = R2, Lime = R3.',
      ],
      takeaway: 'A valid graph vertex coloring guarantees ZERO data collisions on physical CPU silicon!',
      visualBadge: 'c: V → {R1, R2, ..., Rk}',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      miniVisual: (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-cyan-400 font-bold">Invariance Theorem:</div>
          <div className="text-slate-300">∀ &#123;u, v&#125; ∈ E, Color(u) ≠ Color(v)</div>
          <div className="text-[11px] text-slate-400 pt-1">
            Graph coloring transforms scheduling into discrete math.
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: 'The Simulation: How the Algorithm Solves It',
      tag: 'Compiler Execution',
      bigHeadline: 'The Greedy Heuristic in Milliseconds',
      bulletPoints: [
        'STEP 1: Pick an uncolored variable (highest degree / most clashing neighbors first).',
        'STEP 2: Inspect registers already claimed by its active neighbors.',
        'STEP 3: Pick the lowest-numbered register (R1, R2, R3) not used by any neighbor.',
        'STEP 4: Repeat until every variable has a safe register.',
      ],
      takeaway: 'Degree-saturation ordering maximizes register reuse with minimal overhead.',
      visualBadge: 'O(|V| + |E|) Execution',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      miniVisual: (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-purple-400 font-bold">Chaitin Simplification:</div>
          <div className="text-slate-300">If deg(v) &lt; k, push v to stack.</div>
          <div className="text-[11px] text-slate-400 pt-1">
            Colors popped in reverse order with zero backtracking.
          </div>
        </div>
      ),
    },
    {
      number: 5,
      title: 'The Mathematical Limit: The Chromatic Number χ(G)',
      tag: 'Theory & Complexity',
      bigHeadline: 'The Theoretical Limit of the Code',
      bulletPoints: [
        'The Chromatic Number χ(G) is the absolute minimum number of registers mathematically required.',
        'For a complete triangle of 3 clashing variables (K3), χ(G) = 3. Two registers are impossible.',
        'Finding the exact minimum coloring for an arbitrary graph is NP-complete (Richard Karp, 1972).',
        'Compilers cannot run exponential algorithms, so they rely on Chaitin-Briggs heuristics.',
      ],
      takeaway: 'If available hardware registers k < χ(G), memory spilling is mathematically unavoidable!',
      visualBadge: 'χ(G) ≥ ω(G) • NP-Complete',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      miniVisual: (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-amber-400 font-bold">Clique Lower Bound:</div>
          <div className="text-slate-300">χ(G) ≥ ω(G) = 3</div>
          <div className="text-[11px] text-slate-400 pt-1">
            Complete triangle K₃ forces 3 physical registers.
          </div>
        </div>
      ),
    },
    {
      number: 6,
      title: 'The Safety Valve: Eviction & Register Spilling to RAM',
      tag: 'Hardware Emergency',
      bigHeadline: 'What Happens When Registers Run Out?',
      bulletPoints: [
        'When k < χ(G), the compiler cannot color the graph without a clash.',
        'The compiler evicts the least-frequently-used variable down to the Stack Frame in RAM.',
        'The computer inserts explicit STORE and LOAD machine instructions.',
        'COST: The code compiles and runs, but pays a 200-cycle latency penalty on every spill access.',
      ],
      takeaway: 'Compilers carefully evaluate loop-nesting weights to spill the coldest variables.',
      visualBadge: 'Spill to [RBP - 8]',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      miniVisual: (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-red-400 font-bold">Stack Offset Addressing:</div>
          <div className="text-slate-300">MOV [rbp - 0x08], shield</div>
          <div className="text-[11px] text-slate-400 pt-1">
            Pushed to DRAM memory frame when registers overflow.
          </div>
        </div>
      ),
    },
    {
      number: 7,
      title: 'Real-World Impact: Where This Lives Today',
      tag: 'Global Computing Impact',
      bigHeadline: 'Inside Every iPhone, Android, and Game Engine',
      bulletPoints: [
        'Every line of C++, Rust, Swift, Go, or Metal is compiled using graph coloring principles.',
        'Gregory Chaitin (IBM, 1981) first proved that graph coloring revolutionized compiler code generation.',
        'Preston Briggs (1994) introduced optimistic coloring, avoiding unnecessary spills.',
        'Discrete mathematics directly powers modern high-performance computing!',
      ],
      takeaway: 'FINAL TAKEAWAY: Discrete Mathematics is the invisible engine powering the digital universe!',
      visualBadge: 'Chaitin (1981) • Briggs (1994)',
      icon: <Award className="w-5 h-5 text-yellow-400" />,
      miniVisual: (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-yellow-400 font-bold">Industrial Impact:</div>
          <div className="text-slate-300">LLVM, GCC, Rustc, Clang, HotSpot</div>
          <div className="text-[11px] text-slate-400 pt-1">
            Running on billions of processors every microsecond.
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[slideIndex];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        sounds.playPop();
        setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sounds.playPop();
        setSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        sounds.playPop();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  const toggleFullscreen = () => {
    sounds.playPop();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col select-none overflow-hidden ${
        isDark ? 'bg-[#080B14] text-white' : 'bg-slate-900 text-white'
      }`}
    >
      {/* Top Presenter Bar */}
      <div className="h-16 px-6 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-black tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PROJECTOR SLIDES</span>
          </span>
          <span className="text-sm font-mono text-slate-400">
            Slide {slideIndex + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Exit (Esc)</span>
          </button>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col justify-center space-y-6 overflow-y-auto">
        {/* Slide Category Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              {currentSlide.icon}
              <span>{currentSlide.tag}</span>
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">{currentSlide.title}</span>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
            {currentSlide.visualBadge}
          </span>
        </div>

        {/* Big Slide Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
          {currentSlide.bigHeadline}
        </h2>

        {/* Bullet Points with Mini-Visual Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            {currentSlide.bulletPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>

          <div className="md:col-span-4">
            {currentSlide.miniVisual}
          </div>
        </div>

        {/* Core Takeaway */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-purple-500/20 to-pink-500/15 border-2 border-cyan-500/40">
          <p className="text-xs sm:text-sm font-black text-cyan-400 leading-snug">
            💡 {currentSlide.takeaway}
          </p>
        </div>
      </div>

      {/* Bottom Presenter Controls */}
      <div className="h-20 px-8 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playPop();
              setSlideIndex(0);
            }}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Jump to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline font-bold">
            Use Left / Right Arrows on Keyboard
          </span>
        </div>

        {/* Slide Progress Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playPop();
                setSlideIndex(idx);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                slideIndex === idx ? 'w-8 bg-cyan-400' : 'w-2.5 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Next / Prev Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playPop();
              setSlideIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={slideIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-white border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
            }}
            disabled={slideIndex === slides.length - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
