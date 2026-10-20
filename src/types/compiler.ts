export interface GraphNode {
  id: string;
  label: string;
  friendlyName?: string;
  icon?: string;
  description?: string;
  x: number;
  y: number;
  liveStart?: number;
  liveEnd?: number;
  assignedRegister?: number | null; // 1-indexed, null if unassigned
  isSpilled?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface CPURegister {
  id: number; // 1 to 6
  name: string; // "R1", "R2", etc.
  friendlyName: string; // "Cyan Pocket", "Violet Pocket", etc.
  color: string; // vibrant hex
  lightColor: string;
  textColor: string;
  borderColor: string;
  glow: string;
}

export const REGISTER_PALETTE: CPURegister[] = [
  {
    id: 1,
    name: 'R1',
    friendlyName: 'Pocket 1 (Electric Cyan)',
    color: '#06B6D4', // Vibrant Cyan
    lightColor: 'rgba(6, 182, 212, 0.22)',
    textColor: '#FFFFFF',
    borderColor: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.6)',
  },
  {
    id: 2,
    name: 'R2',
    friendlyName: 'Pocket 2 (Purple Spark)',
    color: '#8B5CF6', // Vivid Purple
    lightColor: 'rgba(139, 92, 246, 0.22)',
    textColor: '#FFFFFF',
    borderColor: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.6)',
  },
  {
    id: 3,
    name: 'R3',
    friendlyName: 'Pocket 3 (Lime Neon)',
    color: '#10B981', // Emerald / Lime
    lightColor: 'rgba(16, 185, 129, 0.22)',
    textColor: '#FFFFFF',
    borderColor: '#10B981',
    glow: 'rgba(16, 185, 129, 0.6)',
  },
  {
    id: 4,
    name: 'R4',
    friendlyName: 'Pocket 4 (Solar Amber)',
    color: '#F59E0B', // Warm Amber
    lightColor: 'rgba(245, 158, 11, 0.22)',
    textColor: '#FFFFFF',
    borderColor: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.6)',
  },
  {
    id: 5,
    name: 'R5',
    friendlyName: 'Pocket 5 (Hot Pink)',
    color: '#EC4899', // Hot Pink
    lightColor: 'rgba(236, 72, 153, 0.22)',
    textColor: '#FFFFFF',
    borderColor: '#EC4899',
    glow: 'rgba(236, 72, 153, 0.6)',
  },
  {
    id: 6,
    name: 'R6',
    friendlyName: 'Pocket 6 (Blue Laser)',
    color: '#3B82F6', // Royal Blue
    lightColor: 'rgba(59, 130, 246, 0.22)',
    textColor: '#FFFFFF',
    borderColor: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.6)',
  },
];

export type StepType =
  | 'init'
  | 'select_node'
  | 'inspect_neighbors'
  | 'inspect_registers'
  | 'assign_register'
  | 'spill'
  | 'conflict'
  | 'complete';

export interface ExplanationText {
  whatYouSee: string;
  whatItMeans: string;
  whyItMatters: string;
  plainEnglishStory?: string;
}

export interface AlgorithmStep {
  stepIndex: number;
  type: StepType;
  currentNodeId: string | null;
  examinedNeighborIds: string[];
  blockedRegisters: number[];
  assignedRegister: number | null;
  nodeColors: Record<string, number | null>; // nodeId -> register id
  spilledNodes: string[];
  explanation: ExplanationText;
  conflicts: Array<[string, string]>;
  registersUsed: number;
  isValid: boolean;
}

export interface ExampleGraph {
  id: string;
  title: string;
  storyTitle: string;
  tag: string;
  badge: string;
  description: string;
  storyDescription: string;
  codeSnippet: string[];
  programInstructions?: {
    line: number;
    text: string;
    liveVariables: string[];
  }[];
  initialRegisters: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  chromaticNumber: number;
  optimalColorCount: number;
  whyOptimal: string;
}

export interface ChallengeLevel {
  id: string;
  levelNumber: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  scenario: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  maxRegisters: number;
  chromaticNumber: number;
  hint: string;
  solutionExplanation: string;
}
