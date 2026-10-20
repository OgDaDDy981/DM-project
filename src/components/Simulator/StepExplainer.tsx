import React from 'react';
import type { AlgorithmStep } from '../../types/compiler';
import { REGISTER_PALETTE } from '../../types/compiler';
import { Eye, HelpCircle, Lightbulb, CheckCircle2, XCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface StepExplainerProps {
  currentStep: AlgorithmStep | null;
  totalSteps: number;
  maxRegisters: number;
  chromaticNumber: number;
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const StepExplainer: React.FC<StepExplainerProps> = ({
  currentStep,
  totalSteps,
  maxRegisters,
  chromaticNumber,
  isDark = true,
  isStoryMode = true,
}) => {
  if (!currentStep) return null;

  const {
    type,
    explanation,
    currentNodeId,
    blockedRegisters,
    assignedRegister,
    registersUsed,
    isValid,
    spilledNodes,
  } = currentStep;

  // Badge configuration based on step type
  const getBadge = () => {
    switch (type) {
      case 'init':
        return { label: 'START: WAITING TO ALLOCATE', color: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/40' };
      case 'select_node':
        return { label: `STEP 1: INSPECT "${currentNodeId}"`, color: 'bg-purple-500/20 text-purple-500 border-purple-500/40' };
      case 'inspect_neighbors':
        return { label: 'STEP 2: CHECK CLASHING NEIGHBORS', color: 'bg-amber-500/20 text-amber-500 border-amber-500/40' };
      case 'assign_register':
        return { label: `STEP 3: ASSIGN POCKET R${assignedRegister}`, color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' };
      case 'spill':
        return { label: 'POCKET OVERFLOW: SPILL TO RAM', color: 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse' };
      case 'complete':
        return { label: 'ALL CLEAR: FAST HARDWARE EXECUTION', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' };
      case 'conflict':
        return { label: 'FINISHED WITH SPILLS', color: 'bg-red-500/20 text-red-500 border-red-500/40' };
      default:
        return { label: 'ALGORITHM STEP', color: 'bg-slate-700/20 text-slate-400 border-slate-700' };
    }
  };

  const badge = getBadge();

  return (
    <div className={`p-5 sm:p-6 rounded-3xl border-2 space-y-5 shadow-2xl transition-all duration-300 ${
      isDark ? 'bg-[#121829] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Step Header & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`px-3.5 py-1 rounded-full text-xs font-mono font-black border tracking-wider ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            Step {currentStep.stepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Register Availability Matrix */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className="text-[11px] font-mono font-bold text-slate-400 mr-1 hidden sm:inline">
            Pockets:
          </span>
          {Array.from({ length: maxRegisters }, (_, i) => i + 1).map((regNum) => {
            const isBlocked = blockedRegisters.includes(regNum);
            const isAssignedToCurrent = assignedRegister === regNum;
            const regInfo = REGISTER_PALETTE[regNum - 1];

            return (
              <div
                key={regNum}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-black transition-all ${
                  isAssignedToCurrent
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 scale-105'
                    : isBlocked
                    ? 'bg-red-500/15 text-red-500 border border-red-500/30 opacity-70'
                    : isDark
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-white text-slate-800 border border-slate-300'
                }`}
                title={
                  isAssignedToCurrent
                    ? `Assigned to ${currentNodeId}`
                    : isBlocked
                    ? `Blocked by neighbor`
                    : `Available for allocation`
                }
              >
                <span>{regInfo.name}</span>
                {isAssignedToCurrent ? (
                  <CheckCircle2 className="w-3 h-3 text-slate-950" />
                ) : isBlocked ? (
                  <XCircle className="w-3 h-3 text-red-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Mode Big Friendly Highlight Banner */}
      {isStoryMode && explanation.plainEnglishStory && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 border-2 border-purple-500/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
              Plain English Narration
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
              {explanation.plainEnglishStory}
            </p>
          </div>
        </div>
      )}

      {/* 3-Part Educational Explanation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. WHAT YOU SEE */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-500 mb-2 uppercase tracking-wide">
              <Eye className="w-4 h-4 text-cyan-500" />
              <span>What You See</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {explanation.whatYouSee}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400">
            Screen Animation
          </div>
        </div>

        {/* 2. WHAT IT MEANS */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-500 mb-2 uppercase tracking-wide">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              <span>What It Means</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {explanation.whatItMeans}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400">
            The Underlying Logic
          </div>
        </div>

        {/* 3. WHY IT MATTERS */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-500 mb-2 uppercase tracking-wide">
              <Lightbulb className="w-4 h-4 text-emerald-500" />
              <span>Why It Matters</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {explanation.whyItMatters}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400">
            Real Hardware Impact
          </div>
        </div>

      </div>

      {/* Diagnostics Bar */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 gap-3 font-bold">
        <div className="flex items-center gap-4">
          <span>Pockets Used: <strong className="text-slate-900 dark:text-white">{registersUsed}</strong> / {maxRegisters}</span>
          <span>Theoretical Minimum: <strong className="text-purple-500">{chromaticNumber}</strong></span>
          {spilledNodes.length > 0 && (
            <span className="text-red-500">
              Spilled Variables: {spilledNodes.join(', ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isValid && spilledNodes.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
              <span>0 Interference Conflicts</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-500">
              <span>{spilledNodes.length > 0 ? 'Requires Stack Memory (Spill)' : 'Conflict Detected'}</span>
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
