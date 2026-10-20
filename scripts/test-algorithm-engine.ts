import { EXAMPLE_GRAPHS } from '../src/data/examples.ts';
import {
  generateColoringSteps,
  getExactChromaticNumber,
  validateColoring,
} from '../src/algorithms/graphColoring.ts';

console.log("=== RUNNING RIGOROUS ALGORITHM VERIFICATION ===");

// 1. Triangle Tests
const triangle = EXAMPLE_GRAPHS.find((e) => e.id === 'triangle')!;
const triChi = getExactChromaticNumber(triangle.nodes, triangle.edges);
console.log(`[TEST 1] Triangle Chromatic Number: ${triChi} (Expected: 3)`);
if (triChi !== 3) throw new Error("Triangle chromatic number must be 3!");

const triSteps3 = generateColoringSteps(triangle.nodes, triangle.edges, 3);
const lastTri3 = triSteps3[triSteps3.length - 1];
console.log(`[TEST 2] Triangle with k=3: isValid=${lastTri3.isValid}, spilled=${lastTri3.spilledNodes.length}, regsUsed=${lastTri3.registersUsed}`);
if (!lastTri3.isValid || lastTri3.spilledNodes.length !== 0 || lastTri3.registersUsed !== 3) {
  throw new Error("Triangle with k=3 failed!");
}

const triSteps2 = generateColoringSteps(triangle.nodes, triangle.edges, 2);
const lastTri2 = triSteps2[triSteps2.length - 1];
console.log(`[TEST 3] Triangle with k=2: isValid=${lastTri2.isValid}, spilled=${lastTri2.spilledNodes.length}`);
if (lastTri2.isValid || lastTri2.spilledNodes.length === 0) {
  throw new Error("Triangle with k=2 must detect spill and be marked invalid!");
}

// 2. Chain Tests
const chain = EXAMPLE_GRAPHS.find((e) => e.id === 'chain')!;
const chainChi = getExactChromaticNumber(chain.nodes, chain.edges);
console.log(`[TEST 4] Chain Chromatic Number: ${chainChi} (Expected: 2)`);
if (chainChi !== 2) throw new Error("Chain chromatic number must be 2!");

const chainSteps2 = generateColoringSteps(chain.nodes, chain.edges, 2);
const lastChain2 = chainSteps2[chainSteps2.length - 1];
console.log(`[TEST 5] Chain with k=2: isValid=${lastChain2.isValid}, spilled=${lastChain2.spilledNodes.length}, regsUsed=${lastChain2.registersUsed}`);
if (!lastChain2.isValid || lastChain2.spilledNodes.length !== 0 || lastChain2.registersUsed !== 2) {
  throw new Error("Chain with k=2 failed!");
}

// 3. Realistic Arithmetic Pipeline Tests
const realistic = EXAMPLE_GRAPHS.find((e) => e.id === 'game-stats' || e.id === 'realistic')!;
const realChi = getExactChromaticNumber(realistic.nodes, realistic.edges);
console.log(`[TEST 6] Realistic Program Chromatic Number: ${realChi} (Expected: 3)`);
if (realChi !== 3) throw new Error("Realistic program chromatic number must be 3!");

const realSteps3 = generateColoringSteps(realistic.nodes, realistic.edges, 3);
const lastReal3 = realSteps3[realSteps3.length - 1];
console.log(`[TEST 7] Realistic with k=3: isValid=${lastReal3.isValid}, spilled=${lastReal3.spilledNodes.length}, regsUsed=${lastReal3.registersUsed}`);
if (!lastReal3.isValid || lastReal3.spilledNodes.length !== 0 || lastReal3.registersUsed !== 3) {
  throw new Error("Realistic program with k=3 failed!");
}

// 4. Verification that adjacent nodes never share a register in successful allocations
for (const eg of EXAMPLE_GRAPHS) {
  const steps = generateColoringSteps(eg.nodes, eg.edges, eg.initialRegisters);
  const final = steps[steps.length - 1];
  const val = validateColoring(eg.edges, final.nodeColors);
  console.log(`[TEST 8] Adjacency check for ${eg.id}: conflicts count = ${val.conflicts.length}`);
  if (val.conflicts.length > 0) {
    throw new Error(`Adjacent nodes shared a register in ${eg.id}! Conflicts: ${JSON.stringify(val.conflicts)}`);
  }
}

console.log("\n>>> ALL 8 MATHEMATICAL VERIFICATION TESTS PASSED 100% SUCCESSFULLY! <<<");
