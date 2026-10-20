import type {
  AlgorithmStep,
  GraphEdge,
  GraphNode,
} from '../types/compiler';
import { REGISTER_PALETTE } from '../types/compiler';

/**
 * Validate whether any adjacent vertices share the exact same register color
 */
export function validateColoring(
  edges: GraphEdge[],
  nodeColors: Record<string, number | null>
): { isValid: boolean; conflicts: Array<[string, string]> } {
  const conflicts: Array<[string, string]> = [];

  for (const edge of edges) {
    const c1 = nodeColors[edge.source];
    const c2 = nodeColors[edge.target];
    if (c1 !== null && c2 !== null && c1 !== undefined && c2 !== undefined && c1 === c2) {
      conflicts.push([edge.source, edge.target]);
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Exact backtracking k-colorability checker for small graphs
 */
export function isKColorable(
  nodes: GraphNode[],
  edges: GraphEdge[],
  k: number
): boolean {
  const nodeIds = nodes.map((n) => n.id);
  const adj = buildAdjacencyList(nodes, edges);
  const colors: Record<string, number> = {};

  function solve(index: number): boolean {
    if (index === nodeIds.length) return true;
    const current = nodeIds[index];

    for (let c = 1; c <= k; c++) {
      let safe = true;
      for (const neighbor of adj[current] || []) {
        if (colors[neighbor] === c) {
          safe = false;
          break;
        }
      }
      if (safe) {
        colors[current] = c;
        if (solve(index + 1)) return true;
        delete colors[current];
      }
    }
    return false;
  }

  return solve(0);
}

/**
 * Computes exact Chromatic Number χ(G) for small graphs (up to 15 nodes)
 */
export function getExactChromaticNumber(
  nodes: GraphNode[],
  edges: GraphEdge[]
): number {
  if (nodes.length === 0) return 0;
  if (edges.length === 0) return 1;

  for (let k = 1; k <= nodes.length; k++) {
    if (isKColorable(nodes, edges, k)) {
      return k;
    }
  }
  return nodes.length;
}

/**
 * Helper to build an adjacency list map: nodeId -> Set of neighbor nodeIds
 */
export function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Record<string, string[]> {
  const adj: Record<string, Set<string>> = {};
  for (const n of nodes) {
    adj[n.id] = new Set();
  }
  for (const e of edges) {
    if (adj[e.source]) adj[e.source].add(e.target);
    if (adj[e.target]) adj[e.target].add(e.source);
  }

  const result: Record<string, string[]> = {};
  for (const id in adj) {
    result[id] = Array.from(adj[id]);
  }
  return result;
}

/**
 * Deterministic step-by-step graph coloring execution generator
 * Records every decision, blocked registers, and both technical & story explanations.
 */
export function generateColoringSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxRegisters: number
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const adj = buildAdjacencyList(nodes, edges);

  // We choose nodes deterministically: Highest degree (most interferences) first, tie-break by ID
  const sortedNodeIds = [...nodes]
    .sort((a, b) => {
      const degDiff = (adj[b.id]?.length || 0) - (adj[a.id]?.length || 0);
      return degDiff !== 0 ? degDiff : a.id.localeCompare(b.id);
    })
    .map((n) => n.id);

  const nodeColors: Record<string, number | null> = {};
  for (const n of nodes) {
    nodeColors[n.id] = null;
  }
  const spilledNodes: string[] = [];

  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Step 0: Initial clean state
  steps.push({
    stepIndex: 0,
    type: 'init',
    currentNodeId: null,
    examinedNeighborIds: [],
    blockedRegisters: [],
    assignedRegister: null,
    nodeColors: { ...nodeColors },
    spilledNodes: [],
    explanation: {
      whatYouSee: `Starting layout: ${nodes.length} variables waiting for ${maxRegisters} fast hardware pockets.`,
      whatItMeans: `Every circle is a variable. Every connecting line is a clash: these two variables are needed at the same time!`,
      whyItMatters: `Our goal: Give every connected circle a different color so no two colliding items share a pocket.`,
      plainEnglishStory: `Welcome! We have ${nodes.length} items needing a fast pocket, but only ${maxRegisters} pockets are in the CPU. Watch how smart coloring solves this!`,
    },
    conflicts: [],
    registersUsed: 0,
    isValid: true,
  });

  // Step through each variable
  for (let i = 0; i < sortedNodeIds.length; i++) {
    const currentId = sortedNodeIds[i];
    const nodeObj = nodeMap.get(currentId);
    const friendlyName = nodeObj?.friendlyName || currentId;
    const icon = nodeObj?.icon ? `${nodeObj.icon} ` : '';
    const neighbors = adj[currentId] || [];

    // Sub-step A: Select the variable
    steps.push({
      stepIndex: steps.length,
      type: 'select_node',
      currentNodeId: currentId,
      examinedNeighborIds: [],
      blockedRegisters: [],
      assignedRegister: null,
      nodeColors: { ...nodeColors },
      spilledNodes: [...spilledNodes],
      explanation: {
        whatYouSee: `Selected ${icon}"${friendlyName}" (clashes with ${neighbors.length} other items).`,
        whatItMeans: `The computer is picking which fast pocket to grant to ${friendlyName}.`,
        whyItMatters: `Prioritizing the busiest items with the most clashes first makes it much easier to avoid conflicts later!`,
        plainEnglishStory: `Step A: Let's pick ${icon}${friendlyName}! It has the most clashes (${neighbors.length}), so we solve it first.`,
      },
      conflicts: [],
      registersUsed: calculateRegistersUsed(nodeColors),
      isValid: true,
    });

    // Sub-step B: Inspect conflicting neighbors and blocked registers
    const neighborRegisters = new Set<number>();
    const coloredNeighbors: string[] = [];
    for (const nb of neighbors) {
      const reg = nodeColors[nb];
      if (reg !== null && reg !== undefined) {
        neighborRegisters.add(reg);
        const nbObj = nodeMap.get(nb);
        coloredNeighbors.push(nbObj?.friendlyName || nb);
      }
    }
    const blockedRegisters = Array.from(neighborRegisters).sort((a, b) => a - b);

    steps.push({
      stepIndex: steps.length,
      type: 'inspect_neighbors',
      currentNodeId: currentId,
      examinedNeighborIds: neighbors,
      blockedRegisters,
      assignedRegister: null,
      nodeColors: { ...nodeColors },
      spilledNodes: [...spilledNodes],
      explanation: {
        whatYouSee: coloredNeighbors.length > 0
          ? `Connected neighbors (${coloredNeighbors.join(', ')}) already hold pockets: ${blockedRegisters.map((r) => 'Pocket ' + r).join(', ')}.`
          : `Inspected neighbors for "${friendlyName}". None of its neighbors have taken a pocket yet.`,
        whatItMeans: blockedRegisters.length > 0
          ? `Because they clash at the exact same moment, "${friendlyName}" CANNOT use ${blockedRegisters.map((r) => 'Pocket ' + r).join(', ')}.`
          : `All ${maxRegisters} pockets are currently open and safe for "${friendlyName}".`,
        whyItMatters: 'If two items active at the same moment took the same pocket, one would overwrite the other\'s data!',
        plainEnglishStory: blockedRegisters.length > 0
          ? `Checking rules: ${icon}${friendlyName} cannot use ${blockedRegisters.map((r) => 'Pocket ' + r).join(', ')} because friends connected to it are already sitting there!`
          : `Good news! None of ${icon}${friendlyName}'s connected friends have taken any pockets yet.`,
      },
      conflicts: [],
      registersUsed: calculateRegistersUsed(nodeColors),
      isValid: true,
    });

    // Sub-step C: Find first available register 1..maxRegisters
    let chosenRegister: number | null = null;
    for (let r = 1; r <= maxRegisters; r++) {
      if (!neighborRegisters.has(r)) {
        chosenRegister = r;
        break;
      }
    }

    if (chosenRegister !== null) {
      nodeColors[currentId] = chosenRegister;
      const reg = REGISTER_PALETTE[chosenRegister - 1];

      steps.push({
        stepIndex: steps.length,
        type: 'assign_register',
        currentNodeId: currentId,
        examinedNeighborIds: neighbors.filter((nb) => nodeColors[nb] !== null),
        blockedRegisters,
        assignedRegister: chosenRegister,
        nodeColors: { ...nodeColors },
        spilledNodes: [...spilledNodes],
        explanation: {
          whatYouSee: `Assigned Pocket ${chosenRegister} (${reg?.friendlyName || 'Color'}) to ${icon}"${friendlyName}".`,
          whatItMeans: `Pocket ${chosenRegister} is completely free of clashes with all connected friends of "${friendlyName}".`,
          whyItMatters: `"${friendlyName}" will now execute directly inside CPU ${reg?.name || 'hardware'} at maximum nanosecond speed!`,
          plainEnglishStory: `Match found! We assign ${reg?.friendlyName} to ${icon}${friendlyName}! Zero clashes, pure speed!`,
        },
        conflicts: [],
        registersUsed: calculateRegistersUsed(nodeColors),
        isValid: true,
      });
    } else {
      // Need to spill!
      spilledNodes.push(currentId);
      nodeColors[currentId] = null;

      steps.push({
        stepIndex: steps.length,
        type: 'spill',
        currentNodeId: currentId,
        examinedNeighborIds: neighbors,
        blockedRegisters,
        assignedRegister: null,
        nodeColors: { ...nodeColors },
        spilledNodes: [...spilledNodes],
        explanation: {
          whatYouSee: `POCKET OVERFLOW (SPILL): "${friendlyName}" has all ${maxRegisters} pockets blocked by neighbors!`,
          whatItMeans: `There are no available physical pockets left. It must be evicted down to the slow basement storage (RAM).`,
          whyItMatters: `When variables exceed available registers, the computer must wait hundreds of clock cycles to load from RAM.`,
          plainEnglishStory: `Uh-oh! All ${maxRegisters} pockets were taken by neighbors! ${icon}${friendlyName} has to be spilled down into slow RAM.`,
        },
        conflicts: [],
        registersUsed: calculateRegistersUsed(nodeColors),
        isValid: false,
      });
    }
  }

  // Final Step: Complete
  const finalValidation = validateColoring(edges, nodeColors);
  const totalRegs = calculateRegistersUsed(nodeColors);
  const exactChi = getExactChromaticNumber(nodes, edges);
  const isOptimal = totalRegs <= exactChi && spilledNodes.length === 0;

  steps.push({
    stepIndex: steps.length,
    type: spilledNodes.length > 0 ? 'conflict' : 'complete',
    currentNodeId: null,
    examinedNeighborIds: [],
    blockedRegisters: [],
    assignedRegister: null,
    nodeColors: { ...nodeColors },
    spilledNodes: [...spilledNodes],
    explanation: {
      whatYouSee: spilledNodes.length > 0
        ? `Finished with ${spilledNodes.length} spilled variable(s) because only ${maxRegisters} pockets were allowed.`
        : `Victory! All ${nodes.length} items fit smoothly into ${totalRegs} pockets with ZERO collisions!`,
      whatItMeans: spilledNodes.length > 0
        ? `The graph strictly requires ${exactChi} pockets to fit without spilling.`
        : `Each variable has a distinct pocket from all its overlapping neighbors.`,
      whyItMatters: isOptimal
        ? `Maximum efficiency unlocked! 100% of variables fit in ultra-fast CPU registers with zero memory stalls.`
        : `Spilled variables show why compilers work so hard to find the best coloring.`,
      plainEnglishStory: spilledNodes.length > 0
        ? `Done! We needed ${exactChi} pockets, but only had ${maxRegisters}, so some items had to go to slow RAM.`
        : `Awesome! All ${nodes.length} variables are safely packed into only ${totalRegs} pockets. Your app runs at blazing speed!`,
    },
    conflicts: finalValidation.conflicts,
    registersUsed: totalRegs,
    isValid: finalValidation.isValid && spilledNodes.length === 0,
  });

  return steps;
}

function calculateRegistersUsed(nodeColors: Record<string, number | null>): number {
  const used = new Set<number>();
  for (const id in nodeColors) {
    const r = nodeColors[id];
    if (r !== null && r !== undefined) {
      used.add(r);
    }
  }
  return used.size;
}
