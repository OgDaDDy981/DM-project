import React, { useState, useEffect } from 'react';
import { EXAMPLE_GRAPHS } from '../../data/examples';
import { GraphCanvas } from './GraphCanvas';
import { ControlsBar } from './ControlsBar';
import { StepExplainer } from './StepExplainer';
import { AllocationTable } from './AllocationTable';
import { generateColoringSteps, getExactChromaticNumber } from '../../algorithms/graphColoring';
import type { GraphNode, GraphEdge, AlgorithmStep } from '../../types/compiler';
import { Info, Terminal, Cpu, Plus } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface GraphSimulatorProps {
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const GraphSimulator: React.FC<GraphSimulatorProps> = ({
  isDark = true,
  isStoryMode = true,
}) => {
  const [selectedExampleId, setSelectedExampleId] = useState<string>('game-stats');
  const currentExample = EXAMPLE_GRAPHS.find((e) => e.id === selectedExampleId) || EXAMPLE_GRAPHS[0];

  const [nodes, setNodes] = useState<GraphNode[]>(currentExample.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(currentExample.edges);
  const [maxRegisters, setMaxRegisters] = useState<number>(currentExample.initialRegisters);
  
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [showConflicts, setShowConflicts] = useState<boolean>(true);
  const [showAllocationTable, setShowAllocationTable] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Recalculate steps whenever nodes, edges, or maxRegisters change
  useEffect(() => {
    const computedSteps = generateColoringSteps(nodes, edges, maxRegisters);
    setSteps(computedSteps);
    setCurrentStepIndex((prev) => Math.min(prev, computedSteps.length - 1));
  }, [nodes, edges, maxRegisters]);

  // When switching examples
  const handleSelectExample = (exampleId: string) => {
    const ex = EXAMPLE_GRAPHS.find((e) => e.id === exampleId);
    if (!ex) return;
    setIsPlaying(false);
    setSelectedExampleId(exampleId);
    setNodes(ex.nodes);
    setEdges(ex.edges);
    setMaxRegisters(ex.initialRegisters);
    setCurrentStepIndex(0);
    setSelectedNodeId(null);
  };

  // Play sound for a specific step
  const playSoundForStep = (step: AlgorithmStep) => {
    if (!step) return;
    if (step.type === 'assign_register' && step.assignedRegister) {
      sounds.playRegisterAssign(step.assignedRegister);
    } else if (step.type === 'spill') {
      sounds.playSpill();
    } else if (step.type === 'inspect_neighbors') {
      sounds.playScan();
    } else if (step.type === 'conflict') {
      sounds.playConflict();
    } else if (step.type === 'complete') {
      sounds.playVictory();
    } else {
      sounds.playPop();
    }
  };

  // Playback timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      const delay = Math.round(1400 / speed);
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            sounds.playVictory();
            return prev;
          }
          const nextIndex = prev + 1;
          if (steps[nextIndex]) {
            playSoundForStep(steps[nextIndex]);
          }
          return nextIndex;
        });
      }, delay);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed, steps]);

  const handleTogglePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (steps[nextIndex]) {
        playSoundForStep(steps[nextIndex]);
      }
    }
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      sounds.playPop();
    }
  };

  const handleReset = () => {
    sounds.playPop();
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSelectedNodeId(null);
  };

  // Keyboard navigation for simulator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, steps, isPlaying]);

  // Auto layout arranging nodes in a clean circular polygon
  const handleAutoLayout = () => {
    const count = nodes.length;
    const centerX = 280;
    const centerY = 230;
    const radius = Math.min(180, 70 + count * 20);

    const updated = nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      return {
        ...node,
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      };
    });
    setNodes(updated);
  };

  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n))
    );
  };

  // Add custom variable to canvas
  const handleAddCustomNode = () => {
    sounds.playPop();
    const newId = `var_${nodes.length + 1}`;
    const newNode: GraphNode = {
      id: newId,
      label: newId,
      friendlyName: `New Item ${nodes.length + 1}`,
      icon: '💎',
      x: 200 + (nodes.length % 5) * 40,
      y: 200 + (nodes.length % 4) * 30,
    };
    // Connect to at least 1 random previous node
    const targetNode = nodes[nodes.length - 1];
    const newEdges = [...edges];
    if (targetNode) {
      newEdges.push({
        id: `e-${newId}-${targetNode.id}`,
        source: newId,
        target: targetNode.id,
      });
    }
    setNodes([...nodes, newNode]);
    setEdges(newEdges);
  };

  const currentStep = steps[currentStepIndex] || null;
  const exactChi = getExactChromaticNumber(nodes, edges);

  // Selected node explanation if clicked
  const selectedNodeInfo = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const selectedNodeNeighbors = selectedNodeId
    ? edges
        .filter((e) => e.source === selectedNodeId || e.target === selectedNodeId)
        .map((e) => (e.source === selectedNodeId ? e.target : e.source))
    : [];

  return (
    <section id="simulator" className={`py-16 md:py-24 border-b transition-colors duration-300 ${
      isDark ? 'bg-[#080B14] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Interactive Simulator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Interactive Graph Coloring Studio
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Watch the compiler analyze clashes, inspect which pockets are already taken by friends, and assign physical CPU pockets step-by-step.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddCustomNode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Variable</span>
            </button>
          </div>
        </div>

        {/* Selected Node Inspection Alert if user clicked a node */}
        {selectedNodeInfo && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 text-sm flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Inspecting: {selectedNodeInfo.icon || ''} "{selectedNodeInfo.friendlyName || selectedNodeInfo.label}"
                </span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-xs sm:text-sm">
                  Connected to {selectedNodeNeighbors.length > 0 ? selectedNodeNeighbors.join(', ') : 'no other items'}.{' '}
                  {selectedNodeNeighbors.length > 0
                    ? `Because it clashes with these items, it CANNOT use their colors.`
                    : `No collisions detected; it can freely use any pocket!`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-xs font-mono font-bold text-slate-400 hover:text-white px-3 py-1 rounded-xl bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Main Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center: The SVG Canvas & Controls */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              nodeColors={currentStep?.nodeColors || {}}
              currentNodeId={currentStep?.currentNodeId || null}
              examinedNeighborIds={currentStep?.examinedNeighborIds || []}
              conflicts={currentStep?.conflicts || []}
              spilledNodes={currentStep?.spilledNodes || []}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onUpdateNodePosition={handleUpdateNodePosition}
              showConflicts={showConflicts}
              isDark={isDark}
              isStoryMode={isStoryMode}
            />

            {/* Controls Bar */}
            <ControlsBar
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onReset={handleReset}
              speed={speed}
              onChangeSpeed={setSpeed}
              maxRegisters={maxRegisters}
              onChangeMaxRegisters={setMaxRegisters}
              selectedExampleId={selectedExampleId}
              onSelectExample={handleSelectExample}
              showConflicts={showConflicts}
              onToggleShowConflicts={() => setShowConflicts(!showConflicts)}
              showAllocationTable={showAllocationTable}
              onToggleShowAllocationTable={() => setShowAllocationTable(!showAllocationTable)}
              onAutoLayout={handleAutoLayout}
              canStepForward={currentStepIndex < steps.length - 1}
              canStepBack={currentStepIndex > 0}
              isDark={isDark}
              isStoryMode={isStoryMode}
            />
          </div>

          {/* Right: Explainer Panel & Source Code Box */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* Step Explainer */}
            <StepExplainer
              currentStep={currentStep}
              totalSteps={steps.length}
              maxRegisters={maxRegisters}
              chromaticNumber={exactChi}
              isDark={isDark}
              isStoryMode={isStoryMode}
            />

            {/* Story / Code Snippet Box */}
            <div className={`p-5 rounded-3xl border-2 shadow-xl ${
              isDark ? 'bg-[#121829] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {isStoryMode ? 'Story Timeline & Code' : 'Program Instructions'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentExample.badge}
                </span>
              </div>

              {/* Code lines */}
              <div className={`p-3 rounded-2xl font-mono text-xs space-y-1 overflow-x-auto border ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {currentExample.codeSnippet.map((line, idx) => (
                  <div key={idx} className="flex gap-2.5 px-1 py-0.5 rounded">
                    <span className="text-slate-400 select-none w-5 text-right">{idx + 1}</span>
                    <span className={line.startsWith('//') ? 'text-slate-400 italic' : 'text-slate-900 dark:text-white font-semibold'}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Why Optimal:</strong> {currentExample.whyOptimal}
              </div>
            </div>

          </div>

        </div>

        {/* Allocation Table Toggle View */}
        {showAllocationTable && (
          <AllocationTable
            nodes={nodes}
            edges={edges}
            nodeColors={currentStep?.nodeColors || {}}
            spilledNodes={currentStep?.spilledNodes || []}
            isDark={isDark}
            isStoryMode={isStoryMode}
          />
        )}

      </div>
    </section>
  );
};
